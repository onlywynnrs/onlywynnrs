// ══ SUPABASE AUTH ══

// Current session
var _session=null;
var _profile=null;
var _sessionReady=false;

async function _sbFetch(path, opts){
  var headers={'apikey':_SKEY,'Content-Type':'application/json','Authorization':'Bearer '+_SKEY};
  if(_session?.access_token) headers['Authorization']='Bearer '+_session.access_token;
  Object.assign(headers, opts?.headers||{});
  var res=await fetch(_SURL+path, {method:opts?.method||'GET',headers,body:opts?.body});
  var data=await res.json().catch(function(){return {}});
  return {ok:res.ok,status:res.status,data};
}

async function authSignUp(email,password){
  var res=await _sbFetch('/auth/v1/signup',{
    method:'POST',
    body:JSON.stringify({email,password,options:{emailRedirectTo:'https://onlywynnrs.com'}})
  });
  if(res.ok){
    var d=res.data;
    var token=d.access_token||(d.session&&d.session.access_token)||null;
    var user=d.user||(d.session&&d.session.user)||null;
    if(token){
      _session={access_token:token,user:user||d};
      localStorage.setItem('ow_session',JSON.stringify(_session));
      await loadProfile();
      if(_session&&_session.user&&_session.user.id&&typeof saveReferralToProfile==='function') saveReferralToProfile(_session.user.id);
      updateAuthUI();
      return {success:true};
    }
    // No token but user created - try signing in immediately
    if(d.id||(d.user&&d.user.id)){
      var signInRes=await authSignIn(email,password);
      if(signInRes.success) return {success:true};
      return {success:true,needsConfirm:true};
    }
  }
  var err=(res.data&&(res.data.msg||res.data.error_description||res.data.message||res.data.error))||'Signup failed. Please try again.';
  return {success:false,error:err};
}

async function authSignIn(email,password){
  var res=await _sbFetch('/auth/v1/token?grant_type=password',{
    method:'POST',
    body:JSON.stringify({email,password})
  });
  if(res.ok && res.data.access_token){
    _session={access_token:res.data.access_token,user:res.data.user||res.data};
    localStorage.setItem('ow_session',JSON.stringify(_session));
    await loadProfile();
    updateAuthUI();
    return {success:true};
  }
  var err=res.data?.error_description||res.data?.msg||res.data?.message||res.data?.error||'Invalid email or password';
  return {success:false,error:err};
}

async function authSignOut(){
  if(_session&&_session.access_token){
    await _sbFetch('/auth/v1/logout',{method:'POST'}).catch(function(){});
  }
  _session=null;_profile=null;_sessionReady=true;
  localStorage.removeItem('ow_session');
  localStorage.removeItem('ow_member');
  localStorage.removeItem('ow_optimizer');
  localStorage.removeItem('ow_pending_tier');
  localStorage.removeItem('ow_role');
  updateAuthUI();
  go('home',null);
}

async function loadProfile(){
  if(!_session?.user?.id) return;
  var res=await _sbFetch('/rest/v1/profiles?id=eq.'+_session.user.id+'&select=*');
  if(res.ok && res.data.length){
    _profile=res.data[0];
    if(typeof ensureRefCode==='function') ensureRefCode();
    // Sync tier to localStorage for existing gate checks
    var t=_profile.tier||'free';
    if(t==='wynnr'||t==='elite'){
      localStorage.setItem('ow_member','true');
      localStorage.removeItem('ow_optimizer');
    } else if(t==='optimizer'){
      localStorage.setItem('ow_optimizer','true');
      localStorage.removeItem('ow_member');
    } else {
      localStorage.removeItem('ow_member');
      localStorage.removeItem('ow_optimizer');
    }
  }
}

async function upgradeUserTier(tier){
  if(!_session||!_session.user||!_session.user.id){
    console.error('upgradeUserTier: no session');
    return;
  }
  console.log('Upgrading tier to:', tier, 'for user:', _session.user.id);
  var res=await _sbFetch('/rest/v1/profiles?id=eq.'+_session.user.id,{
    method:'PATCH',
    headers:{'Prefer':'return=minimal','Content-Type':'application/json'},
    body:JSON.stringify({tier:tier,updated_at:new Date().toISOString()})
  });
  console.log('Upgrade result:', res.status, JSON.stringify(res.data));
  if(res.ok||res.status===204||res.status===200){
    // Update local profile immediately
    if(!_profile) _profile={};
    _profile.tier=tier;
    // Sync localStorage
    if(tier==='wynnr'||tier==='elite'){
      localStorage.setItem('ow_member','true');
      localStorage.removeItem('ow_optimizer');
    } else if(tier==='optimizer'){
      localStorage.setItem('ow_optimizer','true');
      localStorage.removeItem('ow_member');
    }
    updateAuthUI();
    // Show success
    var t=document.createElement('div');
    t.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#166534;color:#4ade80;border:1px solid #4ade80;border-radius:8px;padding:14px 28px;font-size:14px;font-weight:700;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.5);white-space:nowrap;';
    t.textContent='Welcome to OnlyWynnrs '+tier.charAt(0).toUpperCase()+tier.slice(1)+'! ';
    document.body.appendChild(t);
    setTimeout(function(){t.remove();},5000);
  } else {
    console.error('Upgrade failed:', res.status, res.data);
    // Force localStorage fallback even if DB fails
    if(tier==='wynnr'||tier==='elite') localStorage.setItem('ow_member','true');
    if(tier==='optimizer') localStorage.setItem('ow_optimizer','true');
    updateAuthUI();
  }
}

async function restoreSession(){
  // Try to restore from localStorage
  var saved=localStorage.getItem('ow_session');
  if(saved){
    try{
      _session=JSON.parse(saved);
      // Verify session still valid
      var res=await _sbFetch('/auth/v1/user');
      if(res.ok && res.data.id){
        _session.user=res.data;
        await loadProfile();
        _sessionReady=true;
        updateAuthUI();
        updatePaywalls();
        return;
      }
    }catch(e){}
  }
  _session=null;_profile=null;
  localStorage.removeItem('ow_session');
  _sessionReady=true;
}


function showAccountDropdown(){
  var existing=document.getElementById('accountDropdown');
  if(existing){existing.remove();return;}
  var tier=getTier();
  var email=(_session&&_session.user&&_session.user.email)||'';
  var tierColors={free:'var(--muted2)',optimizer:'#64a0ff',wynnr:'var(--gold)',elite:'var(--gold)',owner:'var(--green2)'};
  var tierLabels={free:'Free',optimizer:'Optimizer',wynnr:'Wynnr',elite:'Elite',owner:'Owner'};

  var drop=document.createElement('div');
  drop.id='accountDropdown';
  drop.style.cssText='position:fixed;top:56px;right:16px;background:var(--dark2);border:1px solid var(--border);border-radius:10px;min-width:240px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.6);overflow:hidden;';

  // Header
  var head=document.createElement('div');
  head.style.cssText='padding:16px;border-bottom:1px solid var(--border);';
  head.innerHTML='<div style="font-size:11px;color:var(--muted2);margin-bottom:4px;">Signed in as</div>'+
    '<div style="font-size:13px;font-weight:600;color:var(--parch);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">'+email+'</div>'+
    '<div style="margin-top:8px;display:inline-block;font-size:10px;font-weight:700;padding:2px 10px;border-radius:12px;background:rgba(0,0,0,.4);color:'+tierColors[tier]+';border:1px solid '+tierColors[tier]+';">'+tierLabels[tier].toUpperCase()+'</div>';

  var items=document.createElement('div');
  items.style.cssText='padding:6px 0;';

  function mkItem(icon,label,action,color,bold){
    var item=document.createElement('div');
    item.style.cssText='display:flex;align-items:center;gap:10px;padding:11px 16px;cursor:pointer;font-size:13px;color:'+(color||'var(--muted2)')+';'+(bold?'font-weight:700;':'');
    item.onmouseenter=function(){this.style.background='rgba(255,255,255,.04)';};
    item.onmouseleave=function(){this.style.background='transparent';};
    item.innerHTML='<span style="font-size:14px;width:18px;text-align:center;">'+icon+'</span><span>'+label+'</span>';
    item.onclick=function(){drop.remove();action();};
    return item;
  }

  // Upgrade options based on current tier
  if(tier==='free'){
    var sec=document.createElement('div');
    sec.style.cssText='padding:8px 16px 4px;font-size:10px;font-weight:700;letter-spacing:1px;color:var(--muted);';
    sec.textContent='UPGRADE';
    items.appendChild(sec);
    items.appendChild(mkItem('⚡','Optimizer — $15/mo',function(){stripeCheckout('optimizer');},'#64a0ff',true));
    items.appendChild(mkItem('🏆','Wynnr — $29/mo',function(){stripeCheckout('wynnr');},'var(--gold)',true));
    items.appendChild(mkItem('👑','Elite — $49/mo',function(){stripeCheckout('elite');},'var(--parch)',true));
    var div1=document.createElement('div');div1.style.cssText='height:1px;background:var(--border);margin:6px 0;';
    items.appendChild(div1);
  } else if(tier==='optimizer'){
    var sec2=document.createElement('div');
    sec2.style.cssText='padding:8px 16px 4px;font-size:10px;font-weight:700;letter-spacing:1px;color:var(--muted);';
    sec2.textContent='UPGRADE';
    items.appendChild(sec2);
    items.appendChild(mkItem('🏆','Wynnr — $29/mo',function(){stripeCheckout('wynnr');},'var(--gold)',true));
    items.appendChild(mkItem('👑','Elite — $49/mo',function(){stripeCheckout('elite');},'var(--parch)',true));
    var div2=document.createElement('div');div2.style.cssText='height:1px;background:var(--border);margin:6px 0;';
    items.appendChild(div2);
  }

  // Manage subscription — only show if on paid tier
  if(tier==='optimizer'||tier==='wynnr'||tier==='elite'){
    items.appendChild(mkItem('💳','Manage Subscription',function(){
      // Stripe customer portal — user can cancel/upgrade/downgrade
      window.open('https://billing.stripe.com/p/login/eVq00l63icnKcsz1Jt33W00','_blank');
    },'var(--muted2)'));
  }
  items.appendChild(mkItem('⚙','Settings',function(){go('settings',null);}));

  var div3=document.createElement('div');div3.style.cssText='height:1px;background:var(--border);margin:4px 0;';
  items.appendChild(div3);
  items.appendChild(mkItem('↪','Sign Out',function(){authSignOut();},'#f87171'));

  drop.appendChild(head);drop.appendChild(items);
  document.body.appendChild(drop);

  setTimeout(function(){
    document.addEventListener('click',function handler(e){
      if(!drop.contains(e.target)&&e.target.id!=='navAuthBtn'){
        drop.remove();document.removeEventListener('click',handler);
      }
    });
  },100);
}
function updateAuthUI(){
  var isLoggedIn=!!_session?.user;
  var tier=getTier();
  var email=_session?.user?.email||'';

  // Update nav auth button
  var navAuth=document.getElementById('navAuthBtn');
  if(navAuth){
    if(isLoggedIn){
      navAuth.textContent=email.split('@')[0];
      navAuth.onclick=function(e){e.stopPropagation();showAccountDropdown();};
      navAuth.style.background='rgba(201,168,76,.15)';
      navAuth.style.borderColor='var(--gold)';
      navAuth.style.color='var(--gold)';
    } else {
      navAuth.textContent='Login';
      navAuth.onclick=function(){showAuthModal('login');};
      navAuth.style.background='';
      navAuth.style.borderColor='';
      navAuth.style.color='';
    }
  }

  // Update Join Free button
  var joinBtn=document.getElementById('navJoinBtn');
  if(joinBtn){
    joinBtn.style.display=isLoggedIn?'none':'inline-flex';
  }

  // Update owner badge in settings
  // Update settings page buttons
  var settingsLogin=document.getElementById('settingsLoginBtn');
  var settingsSignup=document.getElementById('settingsSignupBtn');
  var settingsLogout=document.getElementById('settingsLogoutBtn');
  var authEmail=document.getElementById('authStatusEmail');
  if(settingsLogin) settingsLogin.style.display=isLoggedIn?'none':'inline-flex';
  if(settingsSignup) settingsSignup.style.display=isLoggedIn?'none':'inline-flex';
  if(settingsLogout) settingsLogout.style.display=isLoggedIn?'inline-flex':'none';
  if(authEmail) authEmail.textContent=isLoggedIn?email+' — '+tier.toUpperCase():'Not logged in';
  var badge=document.getElementById('ownerBadge');
  if(badge){
    if(isLoggedIn){
      badge.style.display='block';
      var tierLabels={free:'FREE',optimizer:'OPTIMIZER',wynnr:'WYNNR',elite:'ELITE'};
      badge.textContent=tierLabels[tier]||'FREE';
      badge.style.background=tier==='wynnr'||tier==='elite'?'rgba(201,168,76,.15)':'rgba(58,148,96,.15)';
      badge.style.color=tier==='wynnr'||tier==='elite'?'var(--gold)':'var(--green2)';
      badge.style.borderColor=tier==='wynnr'||tier==='elite'?'rgba(201,168,76,.25)':'rgba(58,148,96,.25)';
    } else {
      badge.style.display='none';
    }
  }
}


async function authResetPassword(email){
  if(!email){return {success:false,error:'Please enter your email.'};}
  var res=await _sbFetch('/auth/v1/recover',{
    method:'POST',
    body:JSON.stringify({email:email,redirect_to:'https://onlywynnrs.com#recovery'})
  });
  // Supabase returns 200 even if email not found (security)
  if(res.ok||res.status===200){
    return {success:true};
  }
  var err=(res.data&&(res.data.msg||res.data.message||res.data.error))||'Could not send reset email. Check your email address and try again.';
  return {success:false,error:err};
}

async function authUpdatePassword(newPassword){
  if(!_session||!_session.access_token){
    return {success:false,error:'Not authenticated.'};
  }
  var res=await _sbFetch('/auth/v1/user',{
    method:'PUT',
    body:JSON.stringify({password:newPassword})
  });
  if(res.ok){
    return {success:true};
  }
  return {success:false,error:'Could not update password. Please try again.'};
}

function showResetPasswordModal(){
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  var box=document.createElement('div');
  box.style.cssText='background:var(--dark2);border:1px solid var(--border);border-radius:12px;padding:32px;width:100%;max-width:380px;';
  var logo=document.createElement('div');
  logo.style.cssText='font-size:18px;font-weight:900;margin-bottom:24px;text-align:center;';
  logo.innerHTML='<span style="color:var(--gold);">ONLY</span>WYNNRS';
  var title=document.createElement('div');
  title.style.cssText='font-size:20px;font-weight:700;margin-bottom:8px;';
  title.textContent='Set New Password';
  var desc=document.createElement('div');
  desc.style.cssText='font-size:13px;color:var(--muted2);margin-bottom:20px;';
  desc.textContent='Choose a new password for your account.';
  var passInp=document.createElement('input');
  passInp.type='password';passInp.placeholder='New password (min 6 chars)';
  passInp.style.cssText='width:100%;box-sizing:border-box;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;padding:12px 14px;color:var(--parch);font-size:14px;margin-bottom:12px;';
  var passInp2=document.createElement('input');
  passInp2.type='password';passInp2.placeholder='Confirm new password';
  passInp2.style.cssText='width:100%;box-sizing:border-box;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;padding:12px 14px;color:var(--parch);font-size:14px;margin-bottom:16px;';
  var errMsg=document.createElement('div');
  errMsg.style.cssText='font-size:12px;color:var(--red2);margin-bottom:12px;display:none;';
  var submitBtn=document.createElement('button');
  submitBtn.className='btn btn-gold btn-sm';
  submitBtn.style.cssText='width:100%;padding:13px;font-size:14px;';
  submitBtn.textContent='Update Password';
  submitBtn.onclick=async function(){
    var pw=passInp.value;var pw2=passInp2.value;
    if(pw.length<6){errMsg.textContent='Password must be at least 6 characters.';errMsg.style.display='block';return;}
    if(pw!==pw2){errMsg.textContent='Passwords do not match.';errMsg.style.display='block';return;}
    submitBtn.textContent='Updating...';submitBtn.disabled=true;
    var res=await authUpdatePassword(pw);
    if(res.success){
      overlay.remove();
      var t=document.createElement('div');
      t.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#166534;color:#4ade80;border:1px solid #4ade80;border-radius:8px;padding:12px 24px;font-size:13px;font-weight:700;z-index:9999;';
      t.textContent='Password updated successfully!';
      document.body.appendChild(t);setTimeout(function(){t.remove();},4000);
    } else {
      errMsg.textContent=res.error;errMsg.style.display='block';
      submitBtn.textContent='Update Password';submitBtn.disabled=false;
    }
  };
  box.appendChild(logo);box.appendChild(title);box.appendChild(desc);
  box.appendChild(passInp);box.appendChild(passInp2);box.appendChild(errMsg);box.appendChild(submitBtn);
  overlay.appendChild(box);document.body.appendChild(overlay);
  setTimeout(function(){passInp.focus();},100);
}
function showAuthModal(mode, onSuccess){
  mode=mode||'login';
  var existing=document.getElementById('authModal');
  if(existing)existing.remove();

  var overlay=document.createElement('div');
  overlay.id='authModal';
  overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

  var box=document.createElement('div');
  box.style.cssText='background:var(--dark2);border:1px solid var(--border);border-radius:12px;padding:32px;width:100%;max-width:400px;';

  var logo=document.createElement('div');
  logo.style.cssText='font-size:18px;font-weight:900;margin-bottom:24px;text-align:center;';
  logo.innerHTML='<span style="color:var(--gold);">ONLY</span>WYNNRS';

  var tabs=document.createElement('div');
  tabs.style.cssText='display:flex;gap:0;margin-bottom:24px;background:var(--dark3);border-radius:8px;padding:3px;';
  var tabLogin=document.createElement('button');
  tabLogin.style.cssText='flex:1;padding:8px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;';
  var tabSignup=document.createElement('button');
  tabSignup.style.cssText='flex:1;padding:8px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s;';

  function setTab(m){
    mode=m;
    if(m==='login'){
      tabLogin.style.cssText+='background:var(--dark1);color:var(--parch);';
      tabSignup.style.cssText='flex:1;padding:8px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--muted2);';
      title.textContent='Welcome back';
      submitBtn.textContent='Sign In';
      switchTxt.innerHTML='No account? <a href="#" id="switchLink" style="color:var(--gold);">Sign up free</a>';
      refWrap.style.display='none';
    } else {
      tabSignup.style.cssText+='background:var(--dark1);color:var(--parch);';
      tabLogin.style.cssText='flex:1;padding:8px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--muted2);';
      title.textContent='Create your account';
      submitBtn.textContent='Create Account';
      switchTxt.innerHTML='Already have one? <a href="#" id="switchLink" style="color:var(--gold);">Sign in</a>';
      refWrap.style.display='block';
    }
    setTimeout(function(){
      var sl=document.getElementById('switchLink');
      if(sl) sl.onclick=function(e){e.preventDefault();setTab(mode==='login'?'signup':'login');};
    },0);
  }

  tabLogin.textContent='Sign In';
  tabSignup.textContent='Sign Up';
  tabLogin.onclick=function(){setTab('login');};
  tabSignup.onclick=function(){setTab('signup');};
  tabs.appendChild(tabLogin);tabs.appendChild(tabSignup);

  var title=document.createElement('div');
  title.style.cssText='font-size:20px;font-weight:700;margin-bottom:20px;';

  var emailInp=document.createElement('input');
  emailInp.type='email';emailInp.placeholder='Email address';
  emailInp.style.cssText='width:100%;box-sizing:border-box;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;padding:12px 14px;color:var(--parch);font-size:14px;margin-bottom:12px;';

  var passInp=document.createElement('input');
  passInp.type='password';passInp.placeholder='Password';
  passInp.style.cssText='width:100%;box-sizing:border-box;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;padding:12px 14px;color:var(--parch);font-size:14px;margin-bottom:16px;';
  var refWrap=document.createElement('div');refWrap.style.cssText='margin-bottom:12px;display:none;';
  var refInp=document.createElement('input');refInp.type='text';refInp.placeholder='Referral code (optional)';
  refInp.style.cssText='width:100%;box-sizing:border-box;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;padding:12px 14px;color:var(--parch);font-size:14px;text-transform:uppercase;letter-spacing:1px;';
  refInp.oninput=function(){this.value=this.value.toUpperCase();};
  var _sr=localStorage.getItem('ow_referral_code');if(_sr)refInp.value=_sr;
  refWrap.appendChild(refInp);

  // Forgot password link
  var forgotWrap=document.createElement('div');
  forgotWrap.style.cssText='text-align:right;margin-top:-8px;margin-bottom:12px;';
  var forgotLink=document.createElement('a');
  forgotLink.href='#';forgotLink.style.cssText='font-size:11px;color:var(--muted2);text-decoration:none;';
  forgotLink.textContent='Forgot password?';
  forgotLink.onclick=function(e){
    e.preventDefault();
    var em=emailInp.value.trim();
    if(!em){errMsg.textContent='Enter your email above first.';errMsg.style.display='block';return;}
    forgotLink.textContent='Sending...';
    authResetPassword(em).then(function(r){
      if(r.success){
        errMsg.style.color='var(--green2)';
        errMsg.textContent='Reset email sent to '+em+'. Check your inbox.';
        errMsg.style.display='block';
        forgotLink.textContent='Forgot password?';
      } else {
        errMsg.style.color='var(--red2)';
        errMsg.textContent=r.error;
        errMsg.style.display='block';
        forgotLink.textContent='Forgot password?';
      }
    });
  };
  forgotWrap.appendChild(forgotLink);

  var errMsg=document.createElement('div');
  errMsg.style.cssText='font-size:12px;color:var(--red2);margin-bottom:12px;display:none;';

  var submitBtn=document.createElement('button');
  submitBtn.className='btn btn-gold btn-sm';
  submitBtn.style.cssText='width:100%;padding:13px;font-size:14px;';

  submitBtn.onclick=async function(){
    var em=emailInp.value.trim();
    var pw=passInp.value;
    if(!em||!pw){errMsg.textContent='Please enter email and password.';errMsg.style.display='block';return;}
    if(pw.length<6){errMsg.textContent='Password must be at least 6 characters.';errMsg.style.display='block';return;}
    submitBtn.textContent='Please wait...';submitBtn.disabled=true;
    if(mode==='signup'){var _rc=refInp.value.trim().toUpperCase();if(_rc)localStorage.setItem('ow_referral_code',_rc);}
    var result=mode==='signup'?await authSignUp(em,pw):await authSignIn(em,pw);
    if(result.success){
      overlay.remove();
      if(onSuccess && !result.needsConfirm){
        onSuccess();
        return;
      }
      // Check for pending tier from pricing page click
      var pendingTier=localStorage.getItem('ow_pending_tier');
      if(pendingTier&&!result.needsConfirm){
        localStorage.removeItem('ow_pending_tier');
        overlay.remove();
        // Small delay to let session settle
        setTimeout(function(){stripeCheckout(pendingTier);},600);
        return;
      }
      var toast=document.createElement('div');
      toast.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#166534;color:#4ade80;border:1px solid #4ade80;border-radius:8px;padding:12px 24px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.5);';
      if(result.needsConfirm){
        toast.style.background='#1e3a5f';toast.style.color='#93c5fd';toast.style.borderColor='#3b82f6';toast.style.fontSize='14px';toast.style.maxWidth='320px';toast.style.lineHeight='1.5';toast.style.textAlign='center';
        toast.textContent='Almost there! Check your email and click the confirmation link — it will bring you straight to checkout.';
      } else {
        toast.textContent=mode==='signup'?'Account created! Welcome to OnlyWynnrs.':'Welcome back!';
      }
      document.body.appendChild(toast);
      setTimeout(function(){toast.remove();},4000);
    } else {
      errMsg.textContent=result.error;errMsg.style.display='block';
      submitBtn.textContent=mode==='login'?'Sign In':'Create Account';
      submitBtn.disabled=false;
    }
  };

  passInp.onkeydown=function(e){if(e.key==='Enter')submitBtn.click();};

  var switchTxt=document.createElement('div');
  switchTxt.style.cssText='font-size:12px;color:var(--muted2);text-align:center;margin-top:14px;';

  var closeBtn=document.createElement('button');
  closeBtn.className='btn btn-dark btn-sm';
  closeBtn.style.cssText='width:100%;margin-top:10px;';
  closeBtn.textContent='Cancel';
  closeBtn.onclick=function(){overlay.remove();};

  box.appendChild(logo);box.appendChild(tabs);box.appendChild(title);
  box.appendChild(emailInp);box.appendChild(passInp);box.appendChild(refWrap);box.appendChild(forgotWrap);box.appendChild(errMsg);
  box.appendChild(submitBtn);box.appendChild(switchTxt);box.appendChild(closeBtn);
  overlay.appendChild(box);document.body.appendChild(overlay);
  setTab(mode);
  setTimeout(function(){emailInp.focus();},100);
}

// ══ STRIPE CHECKOUT ══

function stripeCheckout(tier){
  var links={
    optimizer:'https://buy.stripe.com/eVq00l63icnKcsz1Jt33W00',
    wynnr:'https://buy.stripe.com/6oU7sNbnCfzWbov3RB33W01',
    elite:'https://buy.stripe.com/bJefZj3VabjGeAH87R33W02'
  };
  var url=(typeof STRIPE_PAYMENT_LINKS!=='undefined'&&STRIPE_PAYMENT_LINKS[tier])||links[tier];
  if(!url){alert('Plan not found.');return;}

  // Only use live session object - NOT localStorage
  var isLoggedIn=(_session&&_session.user&&_session.user.email);

  if(!isLoggedIn){
    localStorage.setItem('ow_pending_tier',tier);
    showAuthModal('signup',function(){
      stripeCheckout(tier);
    });
    return;
  }

  localStorage.removeItem('ow_pending_tier');
  // Store pending checkout in localStorage BEFORE leaving
  // GitHub Pages strips URL params so we cannot use redirect URLs
  localStorage.setItem('ow_pending_checkout', tier);
  localStorage.setItem('ow_checkout_ts', Date.now().toString());
  var email=_session.user.email||'';
  window.location.href=url+(email?'?prefilled_email='+encodeURIComponent(email):'');
}
// ══ DATA ══




















// ── DFS SLATE SYSTEM — Date-aware, upcoming slates only ──


// ── SLATES: only show upcoming/today slates, never past ──
// Each slate has a dayOfWeek array — shown when today matches
// daysAhead: how many days from now (0=today, 1=tomorrow, etc)

function getActiveSlate(sport) {
  const slates = SLATE_SCHEDULE[sport] || [];
  // Find slate matching today first, else nearest upcoming
  const match = slates.find(s => (s.days||[]).includes(todayDay));
  return match || slates[0];
}

// ── PLAYER POOLS — complete, scrollable, per-sport ──








const AGENT_REPLIES = [
  `The <span class="hl">Thunder -8.5</span> is tonight's top rated play — <span class="chip-sm">FREE MONEY</span>. That's <span class="chip-sm">2 units</span> if you are following the system.\n\nSGA averaging <span class="chip-sm">34.2 PPG</span> last 5. Suns missing two rotation players. Line moved -7 to -8.5 while 72% of public is on the Suns — textbook reverse line movement. Sharp money is on OKC.`,
  `For UFC tonight — anchor with <span class="hl">Jasudavicius ($9,200 DK / $11,000 FD)</span>. Most reliable floor on the slate.\n\nFor GPP ceiling swing, <span class="hl">Nallo</span> at 30% projected ownership. Five straight 1R finishes — if he connects early you are looking at <span class="chip-sm">120+ pts</span> from one spot.\n\nRemember: generate 3-5 unique lineups using the Portfolio Builder so you have coverage across different outcomes.`,
  `On the Trends page, the most actionable edge right now is <span class="hl">UFC Late-Notice Replacements</span> — fighters taking fights on 10 days notice or less are 4-11 against full-camp opponents. That's 73% win rate against short-notice fighters.\n\nThe <span class="hl">NBA Back-to-Back Road</span> trend is also live tonight. Check the matchup tab for teams on road back-to-backs — those totals and ATS bets against them are historically profitable.`,
];


function buildArticles(filter){
  filter = filter||currentArticleFilter||'all';
  currentArticleFilter = filter;
  var el = document.getElementById('articlesGrid');
  if(!el) return;
  var evergreen = (typeof EVERGREEN_ARTICLES !== 'undefined') ? EVERGREEN_ARTICLES : [];
  var daily = ARTICLES || [];
  var allArticles = evergreen.concat(daily);
  var list;
  if(filter==='all') list = allArticles;
  else if(filter==='education') list = allArticles.filter(function(a){return a.type==='education';});
  else if(filter==='dfs') list = allArticles.filter(function(a){return a.type==='dfs'||a.sport==='dfs';});
  else list = allArticles.filter(function(a){return a.type===filter||a.sport===filter;});
  el.innerHTML = list.map(function(a){
    var key = a.id ? 'e:'+a.id : 'i:'+daily.indexOf(a);
    var isPinned = a.pinned === true;
    var borderCol = isPinned ? 'rgba(201,168,76,.3)' : 'var(--border)';
    var badge = isPinned ? '<div style="position:absolute;top:12px;right:12px;font-size:9px;font-weight:700;letter-spacing:1px;padding:2px 7px;border-radius:4px;background:rgba(201,168,76,.15);color:var(--gold);">EVERGREEN</div>' : '';
    var lockBadge = a.locked ? '<span style="font-size:10px;color:var(--muted);">\uD83D\uDD12 Wynnr</span>' : '<span style="font-size:10px;color:var(--green2);">\u25CF Free</span>';
    return '<div onclick="openArticleByKey(\''+key+'\')" style="background:var(--dark2);border:1px solid '+borderCol+';border-radius:var(--r2);padding:18px;transition:all .2s;cursor:pointer;position:relative;" onmouseover="this.style.borderColor=\'var(--border2)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.borderColor=\''+borderCol+'\';this.style.transform=\'\'">'
      +badge
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;flex-wrap:wrap;">'
      +'<span style="font-size:9px;font-weight:700;letter-spacing:1px;padding:3px 8px;border-radius:4px;background:rgba(201,168,76,.1);color:var(--gold);">'+a.tag+'</span>'
      +lockBadge
      +'</div>'
      +'<div style="font-size:14px;font-weight:600;margin-bottom:6px;line-height:1.4;">'+a.title+'</div>'
      +'<div style="font-size:11px;color:var(--muted);margin-bottom:10px;">'+a.time+'</div>'
      +'<div style="font-size:12px;color:var(--gold);font-weight:600;">Read article \u2192</div>'
      +'</div>';
  }).join('');
}

function openArticleByKey(key){
  var a;
  if(key && key.indexOf('e:')===0){
    var id = key.slice(2);
    a = (typeof EVERGREEN_ARTICLES !== 'undefined') ? EVERGREEN_ARTICLES.filter(function(x){return x.id===id;})[0] : null;
  } else if(key && key.indexOf('i:')===0){
    a = ARTICLES[parseInt(key.slice(2))];
  } else {
    a = ARTICLES[parseInt(key)];
  }
  if(!a) return;
  var canRead = !a.locked || (typeof isWynnrPlus === 'function' && isWynnrPlus()) || currentUserRole==='owner';
  if(!canRead){
    var ov=document.getElementById('articleOverlay');
    if(ov){var ot=document.getElementById('overlayTitle');if(ot)ot.textContent=a.title;ov.style.display='flex';}
    else{stripeCheckout('wynnr');}
    return;
  }
  var viewer=document.getElementById('articleViewer');
  var list=document.getElementById('articlesListPane');
  if(!viewer) return;
  var html='<button onclick="closeArticle()" style="background:none;border:none;color:var(--gold);font-size:13px;font-weight:600;cursor:pointer;margin-bottom:20px;display:flex;align-items:center;gap:6px;padding:0;">&#8592; Back to Articles</button>';
  html+='<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--gold);margin-bottom:8px;">'+a.tag+'</div>';
  html+='<div style="font-family:var(--fd);font-size:clamp(20px,4vw,32px);letter-spacing:1px;line-height:1.2;margin-bottom:12px;color:var(--parch);">'+a.title+'</div>';
  html+='<div style="font-size:11px;color:var(--muted);margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border);">'+a.time+'</div>';
  html+='<div style="font-size:14px;color:var(--muted2);line-height:1.85;">'+a.body+'</div>';
  html+='<div style="margin-top:28px;padding:16px;background:rgba(58,148,96,.05);border:1px solid rgba(58,148,96,.15);border-radius:var(--r2);">';
  html+='<div style="font-size:12px;font-weight:600;color:var(--green2);margin-bottom:4px;">Bet smarter. Think in months, not nights.</div>';
  html+='<div style="font-size:12px;color:var(--muted2);">The edge compounds over time. Use the unit system. Track every bet.</div>';
  html+='</div>';
  viewer.innerHTML=html;
  viewer.style.display='block';
  if(list) list.style.display='none';
}

function openArticle(idx){
  var a=ARTICLES[idx];
  if(!a) return;

  // Gate check
  var canRead=!a.locked||isWynnrPlus()||currentUserRole==='owner';

  if(!canRead){
    var ov=document.getElementById('articleOverlay');
    if(ov){
      var ot=document.getElementById('overlayTitle');
      if(ot) ot.textContent=a.title;
      ov.style.display='flex';
    } else {
      // Fallback: go to pricing
      stripeCheckout('wynnr');
    }
    return;
  }

  // Show article viewer
  var viewer=document.getElementById('articleViewer');
  var list=document.getElementById('articlesListPane');
  if(!viewer) return;

  var html='<button onclick="closeArticle()" style="background:none;border:none;color:var(--gold);font-size:13px;font-weight:600;cursor:pointer;margin-bottom:20px;display:flex;align-items:center;gap:6px;padding:0;">&#8592; Back to Articles</button>';
  html+='<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--gold);margin-bottom:8px;">'+a.tag+'</div>';
  html+='<div style="font-family:var(--fd);font-size:clamp(20px,4vw,32px);letter-spacing:1px;line-height:1.2;margin-bottom:12px;color:var(--parch);">'+a.title+'</div>';
  html+='<div style="font-size:11px;color:var(--muted);margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--border);">'+a.time+'</div>';
  html+='<div style="font-size:14px;color:var(--muted2);line-height:1.85;">'+a.body+'</div>';
  html+='<div style="margin-top:28px;padding:16px;background:rgba(58,148,96,.05);border:1px solid rgba(58,148,96,.15);border-radius:var(--r2);">';
  html+='<div style="font-size:12px;font-weight:600;color:var(--green2);margin-bottom:4px;">Bet smarter. Think in months, not nights.</div>';
  html+='<div style="font-size:12px;color:var(--muted2);">The edge compounds over time. Use the unit system. Track every bet.</div>';
  html+='</div>';

  viewer.innerHTML=html;
  viewer.style.display='block';
  if(list) list.style.display='none';
}

function closeArticle(){
  var viewer=document.getElementById('articleViewer');
  var list=document.getElementById('articlesListPane');
  if(viewer) viewer.style.display='none';
  if(list) list.style.display='block';
}

function initArticlesTabs(){
  const tb=document.getElementById('articlesTabs');
  if(!tb)return;
  tb.onclick=e=>{
    if(!e.target.classList.contains('tab'))return;
    tb.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
    e.target.classList.add('on');
    buildArticles(e.target.dataset.atype);
    closeArticle();
  };
}

const AFFILIATE_OFFERS = [
  {book:'DraftKings',  badge:'Up to $200',  color:'#ff6600',
   copy:'Bet $5, get $200 in bonus bets instantly. No sweat first bet on any game.',
   cta:'Claim at DraftKings', url:'https://draftkings.com',
   note:'Must be 21+. New users only. Terms apply.'},
  {book:'FanDuel',     badge:'Up to $1,000', color:'#1493ff',
   copy:'No-sweat first bet up to $1,000. If you lose your first bet, get it back in bonus bets.',
   cta:'Claim at FanDuel', url:'https://fanduel.com',
   note:'Must be 21+. New users only. Terms apply.'},
  {book:'BetMGM',      badge:'Up to $1,500', color:'#c9a84c',
   copy:'First bet offer up to $1,500. Use code ONLYWYNNRS for maximum bonus.',
   cta:'Claim at BetMGM', url:'https://betmgm.com',
   note:'Must be 21+. New users only. Terms apply.'},
  {book:'Caesars',     badge:'Up to $1,000', color:'#8b6914',
   copy:'First bet on Caesars. Up to $1,000 back in bonus bets if your first bet loses.',
   cta:'Claim at Caesars', url:'https://caesars.com',
   note:'Must be 21+. New users only. Terms apply.'},
];



// ══ STATE ══
let currentMode='GPP', currentBook='dk', pfCount=3, currentArticleFilter='all';
let bets=[], parlayLegs=[], msgCount=0;
let lastRefresh = new Date();
let currentOddsType = 'spreads';
let currentUserRole = localStorage.getItem('ow_role') || 'guest';
let oddsApiKey = localStorage.getItem('ow_odds_api_key') || '';
const qaStorageKey = 'ow_qa_status_v1';
const poolStorageKey = 'ow_pool_state_v1';
const QA_ITEMS = [
  {id:'nav',title:'Navigation works',desc:'Every nav item opens the correct page and mobile menu closes cleanly.'},
  {id:'emails',title:'Email capture works',desc:'Free signup accepts valid email and rejects invalid email.'},
  {id:'dfs_dup',title:'DFS has no duplicates',desc:'Generate 10 lineups on each platform/sport and confirm no duplicate players in one build.'},
  {id:'dfs_cap',title:'DFS respects salary cap',desc:'Every generated lineup stays at or under the active platform cap.'},
  {id:'dfs_pool',title:'Pool controls work',desc:'Exclude, Favorite, and Lock correctly affect builds and portfolio output.'},
  {id:'odds',title:'Odds board loads',desc:'Demo odds load, refresh works, and live key test succeeds if configured.'},
  {id:'pricing',title:'Pricing buttons behave',desc:'Owner mode bypasses paywall messaging and non-owner buttons show the correct next step.'},
  {id:'mobile',title:'Mobile layout is clean',desc:'No horizontal scroll, controls fit on smaller screens, and tables remain readable.'},
  {id:'footer',title:'Footer/social links work',desc:'All social links open, disclaimers render, and key page links are correct.'},
  {id:'console',title:'No obvious console errors',desc:'Open DevTools and confirm major flows aren’t throwing runtime errors.'},
];

// ══ HIGH CONFIDENCE PARLAYS DATA ══




// ══ ARTICLES DATA ══











function buildParlayCards(){
  const el = document.getElementById('parlayCardsGrid');
  if(!el) return;
  el.innerHTML = HC_PARLAYS.map(p=>`
    <div style="background:var(--dark2);border:1px solid rgba(201,168,76,.18);border-radius:var(--r2);padding:20px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--gold);margin-bottom:4px;">💎 HIGH CONFIDENCE PARLAY</div>
          <div style="font-family:var(--fd);font-size:22px;letter-spacing:.5px;">${p.title}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:var(--fm);font-size:20px;color:var(--green2);">${p.combinedOdds}</div>
          <div style="font-size:10px;color:var(--muted);">Combined odds</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
        ${(p.legs||[]).map((leg,i)=>`<div style="background:var(--dark3);border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div>
            <div style="font-size:12px;font-weight:600;margin-bottom:2px;">Leg ${i+1}: ${leg}</div>
            <div style="font-size:11px;color:var(--muted2);">${p.reasons[i]}</div>
          </div>
          <div style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;background:rgba(58,148,96,.15);color:var(--green2);white-space:nowrap;margin-top:2px;">EDGE ✓</div>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
        <div style="background:var(--dark3);border-radius:7px;padding:8px 12px;text-align:center;flex:1;min-width:70px;">
          <div style="font-family:var(--fd);font-size:18px;color:var(--parch);">${p.winProb}</div>
          <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Win prob</div>
        </div>
        <div style="background:var(--dark3);border-radius:7px;padding:8px 12px;text-align:center;flex:1;min-width:70px;">
          <div style="font-family:var(--fd);font-size:18px;color:var(--green2);">${p.ev}</div>
          <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">EV</div>
        </div>
        <div style="background:var(--dark3);border-radius:7px;padding:8px 12px;text-align:center;flex:1;min-width:70px;">
          <div style="font-family:var(--fd);font-size:18px;color:var(--gold);">${p.units}</div>
          <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Bet size</div>
        </div>
        <div style="background:var(--dark3);border-radius:7px;padding:8px 12px;text-align:center;flex:1;min-width:80px;">
          <div style="font-size:11px;font-weight:700;color:${p.ratingColor};margin-top:2px;">${p.rating}</div>
          <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Rating</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--muted2);font-style:italic;padding-top:10px;border-top:1px solid var(--border);">Remember: parlays are bonus plays only. Each leg should have standalone edge. Max 1 unit per parlay.</div>
    </div>`).join('');
}


function initArticlesTabs(){
  const tb = document.getElementById('articlesTabs');
  if(!tb) return;
  tb.onclick = e=>{
    if(!e.target.classList.contains('tab')) return;
    tb.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
    e.target.classList.add('on');
    buildArticles(e.target.dataset.atype);
  };
}

function applyAmbassador(){
  const el = document.getElementById('ambassadorEmail');
  if(!el?.value?.includes('@')){ alert('Please enter a valid email address.'); return; }
  alert('Application received! We will reach out to ' + el.value + ' within 24 hours with your tracking link and onboarding materials. Welcome to the team. 🏆');
  el.value = '';
}

// ══ INIT ══

function updatePaywalls(){
  // Re-check all active paywalls after session/tier loads
  var tier=getTier();
  var wynnr=isWynnrPlus();
  var dfs=isDFSUnlocked();

  // Remove stale gates if user is now unlocked
  if(wynnr){
    ['page-sharp','page-parlays','page-picks'].forEach(function(id){
      var pg=document.getElementById(id);
      if(pg){
        var gate=pg.querySelector('.paywall-gate');
        if(gate) gate.remove();
      }
    });
    // Rebuild picks if they were limited
    var pg=document.getElementById('fullPicksGrid');
    if(pg && pg.querySelector('.paywall-gate')===null){
      buildFullPicks();
    }
  }
  if(dfs){
    var dfsGate=document.querySelector('#page-dfs .dfs-teaser');
    if(dfsGate) dfsGate.remove();
    var lineupGate=document.querySelector('#lineupDisplay .btn-gold');
    if(lineupGate) genLineup();
  }
}
function init(){
  // Check for pending Stripe checkout (survives GitHub Pages redirect)
  var _pendingCheckout = localStorage.getItem('ow_pending_checkout');
  var _checkoutTs = parseInt(localStorage.getItem('ow_checkout_ts')||'0');
  var _checkoutAge = Date.now() - _checkoutTs;
  // Check URL for Stripe success redirect (?checkout=success&tier=wynnr)
  var _urlParams = new URLSearchParams(window.location.search);
  var _stripeSuccess = _urlParams.get('checkout') === 'success';
  var _stripeTier = _urlParams.get('tier');
  if(_stripeSuccess && _stripeTier) {
    // Override pending checkout with URL params (more secure)
    _pendingCheckout = _stripeTier;
    localStorage.setItem('ow_pending_checkout', _stripeTier);
    localStorage.setItem('ow_checkout_ts', Date.now().toString());
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
  // SECURITY: Only process if came from Stripe (URL param) OR within 5 min window
  // Reduced from 30min to 5min to limit exposure
  var _secureWindow = _stripeSuccess || _checkoutAge < 5*60*1000;
  if(_pendingCheckout && _secureWindow){
    console.log('Pending checkout detected:', _pendingCheckout);
    localStorage.removeItem('ow_pending_checkout');
    localStorage.removeItem('ow_checkout_ts');
    // Set localStorage tier immediately for instant access
    if(_pendingCheckout==='optimizer'){
      localStorage.setItem('ow_optimizer','true');
    } else {
      localStorage.setItem('ow_member','true');
    }
    // Upgrade Supabase profile once session loads
    var _co_tier = _pendingCheckout;
    var _co_attempts = 0;
    function _tryCoUpgrade(){
      if(_session&&_session.user&&_session.user.id){
        console.log('Upgrading Supabase profile to:', _co_tier);
        upgradeUserTier(_co_tier);
      } else if(_co_attempts < 30){
        _co_attempts++;
        setTimeout(_tryCoUpgrade, 500);
      }
    }
    setTimeout(_tryCoUpgrade, 1000);
    // Show success banner
    setTimeout(function(){
      updateAuthUI();
      var t=document.createElement('div');
      t.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%);'+
        'background:#166534;color:#4ade80;border:1px solid #4ade80;border-radius:8px;'+
        'padding:14px 28px;font-size:14px;font-weight:700;z-index:9999;'+
        'box-shadow:0 4px 20px rgba(0,0,0,.5);white-space:nowrap;';
      t.textContent='Payment successful! Welcome to OnlyWynnrs '+
        _co_tier.charAt(0).toUpperCase()+_co_tier.slice(1)+'. ';
      document.body.appendChild(t);
      setTimeout(function(){t.remove();},6000);
    }, 1500);
  }
  // ── Check for Supabase email confirmation FIRST ──
  // Must run before loadFromHash() which clears the URL hash
  (function(){
    var raw=window.location.hash;
    if(raw.indexOf('access_token=')>-1){
      var hp=new URLSearchParams(raw.replace('#',''));
      var tok=hp.get('access_token');
      var typ=hp.get('type');
      // PASSWORD RECOVERY — show reset modal
      if(tok&&typ==='recovery'){
        window.history.replaceState({},'',window.location.pathname);
        _session={access_token:tok,user:{email:''}};
        _sbFetch('/auth/v1/user').then(function(r){
          if(r.ok&&r.data&&r.data.email){
            _session.user=r.data;
            localStorage.setItem('ow_session',JSON.stringify(_session));
          }
        }).then(function(){
          _sessionReady=true;
          updateAuthUI();
          setTimeout(function(){showResetPasswordModal();},500);
        });
        return;
      }
      // EMAIL CONFIRMATION / MAGIC LINK — sign in and continue
      if(tok&&(typ==='signup'||typ==='magiclink')){
        // Clear hash immediately before loadFromHash sees it
        window.history.replaceState({},'',window.location.pathname);
        _session={access_token:tok,user:{email:''}};
        localStorage.setItem('ow_session',JSON.stringify(_session));
        // Fetch user and continue
        _sbFetch('/auth/v1/user').then(function(r){
          if(r.ok&&r.data&&r.data.email){
            _session.user=r.data;
            localStorage.setItem('ow_session',JSON.stringify(_session));
            return loadProfile();
          }
        }).then(function(){
          _sessionReady=true;
          updateAuthUI();
          var pt=localStorage.getItem('ow_pending_tier');
          if(pt){
            localStorage.removeItem('ow_pending_tier');
            setTimeout(function(){stripeCheckout(pt);},600);
          } else {
            setTimeout(function(){
              var t=document.createElement('div');
              t.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%);background:#166534;color:#4ade80;border:1px solid #4ade80;border-radius:8px;padding:12px 24px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.5);';
              t.textContent='Email confirmed! Welcome to OnlyWynnrs.';
              document.body.appendChild(t);
              setTimeout(function(){t.remove();},4000);
            },400);
          }
        });
        return;
      }
    }
    // Normal load — restore session from localStorage
    if(typeof detectReferral==='function') detectReferral();
  restoreSession();
  })();
  loadFromHash();
  loadDailyContent().then(function(){
    buildTicker(); buildBI(); buildHomePicks(); buildFMPicks();
    buildSharp(); buildTrends(); buildOddsBoard('spreads'); buildOffers();
  });
  setTimeout(animStats,400);
  setTimeout(()=>{document.querySelectorAll('.rise').forEach(el=>obs.observe(el));forceVisible('page-home');},100);
  initParlay(); updateTrackerSummary(); drawROI();
  syncSettingsUI(); updateBookInfo
  // Handle Stripe checkout return — read from hash (GitHub Pages strips query strings)
  var _checkHash=window.location.hash.replace('#','');
  var _checkSearch=window.location.search.replace('?','');
  var _checkStr=_checkHash.indexOf('checkout=success')>-1?_checkHash:_checkSearch;
  var urlParams=new URLSearchParams(_checkStr);
  if(urlParams.get('checkout')==='success'){
    var tier=urlParams.get('tier')||'wynnr';
    if(tier==='optimizer'){
      localStorage.setItem('ow_optimizer','true');
    } else {
      localStorage.setItem('ow_member','true');
    }
    // Upgrade Supabase profile — wait for session to be ready
    var upgradeAttempts=0;
    function tryUpgrade(){
      if(_session&&_session.user&&_session.user.id){
        console.log('Attempting tier upgrade to:', tier);
        upgradeUserTier(tier);
      } else if(upgradeAttempts<30){
        upgradeAttempts++;
        console.log('Waiting for session... attempt', upgradeAttempts);
        setTimeout(tryUpgrade,500);
      } else {
        console.error('Session never loaded - using localStorage fallback');
        if(tier==='wynnr'||tier==='elite') localStorage.setItem('ow_member','true');
        if(tier==='optimizer') localStorage.setItem('ow_optimizer','true');
        updateAuthUI();
      }
    }
    setTimeout(tryUpgrade,1000);
    // Clean URL
    window.history.replaceState({},'',window.location.pathname);
    // Show success message
    setTimeout(function(){
      var msg=document.createElement('div');
      msg.style.cssText='position:fixed;top:70px;left:50%;transform:translateX(-50%);'+
        'background:#166534;color:#4ade80;border:1px solid #4ade80;border-radius:8px;'+
        'padding:12px 24px;font-size:13px;font-weight:700;z-index:9999;'+
        'box-shadow:0 4px 20px rgba(0,0,0,.5);';
      msg.textContent='✓ Payment successful! Welcome to OnlyWynnrs '+tier.charAt(0).toUpperCase()+tier.slice(1)+'.';
      document.body.appendChild(msg);
      setTimeout(function(){msg.remove();},5000);
    },500);
  }
  if(urlParams.get('checkout')==='cancelled'){
    window.history.replaceState({},'',window.location.pathname);
  }
  var _is=document.getElementById('sportSel')?.value||'ufc'; updatePositionFilter(_is); renderSlateSelect(_is); renderPlayerPool(); genLineup(); refreshLeverage(); buildPortfolio(); renderQa();
  initOddsTabs(); initPicksTabs(); updatePricingButtons();
}

function buildTicker(){
  const el=document.getElementById('tickerEl');
  const items=[...TICKER_DATA,...TICKER_DATA];
  el.innerHTML=items.map(t=>`<div class="tick-item"><span class="ts">${t.s}</span><span>${t.p}</span><span class="${t.r==='LOSS'?'tl':t.r==='LIVE'?'tlv':'tw'}">${t.r}</span></div>`).join('');
}

function buildBI(){
  const el=document.getElementById('biList');
  if(!el)return;
  el.innerHTML=BI_TIERS.map(t=>`<div style="display:flex;align-items:flex-start;gap:14px;padding:14px;background:var(--dark2);border:1px solid var(--border);border-radius:var(--r2);margin-bottom:8px;transition:border-color .2s;" onmouseover="this.style.borderColor='var(--border2)'" onmouseout="this.style.borderColor='var(--border)'">
    <div style="width:50px;height:50px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:800;letter-spacing:.4px;text-align:center;line-height:1.4;flex-shrink:0;background:${t.bg};color:${t.color};border:1px solid ${t.border};">${t.badge}</div>
    <div style="flex:1;">
      <div style="font-size:14px;font-weight:600;color:${t.color};margin-bottom:3px;">${t.name}</div>
      <div style="font-size:12px;color:var(--muted2);line-height:1.65;margin-bottom:7px;">${t.desc}</div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;">${(t.stats||[]).map(([l,v])=>`<span style="font-size:10px;color:var(--muted);">${l}: <b style="color:var(--parch);">${v}</b></span>`).join('')}</div>
    </div>
  </div>`).join('');
}

function ratingLabel(r){return{FREE:'FREE MONEY',HIGH:'HIGH VALUE',STD:'STANDARD PLAY',PARL:'PARLAY PIECE',LOTT:'LOTTERY TICKET'}[r]||r;}
function pickCard(p, locked=false, mode='full'){
  const labelMap = {FREE:'FREE MONEY',HIGH:'HIGH VALUE',STD:'STANDARD PLAY',PARL:'PARLAY PIECE',LOTT:'LOTTERY TICKET'};
  const rcMap = {FREE:'rc-FREE',HIGH:'rc-HIGH',STD:'rc-STD',PARL:'rc-PARL',LOTT:'rc-LOTT'};
  const label = p.sport.toUpperCase();
  if(locked) return `<div class="lock-card"><div style="font-size:22px;opacity:.2;">🔒</div><div style="font-family:var(--fd);font-size:17px;letter-spacing:1px;">LOCKED</div><div style="font-size:12px;color:var(--muted2);">Wynnr access required</div><button class="btn btn-gold btn-sm" onclick="go('pricing',null)">Get Wynnr →</button></div>`;
  if(mode==='teaser') return `<div class="pick-card" style="position:relative;overflow:hidden;">
    <div class="pick-top"><span class="sport-chip sc-${p.sport}">${label}</span><span class="rating-chip ${rcMap[p.rating]}">${labelMap[p.rating]||p.rating}</span></div>
    <div class="pick-matchup">${p.matchup}</div>
    <div class="pick-call">${p.call}</div>
    <div style="filter:blur(5px);pointer-events:none;user-select:none;">
      <div class="pick-why">${p.why}</div>
      <div class="pick-size">Recommended: <b>${p.units}</b></div>
    </div>
    <div style="position:absolute;bottom:0;left:0;right:0;padding:12px 16px;background:linear-gradient(transparent,var(--dark2) 60%);display:flex;align-items:flex-end;justify-content:center;padding-top:40px;">
      <button class="btn btn-gold btn-sm" onclick="go('pricing',null)" style="font-size:11px;">Unlock Full Pick →</button>
    </div>
    <div class="pick-foot" style="visibility:hidden;"><span class="pick-odds">${p.odds}</span><span class="pick-time">${p.time}</span></div>
  </div>`;
  return `<div class="pick-card">
    <div class="pick-top"><span class="sport-chip sc-${p.sport}">${label}</span><span class="rating-chip ${rcMap[p.rating]}">${labelMap[p.rating]||p.rating}</span></div>
    <div class="pick-matchup">${p.matchup}</div>
    <div class="pick-call">${p.call}</div>
    <div class="pick-why">${p.why}</div>
    <div class="pick-size">Recommended: <b>${p.units}</b></div>
    <div class="pick-foot"><span class="pick-odds">${p.odds}</span><span class="pick-time">${p.time}</span></div>
  </div>`;
}


function buildHomePicks(){
  var el = document.getElementById('homePicksGrid');
  if(!el) return;
  var sports = ['nba','mlb','ufc','pga','tennis'];
  var shown = [];
  sports.forEach(function(s){
    var p = PICKS.find(function(pk){ return pk.sport===s; });
    if(p && shown.length < 4) shown.push(p);
  });
  var html_out = '';
  shown.slice(0,2).forEach(function(p){ html_out += pickCard(p,false,'full'); });
  shown.slice(2,4).forEach(function(p){ html_out += pickCard(p,false,'teaser'); });
  html_out += teaserLockCard();
  el.innerHTML = html_out;
}

function teaserLockCard(){
  return `<div style="background:var(--dark2);border:1px solid rgba(201,168,76,.2);border-radius:var(--r2);padding:24px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;min-height:180px;justify-content:center;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;backdrop-filter:blur(2px);background:rgba(8,8,8,.7);border-radius:var(--r2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;">
      <div style="font-size:22px;">🔒</div>
      <div style="font-family:var(--fd);font-size:18px;letter-spacing:1px;">+14 MORE PICKS TODAY</div>
      <div style="font-size:12px;color:var(--muted2);max-width:220px;">Join free to unlock 1 pick per sport daily. No card required.</div>
      <div class="email-bar" style="max-width:300px;margin:0;">
        <input type="email" placeholder="Your email..." id="inlineGateEmail" style="font-size:12px;padding:10px 12px;"/>
        <button onclick="joinFree('inlineGateEmail')" style="padding:10px 14px;font-size:11px;">Unlock →</button>
      </div>
    </div>
  </div>`;
}


function buildFullPicks(filter){
  filter = filter || 'all';
  const el = document.getElementById('fullPicksGrid');
  if(!el) return;
  var allPicks = filter==='all' ? PICKS : PICKS.filter(function(p){return p.sport===filter;});
  var unlocked = isWynnrPlus() || currentUserRole==='owner';
  var visiblePicks = unlocked ? allPicks : allPicks.slice(0,3);

  el.innerHTML = visiblePicks.map(function(p){
    return pickCard(p, false, 'full');
  }).join('');

  // Show upgrade teaser for locked users
  if(!unlocked && allPicks.length > 3){
    var remaining = allPicks.length - 3;
    var teaser = document.createElement('div');
    teaser.style.cssText='text-align:center;padding:28px;background:var(--dark2);border:1px solid var(--border);border-radius:var(--r2);margin-top:8px;';
    teaser.innerHTML='<div style="font-size:24px;margin-bottom:10px;">&#128274;</div>'+
      '<div style="font-weight:700;margin-bottom:6px;">'+remaining+' more picks today</div>'+
      '<div style="font-size:12px;color:var(--muted2);margin-bottom:16px;">Wynnr members get every pick, every sport — with full reasoning, unit sizing, and line movement.</div>';
    var btn=document.createElement('button');
    btn.className='btn btn-gold btn-sm';
    btn.textContent='Unlock All Picks';
    btn.onclick=function(){stripeCheckout('wynnr');};
    teaser.appendChild(btn);
    el.appendChild(teaser);
  }
}

function initPicksTabs(){
  const tb=document.getElementById('picksTabs');if(!tb)return;
  tb.onclick=e=>{if(!e.target.classList.contains('tab'))return;tb.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));e.target.classList.add('on');buildFullPicks(e.target.dataset.sport);};
}

function buildFMPicks(){
  const el=document.getElementById('fmGrid');if(!el)return;
  const cn=document.getElementById('fmCount');if(cn)cn.textContent=FM_PICKS.length;
  var visiblePicks = isUnlocked() ? FM_PICKS : FM_PICKS.slice(0,3);
  el.innerHTML=visiblePicks.map(p=>`<div class="fm-card">
    <div class="fm-label">🟢 FREE MONEY</div>
    <div class="fm-matchup">${p.matchup}</div>
    <div class="fm-call">${p.call}</div>
    <div class="fm-why">${p.why}</div>
    <div class="fm-metrics">
      <div class="fm-metric"><div class="fm-metric-n" style="color:var(--green2);">${p.ev}</div><div class="fm-metric-l">Exp. Value</div></div>
      <div class="fm-metric"><div class="fm-metric-n" style="color:var(--parch);">${p.winProb}</div><div class="fm-metric-l">Win Prob</div></div>
      <div class="fm-metric"><div class="fm-metric-n" style="color:var(--gold);">✓</div><div class="fm-metric-l">Sharp ✓</div></div>
      <div class="fm-metric"><div class="fm-metric-n" style="color:var(--blue2);">${p.lineMove}</div><div class="fm-metric-l">Line Move</div></div>
    </div>
    <div style="font-size:11px;color:var(--muted2);margin-bottom:10px;">Recommended: <b style="color:var(--gold);">${p.units}</b></div>
    <div class="fm-foot"><span class="fm-odds">${p.odds}</span></div>
  </div>`).join('');
  if(!isUnlocked()&&FM_PICKS.length>3){
    var rem=FM_PICKS.length-3;
    var gDiv=document.createElement('div');
    gDiv.style.cssText='background:var(--dark2);border:1px dashed var(--gold);border-radius:var(--r2);padding:24px;text-align:center;margin-top:8px;';
    var lockIcon=document.createElement('div');lockIcon.style.cssText='font-size:20px;margin-bottom:8px;';lockIcon.textContent='\u{1F512}';
    var lockTitle=document.createElement('div');lockTitle.style.cssText='font-size:14px;font-weight:700;margin-bottom:6px;';
    lockTitle.textContent=rem+' more plays today';
    var lockDesc=document.createElement('div');lockDesc.style.cssText='font-size:12px;color:var(--muted2);margin-bottom:16px;';
    lockDesc.textContent='Wynnr members get all daily free money plays with full reasoning.';
    var unlockBtn=document.createElement('button');
    unlockBtn.className='btn btn-gold btn-sm';unlockBtn.textContent='Unlock All Picks';
    unlockBtn.onclick=function(){go('pricing',null);};
    gDiv.appendChild(lockIcon);gDiv.appendChild(lockTitle);gDiv.appendChild(lockDesc);gDiv.appendChild(unlockBtn);
    el.appendChild(gDiv);
  }
}


function buildOffers(){
  var el = document.getElementById('offerGrid');
  if(!el) return;
  var out = '';
  AFFILIATE_OFFERS.forEach(function(o){
    out += '<div style="background:var(--dark2);border:1px solid var(--border);border-radius:var(--r2);padding:20px;">';
    out += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    out += '<div style="font-family:var(--fd);font-size:22px;letter-spacing:1px;color:'+o.color+';">'+o.book+'</div>';
    out += '<div style="background:rgba(58,148,96,.15);color:var(--green2);font-size:11px;font-weight:700;padding:4px 10px;border-radius:5px;">'+o.badge+'</div>';
    out += '</div>';
    out += '<div style="font-size:13px;color:var(--muted2);line-height:1.65;margin-bottom:14px;">'+o.copy+'</div>';
    out += '<a href="'+o.url+'" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;background:var(--gold);color:#000;border-radius:var(--r);padding:11px 20px;font-weight:700;font-size:13px;text-decoration:none;">'+o.cta+' &rarr;</a>';
    out += '<div style="font-size:10px;color:var(--muted);margin-top:8px;text-align:center;">'+o.note+'</div>';
    out += '</div>';
  });
  el.innerHTML = out;
}

function openOffer(i){
  const offer=AFFILIATE_OFFERS[i];
  if(offer && offer.url){ window.open(offer.url,'_blank','noopener'); return; }
  alert(`Add your real ${offer.book} affiliate URL in the AFFILIATE_OFFERS section first.`);
}

// ── ODDS BOARD ──
function buildOddsBoard(type){
  currentOddsType = type;
  var data = ODDS_DATA[type] || {};
  var leagues = [
    {key:'nba', label:'NBA', rowsId:'oddsNBARows'},
    {key:'mlb', label:'MLB', rowsId:'oddsMLBRows'},
    {key:'nhl', label:'NHL', rowsId:'oddsNHLRows'},
    {key:'tennis', label:'Tennis', rowsId:'oddsTennisRows'},
  ];
  leagues.forEach(function(lg){
    var el = document.getElementById(lg.rowsId);
    if(!el) return;
    var rows = data[lg.key] || [];
    if(!rows.length){ el.innerHTML='<div style="padding:14px 16px;font-size:13px;color:var(--muted2);">No games currently available.</div>'; return; }
    el.innerHTML = rows.map(function(r){
      var edgeClass = r.edge==='FREE'?'vb-free':r.edge==='HIGH'?'vb-high':'vb-std';
      var edgeLabel = r.edge==='FREE'?'FREE $':r.edge==='HIGH'?'VALUE':'STD';
      var mvIcon = r.move==='up'?'<span class="or-move-up">▲</span>':r.move==='dn'?'<span class="or-move-dn">▼</span>':'';
      return '<div class="odds-row">' +
        '<div><div class="or-game">'+r.game+'</div><div class="or-time">'+r.time+' '+mvIcon+'</div></div>' +
        '<div class="or-cell '+(r.edge==='FREE'?'or-best':'')+'">'+r.dk+'</div>' +
        '<div class="or-cell '+(r.edge==='HIGH'?'or-best':'')+'">'+r.fd+'</div>' +
        '<div class="or-cell oh-hide">'+r.mgm+'</div>' +
        '<div class="or-cell oh-hide">'+r.cae+'</div>' +
        '<div class="or-val"><span class="val-badge '+edgeClass+'">'+edgeLabel+'</span></div>' +
      '</div>';
    }).join('');
  });
}


function initOddsTabs(){
  const tb=document.getElementById('oddsTabs');if(!tb)return;
  tb.onclick=e=>{if(!e.target.classList.contains('tab'))return;tb.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));e.target.classList.add('on');buildOddsBoard(e.target.dataset.otype);};
}

async function refreshOdds(){
  const btn=event?.target;
  if(btn){btn.textContent='Refreshing...';btn.disabled=true;}
  try{
    if(oddsApiKey){
      await fetchLiveOdds();
      document.getElementById('lastUpdatedText').textContent='Last updated: live API pull';
    }else{
      lastRefresh=new Date();
      document.getElementById('lastUpdatedText').textContent='Last updated: demo refresh';
      buildOddsBoard(currentOddsType);
    }
  }catch(err){
    console.error(err);
    alert('Live odds refresh failed. Falling back to demo data.');
    buildOddsBoard(currentOddsType);
  }finally{
    if(btn){btn.textContent='↻ Refresh Odds';btn.disabled=false;}
  }
}
async function fetchLiveOdds(){
  const sportMap={nfl:'americanfootball_nfl',nba:'basketball_nba',mlb:'baseball_mlb'};
  const regions='us';
  const markets=currentOddsType==='spreads'?'spreads':currentOddsType==='totals'?'totals':'h2h';
  const books='draftkings,fanduel,betmgm,caesars';
  const results={nfl:[],nba:[],mlb:[]};
  for(const [shortKey,apiSport] of Object.entries(sportMap)){
    const url=`https://api.the-odds-api.com/v4/sports/${apiSport}/odds?apiKey=${encodeURIComponent(oddsApiKey)}&regions=${regions}&markets=${markets}&bookmakers=${books}&oddsFormat=american`;
    const res=await fetch(url);
    if(!res.ok) throw new Error(`Odds API error for ${shortKey}: ${res.status}`);
    const data=await res.json();
    results[shortKey]=(data||[]).slice(0,4).map(ev=>mapOddsEvent(ev, markets));
  }
  ODDS_DATA[currentOddsType]=results;
  buildOddsBoard(currentOddsType);
}
function mapOddsEvent(ev, marketType){
  const books={draftkings:'—',fanduel:'—',betmgm:'—',caesars:'—'};
  (ev.bookmakers||[]).forEach(bk=>{
    const mk=(bk.markets||[]).find(m=>m.key===marketType);
    if(!mk) return;
    let val='—';
    if(marketType==='h2h'){
      val = mk.outcomes?.[0]?.price!=null ? `${mk.outcomes[0].price>0?'+':''}${mk.outcomes[0].price}` : '—';
    } else if(marketType==='spreads'){
      const o=mk.outcomes?.[0];
      val = o ? `${o.point>0?'+':''}${o.point} ${o.price>0?'+':''}${o.price}` : '—';
    } else {
      const o=mk.outcomes?.find(x=>x.name==='Over') || mk.outcomes?.[0];
      val = o ? `O${o.point} ${o.price>0?'+':''}${o.price}` : '—';
    }
    books[bk.key]=val;
  });
  return {
    game:`${ev.home_team} vs ${ev.away_team}`,
    time:new Date(ev.commence_time).toLocaleString(),
    dk:books.draftkings,fd:books.fanduel,mgm:books.betmgm,cae:books.caesars,
    edge:'STD',move:'neut'
  };
}

// ── TRENDS ──
function buildTrends(){
  const tg=document.getElementById('trendsGrid');
  if(tg) tg.innerHTML=TRENDS_DATA.map(t=>{
    const pct=t.pct;
    const fillColor=t.color==='good'?'var(--green2)':t.color==='warn'?'var(--gold)':'var(--red2)';
    return`<div class="trend-card rise">
      <div class="trend-header">
        <div class="trend-title">${t.title}</div>
        <div style="text-align:right;"><div class="trend-record ${t.color}">${t.record}</div><div class="trend-pct tp-${t.color}">${pct}%</div></div>
      </div>
      <div class="trend-bar"><div class="trend-fill" style="width:${pct}%;background:${fillColor};"></div></div>
      <div class="trend-desc">${t.desc}</div>
      <div class="trend-sample">${t.sample}</div>
    </div>`;
  }).join('');

  const pl=document.getElementById('patternList');
  if(pl) pl.innerHTML=PATTERNS_DATA.map(p=>`<div class="pattern-row rise">
    <div class="pr-icon">${p.icon}</div>
    <div><div class="pr-title">${p.title}</div><div class="pr-body">${p.body}</div><span class="pr-edge ${p.eClass}">${p.edge}</span></div>
  </div>`).join('');
}

// ── SHARP ──
function buildSharp(sportFilter){
  sportFilter = sportFilter || 'all';
  currentSharpFilter = sportFilter;

  document.querySelectorAll('#sharpSportTabs .tab').forEach(function(t){
    t.classList.toggle('on', t.getAttribute('data-sport')===sportFilter);
  });

  var data = sportFilter==='all' ? SHARP_DATA :
    SHARP_DATA.filter(function(sd){
      var g=(sd.game||'').toUpperCase();
      var sb=(sd.sub||'').toUpperCase();
      var sp=sportFilter.toUpperCase();
      return g.indexOf(sp)>-1||sb.indexOf(sp)>-1||
        (sp==='UFC'&&sb.indexOf('UFC')>-1)||
        (sp==='NBA'&&sb.indexOf('NBA')>-1)||
        (sp==='MLB'&&sb.indexOf('MLB')>-1)||
        (sp==='NHL'&&sb.indexOf('NHL')>-1)||
        (sp==='PGA'&&sb.indexOf('PGA')>-1);
    });

  const sl=document.getElementById('sharpList');
  if(!sl) return;

  if(!data.length){
    sl.innerHTML='<div style="padding:20px;text-align:center;font-size:13px;color:var(--muted2);">No sharp signals for this sport.</div>';
  } else {
    sl.innerHTML = data.map(function(sd){
      var parts=(sd.game||'').split(' vs ');
      var f1=parts[0]||'Fighter 1';
      var f2=parts[1]||'Fighter 2';
      var pub=sd.pub||50;
      var sharp=sd.sharp||50;

      // KEY LOGIC:
      // pub% = % of total bets placed on f1
      // sharp% = % of total dollars on f1
      // If sharp > pub: sharps loading f1 more than public = sharp lean f1
      // If sharp < pub: sharps betting f1 LESS than public = sharp lean f2 (RLM)
      var sharpLeanF1 = sharp >= pub; // sharps proportionally more on f1 than public
      var sharpSide = sharpLeanF1 ? f1 : f2;
      var publicSide = pub >= 50 ? f1 : f2;
      var pubPct = pub >= 50 ? pub : 100-pub;
      var sharpPct = sharpLeanF1 ? sharp : 100-sharp;
      var sharpDiff = Math.abs(sharp - pub);
      var isRLM = !sharpLeanF1 && pub > 50; // public on f1, sharps on f2

      var sigColor = sd.sig==='hot'?'var(--green2)':sd.sig==='fade'?'#f87171':'var(--gold)';

      return '<div style="background:var(--dark2);border:1px solid var(--border);border-radius:var(--r2);padding:16px 18px;margin-bottom:10px;">'+

        // Header
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:14px;">'+
          '<div>'+
            '<div style="font-size:15px;font-weight:700;">'+sd.game+'</div>'+
            '<div style="font-size:11px;color:var(--muted2);margin-top:3px;">'+sd.sub+'</div>'+
          '</div>'+
          '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">'+
            '<span class="sig sig-'+sd.sig+'">'+sd.sigText+'</span>'+
            '<span style="font-size:11px;color:var(--muted2);">Line: '+sd.move+'</span>'+
          '</div>'+
        '</div>'+

        // Public vs Sharp two columns
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">'+
          // PUBLIC side
          '<div style="background:var(--dark3);border-radius:var(--r);padding:12px;border:1px solid var(--border);">'+
            '<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--muted2);margin-bottom:6px;">PUBLIC BETS</div>'+
            '<div style="font-size:22px;font-weight:800;color:var(--parch);line-height:1;">'+pubPct+'%</div>'+
            '<div style="font-size:11px;color:var(--muted2);margin:4px 0 8px;">of bets on</div>'+
            '<div style="font-size:13px;font-weight:700;color:var(--parch);">'+publicSide+'</div>'+
            '<div style="background:var(--border);border-radius:20px;height:4px;overflow:hidden;margin-top:8px;">'+
              '<div style="width:'+pubPct+'%;height:100%;background:rgba(255,255,255,.25);border-radius:20px;"></div>'+
            '</div>'+
          '</div>'+
          // SHARP side
          '<div style="background:rgba(201,168,76,.06);border-radius:var(--r);padding:12px;border:1px solid rgba(201,168,76,.25);">'+
            '<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--gold);margin-bottom:6px;">SHARP MONEY</div>'+
            '<div style="font-size:22px;font-weight:800;color:var(--gold);line-height:1;">'+sharpPct+'%</div>'+
            '<div style="font-size:11px;color:var(--muted2);margin:4px 0 8px;">of dollars on</div>'+
            '<div style="font-size:13px;font-weight:700;color:var(--gold);">'+sharpSide+'</div>'+
            '<div style="background:var(--border);border-radius:20px;height:4px;overflow:hidden;margin-top:8px;">'+
              '<div style="width:'+sharpPct+'%;height:100%;background:var(--gold);border-radius:20px;"></div>'+
            '</div>'+
          '</div>'+
        '</div>'+

        // THE PLAY
        '<div style="padding:10px 12px;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:8px;margin-bottom:8px;">'+
          '<div style="font-size:9px;font-weight:700;letter-spacing:1.5px;color:var(--gold);margin-bottom:4px;">THE PLAY</div>'+
          '<div style="font-size:14px;font-weight:700;color:var(--parch);">Bet '+sharpSide+'</div>'+
          (isRLM?'<div style="font-size:11px;color:var(--red2);margin-top:2px;">⚠ Reverse line movement — public on '+publicSide+', sharps going opposite</div>':'<div style="font-size:11px;color:var(--green2);margin-top:2px;">✓ Sharp money aligns with '+(pub>=50?'':'counter-')+'public lean</div>')+
        '</div>'+

        // Note
        (sd.note?'<div style="font-size:11px;color:var(--muted2);line-height:1.5;padding:8px 10px;background:rgba(0,0,0,.2);border-radius:6px;">'+sd.note+'</div>':'')+

      '</div>';
    }).join('');
  }

  // Line value section
  const lv=document.getElementById('lvList');
  if(lv) lv.innerHTML=(LV_DATA||[]).map(function(l){
    return '<div class="lv-row">'+
      '<div class="lv-game">'+l.game+'<div class="lv-sub">'+l.sub+'</div></div>'+
      '<div class="lv-mv '+(l.dir==='up'?'lv-up':'lv-dn')+'">'+l.move+'</div>'+
      '<div class="lv-note">'+l.note+'</div>'+
    '</div>';
  }).join('');
}


// ── DFS OPTIMIZER — HARD CAP ENFORCEMENT ──
function getCurrentPoolKey(){
  const s=document.getElementById('sportSel')?.value||'ufc';
  const book=currentBook||'dk';
  return book+'_'+s;
}
function getPoolState(){
  try{return JSON.parse(localStorage.getItem(poolStorageKey)||'{}');}catch(e){return {};}
}
function savePoolState(state){localStorage.setItem(poolStorageKey,JSON.stringify(state));}
function getPoolPrefs(){
  const state=getPoolState();
  const prefs=state[getCurrentPoolKey()]||{};
  return {
    favorites: prefs.favorites||[],
    locks:     prefs.locks||[],
    excludes:  prefs.excludes||[],
    boosts:    prefs.boosts||[],
    reduces:   prefs.reduces||[],
  };
}

function setPoolPrefs(prefs){
  const state=getPoolState();
  state[getCurrentPoolKey()]=prefs;
  savePoolState(state);
}

var currentPoolTab='all';
function setPoolTab(tab, btn){
  currentPoolTab=tab;
  document.querySelectorAll('#poolTabAll,#poolTabExcluded').forEach(function(b){b.classList.remove('on');});
  if(btn)btn.classList.add('on');
  renderPlayerPool();
}
function togglePoolState(action, name){
  var sport = document.getElementById('sportSel')?.value || 'ufc';
  var key = (currentBook||'dk') + '_' + sport;
  var state = getPoolState();
  if(!state[key]) state[key] = {favorites:[],locks:[],excludes:[],boosts:[],reduces:[]};
  var s = state[key];
  if(!s.favorites)s.favorites=[];if(!s.locks)s.locks=[];if(!s.excludes)s.excludes=[];
  if(!s.boosts)s.boosts=[];if(!s.reduces)s.reduces=[];

  function toggle(arr, val){
    var i = arr.indexOf(val);
    if(i > -1) arr.splice(i,1);
    else arr.push(val);
  }

  if(action==='favorite') toggle(s.favorites, name);
  if(action==='lock')     toggle(s.locks, name);
  if(action==='exclude')  toggle(s.excludes, name);
  if(action==='boost'){
    toggle(s.boosts, name);
    // Remove from reduces AND excludes when boosting
    var ri = s.reduces.indexOf(name);
    if(ri > -1) s.reduces.splice(ri,1);
    var ei = s.excludes.indexOf(name);
    if(ei > -1) s.excludes.splice(ei,1);
  }
  if(action==='reduce'){
    toggle(s.reduces, name);
    // Remove from boosts AND excludes when reducing
    var bi = s.boosts.indexOf(name);
    if(bi > -1) s.boosts.splice(bi,1);
    var ei2 = s.excludes.indexOf(name);
    if(ei2 > -1) s.excludes.splice(ei2,1);
  }

  savePoolState(state);
  renderPlayerPool();
}
function clearPoolState(){
  var sport=document.getElementById('sportSel')?.value||'ufc';
  var key=(currentBook||'dk')+'_'+sport;
  var state=getPoolState();delete state[key];savePoolState(state);
  [['poolSearch',''],['poolPosFilter','all'],['poolSort','sal'],['salMin',''],['salMax',''],['uniqFilter','0'],['maxExposure','70']].forEach(function(p){var e=document.getElementById(p[0]);if(e)e.value=p[1];});
  renderPlayerPool();
}
function updatePositionFilter(sport){
  var sel=document.getElementById('poolPosFilter');
  if(!sel)return;
  var posMap={ufc:[],nba:['PG','SG','SF','PF','C'],nfl:['QB','WR','RB','TE','DST'],mlb:['SP','RP','C','1B','2B','3B','SS','OF','DH']};
  var positions=posMap[sport]||[];
  var opts='<option value="all">All Positions</option>';
  positions.forEach(function(p){opts+='<option value="'+p+'">'+p+'</option>';});
  sel.innerHTML=opts;sel.value='all';
}
function onSportChange(){
  var sport=document.getElementById('sportSel')?.value||'ufc';
  updatePositionFilter(sport);
  renderSlateSelect(sport);
  renderPlayerPool();
  genLineup();
  refreshLeverage();
  buildPortfolio();
}

function onSlateChange(){
  const sport=document.getElementById('sportSel')?.value||'ufc';
  const slateId=document.getElementById('slateSel')?.value;
  const slates=SLATE_SCHEDULE[sport]||[];
  const slate=slates.find(s=>s.id===slateId)||slates[0];
  if(slate){
    const bar=document.getElementById('slateGamesBar');
    if(bar){
      bar.innerHTML='<span style="font-size:10px;font-weight:700;color:var(--gold);letter-spacing:1px;">GAMES:</span>'+
        (slate.games||[]).map(g=>`<span style="background:var(--dark3);border:1px solid var(--border);border-radius:5px;padding:3px 8px;font-size:11px;">${g}</span>`).join('');
    }
  }
  genLineup();
}

function renderSlateSelect(sport){
  const sel=document.getElementById('slateSel');
  if(!sel)return;
  const slates=SLATE_SCHEDULE[sport]||[];
  sel.innerHTML=slates.map(s=>`<option value="${s.id}">${s.label}</option>`).join('');
  const active=getActiveSlate(sport);
  if(active)sel.value=active.id;
  onSlateChange();
}

function refreshLeverage(){
  var sport=document.getElementById('sportSel')?.value||'ufc';
  var book=currentBook;
  var pool=(POOLS[sport]||[]).map(function(p){return Object.assign({},p,{salary:p.sal[book]});});
  if(!pool.length)return;
  var chalkPlayers=pool.filter(function(p){return p.own>=40;}).sort(function(a,b){return b.own-a.own;}).slice(0,3);
  var ceilT=sport==='ufc'?72:sport==='mlb'?35:52;
  var leveragePlays=pool.filter(function(p){return p.own<22&&(p.ceil_pts||p.ceil)>=ceilT;}).sort(function(a,b){return(b.ceil_pts||b.ceil)-(a.ceil_pts||a.ceil);}).slice(0,3);
  var bustRisks=pool.filter(function(p){return p.bust;});
  var avgOwn=pool.reduce(function(s,p){return s+p.own;},0)/pool.length;
  var fieldConc=chalkPlayers.reduce(function(s,p){return s+p.own;},0);
  var el=document.getElementById('leveragePanel');if(!el)return;
  var o='';
  // Ownership Analysis
  o+='<div style="background:var(--dark3);border-radius:var(--r);padding:14px;">';
  o+='<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--gold);margin-bottom:8px;">📊 OWNERSHIP ANALYSIS</div>';
  o+='<div style="font-size:11px;color:var(--muted2);margin-bottom:8px;">High-owned players this slate — use your intel to decide if the field is right or wrong on each one.</div>';
  if(chalkPlayers.length){chalkPlayers.forEach(function(p){
    var ownColor=p.own>=50?'var(--red2)':p.own>=35?'var(--gold)':'var(--muted3)';
    var ownLabel=p.own>=50?'CHALK':p.own>=35?'HIGH OWN':'MODERATE';
    o+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);">';
    o+='<div style="font-size:12px;">'+p.name+'</div>';
    o+='<div style="display:flex;align-items:center;gap:8px;">';
    o+='<span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:4px;background:rgba(0,0,0,.3);color:'+ownColor+';border:1px solid '+ownColor+';">'+ownLabel+'</span>';
    o+='<span style="color:'+ownColor+';font-family:var(--fm);font-weight:600;font-size:12px;">'+p.own+'%</span>';
    o+='</div></div>';
  });}
  else{o+='<div style="font-size:12px;color:var(--muted2);">No heavily-owned players identified.</div>';}
  o+='<div style="font-size:10px;color:var(--muted);margin-top:8px;">Top-3 field concentration: '+fieldConc+'% — '+
    (fieldConc>90?'chalk-heavy slate, field likely wrong on at least one':
     fieldConc>70?'moderately concentrated, evaluate each play individually':
     'well-distributed ownership, no dominant chalk')+
  '</div></div>';
  // Leverage plays
  o+='<div style="background:var(--dark3);border-radius:var(--r);padding:14px;">';
  o+='<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--green2);margin-bottom:8px;">🎯 LEVERAGE PLAYS</div>';
  o+='<div style="font-size:11px;color:var(--muted2);margin-bottom:8px;">High ceiling, low ownership — win tournaments when chalk busts.</div>';
  if(leveragePlays.length){leveragePlays.forEach(function(p){o+='<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;"><span>'+p.name+'</span><span style="color:var(--green2);font-family:var(--fm);">'+p.own+'% · '+(p.ceil_pts||p.ceil)+' proj</span></div>';});}
  else{o+='<div style="font-size:12px;color:var(--muted2);">No clear low-owned/high-ceiling plays — all upside players have elevated ownership on this slate.</div>';}
  o+='</div>';
  // Game theory read
  var isHeavy=fieldConc>90;
  var gtMsg=isHeavy
    ?'<b style="color:var(--gold);">Chalk-heavy slate.</b> Field is concentrated on a few players. If those players deliver, most lineups score similarly — the winner will have a leverage play. Evaluate whether the chalk is sharp-backed or just popular.':
     '<b style="color:var(--green2);">Balanced slate.</b> Ownership is spread across the pool. Mix anchors with leverage plays. No single player is so dominant that building around them is required.';
  var bustMsg=bustRisks.length
    ?'<br><br><b style="color:var(--gold);">Bust risks: </b>'+(bustRisks||[]).map(function(p){return p.name;}).join(', ')+'— high-owned players who could crash entire fields if they underperform.'
    :'<br><br>No major bust risks on this slate.';
  o+='<div style="background:var(--dark3);border-radius:var(--r);padding:14px;">';
  o+='<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--gold);margin-bottom:8px;">📐 GAME THEORY READ</div>';
  o+='<div style="font-size:11px;color:var(--muted2);line-height:1.7;">'+gtMsg+bustMsg+'</div></div>';
  // Ownership distribution
  o+='<div style="background:var(--dark3);border-radius:var(--r);padding:14px;">';
  o+='<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--blue2);margin-bottom:8px;">📊 OWNERSHIP DISTRIBUTION</div>';
  [['70%+',70,100],['50-70%',50,70],['30-50%',30,50],['15-30%',15,30],['Under 15%',0,15]].forEach(function(b){
    var cnt=pool.filter(function(p){return p.own>=b[1]&&p.own<b[2];}).length;
    var pct=Math.round(cnt/pool.length*100);
    o+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><div style="font-size:10px;color:var(--muted);width:70px;">'+b[0]+'</div><div style="flex:1;background:var(--dark2);border-radius:20px;height:6px;overflow:hidden;"><div style="width:'+pct+'%;height:100%;background:var(--gold);border-radius:20px;"></div></div><div style="font-size:10px;color:var(--muted2);width:30px;">'+cnt+'p</div></div>';
  });
  o+='</div>';
  // ── PRO INTEL SECTION ──
  var intelItems = [];
  pool.forEach(function(p){
    var intel = getPlayerIntelScore(p, currentMode);
    if(intel.score > 12 && intel.reasons.length > 0){
      intelItems.push({name:p.name, score:intel.score, top:intel.reasons[0], own:p.own, tag:p.tag||'value'});
    }
  });
  intelItems.sort(function(a,b){return b.score-a.score;});
  var topIntel = intelItems.slice(0,4);

  if(topIntel.length > 0){
    o += '<div style="background:var(--dark3);border-radius:var(--r);padding:14px;">';
    o += '<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--parch);margin-bottom:8px;">⚡ PRO INTEL SIGNALS</div>';
    o += '<div style="font-size:11px;color:var(--muted2);margin-bottom:8px;">Players flagged by sharp money, picks alignment, trends, and pro DFS strategy — combined signal score.</div>';
    topIntel.forEach(function(item){
      var signalColor = item.score>25?'var(--green2)':item.score>15?'var(--gold)':'var(--muted3)';
      o += '<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">';
      o += '<div style="flex:1;">';
      o += '<div style="font-size:12px;font-weight:500;">'+item.name+'</div>';
      o += '<div style="font-size:10px;color:var(--muted2);margin-top:1px;">'+item.top+'</div>';
      o += '</div>';
      o += '<div style="text-align:right;flex-shrink:0;">';
      o += '<div style="font-family:var(--fm);font-size:13px;color:'+signalColor+';">+'+item.score+'</div>';
      o += '<div style="font-size:9px;color:var(--muted);">intel score</div>';
      o += '</div></div>';
    });
    o += '</div>';
  }


  // ── TAG BREAKDOWN SECTION ──
  var tagGroups = {
    anchor:     {label:'Anchors',      color:'var(--green2)',  icon:'⚓', desc:'High floor — use in every lineup. Justified by record, FPPF, and sharp signal.'},
    chalk:      {label:'Chalk',        color:'var(--gold)',    icon:'📊', desc:''},
    leverage:   {label:'Leverage Plays',color:'var(--blue2)', icon:'🎯', desc:'Low owned + high ceiling. Tournament winners when the chalk busts.'},
    ceiling:    {label:'Ceiling Plays', color:'var(--parch)',  icon:'🚀', desc:'High upside, moderate ownership. GPP plays with real finish potential.'},
    value:      {label:'Value',         color:'var(--muted3)', icon:'💡', desc:'Salary efficient. Consistent floor. Good cash game and GPP filler.'},
    contrarian: {label:'Contrarians',   color:'var(--red2)',   icon:'⚡', desc:'Lowest ownership. Highest variance. Use 1-2 in large GPP only — moonshots.'},
  };

  // Separate chalk into good/bad using intel scoring
  var goodChalkPlayers = [], badChalkPlayers = [];
  pool.filter(function(p){return p.tag==='chalk';}).forEach(function(p){
    var intel = getPlayerIntelScore(p, currentMode);
    var chalkIdx = intel.reasons.findIndex(function(r){return r.indexOf('chalk')>-1||r.indexOf('CHALK')>-1;});
    var isGood = chalkIdx>-1 ? intel.reasons[chalkIdx].indexOf('GOOD')>-1 : intel.score>5;
    if(isGood) goodChalkPlayers.push(p);
    else badChalkPlayers.push(p);
  });

  var tagOrder = ['anchor','leverage','ceiling','value','contrarian'];
  var tagHtml = '<div style="background:var(--dark3);border-radius:var(--r);padding:14px;">';
  tagHtml += '<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--parch);margin-bottom:12px;">🏷️ PLAYER POOL BREAKDOWN</div>';

  // Good chalk section
  if(goodChalkPlayers.length){
    tagHtml += '<div style="margin-bottom:8px;">';
    tagHtml += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">';
    tagHtml += '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;background:rgba(58,148,96,.15);color:var(--green2);border:1px solid rgba(58,148,96,.25);">✅ GOOD CHALK</span>';
    tagHtml += '<span style="font-size:10px;color:var(--muted2);">Sharp-backed, ceiling justifies ownership</span>';
    tagHtml += '</div>';
    goodChalkPlayers.forEach(function(p){
      tagHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:11px;">';
      tagHtml += '<span style="color:var(--parch);">'+p.name+'</span>';
      tagHtml += '<span style="color:var(--muted2);">'+p.own+'% own · $'+(p.salary||0).toLocaleString()+'</span>';
      tagHtml += '</div>';
    });
    tagHtml += '</div>';
  }

  // High ownership section
  if(badChalkPlayers.length){
    tagHtml += '<div style="margin-bottom:8px;">';
    tagHtml += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">';
    tagHtml += '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;background:rgba(220,53,69,.1);color:var(--red2);border:1px solid rgba(220,53,69,.2);">⚠️ BAD CHALK</span>';
    tagHtml += '<span style="font-size:10px;color:var(--muted2);">High owned, ceiling does not justify risk</span>';
    tagHtml += '</div>';
    badChalkPlayers.forEach(function(p){
      tagHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:11px;">';
      tagHtml += '<span style="color:var(--muted3);">'+p.name+'</span>';
      tagHtml += '<span style="color:var(--muted2);">'+p.own+'% own · $'+(p.salary||0).toLocaleString()+'</span>';
      tagHtml += '</div>';
    });
    tagHtml += '</div>';
  }

  // All other tag groups
  tagOrder.forEach(function(tagKey){
    var group = tagGroups[tagKey];
    var players = pool.filter(function(p){return p.tag===tagKey;});
    if(!players.length) return;
    tagHtml += '<div style="margin-bottom:10px;">';
    tagHtml += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">';
    tagHtml += '<span style="font-size:10px;font-weight:700;color:'+group.color+';">'+group.icon+' '+group.label+'</span>';
    tagHtml += '<span style="font-size:10px;color:var(--muted);margin-left:2px;">('+players.length+')</span>';
    tagHtml += '</div>';
    if(group.desc){
      tagHtml += '<div style="font-size:10px;color:var(--muted2);margin-bottom:5px;">'+group.desc+'</div>';
    }
    players.sort(function(a,b){return b.own-a.own;}).forEach(function(p){
      var ownColor = p.own>=35?'var(--red2)':p.own>=20?'var(--gold)':'var(--green2)';
      tagHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid var(--border);font-size:11px;">';
      tagHtml += '<span>'+p.name+'</span>';
      tagHtml += '<div style="display:flex;gap:10px;">';
      tagHtml += '<span style="color:'+ownColor+';">'+p.own+'% own</span>';
      tagHtml += '<span style="color:var(--muted2);">$'+(p.salary||0).toLocaleString()+'</span>';
      tagHtml += '<span style="color:var(--muted2);">'+(p.ceil_pts||p.ceil)+' proj</span>';
      tagHtml += '</div></div>';
    });
    tagHtml += '</div>';
  });
  tagHtml += '</div>';
  o += tagHtml;

  el.innerHTML=o;
}

function renderPlayerPool(){
  var sport=document.getElementById('sportSel')?.value||'ufc';
  var prefs=getPoolPrefs();
  var searchTerm=(document.getElementById('poolSearch')?.value||'').toLowerCase();
  var posFilter=document.getElementById('poolPosFilter')?.value||'all';
  var sortBy=document.getElementById('poolSort')?.value||'sal';
  var book=currentBook;
  var pool=(POOLS[sport]||[]).map(function(p){return Object.assign({},p,{salary:p.sal[book]});});
  if(searchTerm) pool=pool.filter(function(p){return p.name.toLowerCase().indexOf(searchTerm)>-1;});
  if(posFilter!=='all')pool=pool.filter(function(p){return p.pos===posFilter;});


  pool.sort(function(a,b){
    if(sortBy==='own') return b.own-a.own;
    if(sortBy==='ceil') return (b.ceil_pts||b.ceil)-(a.ceil_pts||a.ceil);
    if(sortBy==='floor') return (b.floor_pts||b.floor)-(a.floor_pts||a.floor);
    if(sortBy==='fppf') return (b.fppf||0)-(a.fppf||0);
    return b.salary-a.salary;
  });
  // Tab filter — read excludes DIRECTLY from storage to avoid any key mismatch
  var _rawState = getPoolState();
  var _key = (currentBook||'dk')+'_'+(document.getElementById('sportSel')?.value||'ufc');
  var _excludeNames = (_rawState[_key]||{}).excludes || [];
  var excl_badge=document.getElementById('excludedCount');
  if(excl_badge)excl_badge.textContent=_excludeNames.length>0?'('+_excludeNames.length+')':'';
  if(currentPoolTab==='excluded'){
    var _allPlayers=(POOLS[sport]||[]).map(function(p){return Object.assign({},p,{salary:p.sal[currentBook||'dk']||0});});
    pool=_allPlayers.filter(function(p){return _excludeNames.indexOf(p.name)>-1;});
  }
  var label=document.getElementById('poolCountLabel');
  if(label){
    var st=document.getElementById('slateSel');
    label.textContent=pool.length+' players'+(st&&st.options[st.selectedIndex]?' · '+st.options[st.selectedIndex].text:'');
  }
  var summary=document.getElementById('poolSummary');
  if(summary) summary.textContent=(prefs.favorites?prefs.favorites.length:0)+' fav · '+(prefs.locks?prefs.locks.length:0)+' lock · '+(prefs.excludes?prefs.excludes.length:0)+' excl';
  var el=document.getElementById('playerPoolGrid');
  if(!el)return;
  if(!pool.length){el.innerHTML='<div style="padding:20px;text-align:center;font-size:13px;color:var(--muted2);">No players match filter.</div>';return;}
  el.innerHTML='';
  // Calculate current exposure from portfolio if available
  var expMap = {};
  try {
    var pfGrid = document.getElementById('portfolioGrid');
    if(pfGrid){
      var pfRows = pfGrid.querySelectorAll('.pf-row .pf-players');
      var pfTotal = pfRows.length;
      if(pfTotal > 0){
        pfRows.forEach(function(row){
          var names = row.textContent.split(' · ');
          names.forEach(function(n){ expMap[n.trim()] = (expMap[n.trim()]||0)+1; });
        });
      }
    }
  } catch(eee){}

  pool.forEach(function(p){
    var fav=(prefs.favorites||[]).indexOf(p.name)>-1;
    var lock=(prefs.locks||[]).indexOf(p.name)>-1;
    var ex=(prefs.excludes||[]).indexOf(p.name)>-1;
    var pn=(function(n){return n;})(p.name);
    var poolSt=getPoolState();
    var poolKy=(currentBook||'dk')+'_'+(document.getElementById('sportSel')?.value||'ufc');
    var pnk=p.name.replace(/[^a-z0-9]/gi,'_');
    var minE=(poolSt[poolKy]||{})['minexp_'+pnk]||'';
    var maxE=(poolSt[poolKy]||{})['maxexp_'+pnk]||'';
    var sc=p.status==='CONFIRMED'?'var(--green2)':p.status==='PROBABLE'?'var(--gold)':'var(--red2)';
    var proj=p.fppf?(p.fppf+' fppf'):(p.ceil_pts||p.ceil)+' ceil';
    var tagColor=p.tag==='anchor'?'#4ade80':p.tag==='leverage'?'#a78bfa':p.tag==='chalk'?'var(--gold)':p.tag==='contrarian'?'#94a3b8':p.tag==='value'?'#38bdf8':'var(--muted2)';
    var tagLabel=p.tag==='anchor'?'ANCHOR':p.tag==='leverage'?'LEVERAGE':p.tag==='chalk'?'CHALK':p.tag==='contrarian'?'CONTRARIAN':p.tag==='value'?'VALUE':'';

    var row=document.createElement('div');
    row.style.cssText='border-bottom:1px solid var(--border);'+(ex?'display:none;':'');

    var main=document.createElement('div');
    main.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 12px;';

    var pos=document.createElement('div');
    pos.style.cssText='font-size:9px;font-weight:700;padding:2px 5px;background:var(--dark3);border-radius:4px;color:var(--muted2);width:22px;text-align:center;flex-shrink:0;';
    pos.textContent=p.pos||'F';

    var info=document.createElement('div');
    info.style.cssText='flex:1;min-width:0;';
    var showTags=isWynnrPlus();
    info.innerHTML='<div style="font-size:12px;font-weight:500;display:flex;align-items:center;gap:4px;">'+p.name+
      (tagLabel?'<span style="font-size:8px;font-weight:700;padding:1px 4px;border-radius:3px;background:rgba(0,0,0,.4);color:'+tagColor+';border:1px solid '+tagColor+';">'+tagLabel+'</span>':'')+
      '</div>'+
      '<div style="font-size:10px;color:var(--muted);">'+p.opp+' · '+p.own+'% own</div>';

    var sal=document.createElement('div');
    sal.style.cssText='text-align:right;flex-shrink:0;font-size:11px;';
    sal.innerHTML='<div style="font-family:var(--fm);">$'+(p.salary||0).toLocaleString()+'</div>'+
      '<div style="font-size:10px;color:var(--muted);">'+proj+'</div>';

    // Three utility buttons: ★ 🔒 ✕
    var btns=document.createElement('div');
    btns.style.cssText='display:flex;gap:3px;flex-shrink:0;';

    var bFav=document.createElement('button');
    bFav.type='button';
    bFav.className='pool-btn'+(fav?' on-fav':'');
    bFav.textContent='★';bFav.title='Favorite';
    bFav.addEventListener('click',function(e){e.stopPropagation();togglePoolState('favorite',pn);});

    var bLock=document.createElement('button');
    bLock.type='button';
    bLock.className='pool-btn'+(lock?' on-lock':'');
    bLock.textContent='🔒';bLock.title='Lock in lineup';
    bLock.addEventListener('click',function(e){e.stopPropagation();togglePoolState('lock',pn);});

    var bEx=document.createElement('button');
    bEx.type='button';
    bEx.className='pool-btn'+(ex?'pool-btn on-ex':'pool-btn');
    bEx.textContent='✕';bEx.title='Exclude (moves to Excluded tab)';
    bEx.addEventListener('click',function(e){e.stopPropagation();togglePoolState('exclude',pn);});

    btns.appendChild(bFav);btns.appendChild(bLock);btns.appendChild(bEx);
    main.appendChild(pos);main.appendChild(info);main.appendChild(sal);main.appendChild(btns);
    row.appendChild(main);

    // Min/Max exposure inputs — Wynnr+ only
    if(isWynnrPlus()){
    var pnk=pn.replace(/[^a-z0-9]/gi,'_');
    var poolSt=getPoolState();
    var poolKy=(currentBook||'dk')+'_'+(document.getElementById('sportSel')?.value||'ufc');
    var minE=(poolSt[poolKy]||{})['minexp_'+pnk]||'';
    var maxE=(poolSt[poolKy]||{})['maxexp_'+pnk]||'';
    var expRow=document.createElement('div');
    expRow.style.cssText='display:flex;align-items:center;gap:8px;padding:2px 14px 7px;';
    var mkExp=function(lbl,val,key){
      var w=document.createElement('div');
      w.style.cssText='display:flex;align-items:center;gap:3px;';
      var l=document.createElement('span');
      l.style.cssText='font-size:9px;color:var(--muted2);';l.textContent=lbl+':';
      var inp=document.createElement('input');
      inp.type='number';inp.min='0';inp.max='100';inp.step='5';
      inp.value=val;inp.placeholder='—';
      inp.style.cssText='background:var(--dark3);border:1px solid var(--border2);border-radius:5px;padding:2px 5px;color:var(--parch);font-size:10px;width:44px;';
      inp.title=lbl+' % lineup exposure for this player';
      inp.addEventListener('click',function(e){e.stopPropagation();});
      inp.addEventListener('input',(function(k){return function(){
        var st=getPoolState();
        var ky=(currentBook||'dk')+'_'+(document.getElementById('sportSel')?.value||'ufc');
        if(!st[ky])st[ky]={};
        st[ky][k]=this.value;
        savePoolState(st);
      };})(key));
      w.appendChild(l);w.appendChild(inp);return w;
    };
    expRow.appendChild(mkExp('Min%',minE,'minexp_'+pnk));
    expRow.appendChild(mkExp('Max%',maxE,'maxexp_'+pnk));
    row.appendChild(expRow);
    } // end isWynnrPlus exposure

    el.appendChild(row);
  });
}





function updateBookInfo(){
  const b=BOOKS[currentBook];
  const s=document.getElementById('sportSel')?.value||'ufc';
  const el=document.getElementById('bookInfo');
  if(el) el.textContent=`${b.name} · $${b.cap.toLocaleString()} cap · ${b.sizes[s]} players${s!=='ufc'?' · beta roster template':''}`;
}

function setBook(bk){
  currentBook=bk;
  document.getElementById('bookDK').className='book-btn'+(bk==='dk'?' on':'');
  document.getElementById('bookFD').className='book-btn'+(bk==='fd'?' on':'');
  updateBookInfo();
  genLineup();
}

function setMode(m){
  currentMode=m;
  document.getElementById('btnGPP').className='mode-btn'+(m==='GPP'?' on':'');
  document.getElementById('btnCash').className='mode-btn'+(m==='Cash'?' on':'');
  genLineup();
}


// ══ INTEL SCORING ENGINE ══
// Cross-references SHARP_DATA, PICKS, TRENDS_DATA, and player tags
// Returns a score modifier (-30 to +50) representing real-world edge signals

function getPlayerIntelScore(player, mode){
  var score = 0;
  var reasons = [];

  // ── 1. SHARP MONEY SIGNAL ──
  // Does this player's game have sharp action? If so, they benefit
  // from the information that caused the line move.
  var sharpEntry = SHARP_DATA.find(function(sd){
    var g = player.game || '';
    var sdg = sd.game || '';
    // Match either direction: "Montague vs Bueno Silva" matches "Montague vs Bueno Silva"
    // Also handle NBA team abbreviation differences: OKC/Thunder, PHX/Suns
    var g1 = g.toLowerCase().replace(/\s/g,'');
    var g2 = sdg.toLowerCase().replace(/\s/g,'');
    if(g1===g2) return true;
    // Fuzzy: check if any word from player.opp or player.name appears in sharp game
    var playerWords = (player.name+' '+(player.opp||'')).toLowerCase().split(/\s+/);
    var sharpWords = sdg.toLowerCase().split(/\s+/);
    return playerWords.some(function(w){ return w.length>3 && sharpWords.some(function(sw){ return sw.includes(w)||w.includes(sw); }); });
  });

  if(sharpEntry){
    if(sharpEntry.sig === 'hot'){
      // Strong sharp signal on this game
      var sharpPct = sharpEntry.sharp || 50;
      var sharpBoost = Math.round((sharpPct - 50) * 0.5); // 0-25 pts based on sharp %
      score += sharpBoost;
      reasons.push('Sharp action: '+sharpEntry.sigText+' ('+sharpPct+'% sharp $)');
    } else if(sharpEntry.sig === 'fade'){
      // Sharps on the OTHER side — slight penalty
      score -= 8;
      reasons.push('Sharp fade signal on this game');
    } else if(sharpEntry.sig === 'watch'){
      score += 3;
      reasons.push('Line moving — monitor');
    }
    // Line move direction bonus
    var moveStr = sharpEntry.move || '';
    if(moveStr.indexOf('to') > -1){
      score += 5;
      reasons.push('Line movement confirmed');
    }
  }

  // ── 2. PICKS ALIGNMENT ──
  // Is this player's matchup in our picks? Are they THE pick?
  var pickEntry = PICKS.find(function(pk){
    var matchup = pk.matchup || '';
    var game = player.game || '';
    var opp = player.opp || '';
    var name = player.name || '';
    // Check if player's game matches pick matchup
    if(matchup.toLowerCase().indexOf(name.toLowerCase().split(' ').pop()) > -1) return true;
    if(game.toLowerCase().indexOf(matchup.toLowerCase().split(' ')[0].toLowerCase()) > -1) return true;
    return false;
  });

  if(pickEntry){
    var pickCall = pickEntry.call || '';
    var playerLastName = player.name.split(' ').pop();
    // Check if player IS the pick
    var isThePick = pickCall.toLowerCase().indexOf(playerLastName.toLowerCase()) > -1;
    if(isThePick){
      var ratingBoost = pickEntry.rating==='FREE'?20:pickEntry.rating==='HIGH'?14:pickEntry.rating==='STD'?8:3;
      score += ratingBoost;
      reasons.push('IS the pick ('+pickEntry.rating+' rated): '+pickCall);
    } else {
      // Same game as a pick — correlated upside
      score += 5;
      reasons.push('Same game as '+pickEntry.rating+' pick');
    }
  }

  // ── 3. TRENDS SIGNAL ──
  // Apply relevant trend boosts/penalties based on player context
  TRENDS_DATA.forEach(function(t){
    var tPct = t.pct || 50;
    var tTitle = t.title.toLowerCase();
    // Short-notice trend
    if(tTitle.indexOf('short-notice') > -1 || tTitle.indexOf('replacement') > -1){
      var fights = 0;
      if(player.record){var parts=player.record.split('-');fights=(parseInt(parts[0])||0)+(parseInt(parts[1])||0);}
      if(fights < 3){
        var penalty = Math.round((50 - tPct) * 0.4); // pct:27 → penalty of ~9
        score -= penalty;
        reasons.push('Trend penalty: '+t.title+' ('+tPct+'% cover rate)');
      }
    }
    // Experience + FPPF trend
    if(tTitle.indexOf('fppf') > -1 || tTitle.indexOf('experience') > -1){
      var f2=0;
      if(player.record){var p2=player.record.split('-');f2=(parseInt(p2[0])||0)+(parseInt(p2[1])||0);}
      if(player.fppf && player.fppf >= 70 && f2 >= 10){
        var boost = Math.round((tPct - 50) * 0.3);
        score += boost;
        reasons.push('Trend boost: high FPPF veteran ('+tPct+'% edge)');
      }
    }
    // Back-to-back / fatigue trends (NBA)
    if(tTitle.indexOf('back-to-back') > -1 && player.pos && ['PG','SG','SF','PF','C'].includes(player.pos)){
      if(tPct > 58){
        score += Math.round((tPct-50)*0.2);
        reasons.push('NBA trend: '+t.title);
      }
    }
    // MLB SP trend
    if(tTitle.indexOf('era') > -1 && player.pos === 'SP'){
      score += Math.round((tPct-50)*0.25);
      reasons.push('MLB SP trend boost ('+tPct+'%)');
    }
  });

  // ── 4. PRO DFS TAG STRATEGY + GOOD CHALK vs BAD CHALK ──
  var tag = player.tag || 'value';
  var ceil = player.ceil_pts || player.ceil || 0;
  var flr  = player.floor_pts || player.floor || 0;
  var own  = player.own || 0;
  var hasBust = player.bust || false;
  var salary = player.salary || 0;

  // ── Good chalk vs bad chalk classifier ──
  // Good chalk: high owned AND (high ceiling relative to ownership + sharp signal + real upside path)
  // High ownership: high owned AND (low ceiling/salary ratio + bust flag + public-driven not data-driven)
  if(tag === 'chalk'){
    var ceilPerK    = ceil / Math.max(salary/1000, 1);  // ceiling per $1k salary
    var ceilOwnGap  = ceil - own;                        // how much ceiling exceeds ownership
    var floorOwnRat = flr / Math.max(own, 1);            // floor-to-ownership safety ratio

    var goodChalkScore = 0;
    var chalkLabel = '';

    // Signal 1: Does sharp money back this chalk? That is good chalk.
    if(sharpEntry && sharpEntry.sig === 'hot'){
      goodChalkScore += 12;
      chalkLabel += 'sharp-backed ';
    }

    // Signal 2: Is the ceiling high enough to justify ownership?
    // A 40% owned player with a 118-pt ceiling is very different from
    // a 40% owned player with a 70-pt ceiling. Threshold: ceil > own * 2.2
    if(ceil > own * 2.2){
      goodChalkScore += 10;
      chalkLabel += 'ceiling justified ';
    } else if(ceil > own * 1.6){
      goodChalkScore += 4;
      chalkLabel += 'ceiling marginal ';
    } else {
      goodChalkScore -= 8;
      chalkLabel += 'ceiling does not justify ownership ';
    }

    // Signal 3: Does it have a bust flag? High ownership.
    if(hasBust){
      goodChalkScore -= 14;
      chalkLabel += 'BUST FLAGGED ';
    }

    // Signal 4: Is it a picks-aligned player? (already scored above, but confirms good chalk)
    if(pickEntry && pickEntry.rating === 'FREE'){
      goodChalkScore += 8;
      chalkLabel += 'FREE pick ';
    }

    // Signal 5: Salary efficiency — overpriced chalk is bad chalk
    if(ceilPerK < 8){
      goodChalkScore -= 6;
      chalkLabel += 'overpriced for ceiling ';
    } else if(ceilPerK >= 12){
      goodChalkScore += 5;
      chalkLabel += 'salary efficient ';
    }

    if(mode === 'GPP'){
      if(goodChalkScore >= 10){
        score += 14;
        reasons.push('GOOD CHALK: '+chalkLabel.trim()+' — necessary GPP exposure ('+goodChalkScore+' chalk score)');
      } else if(goodChalkScore >= 0){
        score += 4;
        reasons.push('NEUTRAL CHALK: ownership risk without strong edge signal ('+goodChalkScore+')');
      } else {
        score += goodChalkScore; // negative = bad chalk penalty
        reasons.push('BAD CHALK: '+chalkLabel.trim()+' — public-driven, no edge backing ('+goodChalkScore+')');
      }
    } else {
      // Cash: good chalk is fine — you want the safe floor
      if(goodChalkScore >= 0){
        score += 12;
        reasons.push('CASH CHALK: safe floor play — ownership irrelevant in cash');
      } else {
        score += 4; // even bad chalk has some cash value for floor
        reasons.push('CASH CHALK: low efficiency but safe floor');
      }
    }

  } else if(mode === 'GPP'){
    // Non-chalk GPP scoring
    if(tag === 'leverage'){
      score += 18;
      reasons.push('PRO GPP: leverage — underowned ceiling, tournament winner upside');
    } else if(tag === 'contrarian'){
      score += 10;
      reasons.push('PRO GPP: contrarian — wins when chalk busts in large fields');
    } else if(tag === 'ceiling'){
      score += 12;
      reasons.push('PRO GPP: ceiling play — upside justifies GPP exposure');
    } else if(tag === 'anchor'){
      score += 8;
      reasons.push('PRO GPP: anchor — necessary stable piece');
    } else if(tag === 'value'){
      score += 5;
      reasons.push('PRO GPP: value play');
    }

  } else {
    // Cash game scoring — floor and consistency matter
    if(tag === 'anchor'){
      score += 20;
      reasons.push('PRO CASH: anchor — highest floor, essential cash piece');
    } else if(tag === 'value'){
      score += 12;
      reasons.push('PRO CASH: value — consistent floor at efficient salary');
    } else if(tag === 'ceiling'){
      score -= 4;
      reasons.push('PRO CASH: ceiling play — variance risk in cash game');
    } else if(tag === 'contrarian'){
      score -= 14;
      reasons.push('PRO CASH: contrarian — too volatile, avoid in cash');
    } else if(tag === 'leverage'){
      score += 6;
      reasons.push('PRO CASH: leverage play — low owned but ceiling acceptable');
    }
  }

  // ── 5. OWNERSHIP LEVERAGE RATIO ──
  // Separate from chalk — applies to all non-chalk players in GPP
  if(mode === 'GPP' && tag !== 'chalk'){
    var ownCeilRatio = ceil / Math.max(own, 1);
    if(ownCeilRatio > 5 && own < 15){
      score += 15;
      reasons.push('Leverage ratio '+ownCeilRatio.toFixed(1)+'x (ceil/own) — sharp GPP target');
    } else if(ownCeilRatio > 3 && own < 25){
      score += 7;
      reasons.push('Good leverage ratio '+ownCeilRatio.toFixed(1)+'x');
    }
  }

  // ── 5b. TOURNAMENT WINNING TRENDS ──
  // Data from large-field DFS tournament analysis:
  // Winners consistently have: low-owned ceiling plays, salary efficiency, unique combos
  if(mode === 'GPP'){
    // Salary efficiency: ceiling per $1k — tournament winners are salary efficient
    var salary = player.salary || 0;
    if(salary > 0){
      var ceilPerK = ceil / (salary/1000);
      if(ceilPerK >= 13){
        score += 12;
        reasons.push('Tournament trend: elite salary efficiency '+ceilPerK.toFixed(1)+'x — GPP winner profile');
      } else if(ceilPerK >= 10){
        score += 6;
        reasons.push('Good salary efficiency '+ceilPerK.toFixed(1)+'x');
      } else if(ceilPerK < 7){
        score -= 5;
        reasons.push('Poor salary efficiency — tournament underpay');
      }
    }
    // Finish rate proxy: high ceil + good record = GPP winner
    var fights = 0;
    if(player.record){ var rp=player.record.split('-'); fights=(parseInt(rp[0])||0)+(parseInt(rp[1])||0); }
    var wins = player.record ? (parseInt(player.record.split('-')[0])||0) : 0;
    var winRate = fights > 0 ? wins/fights : 0;
    if(winRate >= 0.75 && fights >= 8 && ceil >= 85){
      score += 8;
      reasons.push('High win rate veteran with ceiling — tournament archetype');
    }
    // Uniqueness bonus: sub-20% ownership + 80+ ceiling = tournament equity
    if(own < 20 && ceil >= 80){
      score += 10;
      reasons.push('Tournament equity: low own + high ceil = field-winning combo');
    }
  }

  // ── 6. BUST RISK — only penalize if NOT already handled by chalk classifier ──
  if(hasBust && tag !== 'chalk'){
    if(mode === 'GPP'){
      score -= 15;
      reasons.push('BUST RISK: high-owned non-chalk bust — field exposure risk');
    } else {
      score -= 5;
      reasons.push('Bust risk: moderate cash penalty');
    }
  }

  return {score: score, reasons: reasons};
}

// Build a lookup map for fast intel scoring (pre-compute once per render)
function buildIntelMap(pool, mode){
  var map = {};
  pool.forEach(function(p){
    var intel = getPlayerIntelScore(p, mode);
    map[p.name] = intel;
  });
  return map;
}

function genLineup(){
  if(!isDFSUnlocked()){
    var gEl=document.getElementById('lineupDisplay');
    if(gEl){
      gEl.innerHTML='';
      var gDiv=document.createElement('div');
      gDiv.style.cssText='padding:30px;text-align:center;';
      gDiv.innerHTML='<div style="font-size:20px;margin-bottom:8px;">&#128274;</div>'+
        '<div style="font-weight:700;margin-bottom:6px;">DFS Optimizer</div>'+
        '<div style="font-size:12px;color:var(--muted2);margin-bottom:14px;">Available on Optimizer plan ($9.99/mo) and above.</div>';
      var gb=document.createElement('button');
      gb.className='btn btn-gold btn-sm';gb.textContent='Get Optimizer';
      gb.onclick=function(){stripeCheckout('optimizer');};
      gDiv.appendChild(gb);gEl.appendChild(gDiv);
    }
    return;
  }
  const sport=document.getElementById('sportSel')?.value||'ufc';
  const book=BOOKS[currentBook];
  const CAP=book.cap;
  const SIZE=book.sizes[sport]||6;
  const MIN_SAL=book.minSal;
  document.getElementById('optTitle').textContent=`${sport.toUpperCase()} · ${currentMode} LINEUP #${Math.floor(Math.random()*99)+1}`;
  document.getElementById('optSub').textContent=`${book.name} · $${CAP.toLocaleString()} cap · ${SIZE} players · Click any player for intel`;
  updateBookInfo();
  renderPlayerPool();

  const capWarn=document.getElementById('capWarning');
  const prefs=getPoolPrefs();
  // Salary range controls — applied at LINEUP level, not per player
  var salMin = parseInt(document.getElementById('salMin')?.value||'0')||0;
  var salMax = parseInt(document.getElementById('salMax')?.value||'0')||0;

  const pool=POOLS[sport].map(p=>({...p,salary:p.sal[currentBook]})).filter(p=>{
    if(!p.salary || p.salary <= 0) return false;
    if((prefs.excludes||[]).includes(p.name)) return false;
    return true;
  });
  // Build locked pool: explicit locks + min-exposure-100% players
  const poolState_gl = getPoolState();
  const poolKey_gl = getCurrentPoolKey();
  const poolPrefsState = poolState_gl[poolKey_gl] || {};
  const lockedPool = pool.filter(p => {
    if ((prefs.locks||[]).includes(p.name)) return true;
    // Min exposure 100% = must appear in every lineup = treat as lock
    const pKey = p.name.replace(/[^a-z0-9]/gi,'_');
    const minExp = parseFloat(poolPrefsState['minexp_'+pKey] || '0') || 0;
    return minExp >= 100;
  });

  let selected=[];
  let valid=false;
  let outerAttempts=0;

  const lockSalary=lockedPool.reduce((s,p)=>s+p.salary,0);
  if(lockedPool.length>SIZE || lockSalary>CAP){
    if(capWarn){
      capWarn.style.display='block';
      capWarn.textContent='⚠️ Locked players exceed the active roster size or salary cap. Remove a lock and rebuild.';
    }
    selected=lockedPool.slice(0,SIZE);
  } else {
    while(!valid && outerAttempts<30){
      outerAttempts++;
      selected=[...lockedPool];
      const selectedNames=new Set(selected.map(p=>p.name));
      const available=pool.filter(p=>!selectedNames.has(p.name));
      let innerAttempts=0;

      while(selected.length<SIZE && innerAttempts<5000){
        innerAttempts++;
        if(!available.length) break;

        const currentSal=selected.reduce((s,p)=>s+p.salary,0);
        const slotsLeft=SIZE-selected.length;
        const maxForThis=CAP-currentSal-(slotsLeft-1)*MIN_SAL;
        const minForThis=MIN_SAL;
              // Opponent conflict: cannot use fighters from same bout
      // unless both are locked (user explicitly chose this)
      const selectedGames = selected
        .filter(p => !(prefs.locks||[]).includes(p.name))
        .map(p => p.game||'');

      const eligible=available.filter(p=>{
        if(p.salary < MIN_SAL) return false;
        if(p.salary > maxForThis) return false;
        if(selected.find(s=>s.name===p.name)) return false;
        // Opponent conflict check — skip if player's game already in lineup
        // UNLESS this player is locked (user override)
        var isLocked = (prefs.locks||[]).includes(p.name);
        if(!isLocked && p.game && (selectedGames||[]).includes(p.game)) return false;
        return true;
      });
        if(!eligible.length) break;

        const         scored=eligible.map(function(p){
          var isFav=(prefs.favorites||[]).includes(p.name);
          var isBoost=(prefs.boosts||[]).includes(p.name);
          var isReduce=(prefs.reduces||[]).includes(p.name);
          var isLocked=(prefs.locks||[]).includes(p.name);

          // ── BASE SCORE: ceiling/floor weighted by mode ──
          var base = currentMode==='GPP' ? (p.ceil_pts||p.ceil) : (p.floor_pts||p.floor);

          // ── FPPF WEIGHT: experience-adjusted ──
          var fights=0;
          if(p.record){var rp=p.record.split('-');fights=(parseInt(rp[0])||0)+(parseInt(rp[1])||0);}
          var fppfW = fights>=10?1.0:fights>=5?0.6:fights>=3?0.3:0.0;
          var fppfBonus = (p.fppf && fppfW>0) ? p.fppf*fppfW*0.12 : 0;

          // ── INTEL SCORE: sharp money + picks + trends + pro DFS strategy ──
          var intel = getPlayerIntelScore(p, currentMode);
          var intelScore = intel.score;

          // ── MODE-SPECIFIC BASE MODIFIERS ──
          var modeScore = 0;
          if(currentMode==='GPP'){
            modeScore = (100-p.own)*0.85 + base*0.3 + (Math.random()-0.2)*45;
          } else {
            modeScore = (p.floor_pts||p.floor)*0.7 + p.own*0.1 + (Math.random()-0.5)*12;
          }

          // ── FINAL SCORE ──
          var score = base + fppfBonus + intelScore + modeScore;
          if(isFav) score += 18;
          if(isBoost) score += 80;
          if(isReduce) score -= 60;
          // Min exposure boost: if minexp > 0, heavily favor this player
          var pKey_gl = p.name.replace(/[^a-z0-9]/gi,'_');
          var minExp_gl = parseFloat(poolPrefsState['minexp_'+pKey_gl]||'0')||0;
          var maxExp_gl = parseFloat(poolPrefsState['maxexp_'+pKey_gl]||'0')||0;
          if(minExp_gl > 0 && minExp_gl < 100) score += (minExp_gl / 100) * 120;
          if(isLocked) score += 1000;

          return Object.assign({},p,{score:score, intelReasons:intel.reasons});
        }).sort(function(a,b){return b.score-a.score;});

        const pick=scored[Math.floor(Math.random()*Math.min(5,scored.length))];
        selected.push(pick);
        const idx=available.findIndex(p=>p.name===pick.name);
        if(idx>-1) available.splice(idx,1);
      }

      const total=selected.reduce((s,p)=>s+p.salary,0);
      const hasDupes=(new Set(selected.map(p=>p.name))).size!==selected.length;
      // Lineup-level total salary range check
      var salMinCheck = salMin===0 || total>=salMin;
      var salMaxCheck = salMax===0 || total<=salMax;
      valid=selected.length===SIZE && total<=CAP && !hasDupes && salMinCheck && salMaxCheck;
    }
  }

  if(capWarn) capWarn.style.display='none';
  if(!valid || selected.length!==SIZE){
    if(capWarn){
      capWarn.style.display='block';
      capWarn.textContent='⚠️ Rebuilding — previous attempt was invalid. Adjusting pool and salary fit.';
    }
    const fallbackPool=[...pool].sort((a,b)=>b.ceil-a.ceil);
    selected=[...lockedPool];
    const selectedNames=new Set(selected.map(p=>p.name));
    for(const p of fallbackPool){
      if(selected.length>=SIZE) break;
      if(selectedNames.has(p.name)) continue;
      const cur=selected.reduce((s,x)=>s+x.salary,0);
      if(cur+p.salary<=CAP){
        selected.push(p);
        selectedNames.add(p.name);
      }
    }
  }

  const totalSal=selected.reduce((s,p)=>s+p.salary,0);
  const avgOwn=selected.length?selected.reduce((s,p)=>s+p.own,0)/selected.length:0;
  const uniqueness=Math.min(97,Math.round(100-avgOwn+(currentMode==='GPP'?18:0)+Math.random()*14));

  document.getElementById('lineupBody').innerHTML=selected.map(p=>{
    const init=p.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return`<div class="player-row" onclick="this.classList.toggle('open')">
      <div class="player-main">
        <div class="pl-left">
          <div class="pl-av">${init}</div>
          <div><div class="pl-name">${p.name}</div><div class="pl-opp">${p.opp}</div></div>
        </div>
        <div class="pl-right">
          <div><div class="pl-sal">$${p.salary.toLocaleString()}</div><div class="pl-own">~${p.own}% own</div></div>
          <span class="pl-tag tag-${p.tag}">${p.tag}</span>
          <div class="pl-expand">▾</div>
        </div>
      </div>
      <div class="player-detail">
        <div class="pd-grid">
          <div class="pd-stat"><div class="pd-stat-n" style="color:var(--gold);">${p.ceil}</div><div class="pd-stat-l">Ceiling pts</div></div>
          <div class="pd-stat"><div class="pd-stat-n" style="color:var(--muted3);">${p.floor}</div><div class="pd-stat-l">Floor pts</div></div>
          <div class="pd-stat"><div class="pd-stat-n" style="color:${p.own>40?'#d94040':'var(--green2)'};">${p.own}%</div><div class="pd-stat-l">Proj. own%</div></div>
          <div class="pd-stat"><div class="pd-stat-n" style="color:var(--parch);">$${(p.ceil/p.salary*1000).toFixed(1)}</div><div class="pd-stat-l">Pts per $1k</div></div>
        </div>
        ${p.bust?`<div class="bust-flag">⚠️ Bust Risk — ${p.bustReason}</div>`:''}
        <div class="corr-note">🔗 ${p.corr}</div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('totalSal').textContent=`$${totalSal.toLocaleString()} / $${CAP.toLocaleString()}`;
  document.getElementById('uniqueScore').textContent=`${uniqueness}%`;

  // ── Lineup strength rating ──
  const avgCeil = selected.reduce((s,p)=>s+p.ceil,0)/selected.length;
  const avgFloor = selected.reduce((s,p)=>s+p.floor,0)/selected.length;
  const projTotal = Math.round(selected.reduce((s,p)=>s+p.ceil,0)*0.72);
  const bustCount = selected.filter(p=>p.bust).length;
  let grade, gradeColor, gradeNote;
  if(avgCeil>=95 && bustCount===0 && uniqueness>=70){ grade='A+'; gradeColor='var(--green2)'; gradeNote='Elite ceiling, clean exposure, high uniqueness. Strong tournament entry.'; }
  else if(avgCeil>=85 && bustCount<=1 && uniqueness>=60){ grade='A'; gradeColor='var(--green2)'; gradeNote='High ceiling with manageable risk. Solid GPP lineup.'; }
  else if(avgCeil>=75 && uniqueness>=50){ grade='B+'; gradeColor='var(--gold2)'; gradeNote='Good upside with some chalk exposure. Play in mid-sized fields.'; }
  else if(avgCeil>=65){ grade='B'; gradeColor='var(--gold)'; gradeNote='Average ceiling. Better suited for cash games or small GPP.'; }
  else { grade='C'; gradeColor='var(--muted3)'; gradeNote='Low ceiling or high chalk exposure. Regenerate for better tournament exposure.'; }

  const ratingEl = document.getElementById('lineupRating');
  if(ratingEl) ratingEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px 20px;background:var(--dark3);border-top:1px solid var(--border);">
      <div style="text-align:center;min-width:48px;">
        <div style="font-family:var(--fd);font-size:32px;color:${gradeColor};line-height:1;">${grade}</div>
        <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;">Grade</div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;flex:1;">
        <div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;">
          <div style="font-family:var(--fd);font-size:20px;color:var(--gold);">${projTotal}</div>
          <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Proj pts</div>
        </div>
        <div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;">
          <div style="font-family:var(--fd);font-size:20px;color:var(--parch);">${Math.round(avgCeil)}</div>
          <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Avg ceil</div>
        </div>
        <div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;">
          <div style="font-family:var(--fd);font-size:20px;color:var(--muted3);">${Math.round(avgFloor)}</div>
          <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Avg floor</div>
        </div>
        <div style="background:var(--dark2);border-radius:8px;padding:8px 12px;text-align:center;">
          <div style="font-family:var(--fd);font-size:20px;color:${bustCount>1?'var(--red2)':'var(--green2)'};">${bustCount}</div>
          <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;">Bust risks</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--muted2);max-width:220px;font-style:italic;">${gradeNote}</div>
    </div>`;
}

// ── PORTFOLIO ──
function setPfCount(n){
  pfCount=n;
  ['3','5','10','20','50','100'].forEach(function(x){var b=document.getElementById('pfBtn'+x);if(b)b.className='mode-btn'+(x===String(n)?' on':'');});
}


function getTier(){
  if(currentUserRole==='owner') return 'owner';
  // Check localStorage FIRST for immediate access (set by Stripe checkout)
  if(_profile&&_profile.tier==='elite') return 'elite';
  if(_profile&&_profile.tier==='wynnr') return 'wynnr';
  if(_profile&&_profile.tier==='optimizer') return 'optimizer';
  if(localStorage.getItem('ow_member')==='true') return 'wynnr';
  if(localStorage.getItem('ow_optimizer')==='true') return 'optimizer';
  return 'free';
}
function isDFSUnlocked(){
  var t=getTier();
  return t==='owner'||t==='wynnr'||t==='elite'||t==='optimizer';
}
function isWynnrPlus(){
  var t=getTier();
  return t==='owner'||t==='wynnr'||t==='elite';
}
function buildPortfolio(){
  var sport=document.getElementById('sportSel')?.value||'ufc';
  var book=BOOKS[currentBook];
  var CAP=book.cap, SIZE=book.sizes[sport]||6, MIN_SAL=book.minSal;
  var prefs=getPoolPrefs();
  var poolState_bp=getPoolState();
  var poolKey_bp=getCurrentPoolKey();
  // Tier limits
  var tier=getTier();
  var maxLineups = isWynnrPlus() ? pfCount : Math.min(pfCount, 20);
  var target=maxLineups;
  // Scale attempts higher for uniqueness builds (harder to find valid combos)
  if(uniqPct>0) maxAttempts = target * 100;
  if(!isDFSUnlocked()){
    var el2=document.getElementById('portfolioGrid');
    if(el2){
      var gDiv=document.createElement('div');
      gDiv.style.cssText='padding:30px;text-align:center;';
      gDiv.innerHTML='<div style="font-size:22px;margin-bottom:8px;">&#128274;</div>'+
        '<div style="font-weight:700;margin-bottom:6px;">DFS Optimizer — Members Only</div>'+
        '<div style="font-size:12px;color:var(--muted2);margin-bottom:16px;">Start with the Optimizer plan at $9.99/mo for up to 20 lineups, or get Wynnr for full access.</div>';
      var gBtn=document.createElement('button');
      gBtn.className='btn btn-gold btn-sm';gBtn.textContent='See Plans';
      gBtn.onclick=function(){go('pricing',null);};
      gDiv.appendChild(gBtn);
      el2.innerHTML='';el2.appendChild(gDiv);
    }
    return;
  }
  var maxExpPct=parseInt(document.getElementById('maxExposure')?.value||'70')||70;
  var uniqPct=parseInt(document.getElementById('uniqFilter')?.value||'0')||0;

  // Build full pool excluding excluded players
  var fullPool=(POOLS[sport]||[]).map(function(p){
    return Object.assign({},p,{salary:p.sal[currentBook||'dk']||0});
  }).filter(function(p){
    return p.salary>0 && (prefs.excludes||[]).indexOf(p.name)===-1;
  });

  // Locked players (explicit locks + min 100% exposure)
  var lockedPool=fullPool.filter(function(p){
    if((prefs.locks||[]).indexOf(p.name)>-1) return true;
    var pKey=p.name.replace(/[^a-z0-9]/gi,'_');
    var minE=parseFloat((poolState_bp[poolKey_bp]||{})['minexp_'+pKey]||'0')||0;
    return minE>=100;
  });

  // Pre-score ALL players using intel engine
  var intelScores={};
  fullPool.forEach(function(p){
    var base=p.fppf||p.ceil||40;
    // Salary efficiency
    var salEff = p.salary>0 ? (base/(p.salary/1000)) : 0;
    var sc = base*1.5 + salEff*3;
    // Tag bonuses
    if(p.tag==='anchor')   sc+=40;
    if(p.tag==='leverage') sc+=35;
    if(p.tag==='value')    sc+=25;
    if(p.tag==='contrarian')sc+=15;
    if(p.tag==='chalk')    sc+=10;
    // Bust penalty
    if(p.bust) sc-=120;
    // Ownership sweet spot: reward 10-35% own (leverage), penalize >50%
    if(p.own>=10&&p.own<=35) sc+=30;
    if(p.own>50) sc-=20;
    if(p.own>60) sc-=30;
    // Sharp signal alignment — Wynnr+ only
    if(isWynnrPlus()) SHARP_DATA.forEach(function(sd){
      var sdg=(sd.game||'').toLowerCase();
      var pn=p.name.toLowerCase();
      var lastName=pn.split(' ').pop();
      if(sdg.indexOf(lastName)>-1){
        if(sd.sig==='hot')  sc+=50;
        if(sd.sig==='fade') sc-=80;
      }
    }); // end sharp
    // User favorites
    if((prefs.favorites||[]).indexOf(p.name)>-1) sc+=60;
    // Record quality (win-loss)
    if(p.record){
      var parts=p.record.split('-');
      var w=parseInt(parts[0])||0, l=parseInt(parts[1])||0;
      var total=w+l;
      if(total>0) sc+=(w/total)*20;
    }
    intelScores[p.name]=Math.max(1,sc);
  });

  // Build lineups
  var lineups=[], expCount={}, attempts=0, maxAttempts=target*30;

  while(lineups.length<target && attempts<maxAttempts){
    attempts++;
    var selected=lockedPool.slice();
    if(selected.reduce(function(s,p){return s+p.salary;},0)>CAP || selected.length>SIZE) continue;

    var available=fullPool.filter(function(p){
      return selected.findIndex(function(x){return x.name===p.name;})===-1;
    });

    var innerAttempts=0;
    while(selected.length<SIZE && innerAttempts<2000){
      innerAttempts++;
      var curSal=selected.reduce(function(s,p){return s+p.salary;},0);
      var slotsLeft=SIZE-selected.length;
      var maxForThis=CAP-curSal-(slotsLeft-1)*MIN_SAL;

      // Games already in lineup (conflict check)
      var usedGames=selected.filter(function(p){
        return (prefs.locks||[]).indexOf(p.name)===-1;
      }).map(function(p){return p.game||'';}).filter(Boolean);

      var eligible=available.filter(function(p){
        if(p.salary>maxForThis||p.salary<MIN_SAL) return false;
        if(selected.findIndex(function(x){return x.name===p.name;})>-1) return false;
        // Opponent conflict
        var isLocked=(prefs.locks||[]).indexOf(p.name)>-1;
        if(!isLocked && p.game && (usedGames||[]).indexOf(p.game)>-1) return false;
        // Max exposure check
        var pExp=lineups.length>0?(expCount[p.name]||0)/lineups.length:0;
        var pKey=p.name.replace(/[^a-z0-9]/gi,'_');
        var pMax=parseFloat((poolState_bp[poolKey_bp]||{})['maxexp_'+pKey]||'0')||0;
        if(pMax>0 && pExp*100>=pMax) return false;
        // Global max exposure
        if(lineups.length>2 && pExp*100>=maxExpPct && (prefs.favorites||[]).indexOf(p.name)===-1) return false;
        return true;
      });

      if(!eligible.length) break;

      // Score eligible players - use intel scores + randomness scaled by lineup count
      // More lineups = more randomness for diversity
      var diversityFactor=Math.min(0.4, target/50);
      var totalScore=eligible.reduce(function(s,p){return s+intelScores[p.name];},0);
      // Weighted random selection (higher score = higher probability)
      var rand=Math.random()*totalScore;
      var cumulative=0;
      var pick=eligible[eligible.length-1];
      for(var pi=0;pi<eligible.length;pi++){
        var playerScore=intelScores[eligible[pi].name]*(1+diversityFactor*(Math.random()-0.5));
        cumulative+=playerScore;
        if(cumulative>=rand){pick=eligible[pi];break;}
      }

      selected.push(pick);
      expCount[pick.name]=(expCount[pick.name]||0)+1;
      available=available.filter(function(p){return p.name!==pick.name;});
    }

    var total=selected.reduce(function(s,p){return s+p.salary;},0);
    if(selected.length!==SIZE||total>CAP||(new Set(selected.map(function(p){return p.name;}))).size!==SIZE) continue;

    // Uniqueness check — Wynnr+ only
    if(isWynnrPlus() && uniqPct>0 && lineups.length>0){
      var selNames=selected.map(function(p){return p.name;});
      var tooSimilar=lineups.some(function(existing){
        var exNames=existing.map(function(p){return p.name;});
        var shared=selNames.filter(function(n){return exNames.indexOf(n)>-1;}).length;
        var pctUnique=Math.round(((SIZE-shared)/SIZE)*100);
        return pctUnique < uniqPct;
      });
      // Relax constraint in final 20% of attempts to avoid empty portfolio
      if(tooSimilar && attempts < maxAttempts*0.8) continue;
    }

    lineups.push(selected.slice());
  }

  // Render results
  var el=document.getElementById('portfolioGrid');
  if(!el) return;
  if(!lineups.length){
    el.innerHTML='<div style="color:var(--muted2);font-size:13px;padding:14px;">Could not build lineups. Try fewer lineups, lower uniqueness %, or reset pool.</div>';
    return;
  }

  var ho=lineups.map(function(lu,i){
    var sal=lu.reduce(function(s,p){return s+p.salary;},0);
    var avgOwn=Math.round(lu.reduce(function(s,p){return s+p.own;},0)/lu.length);
    var uniq=Math.min(96,Math.round(100-avgOwn+(Math.random()*12)));
    return '<div class="pf-row"><div class="pf-n">'+(i+1)+'</div>'+
      '<div class="pf-players">'+lu.map(function(p){return p.name.split(' ').pop();}).join(' · ')+'</div>'+
      '<div class="pf-unique">Uniq: <span>'+uniq+'%</span></div>'+
      '<div class="pf-sal">$'+sal.toLocaleString()+'</div></div>';
  }).join('');

  var topExp=Object.entries(expCount).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
  ho+='<div style="margin-top:10px;padding:10px 13px;background:var(--dark2);border:1px solid var(--border);border-radius:var(--r);font-size:11px;color:var(--muted2);">'+
    'Built '+lineups.length+'/'+target+' lineups &nbsp;·&nbsp; '+
    'Top exposure: '+topExp.map(function(e){
      return e[0].split(' ').pop()+' <b style="color:var(--parch);">'+Math.round(e[1]/lineups.length*100)+'%</b>';
    }).join(' · ')+'</div>';
  el.innerHTML=ho;
}


// ── BET TRACKER ──
function logBet(){
  const pick=document.getElementById('bPick').value.trim();
  const sport=document.getElementById('bSport').value;
  const odds=parseInt(document.getElementById('bOdds').value)||0;
  const units=parseFloat(document.getElementById('bUnits').value)||1;
  const result=document.getElementById('bResult').value;
  if(!pick){alert('Please enter a pick name.');return;}
  let pnl=0;
  if(result==='win') pnl=odds>0?units*(odds/100):units*(100/Math.abs(odds));
  else if(result==='loss') pnl=-units;
  bets.unshift({pick,sport,odds,units,result,pnl,date:new Date().toLocaleDateString()});
  document.getElementById('bPick').value='';document.getElementById('bOdds').value='';
  document.getElementById('bUnits').value='';document.getElementById('bResult').value='pending';
  updateTrackerSummary();renderBetsList();drawROI();
}

function updateTrackerSummary(){
  const settled=bets.filter(b=>b.result!=='pending');
  const wins=settled.filter(b=>b.result==='win').length;
  const pnl=settled.reduce((s,b)=>s+b.pnl,0);
  const wr=settled.length?Math.round(wins/settled.length*100):0;
  const units=settled.reduce((s,b)=>s+b.units,0);
  const roi=units?Math.round(pnl/units*100):0;
  const el=document.getElementById('trackerSummary');if(!el)return;
  el.innerHTML=[
    {n:`${wr}%`,l:'Win Rate',c:wr>=55?'var(--green2)':wr>=50?'var(--gold)':'var(--red2)'},
    {n:`${settled.length}`,l:'Tracked',c:'var(--parch)'},
    {n:`${pnl>=0?'+':''}${pnl.toFixed(1)}u`,l:'P&L',c:pnl>=0?'var(--green2)':'var(--red2)'},
    {n:`${roi>=0?'+':''}${roi}%`,l:'ROI',c:roi>=0?'var(--green2)':'var(--red2)'},
  ].map(({n,l,c})=>`<div class="ts-card"><div class="ts-n" style="color:${c};">${n}</div><div class="ts-l">${l}</div></div>`).join('');
}

function renderBetsList(){
  const el=document.getElementById('betsList');
  if(!el)return;
  if(!bets.length){el.innerHTML='<div style="text-align:center;padding:24px;font-size:13px;color:var(--muted2);">No bets logged yet.</div>';return;}
  el.innerHTML=bets.map(function(b,idx){
    const rc={win:'br-win',loss:'br-loss',push:'br-push',pending:'br-pend'}[b.result]||'br-pend';
    const rl={win:'W',loss:'L',push:'P',pending:'--'}[b.result]||'--';
    const pc=b.result==='pending'?'pnl-pend':b.pnl>=0?'pnl-pos':'pnl-neg';
    const pt=b.result==='pending'?'Pending':(b.pnl>=0?'+':'')+b.pnl.toFixed(2)+'u';
    const od=(b.odds>0?'+':'')+b.odds;
    return '<div class="bet-row" style="position:relative;padding-right:32px;">' +
      '<div class="bet-result '+rc+'">'+rl+'</div>' +
      '<div class="bet-pick">'+(b.pick||'--')+'</div>' +
      '<div class="bet-details">'+(b.sport||'')+' · '+od+' · '+(b.units||1)+'u · '+(b.date||'')+'</div>' +
      '<div class="bet-pnl '+pc+'">'+pt+'</div>' +
      '<button onclick="removeBet('+idx+')" style="position:absolute;top:50%;right:8px;transform:translateY(-50%);background:none;border:1px solid var(--border2);color:var(--muted);font-size:12px;cursor:pointer;padding:2px 7px;border-radius:4px;" title="Remove">✕</button>' +
      '</div>';
  }).join('');
}
function removeBet(idx){
  bets.splice(idx,1);
  try{localStorage.setItem('ow_bets',JSON.stringify(bets));}catch(e){}
  renderBetsList();updateTrackerSummary();drawROI();
}

function drawROI(){
  const svg=document.getElementById('roiSvg');if(!svg)return;
  const s=bets.filter(b=>b.result!=='pending').reverse();
  if(s.length<2){svg.innerHTML=`<text x="300" y="45" text-anchor="middle" fill="#5a5040" font-size="12" font-family="DM Sans">Log at least 2 settled bets to see your curve</text>`;return;}
  let r=0;const pts=[{x:0,y:0}];
  s.forEach((b,i)=>{r+=b.pnl;pts.push({x:(i+1)/s.length*600,y:r});});
  const minY=Math.min(...pts.map(p=>p.y)),maxY=Math.max(...pts.map(p=>p.y));
  const rng=maxY-minY||1;
  const sy=y=>75-((y-minY)/rng)*65;
  const d=pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const c=pts[pts.length-1].y>=0?'#3a9460':'#b03030';
  svg.innerHTML=`<defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity=".3"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></linearGradient></defs><path d="${d} L600,80 L0,80 Z" fill="url(#lg)"/><path d="${d}" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="0" y1="${sy(0).toFixed(1)}" x2="600" y2="${sy(0).toFixed(1)}" stroke="rgba(255,255,255,.08)" stroke-width="1" stroke-dasharray="4,4"/>`;
}

// ── PARLAY ──
function initParlay(){parlayLegs=[{pick:'',odds:''}];renderParlay();}
function addLeg(){if(parlayLegs.length>=8)return;parlayLegs.push({pick:'',odds:''});renderParlay();}
function clearParlay(){parlayLegs=[{pick:'',odds:''}];renderParlay();}
function removeLeg(i){if(parlayLegs.length<=1)return;parlayLegs.splice(i,1);renderParlay();}
function renderParlay(){
  const el=document.getElementById('parlayLegs');if(!el)return;
  el.innerHTML=parlayLegs.map((leg,i)=>{
    const o=parseInt(leg.odds)||0;let evClass='ev-neut',evText='Enter odds';
    if(o){const imp=o>0?100/(o+100):Math.abs(o)/(Math.abs(o)+100);evClass=imp<0.45?'ev-pos':imp>0.65?'ev-neg':'ev-neut';evText=`Implied ${Math.round(imp*100)}%`;}
    return`<div class="leg-row"><div class="leg-num">${i+1}</div><div class="leg-fields"><input class="leg-input" placeholder="Pick name" value="${leg.pick}" oninput="parlayLegs[${i}].pick=this.value;calcParlay()"/><input class="leg-odds-input" placeholder="Odds" value="${leg.odds}" oninput="parlayLegs[${i}].odds=this.value;calcParlay()"/><span class="leg-ev ${evClass}">${evText}</span></div><button class="leg-del" onclick="removeLeg(${i})">×</button></div>`;
  }).join('');calcParlay();
}
function calcParlay(){
  const legs=parlayLegs.filter(l=>l.odds&&!isNaN(parseInt(l.odds)));
  const el=document.getElementById('parlaySummary'),wEl=document.getElementById('parlayWarning');
  if(!el||!wEl)return;
  if(legs.length<2){el.innerHTML='<div style="font-size:12px;color:var(--muted2);padding:4px 0;">Add at least 2 legs with odds to see parlay summary.</div>';wEl.innerHTML='';return;}
  let combo=1,winProb=1;
  legs.forEach(l=>{const o=parseInt(l.odds);const dec=o>0?(o/100)+1:1+(100/Math.abs(o));combo*=dec;const imp=o>0?100/(o+100):Math.abs(o)/(Math.abs(o)+100);winProb*=imp;});
  const amOdds=combo>=2?Math.round((combo-1)*100):-Math.round(100/(combo-1));
  const ev=(combo-1)*winProb-(1-winProb);const evPct=Math.round(ev*100);
  el.innerHTML=`<div class="ps-item"><div class="ps-n" style="color:var(--gold);">${amOdds>0?'+':''}${amOdds}</div><div class="ps-l">Payout</div></div><div class="ps-item"><div class="ps-n" style="color:var(--parch);">${Math.round(winProb*100)}%</div><div class="ps-l">Win Prob</div></div><div class="ps-item"><div class="ps-n" style="color:${evPct>=0?'var(--green2)':'var(--red2)'};">${evPct>=0?'+':''}${evPct}%</div><div class="ps-l">EV</div></div><div class="ps-item"><div class="ps-n" style="color:var(--muted3);">${legs.length}</div><div class="ps-l">Legs</div></div>`;
  if(evPct<-20)wEl.innerHTML=`<div class="ev-warn" style="margin-top:12px;">⚠️ <b>High negative EV.</b> This parlay loses ${Math.abs(evPct)}¢ per $1 wagered long-term. Consider dropping a leg. Max: <b>0.25 units.</b></div>`;
  else if(evPct>=0)wEl.innerHTML=`<div class="ev-good" style="margin-top:12px;">✓ <b>Positive EV parlay.</b> Rare — this means individual legs are priced in your favor. Treat like Standard Play: <b>1 unit max.</b></div>`;
  else wEl.innerHTML=`<div style="margin-top:12px;padding:10px 14px;background:var(--dark3);border-radius:8px;font-size:11px;color:var(--muted2);">Slight negative EV — entertainment play only. Keep to <b style="color:var(--parch);">0.5 units or less.</b></div>`;
}

// ── TOOL TABS ──
function setToolTab(tab,btn){
  ['tracker','betgrader','parlay','evanalyzer','kelly','vig','clv'].forEach(function(t){
    var el=document.getElementById('tool-'+t);
    if(el)el.style.display=t===tab?'block':'none';
  });
  document.querySelectorAll('#toolsTabs .tab').forEach(function(t){t.classList.remove('on');});
  var tb=document.querySelector('#toolsTabs .tab[onclick*="'+tab+'"]');
  if(tb)tb.classList.add('on');
  else if(btn&&btn.classList&&btn.classList.contains('tab'))btn.classList.add('on');
  if(tab==='tracker'){updateTrackerSummary();renderBetsList();drawROI();}
  if(tab==='parlay')renderParlay();
  if(tab==='clv')buildCLVTable();
  if(tab==='betgrader')initBetGrader();
  var bar=document.getElementById('toolsTabs');
  if(bar)setTimeout(function(){bar.scrollIntoView({behavior:'smooth',block:'nearest'});},100);
}

function runKelly(){
  var bank=parseFloat(document.getElementById('kellyBank')?.value)||0;
  var odds=parseInt(document.getElementById('kellyOdds')?.value)||0;
  var prob=parseFloat(document.getElementById('kellyProb')?.value)||0;
  if(!bank||!odds||!prob)return;
  var p=prob/100, q=1-p;
  var dec=odds>0?(odds/100)+1:1+(100/Math.abs(odds));
  var b=dec-1;
  var k=Math.max(0,(b*p-q)/b);
  var ev=((p*(dec-1))-(1-p))*100;
  var kf=document.getElementById('kellyFull'); if(kf){kf.textContent='$'+(bank*k).toFixed(0)+' ('+(k*100).toFixed(1)+'%)';kf.style.color=k>0?'var(--green2)':'var(--muted2)';}
  var kh=document.getElementById('kellyHalf'); if(kh){kh.textContent='$'+(bank*k*0.5).toFixed(0)+' ('+(k*50).toFixed(1)+'%)';kh.style.color='var(--gold)';}
  var kq=document.getElementById('kellyQuarter'); if(kq){kq.textContent='$'+(bank*k*0.25).toFixed(0)+' ('+(k*25).toFixed(1)+'%)';}
  var ke=document.getElementById('kellyEV'); if(ke){ke.textContent=(ev>=0?'+':'')+ev.toFixed(1)+'%';ke.style.color=ev>0?'var(--green2)':'var(--red2)';}
}

function runVig(){
  var o1=parseInt(document.getElementById('vigSide1')?.value)||0;
  var o2=parseInt(document.getElementById('vigSide2')?.value)||0;
  if(!o1||!o2)return;
  var i1=o1>0?100/(o1+100):Math.abs(o1)/(Math.abs(o1)+100);
  var i2=o2>0?100/(o2+100):Math.abs(o2)/(Math.abs(o2)+100);
  var total=i1+i2;
  var t1=i1/total, t2=i2/total;
  var vig=(total-1)*100;
  var beven=(total/2)*100;
  var v1=document.getElementById('vigSide1True'); if(v1)v1.textContent=(t1*100).toFixed(1)+'%';
  var v2=document.getElementById('vigSide2True'); if(v2)v2.textContent=(t2*100).toFixed(1)+'%';
  var va=document.getElementById('vigAmount'); if(va){va.textContent=vig.toFixed(2)+'%';va.style.color=vig>5?'var(--red2)':'var(--gold)';}
  var vb=document.getElementById('vigBreakeven'); if(vb)vb.textContent=beven.toFixed(1)+'%';
}

function runCLV(){
  var yours=parseInt(document.getElementById('clvYours')?.value)||0;
  var close=parseInt(document.getElementById('clvClose')?.value)||0;
  if(!yours||!close)return;
  var iy=yours>0?100/(yours+100):Math.abs(yours)/(Math.abs(yours)+100);
  var ic=close>0?100/(close+100):Math.abs(close)/(Math.abs(close)+100);
  var clv=((ic-iy)/iy)*100;
  var edge=(ic-iy)*100;
  var signal=clv>3?'Beating the close':'CLV NEUTRAL';
  if(clv<-3)signal='Losing CLV';
  var color=clv>3?'var(--green2)':clv<-3?'var(--red2)':'var(--gold)';
  var cr=document.getElementById('clvResult'); if(cr){cr.textContent=(clv>=0?'+':'')+clv.toFixed(2)+'%';cr.style.color=color;}
  var cs=document.getElementById('clvSignal'); if(cs){cs.textContent=signal;cs.style.color=color;}
  var ce=document.getElementById('clvEdge'); if(ce){ce.textContent=(edge>=0?'+':'')+edge.toFixed(2)+'%';ce.style.color=color;}
}

function runEVAnalyzer(){
  var odds=parseInt(document.getElementById('evaOdds')?.value)||0;
  var open=parseInt(document.getElementById('evaOpen')?.value)||0;
  var edge=parseFloat(document.getElementById('evaEdge')?.value)||0;
  var bank=parseFloat(document.getElementById('evaBankroll')?.value)||1000;
  if(!odds)return;
  var imp=odds>0?100/(odds+100):Math.abs(odds)/(Math.abs(odds)+100);
  var dec=odds>0?(odds/100)+1:1+(100/Math.abs(odds));
  var wp=imp+(edge/100),ev=((wp*(dec-1))-(1-wp))*100;
  var vig='--';
  if(open){var io=open>0?100/(open+100):Math.abs(open)/(Math.abs(open)+100);vig=((imp+(1-io)-1)*100).toFixed(1)+'%';}
  var kelly=0,bet=0;
  if(edge>0){var b=dec-1,p=wp,q=1-p;kelly=Math.max(0,((b*p-q)/b)*0.5);bet=bank*kelly;}
  var clvTxt='--',clvClr='var(--muted2)';
  if(open&&odds){var d=odds-open;if(d>5){clvTxt='Line moved against you';clvClr='var(--red2)';}else if(d<-5){clvTxt='Beating closing line';clvClr='var(--green2)';}else{clvTxt='Near closing line';clvClr='var(--gold)';}}
  var vc=ev>3?'var(--green2)':ev>0?'var(--gold)':'var(--red2)';
  var vt=ev>5?'Strong +EV BET':ev>2?'Slight edge SMALL BET':ev>0?'Marginal PASS':'Negative EV PASS';
  var e1=document.getElementById('evaEV');if(e1){e1.textContent=(ev>=0?'+':'')+ev.toFixed(1)+'%';e1.style.color=vc;}
  var e2=document.getElementById('evaVig');if(e2)e2.textContent=vig;
  var e3=document.getElementById('evaKelly');if(e3)e3.textContent=bet>0?'$'+bet.toFixed(0)+' ('+(kelly*100).toFixed(1)+'%)':'--';
  var e4=document.getElementById('evaCLV');if(e4){e4.textContent=clvTxt;e4.style.color=clvClr;}
  var e5=document.getElementById('evaVerdict');if(e5){e5.textContent=vt;e5.style.color=vc;e5.style.fontWeight='700';}
}
function submitContact(){
  var nm=document.getElementById('contactName')?.value.trim();
  var em=document.getElementById('contactEmail')?.value.trim();
  var mg=document.getElementById('contactMsg')?.value.trim();
  var out=document.getElementById('contactMsg2');
  if(!nm||!em||!mg){if(out){out.textContent='Please fill in all fields.';out.style.color='var(--red2)';}return;}
  if(!validateEmail(em)){if(out){out.textContent='Please enter a valid email.';out.style.color='var(--red2)';}return;}

  fetch('https://nkqnzyipztancnskshsw.supabase.co/rest/v1/contact_messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({name:nm, email:em, message:mg, created_at:new Date().toISOString()})
  })
  .catch(function(e){ console.log('Contact save error:', e); });

  ['contactName','contactEmail','contactMsg'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  if(out){out.textContent='Message sent! We will get back to you shortly.';out.style.color='var(--green2)';}
}


// ── BANKROLL CALC ──
function calcUnits(){
  const br=parseFloat(document.getElementById('bankroll').value)||0;
  const pct=parseFloat(document.getElementById('unitPct').value)/100;
  const u=br*pct;
  document.getElementById('r1').textContent=u?'$'+u.toFixed(0):'—';
  document.getElementById('r2').textContent=u?'$'+(u*2).toFixed(0):'—';
  document.getElementById('r3').textContent=u?'$'+(u*3).toFixed(0):'—';
  document.getElementById('r4').textContent=u?'$'+(u*0.25).toFixed(2):'—';
}

// ── AGENT ──
function sendMsg(){
  const inp=document.getElementById('agentIn'),msgs=document.getElementById('agentMsgs');
  const txt=inp.value.trim();if(!txt)return;
  msgs.innerHTML+=`<div class="msg u"><div class="av-xs" style="background:rgba(201,168,76,.1);color:var(--gold);">U</div><div class="bubble">${txt}</div></div>`;
  inp.value='';
  msgs.innerHTML+=`<div class="msg" id="typMsg"><div class="chat-av" style="width:26px;height:26px;font-size:9px;">OW</div><div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div></div>`;
  msgs.scrollTop=msgs.scrollHeight;
  const r=AGENT_REPLIES[msgCount%AGENT_REPLIES.length];msgCount++;
  setTimeout(()=>{document.getElementById('typMsg')?.remove();msgs.innerHTML+=`<div class="msg"><div class="chat-av" style="width:26px;height:26px;font-size:9px;">OW</div><div class="bubble">${r}</div></div>`;msgs.scrollTop=msgs.scrollHeight;},1800);
}

// ── EMAIL / OWNER / SETTINGS / QA ──
function validateEmail(val){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);}
function joinFree(inputId){
  var el=document.getElementById(inputId);
  var email=el?el.value.trim():'';
  if(!validateEmail(email)){showEmailMsg(inputId,'Please enter a valid email address.',false);return;}
  showEmailMsg(inputId,'Joining...',true);
  var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo';
  fetch('https://nkqnzyipztancnskshsw.supabase.co/rest/v1/subscribers',{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY,'Prefer':'return=minimal'},
    body:JSON.stringify({email:email,tier:'free',source:inputId,created_at:new Date().toISOString()})
  })
  .then(function(res){
    if(el)el.value='';
    if(res.status===409){
      showEmailMsg(inputId,'You are already on the list!',true);
      return;
    }
    showEmailMsg(inputId,'You are in! Welcome to OnlyWynnrs.',true);
    // Trigger welcome email via Supabase Edge Function (server-side, no CORS)
    fetch('https://nkqnzyipztancnskshsw.supabase.co/functions/v1/welcome-email',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo'},
      body:JSON.stringify({email:email})
    }).catch(function(){/* edge function not yet deployed — silent fail */});
  })
  .catch(function(err){
    try{var sg=JSON.parse(localStorage.getItem('ow_free_signups')||'[]');sg.push({email:email,ts:new Date().toISOString()});localStorage.setItem('ow_free_signups',JSON.stringify(sg));}catch(e){}
    if(el)el.value='';
    showEmailMsg(inputId,'You are in! Welcome to OnlyWynnrs.',true);
  });
}

function showEmailMsg(inputId,msg,ok){
  var el=document.getElementById(inputId);if(!el)return;
  var par=el.closest('.email-bar')||el.parentElement;if(!par)return;
  var ex=par.parentElement?par.parentElement.querySelector('.email-msg'):null;if(ex)ex.remove();
  var d=document.createElement('div');d.className='email-msg';
  d.style.cssText='font-size:12px;margin-top:8px;font-weight:600;color:'+(ok?'var(--green2)':'var(--red2)')+';';
  d.textContent=msg;if(par.parentElement)par.parentElement.insertBefore(d,par.nextSibling);
  if(ok)setTimeout(function(){if(d.parentElement)d.remove();},4000);
}
function enableOwnerMode(){
  currentUserRole='owner';
  localStorage.setItem('ow_role','owner');
  syncSettingsUI();
  updatePricingButtons();
  alert('Owner mode enabled on this device.');
}
function disableOwnerMode(){
  currentUserRole='guest';
  localStorage.setItem('ow_role','guest');
  syncSettingsUI();
  updatePricingButtons();
}

function checkPin(){
  var input = document.getElementById('pinInput');
  var msg = document.getElementById('pinMsg');
  var val = input ? input.value.trim() : '';
  var storedPin = localStorage.getItem('ow_pin') || '1987';
  if(val === storedPin){
    currentUserRole = 'owner';
    localStorage.setItem('ow_role','owner');
    if(msg){ msg.textContent='Owner mode activated.'; msg.style.color='var(--green2)'; }
    var badge = document.getElementById('ownerBadge');
    if(badge) badge.style.display='block';
    if(input) input.value='';
    syncSettingsUI();
  } else {
    if(msg){ msg.textContent='Incorrect PIN.'; msg.style.color='var(--red2)'; }
    setTimeout(function(){ if(msg) msg.textContent=''; }, 2000);
  }
}

function lockOwner(){
  currentUserRole = 'user';
  localStorage.setItem('ow_role','user');
  var badge = document.getElementById('ownerBadge');
  if(badge) badge.style.display='none';
  var msg = document.getElementById('pinMsg');
  if(msg){ msg.textContent='Locked.'; msg.style.color='var(--muted2)'; }
  syncSettingsUI();
}

function changePin(){
  var p1 = document.getElementById('newPin1')?.value.trim();
  var p2 = document.getElementById('newPin2')?.value.trim();
  var msg = document.getElementById('pinChangeMsg');
  if(!p1 || p1.length < 4){ if(msg){msg.textContent='PIN must be 4 digits.';msg.style.color='var(--red2)';} return; }
  if(p1 !== p2){ if(msg){msg.textContent='PINs do not match.';msg.style.color='var(--red2)';} return; }
  if(currentUserRole !== 'owner'){ if(msg){msg.textContent='Must be in owner mode to change PIN.';msg.style.color='var(--red2)';} return; }
  localStorage.setItem('ow_pin', p1);
  if(msg){ msg.textContent='PIN updated.'; msg.style.color='var(--green2)'; }
  document.getElementById('newPin1').value='';
  document.getElementById('newPin2').value='';
}

function saveApiKey(){
  var oddsKey = document.getElementById('oddsApiKey')?.value.trim();
  var rotoKey = document.getElementById('rotoApiKey')?.value.trim();
  if(oddsKey) localStorage.setItem('ow_odds_api_key', oddsKey);
  if(rotoKey) localStorage.setItem('ow_roto_api_key', rotoKey);
}

function syncSettingsUI(){
  oddsApiKey=localStorage.getItem('ow_odds_api_key') || '';
  const input=document.getElementById('oddsApiKeyInput');
  if(input) input.value=oddsApiKey;
  const chip=document.getElementById('ownerStatusChip');
  if(chip) chip.innerHTML=currentUserRole==='owner'
    ? '<span class="status-chip sc-good">Owner mode active</span>'
    : '<span class="status-chip sc-warn2">Guest mode active</span>';
  const oddsStatus=document.getElementById('oddsApiStatus');
  if(oddsStatus) oddsStatus.textContent=oddsApiKey
    ? 'Live key saved locally. Use Refresh Odds on the Live Odds page to test pulls.'
    : 'No live key saved yet. The site is using demo odds.';
}
function updatePricingButtons(){
  const wb=document.getElementById('wynnrBtn');
  const eb=document.getElementById('eliteBtn');
  if(wb){
    wb.textContent=currentUserRole==='owner'?'Owner access active':'Get Wynnr →';
    wb.className='btn '+(currentUserRole==='owner'?'btn-dark':'btn-gold');
  }
  if(eb){
    eb.textContent=currentUserRole==='owner'?'Owner access active':'Go Elite →';
  }
}
function handlePremiumClick(tier){
  if(currentUserRole==='owner'){
    alert(`Owner access active on this device. ${tier.toUpperCase()} features are unlocked for testing.`);
    return;
  }
  alert(`${tier==='wynnr'?'Stripe checkout':'Elite checkout'} is not wired yet. Next step is connecting Stripe + Supabase roles.`);
}
function saveOddsApiKey(){
  const input=document.getElementById('oddsApiKeyInput');
  localStorage.setItem('ow_odds_api_key', input.value.trim());
  syncSettingsUI();
}
function clearOddsApiKey(){
  localStorage.removeItem('ow_odds_api_key');
  syncSettingsUI();
}
async function testOddsApiKey(){
  saveOddsApiKey();
  const status=document.getElementById('oddsApiStatus');
  if(!oddsApiKey){ if(status) status.textContent='Add a key first.'; return; }
  if(status) status.textContent='Testing live key...';
  try{
    const res=await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${encodeURIComponent(oddsApiKey)}`);
    if(!res.ok) throw new Error(`Status ${res.status}`);
    if(status) status.textContent='Success — live connection worked. You can now use Refresh Odds on the Live Odds page.';
  }catch(err){
    if(status) status.textContent='Key test failed. Double-check the key and browser/network access.';
  }
}
function getQaState(){ try{return JSON.parse(localStorage.getItem(qaStorageKey)||'{}');}catch(e){return {};} }
function setQaState(state){ localStorage.setItem(qaStorageKey, JSON.stringify(state)); }
function markQa(id,status){
  const state=getQaState(); state[id]=status; setQaState(state); renderQa();
}
function resetQa(){ localStorage.removeItem(qaStorageKey); renderQa(); }
function renderQa(){
  const wrap=document.getElementById('qaList'), summary=document.getElementById('qaSummary');
  if(!wrap) return;
  const state=getQaState();
  const counts={pass:0,fail:0,pending:0};
  QA_ITEMS.forEach(i=>counts[state[i.id]||'pending']++);
  if(summary) summary.textContent=`${counts.pass} passed · ${counts.fail} failed · ${counts.pending} pending`;
  wrap.innerHTML=QA_ITEMS.map(i=>{
    const st=state[i.id]||'pending';
    const chipClass=st==='pass'?'qa-pass':st==='fail'?'qa-fail':'qa-pend';
    return `<div class="qa-item">
      <div>
        <div class="qa-title">${i.title}</div>
        <div class="qa-desc">${i.desc}</div>
      </div>
      <div class="qa-actions">
        <span class="qa-pill ${chipClass}">${st.toUpperCase()}</span>
        <button class="btn btn-dark btn-xs" onclick="markQa('${i.id}','pass')">Pass</button>
        <button class="btn btn-outline btn-xs" onclick="markQa('${i.id}','fail')">Fail</button>
        <button class="btn btn-outline btn-xs" onclick="markQa('${i.id}','pending')">Pending</button>
      </div>
    </div>`;
  }).join('');
}
function exportQaSummary(){
  const state=getQaState();
  const lines=QA_ITEMS.map(i=>`${i.title}: ${(state[i.id]||'pending').toUpperCase()}`);
  alert(lines.join('\n'));
}

// ── ROUTING ──

function isUnlocked(){
  return currentUserRole==='owner'||localStorage.getItem('ow_member')==='true';
}
function showPaywall(pageName){
  var el=document.getElementById('page-'+pageName);
  if(!el) return;
  var existing=el.querySelector('.paywall-gate');
  if(existing) existing.remove();
  var gate=document.createElement('div');
  gate.className='paywall-gate';
  gate.style.cssText='padding:80px 20px;text-align:center;';
  var icon=document.createElement('div');
  icon.style.cssText='font-size:36px;margin-bottom:16px;';icon.textContent='\uD83D\uDD12';
  var title=document.createElement('div');
  title.style.cssText='font-size:22px;font-weight:700;color:var(--parch);margin-bottom:8px;';
  title.textContent='Members Only';
  var desc=document.createElement('div');
  desc.style.cssText='font-size:14px;color:var(--muted2);line-height:1.7;margin-bottom:24px;max-width:400px;margin-left:auto;margin-right:auto;';
  desc.textContent='Upgrade to Wynnr ($29/mo) for full access to picks, sharp signals, parlays, and all tools.';
  var b1=document.createElement('button');
  b1.className='btn btn-gold btn-sm';b1.style.marginRight='8px';
  b1.textContent='Upgrade to Wynnr';
  b1.onclick=function(){stripeCheckout('wynnr');};
  var b2=document.createElement('button');
  b2.className='btn btn-dark btn-sm';
  b2.textContent=_session?'View Plans':'Sign In';
  b2.onclick=function(){_session?go('pricing',null):showAuthModal('login');};
  gate.appendChild(icon);gate.appendChild(title);gate.appendChild(desc);
  gate.appendChild(b1);gate.appendChild(b2);
  el.innerHTML='<div style="padding-top:84px;"></div>';
  el.appendChild(gate);
}


function applyPageTeasers(pageName){
  var tier=getTier();
  var isWynnr=isWynnrPlus();
  var isDFS=isDFSUnlocked();

  if(pageName==='trends' && !isWynnr){
    var pg=document.getElementById('page-trends');
    if(pg && !pg.querySelector('.trends-teaser')){
      var wrap=pg.querySelector('.wrap')||pg;
      // Show only first 3 trends, hide rest
      var cards=pg.querySelectorAll('.trend-card,.pr-row,.trends-row');
      cards.forEach(function(card,i){
        if(i>=3) card.style.display='none';
      });
      var t=document.createElement('div');
      t.className='trends-teaser';
      t.style.cssText='text-align:center;padding:32px 20px;margin-top:16px;background:var(--dark2);border:1px solid var(--border);border-radius:var(--r2);';
      t.innerHTML='<div style="font-size:28px;margin-bottom:12px;">&#128274;</div>'+
        '<div style="font-size:18px;font-weight:700;margin-bottom:8px;">More Trends & Patterns</div>'+
        '<div style="font-size:13px;color:var(--muted2);margin-bottom:20px;max-width:360px;margin-left:auto;margin-right:auto;line-height:1.6;">'+
        'Upgrade to Wynnr to unlock all trends, historical win rates, and sport-specific sharp patterns.</div>';
      var b=document.createElement('button');
      b.className='btn btn-gold btn-sm';b.textContent='Unlock All Trends';
      b.onclick=function(){stripeCheckout('wynnr');};
      t.appendChild(b);
      wrap.appendChild(t);
    }
  }



  if(pageName==='dfs' && !isDFS && !isDFSUnlocked()){
    var pg3=document.getElementById('page-dfs');
    if(pg3 && !pg3.querySelector('.dfs-teaser')){
      var t3=document.createElement('div');
      t3.className='dfs-teaser';
      t3.style.cssText='text-align:center;padding:40px 20px;margin:16px;background:var(--dark2);border:1px solid var(--border);border-radius:var(--r2);';
      t3.innerHTML='<div style="font-size:28px;margin-bottom:12px;">&#128274;</div>'+
        '<div style="font-size:18px;font-weight:700;margin-bottom:8px;">DFS Optimizer</div>'+
        '<div style="font-size:13px;color:var(--muted2);margin-bottom:20px;max-width:360px;margin-left:auto;margin-right:auto;line-height:1.6;">'+
        'Build intel-scored lineups with sharp signals, ownership data, and exposure controls. Available on Optimizer plan ($9.99/mo).</div>';
      var b3=document.createElement('button');
      b3.className='btn btn-gold btn-sm';b3.style.marginRight='8px';b3.textContent='Get Optimizer — $15/mo';
      b3.onclick=function(){stripeCheckout('optimizer');};
      var b3b=document.createElement('button');
      b3b.className='btn btn-dark btn-sm';b3b.textContent='Get Wynnr — $29/mo';
      b3b.onclick=function(){stripeCheckout('wynnr');};
      t3.appendChild(b3);t3.appendChild(b3b);
      // Insert at top of page content area
      var wrap3=pg3.querySelector('.wrap')||pg3;
      wrap3.insertBefore(t3,wrap3.firstChild);
    }
  }
}
function go(name,btn){
  // Hide all pages uniformly
  document.querySelectorAll('.page').forEach(function(p){
    p.classList.remove('active');
    p.style.display='none';
  });
  var targetPage = document.getElementById('page-'+name);
  if(targetPage){
    targetPage.classList.add('active');
    targetPage.style.display='block';
    // Remove gate only if user is now unlocked
    if(isUnlocked()||isWynnrPlus()||isDFSUnlocked()){
      var existingGate=targetPage.querySelector('.paywall-gate');
      if(existingGate){existingGate.remove();targetPage.style.position='';}
    }
  }
  document.querySelectorAll('.nl').forEach(b=>b.classList.remove('on'));
  if(btn?.classList?.contains('nl'))btn.classList.add('on');
  window.scrollTo({top:0,behavior:'instant'});
  // Update URL — home stays clean, other tabs get #hash
  try {
    if(history && history.pushState){
      var url = (name==='home') ? window.location.pathname : '#'+name;
      history.pushState({page:name}, '', url);
    }
  } catch(e){}
  document.getElementById('navLinks').classList.remove('open');
  if(name==='home'){buildHomePicks();setTimeout(animStats,200);}
  if(name==='freemoney'){buildFMPicks();setTimeout(()=>forceVisible('page-freemoney'),50);}
  if(name==='picks'){
    buildFullPicks();initPicksTabs();
    setTimeout(function(){forceVisible('page-picks');},50);
  }
  if(name==='odds'){buildOddsBoard(currentOddsType);initOddsTabs();setTimeout(function(){forceVisible('page-odds');},50);}
  if(name==='trends'){buildTrends();setTimeout(function(){applyPageTeasers('trends');document.querySelectorAll('#page-trends .rise').forEach(function(el){obs.observe(el);});},400);}
  if(name==='sharp'){
    buildSharp('all');
    setTimeout(function(){
      if(!isWynnrPlus()) showPaywall('sharp');
      forceVisible('page-sharp');
    },50);
  }
  if(name==='dfs'){applyPageTeasers('dfs');
    setTimeout(function(){
      renderSlateSelect(document.getElementById('sportSel')?.value||'ufc');
      renderPlayerPool();
      refreshLeverage();
      forceVisible('page-dfs');
    },50);
  }
  if(name==='tools'){
    setToolTab('tracker',document.querySelector('#toolsTabs .tab'));
    updateTrackerSummary();renderBetsList();drawROI();renderParlay();
    setTimeout(function(){
      if(!isDFSUnlocked()) showPaywall('tools');
      forceVisible('page-tools');
    },50);
  }
  if(name==='parlays'){
    buildParlayCards();
    setTimeout(function(){
      if(!isWynnrPlus()) showPaywall('parlays');
      forceVisible('page-parlays');
    },50);
  }
  if(name==='articles'){buildArticles();initArticlesTabs();setTimeout(function(){applyPageTeasers('articles');forceVisible('page-articles');},400);}
  if(name==='ambassador'){setTimeout(function(){forceVisible('page-ambassador');},50);}
  if(name==='about'){setTimeout(function(){forceVisible('page-about');},50);}
  if(name==='contact'){setTimeout(function(){forceVisible('page-contact');},50);}
  if(name==='learn'){
    var learnPg=document.getElementById('page-learn');
    if(learnPg){learnPg.style.display='block';learnPg.classList.add('active');}
    setAcademyTab('foundation',document.querySelector('#academyTabs .tab'));
    setTimeout(function(){forceVisible('page-learn');},50);
  }
  if(name==='settings'){
    syncSettingsUI();
    updateAuthUI();
    if(typeof renderAmbassadorDash==='function') renderAmbassadorDash('ambassadorDash');
    window.scrollTo({top:0,behavior:'instant'});
  }
  if(name==='privacy'||name==='terms'||name==='responsible'){
    setTimeout(function(){forceVisible('page-'+name);},50);
  }
  if(name==='qa'){if(currentUserRole==='owner'){renderQa();setTimeout(function(){forceVisible('page-qa');},50);}else{go('home',null);}}
}
// Handle browser back/forward + direct URL hash navigation
window.addEventListener('popstate', function(e){
  var page = e.state && e.state.page ? e.state.page : 'home';
  var link = document.querySelector('.nl[href="#'+page+'"]');
  go(page, link);
});

function loadFromHash(){
  var hash = window.location.hash.replace('#','') || 'home';
  var validPages = ['home','freemoney','picks','odds','trends','sharp','dfs',
                    'tools','parlays','articles','learn','ambassador','settings',
                    'pricing','about','contact','qa'];
  var page = validPages.indexOf(hash)>-1 ? hash : 'home';
  var link = document.querySelector('.nl[href="#'+page+'"]');
  try {
    if(history && history.replaceState){
      var initUrl = (page==='home') ? window.location.pathname : '#'+page;
      history.replaceState({page:page}, '', initUrl);
    }
  } catch(e){}
  go(page, link);
}

function toggleNav(){document.getElementById('navLinks').classList.toggle('open');}

// ── STATS ANIM ──
function animStats(){
  [{id:'s1',v:64,s:'%',ms:1600},{id:'s2',v:24,s:'',ms:1000},{id:'s3',v:18,s:'%',ms:1400},{id:'s4',v:12,s:'K',ms:1200}].forEach(({id,v,s,ms})=>{
    const el=document.getElementById(id);if(!el)return;
    let st=null;
    (function step(ts){if(!st)st=ts;const p=Math.min((ts-st)/ms,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(e*v)+s;if(p<1)requestAnimationFrame(step);})(performance.now());
  });
}

const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');}),{threshold:.08});

init();

// ── OWNER PIN AUTH ──
function getOwnerPin(){ return localStorage.getItem('ow_pin') || '1987'; }

function verifyOwnerPin(){
  var input = document.getElementById('ownerPinInput');
  var errEl = document.getElementById('pinError');
  var changeSection = document.getElementById('changePinSection');
  if(!input) return;
  if(input.value.trim() === getOwnerPin()){
    currentUserRole = 'owner';
    localStorage.setItem('ow_role','owner');
    input.value = '';
    if(errEl) errEl.style.display = 'none';
    if(changeSection) changeSection.style.display = 'block';
    syncSettingsUI(); updatePricingButtons();
    alert('Owner mode unlocked on this device.');
  } else {
    if(errEl) errEl.style.display = 'block';
    input.value = '';
    setTimeout(function(){ if(errEl) errEl.style.display='none'; }, 3000);
  }
}

function changeOwnerPin(){
  var p1 = document.getElementById('newPin1') ? document.getElementById('newPin1').value.trim() : '';
  var p2 = document.getElementById('newPin2') ? document.getElementById('newPin2').value.trim() : '';
  var msg = document.getElementById('pinChangeMsg');
  if(!p1 || p1.length !== 4 || isNaN(p1)){
    if(msg){ msg.style.color='var(--red2)'; msg.textContent='PIN must be exactly 4 digits.'; } return;
  }
  if(p1 !== p2){
    if(msg){ msg.style.color='var(--red2)'; msg.textContent='PINs do not match.'; } return;
  }
  localStorage.setItem('ow_pin', p1);
  if(msg){ msg.style.color='var(--green2)'; msg.textContent='PIN updated successfully.'; }
  if(document.getElementById('newPin1')) document.getElementById('newPin1').value='';
  if(document.getElementById('newPin2')) document.getElementById('newPin2').value='';
}


// ── ACADEMY TABS ──
function setAcademyTab(tab,btn,scrollToId){
  ['foundation','advanced','mental','dfs'].forEach(function(t){var el=document.getElementById('academy-'+t);if(el)el.style.display=t===tab?'block':'none';});
  document.querySelectorAll('#academyTabs .tab').forEach(function(b){b.classList.remove('on');});
  if(btn&&btn.classList&&btn.classList.contains('tab'))btn.classList.add('on');
  else{var mb=document.querySelector('#academyTabs .tab[onclick*="'+tab+'"]');if(mb)mb.classList.add('on');}
  if(tab==='advanced')buildCLVTable();
  setTimeout(function(){forceVisible('page-learn');if(scrollToId){var t=document.getElementById(scrollToId);if(t)t.scrollIntoView({behavior:'smooth',block:'start'});}},80);
}

// ── KELLY CRITERION ──
function calcKelly(){
  const br=parseFloat(document.getElementById('kellyBankroll')?.value)||0;
  const edge=parseFloat(document.getElementById('kellyEdge')?.value)||0;
  const odds=parseInt(document.getElementById('kellyOdds')?.value)||0;
  const frac=parseFloat(document.getElementById('kellyFraction')?.value)||0.5;
  if(!br||!edge||!odds) return;
  const dec=odds>0?(odds/100)+1:1+(100/Math.abs(odds));
  const p=edge/100+(odds>0?100/(odds+100):Math.abs(odds)/(Math.abs(odds)+100));
  const q=1-p; const b=dec-1;
  const rawK=(b*p-q)/b;
  const adjK=Math.max(0,rawK*frac);
  const bet=br*adjK;
  const pct=adjK*100;
  const ev=p*(dec-1)*bet-q*bet;
  document.getElementById('kelly1').textContent=bet>0?'$'+bet.toFixed(0):'—';
  document.getElementById('kelly2').textContent=bet>0?pct.toFixed(1)+'%':'—';
  document.getElementById('kelly3').textContent=bet>0?(ev>=0?'+':'')+ev.toFixed(0):'—';
  document.getElementById('kelly4').textContent=bet>0?(pct/2).toFixed(2)+'u':'—';
}

// ── CLV TABLE ──
function buildCLVTable(){
  var el=document.getElementById('clvTableBody');
  if(!el)return;
  var rows=[
    {band:'Beat closing by 3%+',wr:'57-60%',roi:'+8-12%',profit:'+$440-$600 / 100u',color:'var(--green2)',note:'Elite sharp. Books will start limiting you.'},
    {band:'Beat closing by 1-3%',wr:'54-57%',roi:'+3-8%',profit:'+$165-$440 / 100u',color:'var(--green2)',note:'Strong edge. Sustainable long-term profit.'},
    {band:'Beat closing by 0-1%',wr:'52-54%',roi:'+1-3%',profit:'+$55-$165 / 100u',color:'var(--gold)',note:'Slight edge. Profitable but thin margin.'},
    {band:'At closing line',wr:'51-52%',roi:'0-1%',profit:'$0-$55 / 100u',color:'var(--muted3)',note:'No edge over vig. Breaking even.'},
    {band:'Lose to close',wr:'Below 51%',roi:'Negative',profit:'Loss',color:'var(--red2)',note:'Market is beating you. Reassess process.'},
  ];
  el.innerHTML='<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
    '<thead><tr style="border-bottom:2px solid var(--border);">' +
    '<th style="padding:8px 12px;text-align:left;color:var(--muted);font-weight:600;font-size:10px;letter-spacing:1px;">CLV BAND</th>' +
    '<th style="padding:8px 12px;text-align:center;color:var(--muted);font-weight:600;font-size:10px;letter-spacing:1px;">WIN RATE</th>' +
    '<th style="padding:8px 12px;text-align:center;color:var(--muted);font-weight:600;font-size:10px;letter-spacing:1px;">ROI</th>' +
    '<th style="padding:8px 12px;text-align:center;color:var(--muted);font-weight:600;font-size:10px;letter-spacing:1px;">PROFIT</th>' +
    '<th style="padding:8px 12px;text-align:left;color:var(--muted);font-weight:600;font-size:10px;letter-spacing:1px;">SIGNAL</th>' +
    '</tr></thead><tbody>' +
    rows.map(function(r){return '<tr style="border-bottom:1px solid var(--border);">' +
      '<td style="padding:10px 12px;font-weight:600;color:'+r.color+';">'+r.band+'</td>' +
      '<td style="padding:10px 12px;text-align:center;font-family:var(--fm);">'+r.wr+'</td>' +
      '<td style="padding:10px 12px;text-align:center;font-family:var(--fm);color:'+r.color+';">'+r.roi+'</td>' +
      '<td style="padding:10px 12px;text-align:center;font-family:var(--fm);color:'+r.color+';">'+r.profit+'</td>' +
      '<td style="padding:10px 12px;font-size:11px;color:var(--muted2);">'+r.note+'</td>' +
    '</tr>';}).join('') +
    '</tbody></table>';
}

// ── VIG REMOVAL ──
function calcVig(){
  const o1=parseInt(document.getElementById('vigSide1')?.value)||0;
  const o2=parseInt(document.getElementById('vigSide2')?.value)||0;
  if(!o1||!o2) return;
  const i1=o1>0?100/(o1+100):Math.abs(o1)/(Math.abs(o1)+100);
  const i2=o2>0?100/(o2+100):Math.abs(o2)/(Math.abs(o2)+100);
  const tot=i1+i2;
  const vig=((tot-1)*100).toFixed(1);
  const t1=(i1/tot*100).toFixed(1);
  const t2=(i2/tot*100).toFixed(1);
  const tp1=i1/tot;
  const fair1=tp1>=0.5?'-'+Math.round(tp1/(1-tp1)*100):'+'+Math.round((1-tp1)/tp1*100);
  document.getElementById('vigPct').textContent=vig+'%';
  document.getElementById('trueProb1').textContent=t1+'%';
  document.getElementById('trueProb2').textContent=t2+'%';
  document.getElementById('fairOdds1').textContent=fair1;
}

// ── SHARP SIGNAL LABELS (enhanced) ──
const _origBuildSharp = buildSharp;
buildSharp = function(){
  _origBuildSharp();
  // Enhance each sharp row with plain-English note
  const notes = {
    'SHARP ACTION': 'Line moved against the public — sharp money confirmed. Strong signal.',
    'STEAM MOVE': 'Multiple books moved simultaneously — syndicate bet confirmed. Act fast.',
    'REVERSE LINE': 'Strongest signal: line moved opposite to public % — professionals are on this.',
    'WATCH': 'Line is moving but not confirmed yet. Monitor — do not bet until signal strengthens.',
    'SHARP FADE': 'Sharps are betting against the popular side. Consider fading the public here.',
    'NEUTRAL': 'No clear signal. Skip this game — no edge identified.',
  };
  document.querySelectorAll('#sharpList .sig').forEach(el=>{
    const txt = el.textContent.trim();
    if(notes[txt]){
      const note = document.createElement('div');
      note.style.cssText='font-size:10px;color:var(--muted2);margin-top:5px;';
      note.textContent = notes[txt];
      const parent = el.closest('div[style]');
      if(parent && !parent.querySelector('.sharp-note')){
        note.className='sharp-note';
        parent.appendChild(note);
      }
    }
  });
};


function forceVisible(pageId){
  // Make all .rise elements on a page visible immediately (for non-scroll pages)
  const page = document.getElementById(pageId);
  if(!page) return;
  page.querySelectorAll('.rise').forEach(el=>{
    el.classList.add('in');
    obs.observe(el);
  });
}


function exportLineups(){
  var grid=document.getElementById('portfolioGrid');
  if(!grid||!grid.children.length){alert('Build a portfolio first.');return;}
  var rows=grid.querySelectorAll('.pf-row');
  if(!rows.length){alert('No lineups to export.');return;}
  var sport=document.getElementById('sportSel')?.value||'ufc';
  var book=currentBook||'dk';
  var size=BOOKS[book]?.sizes[sport]||6;

  // Build header: DK UFC format is F,F,F,F,F,F (position columns)
  // DK expects: player name in each slot column
  var posLabel=sport==='ufc'?'F':sport==='nba'?'PG,SG,SF,PF,C,G,F,UTIL':'P,P,C,1B,2B,3B,SS,OF,OF,OF';
  var headers=sport==='ufc'?Array(size).fill(0).map(function(_,i){return 'F'+(i+1);}):posLabel.split(',');

  var lines=[headers.join(',')];

  rows.forEach(function(row){
    var playersEl=row.querySelector('.pf-players');
    if(!playersEl) return;
    // pf-players stores last names joined by ' · '
    // We need full names - look up from POOLS
    var lastNames=playersEl.textContent.trim().split(' · ');
    var pool=POOLS[sport]||[];
    var fullNames=lastNames.map(function(ln){
      var match=pool.find(function(p){return p.name.split(' ').pop()===ln||p.name===ln;});
      return match?match.name:ln;
    });
    // Pad to correct size
    while(fullNames.length<size) fullNames.push('');
    lines.push(fullNames.slice(0,size).map(function(n){
      // Wrap in quotes if contains comma
      return n.indexOf(',')>-1?'"'+n+'"':n;
    }).join(','));
  });

  var csv=lines.join('\n');
  var blob=new Blob([csv],{type:'text/csv'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='onlywynnrs_'+book+'_'+sport+'_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);URL.revokeObjectURL(url);
}


function clearExcludes(){
  var sport=document.getElementById('sportSel')?.value||'ufc';
  var key=(currentBook||'dk')+'_'+sport;
  var state=getPoolState();
  if(state[key]) state[key].excludes=[];
  savePoolState(state);
  renderPlayerPool();
}

function submitAmbassador(){
  var name=document.getElementById('ambName')?.value?.trim();
  var email=document.getElementById('ambEmail')?.value?.trim();
  var social=document.getElementById('ambSocial')?.value?.trim()||'';
  var niche=document.getElementById('ambNiche')?.value?.trim()||'';
  var msg=document.getElementById('ambMsg');

  if(!name){if(msg){msg.style.display='block';msg.style.color='var(--red2)';msg.textContent='Please enter your name.';}return;}
  if(!email||email.indexOf('@')===-1){if(msg){msg.style.display='block';msg.style.color='var(--red2)';msg.textContent='Please enter a valid email.';}return;}

  var btn=event?.target||document.querySelector('#page-ambassador .btn-gold');
  if(btn){btn.textContent='Submitting...';btn.disabled=true;}

  fetch('https://nkqnzyipztancnskshsw.supabase.co/rest/v1/ambassador_applications',{
    method:'POST',
    headers:{
      'apikey':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcW56eWlwenRhbmNuc2tzaHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTcxNjAsImV4cCI6MjA5Mjc5MzE2MH0.CyiRaPPPhDwnCzIqxHF0ZpgGmTsh53TUMOvre93wLpo',
      'Content-Type':'application/json',
      'Prefer':'return=minimal'
    },
    body:JSON.stringify({name:name,email:email,social_handle:social,niche:niche,status:'pending',created_at:new Date().toISOString()})
  }).then(function(r){
    if(btn){btn.textContent='Submit Application';btn.disabled=false;}
    if(msg){
      msg.style.display='block';
      if(r.ok||r.status===201){
        msg.innerHTML='<div style="color:var(--green2);font-weight:700;">&#10003; Application received!</div>'+
          '<div style="font-size:12px;color:var(--muted2);margin-top:4px;">We will reach out to '+email+' within 24 hours with your tracking link and onboarding details.</div>';
        // Clear form
        ['ambName','ambEmail','ambSocial','ambNiche'].forEach(function(id){
          var el=document.getElementById(id);if(el)el.value='';
        });
      } else {
        msg.style.color='var(--red2)';
        msg.textContent='Something went wrong ('+r.status+'). Please email hello@onlywynnrs.com directly.';
      }
    }
  }).catch(function(err){
    if(btn){btn.textContent='Submit Application';btn.disabled=false;}
    if(msg){msg.style.display='block';msg.style.color='var(--red2)';msg.textContent='Connection error. Please email hello@onlywynnrs.com directly.';}
  });
}
// ── SUPABASE CONTENT LOADER ──
async function loadDailyContent(){
  try{
    var today=new Date().toISOString().split('T')[0];
    var res=await _sbFetch('/rest/v1/daily_content?date=eq.'+today+'&select=*&limit=1');
    if(!res.ok||!res.data||!res.data.length){console.log('No Supabase content, using data.js');return;}
    var c=res.data[0];
    var parse=function(f){try{return f?JSON.parse(f):null;}catch(e){return null;}};
    var picks=parse(c.picks),signals=parse(c.sharp_signals),parlays=parse(c.parlays);
    var articles=parse(c.articles),ticker=parse(c.ticker),fmPicks=parse(c.fm_picks);
    var oddsBoard=parse(c.odds_board),lvData=parse(c.lv_data);
    if(picks&&picks.length)       window.PICKS=picks;
    if(signals&&signals.length)   window.SHARP_DATA=signals;
    if(parlays&&parlays.length)   window.HC_PARLAYS=parlays;
    if(articles&&articles.length) window.ARTICLES=articles;
    if(ticker&&ticker.length)     window.TICKER_DATA=ticker;
    if(fmPicks&&fmPicks.length)   window.FM_PICKS=fmPicks;
    if(oddsBoard)                 window.ODDS_DATA=oddsBoard;
    if(lvData&&lvData.length)     window.LV_DATA=lvData;
    console.log('Live content loaded from Supabase for '+today);
    // Rebuild all UI with fresh data
    buildTicker(); buildHomePicks(); buildFMPicks(); buildFullPicks();
    buildSharp(); buildArticles(); buildParlays();
  }catch(err){console.log('Content load error, using data.js:',err.message);}
}

// ── AMBASSADOR PROGRAM ──
function generateRefCode(email){var base=email.split('@')[0].replace(/[^a-zA-Z0-9]/g,'').toUpperCase().slice(0,5);var uid=Math.random().toString(36).slice(2,5).toUpperCase();return base+uid;}
function detectReferral(){var params=new URLSearchParams(window.location.search);var ref=params.get('ref');if(ref){localStorage.setItem('ow_referral_code',ref.toUpperCase());localStorage.setItem('ow_referral_ts',Date.now().toString());window.history.replaceState({},'',window.location.pathname);}}
function getStoredReferral(){var code=localStorage.getItem('ow_referral_code');var ts=parseInt(localStorage.getItem('ow_referral_ts')||'0');if(code&&(Date.now()-ts)<30*24*60*60*1000)return code;return null;}
async function saveReferralToProfile(userId){var refCode=getStoredReferral();if(!refCode)return;await _sbFetch('/rest/v1/profiles?id=eq.'+userId,{method:'PATCH',headers:{'Prefer':'return=minimal','Content-Type':'application/json'},body:JSON.stringify({referred_by:refCode})});await creditReferrer(refCode);localStorage.removeItem('ow_referral_code');localStorage.removeItem('ow_referral_ts');}
async function creditReferrer(refCode){var res=await _sbFetch('/rest/v1/profiles?ref_code=eq.'+refCode+'&select=id,ref_credit,ref_count');if(!res.ok||!res.data||!res.data.length)return;var r=res.data[0];await _sbFetch('/rest/v1/profiles?id=eq.'+r.id,{method:'PATCH',headers:{'Prefer':'return=minimal','Content-Type':'application/json'},body:JSON.stringify({ref_credit:(parseFloat(r.ref_credit)||0)+5.80,ref_count:(parseInt(r.ref_count)||0)+1,updated_at:new Date().toISOString()})});}
async function ensureRefCode(){if(!_session||!_profile)return;if(_profile.ref_code)return;var base=(_session.user.email||'user').split('@')[0].replace(/[^a-zA-Z0-9]/g,'').toUpperCase().slice(0,5);var uid=(_session.user.id||'').slice(-4).toUpperCase();var code=base+uid;await _sbFetch('/rest/v1/profiles?id=eq.'+_session.user.id,{method:'PATCH',headers:{'Prefer':'return=minimal','Content-Type':'application/json'},body:JSON.stringify({ref_code:code})});_profile.ref_code=code;}
function getRefStats(){return {code:(_profile&&_profile.ref_code)||null,count:parseInt((_profile&&_profile.ref_count)||0)||0,credit:parseFloat((_profile&&_profile.ref_credit)||0)||0,link:(_profile&&_profile.ref_code)?'https://onlywynnrs.com?ref='+_profile.ref_code:null};}
function renderAmbassadorDash(containerId){var el=document.getElementById(containerId);if(!el)return;if(!_session||!_profile){el.innerHTML='';return;}var stats=getRefStats();if(!stats.code){el.innerHTML='<div style="padding:12px;text-align:center;color:var(--muted2);font-size:12px;">Generating your referral code...</div>';ensureRefCode().then(function(){if(_profile)renderAmbassadorDash(containerId);});return;}var creditMonths=Math.floor(stats.credit/29);var html='<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);"><div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--gold);margin-bottom:12px;">AMBASSADOR PROGRAM</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;"><div style="text-align:center;padding:10px;background:var(--dark3);border-radius:8px;border:1px solid var(--border2);"><div style="font-size:20px;font-weight:800;color:var(--gold);">'+stats.count+'</div><div style="font-size:9px;color:var(--muted2);margin-top:2px;">REFERRALS</div></div><div style="text-align:center;padding:10px;background:var(--dark3);border-radius:8px;border:1px solid var(--border2);"><div style="font-size:20px;font-weight:800;color:var(--green2);">$'+stats.credit.toFixed(2)+'</div><div style="font-size:9px;color:var(--muted2);margin-top:2px;">CREDIT</div></div><div style="text-align:center;padding:10px;background:var(--dark3);border-radius:8px;border:1px solid var(--border2);"><div style="font-size:20px;font-weight:800;color:var(--parch);">'+creditMonths+'</div><div style="font-size:9px;color:var(--muted2);margin-top:2px;">FREE MO</div></div></div><div style="margin-bottom:10px;"><div style="font-size:10px;color:var(--muted2);margin-bottom:5px;">YOUR CODE</div><div style="display:flex;gap:8px;"><div style="flex:1;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;padding:9px 12px;font-size:15px;font-weight:800;color:var(--gold);letter-spacing:2px;">'+stats.code+'</div><button id="amb-copy-code" data-val="'+stats.code+'" style="padding:9px 14px;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;color:var(--parch);font-size:11px;cursor:pointer;">Copy</button></div></div><div style="margin-bottom:12px;"><div style="font-size:10px;color:var(--muted2);margin-bottom:5px;">YOUR LINK</div><div style="display:flex;gap:8px;"><div style="flex:1;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;padding:9px 12px;font-size:10px;color:var(--muted2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+stats.link+'</div><button id="amb-copy-link" data-val="'+stats.link+'" style="padding:9px 14px;background:var(--dark3);border:1px solid var(--border2);border-radius:8px;color:var(--parch);font-size:11px;cursor:pointer;">Copy</button></div></div><div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:8px;padding:10px;font-size:11px;color:var(--muted2);">Every referral who subscribes earns you 20% of their first month as account credit. It never expires.</div></div>';el.innerHTML=html;var cb=document.getElementById('amb-copy-code');if(cb)cb.onclick=function(){navigator.clipboard.writeText(this.dataset.val);var t=this;t.textContent='Copied!';setTimeout(function(){t.textContent='Copy';},2000);};var lb=document.getElementById('amb-copy-link');if(lb)lb.onclick=function(){navigator.clipboard.writeText(this.dataset.val);var t=this;t.textContent='Copied!';setTimeout(function(){t.textContent='Copy';},2000);};}

// ── BET GRADER ──
function bgUpdateGames(){var sport=document.getElementById('bg-sport')?.value||'ufc';var gameEl=document.getElementById('bg-game');if(!gameEl)return;var games=new Set();(window.SHARP_DATA||SHARP_DATA||[]).forEach(function(sd){var g=sd.game||'';var sub=(sd.sub||'').toLowerCase();if(sport==='ufc'&&(sub.indexOf('ufc')>-1||sub.indexOf('mma')>-1))games.add(g);else if(sport==='nba'&&sub.indexOf('nba')>-1)games.add(g);else if(sport==='mlb'&&sub.indexOf('mlb')>-1)games.add(g);else if(sport==='nfl'&&sub.indexOf('nfl')>-1)games.add(g);});(window.PICKS||PICKS||[]).filter(function(p){return p.sport===sport;}).forEach(function(p){if(p.matchup)games.add(p.matchup);});gameEl.innerHTML='<option value="">Select game...</option>';games.forEach(function(g){var o=document.createElement('option');o.value=g;o.textContent=g;gameEl.appendChild(o);});}
function runBetGrader(){var sport=document.getElementById('bg-sport')?.value||'ufc';var pick=(document.getElementById('bg-pick')?.value||'').trim();var oddsStr=(document.getElementById('bg-odds')?.value||'').trim();var units=parseFloat(document.getElementById('bg-units')?.value||'1')||1;if(!pick){alert('Enter your pick.');return;}if(!oddsStr){alert('Enter the odds.');return;}var odds=parseFloat(oddsStr);if(isNaN(odds)){alert('Invalid odds. Use -110 or +150.');return;}var impliedProb=odds<0?(-odds/(-odds+100))*100:(100/(odds+100))*100;var sharpScore=0,sharpSig=null,pickScore=0,pickSig=null,vigScore=0,vigSig=null;var pL=pick.toLowerCase();var _sd=window.SHARP_DATA||SHARP_DATA||[];var _pk=window.PICKS||PICKS||[];_sd.forEach(function(sd){var parts=(sd.game||'').toLowerCase().split(' vs ');var f1=parts[0]||'',f2=(parts[1]||'').trim();var pF1=f1.trim().split(' ').pop().length>2&&pL.indexOf(f1.trim().split(' ').pop())>-1;var pF2=f2.split(' ').pop().length>2&&pL.indexOf(f2.split(' ').pop())>-1;if(!pF1&&!pF2)return;var sharpsF1=(sd.sharp||50)>=50;if(sd.sig==='hot'){if((pF1&&sharpsF1)||(pF2&&!sharpsF1)){sharpScore+=35;sharpSig={type:'STEAM',score:35,color:'var(--green2)',text:'Steam confirmed - '+(sd.pub||50)+'% bets and '+(sd.sharp||50)+'% sharp dollars on your side.'};}else{sharpScore-=20;sharpSig={type:'FADE',score:-20,color:'var(--red2)',text:'Fading the steam - sharps on the OTHER side.'};}}else if(sharpsF1!==((sd.pub||50)>=50)){if((pF1&&sharpsF1)||(pF2&&!sharpsF1)){sharpScore+=40;sharpSig={type:'RLM',score:40,color:'var(--gold)',text:'RLM confirmed - '+(sd.pub||50)+'% bets but '+(sd.sharp||50)+'% sharp dollars on your side.'};}else{sharpScore-=25;sharpSig={type:'FADE',score:-25,color:'var(--red2)',text:'Against sharp money.'};}}});_pk.forEach(function(p){if(p.sport!==sport)return;var pl=(p.call||'').toLowerCase();if(pL.indexOf(pl.split(' ')[0])>-1||pl.indexOf(pL.split(' ')[0])>-1){pickScore+=25;pickSig={type:'PICK MATCH',score:25,color:'var(--green2)',text:'Matches our pick: '+p.call+' ('+p.rating+', '+p.units+').'};}});if(odds>=150){vigScore+=10;vigSig={type:'UNDERDOG VALUE',score:10,color:'var(--green2)',text:'Plus money. Only needs to win '+impliedProb.toFixed(0)+'% to break even.'};}if(odds<=-200){vigScore-=10;vigSig={type:'HEAVY CHALK',score:-10,color:'var(--muted2)',text:'Heavy favorite. Cap at 1-1.5u.'};}var total=sharpScore+pickScore+vigScore;var grade,gc,gb,verdict,recU;if(total>=60){grade='A+';gc='#00e676';gb='rgba(0,230,118,.1)';verdict='STRONG PLAY';recU=Math.min(units,2);}else if(total>=40){grade='A';gc='var(--green2)';gb='rgba(58,148,96,.1)';verdict='GOOD PLAY';recU=Math.min(units,1.5);}else if(total>=20){grade='B';gc='var(--gold)';gb='rgba(201,168,76,.1)';verdict='LEAN PLAY';recU=Math.min(units,1);}else if(total>=0){grade='C';gc='#94a3b8';gb='rgba(148,163,184,.1)';verdict='MARGINAL';recU=0.75;}else{grade='D';gc='var(--red2)';gb='rgba(248,113,113,.1)';verdict='AVOID';recU=0;}var res=document.getElementById('bg-results');if(res)res.style.display='block';var sc=document.getElementById('bg-scorecard');if(sc){sc.style.background=gb;sc.style.border='1px solid '+gc+'44';sc.innerHTML='<div style="font-size:52px;font-weight:900;color:'+gc+';line-height:1;margin-bottom:8px;">'+grade+'</div><div style="font-size:13px;font-weight:700;color:'+gc+';letter-spacing:1px;margin-bottom:4px;">'+verdict+'</div><div style="font-size:11px;color:var(--muted2);">'+pick+' • '+oddsStr+'</div><div style="margin-top:12px;display:flex;justify-content:center;gap:20px;"><div><div style="font-size:10px;color:var(--muted2);">SIGNAL</div><div style="font-size:18px;font-weight:700;color:'+gc+';">'+total+'</div></div><div><div style="font-size:10px;color:var(--muted2);">IMPLIED</div><div style="font-size:18px;font-weight:700;">'+impliedProb.toFixed(1)+'%</div></div><div><div style="font-size:10px;color:var(--muted2);">REC SIZE</div><div style="font-size:18px;font-weight:700;color:var(--gold);">'+recU+'u</div></div></div>';}var sigEl=document.getElementById('bg-signals');if(sigEl){var sigs=[sharpSig,pickSig,vigSig].filter(Boolean);var sH='<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--muted2);margin-bottom:10px;">SIGNAL BREAKDOWN</div>';if(!sigs.length)sH+='<div style="font-size:12px;color:var(--muted2);">No matching signals. Proceed with caution.</div>';else sigs.forEach(function(s){sH+='<div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05);"><span style="font-size:9px;padding:3px 7px;border-radius:4px;background:'+s.color+'22;color:'+s.color+';font-weight:700;white-space:nowrap;margin-top:2px;">'+s.type+'</span><div style="flex:1;font-size:11px;color:var(--muted2);line-height:1.5;">'+s.text+'</div><span style="font-size:13px;font-weight:700;color:'+s.color+';">'+(s.score>0?'+':'')+s.score+'</span></div>';});sigEl.innerHTML=sH;}var vEl=document.getElementById('bg-verdict');if(vEl){vEl.style.background=gb;vEl.style.border='1px solid '+gc+'44';var vT=grade==='A+'||grade==='A'?'Multiple confirming signals. Bet '+recU+'u.':grade==='B'?'Some signals support this. Cap at '+recU+'u.':grade==='C'?'Minimal support. 0.5u max.':'Signals against this. Pass.';vEl.innerHTML='<div style="font-weight:700;color:'+gc+';margin-bottom:6px;">VERDICT: '+verdict+'</div><div style="font-size:12px;color:var(--muted2);line-height:1.6;">'+vT+'</div><div style="margin-top:8px;font-size:11px;color:var(--muted2);font-style:italic;">Grade based on current data. Bet responsibly.</div>';}}
function initBetGrader(){bgUpdateGames();var l=document.getElementById('bg-parlay-legs');if(l&&l.children.length===0){bgAddParlayLeg();bgAddParlayLeg();}}
function bgAddParlayLeg(){var legs=document.getElementById('bg-parlay-legs');if(!legs)return;var n=legs.children.length+1;var row=document.createElement('div');row.className='bg-parlay-row';row.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:center;';row.innerHTML='<span style="font-size:11px;color:var(--muted2);min-width:14px;">'+n+'</span><input class="bg-pl-pick" type="text" placeholder="Pick" style="flex:2;background:var(--dark2);border:1px solid var(--border2);border-radius:7px;padding:8px 10px;color:var(--parch);font-size:11px;"/><input class="bg-pl-odds" type="text" placeholder="Odds" style="flex:1;background:var(--dark2);border:1px solid var(--border2);border-radius:7px;padding:8px 10px;color:var(--parch);font-size:11px;"/><button onclick="this.parentNode.remove()" style="background:rgba(248,113,113,.15);border:none;border-radius:6px;padding:6px 9px;color:var(--red2);cursor:pointer;font-size:11px;">✕</button>';legs.appendChild(row);}
function runParlayGrader(){var legsEl=document.getElementById('bg-parlay-legs');if(!legsEl)return;var rows=legsEl.querySelectorAll('.bg-parlay-row');if(!rows.length){alert('Add at least 2 legs.');return;}var legs=[];var cOdds=1;rows.forEach(function(row){var pick=(row.querySelector('.bg-pl-pick')?.value||'').trim();var odds=parseFloat(row.querySelector('.bg-pl-odds')?.value||'0');if(!pick||isNaN(odds))return;cOdds*=(odds>0?odds/100+1:(-100/odds)+1);var sc=0;(window.SHARP_DATA||SHARP_DATA||[]).forEach(function(sd){if((sd.game||'').toLowerCase().split(' vs ').some(function(p){return pick.toLowerCase().indexOf(p.trim())>-1;})){if(sd.sig==='hot')sc+=2;else if(sd.sig==='rlm')sc+=2;else sc-=1;}});legs.push({pick:pick,odds:odds,score:sc});});if(legs.length<2){alert('Need at least 2 valid legs.');return;}var cAm=cOdds>=2?(cOdds-1)*100:(-100/(cOdds-1));var wk=legs.filter(function(l){return l.score<0;});var g,c,v;if(wk.length>0){g='D';c='var(--red2)';v='Weak leg(s): '+wk.map(function(l){return l.pick;}).join(', ')+'. Fix before parlaying.';}else if(legs.reduce(function(s,l){return s+l.score;},0)>=legs.length*2){g='A';c='var(--green2)';v='All legs confirmed. Keep it small - 0.25u max.';}else{g='B';c='var(--gold)';v='Mixed signals. Lottery ticket only - 0.1-0.25u.';}var res=document.getElementById('bg-results');if(res)res.style.display='block';var sc2=document.getElementById('bg-scorecard');if(sc2){sc2.style.background='rgba(201,168,76,.05)';sc2.style.border='1px solid '+c+'44';sc2.innerHTML='<div style="font-size:48px;font-weight:900;color:'+c+';line-height:1;margin-bottom:8px;">'+g+'</div><div style="font-size:13px;font-weight:700;color:'+c+';letter-spacing:1px;margin-bottom:4px;">'+legs.length+'-LEG PARLAY</div><div style="font-size:11px;color:var(--muted2);">'+legs.map(function(l){return l.pick;}).join(' + ')+'</div><div style="margin-top:12px;display:flex;justify-content:center;gap:20px;"><div><div style="font-size:10px;color:var(--muted2);">COMBINED</div><div style="font-size:18px;font-weight:700;">+'+(Math.round(cAm))+'</div></div><div><div style="font-size:10px;color:var(--muted2);">WIN PROB</div><div style="font-size:18px;font-weight:700;">'+(1/cOdds*100).toFixed(1)+'%</div></div><div><div style="font-size:10px;color:var(--muted2);">REC SIZE</div><div style="font-size:18px;font-weight:700;color:var(--gold);">0.25u</div></div></div>';}var sEl=document.getElementById('bg-signals');if(sEl){var lH='<div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--muted2);margin-bottom:10px;">LEG BREAKDOWN</div>';legs.forEach(function(l){var lc=l.score>=2?'var(--green2)':l.score>=0?'var(--gold)':'var(--red2)';lH+='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);"><span style="font-size:12px;color:var(--parch);">'+l.pick+'</span><span style="font-size:9px;padding:2px 6px;border-radius:4px;background:'+lc+'22;color:'+lc+';font-weight:700;">'+(l.score>=2?'CONFIRMED':l.score>=0?'NEUTRAL':'WEAK')+'</span></div>';});sEl.innerHTML=lH;}var vEl=document.getElementById('bg-verdict');if(vEl){vEl.style.background='rgba(201,168,76,.05)';vEl.style.border='1px solid '+c+'44';vEl.innerHTML='<div style="font-weight:700;color:'+c+';margin-bottom:6px;">VERDICT: '+g+'</div><div style="font-size:12px;color:var(--muted2);line-height:1.6;">'+v+'</div><div style="margin-top:8px;font-size:11px;color:var(--muted2);font-style:italic;">Max 0.25u on parlays.</div>';}}
