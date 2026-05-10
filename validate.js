#!/usr/bin/env node
// OnlyWynnrs — pre-deploy validation script
// Run by GitHub Actions before every deploy

const fs = require('fs');
const path = require('path');

let errors = 0;
let warnings = 0;

function check(condition, msg, isError = true) {
  if (!condition) {
    const icon = isError ? '✗ ERROR' : '⚠ WARN ';
    console.log(`  ${icon}: ${msg}`);
    if (isError) errors++;
    else warnings++;
  } else {
    console.log(`  ✓ OK:    ${msg}`);
  }
}

console.log('\n=== OnlyWynnrs Pre-Deploy Validation ===\n');

// ── 1. File existence ──
console.log('[ Files ]');
const required = ['index.html','data.js','app.js','style.css'];
for (const f of required) {
  const exists = fs.existsSync(path.join(__dirname, f));
  check(exists, `${f} exists`);
}

// ── 2. File sizes (catch accidental empty files) ──
console.log('\n[ File sizes ]');
const minSizes = { 'data.js': 5000, 'app.js': 50000, 'style.css': 5000, 'index.html': 30000 };
for (const [f, min] of Object.entries(minSizes)) {
  try {
    const size = fs.statSync(f).size;
    check(size >= min, `${f} is ${(size/1024).toFixed(1)} KB (min ${(min/1024).toFixed(0)} KB)`);
  } catch(e) { check(false, `${f} readable`); }
}

// ── 3. JS syntax via node --check (already done by Actions but belt+suspenders) ──
console.log('\n[ JS syntax ]');
const { execSync } = require('child_process');
for (const f of ['data.js','app.js']) {
  try {
    execSync(`node --check ${f}`, {stdio:'pipe'});
    check(true, `${f} syntax clean`);
  } catch(e) {
    check(false, `${f} syntax: ${e.stderr?.toString().slice(0,80)}`);
  }
}

// ── 4. Critical data presence ──
console.log('\n[ Data integrity ]');
const dataJs = fs.readFileSync('data.js','utf8');
const appJs  = fs.readFileSync('app.js','utf8');
const idx    = fs.readFileSync('index.html','utf8');

const dataChecks = [
  ['PICKS',      /const PICKS\s*=\s*\[/],
  ['SHARP_DATA', /SHARP_DATA\s*=\s*\[/],
  ['POOLS.ufc',  /ufc:\[/],
  ['ARTICLES',   /const ARTICLES\s*=\s*\[/],
  ['HC_PARLAYS', /HC_PARLAYS\s*=\s*\[/],
  ['BOOKS',      /const BOOKS\s*=/],
  ['_SURL',      /_SURL\s*=/],
  ['STRIPE_PK',  /STRIPE_PK\s*=/],
];
for (const [name, rx] of dataChecks) {
  check(rx.test(dataJs), `data.js contains ${name}`);
}

// ── 5. Critical functions in app.js ──
console.log('\n[ Critical functions ]');
const fnChecks = [
  'function go(',
  'function getTier(',
  'function buildPortfolio(',
  'function refreshLeverage(',
  'function renderPlayerPool(',
  'function buildSharp(',
  'function buildArticles(',
  'function stripeCheckout(',
  'function validateEmail(',
  'function init(',
];
for (const fn of fnChecks) {
  check(appJs.includes(fn), fn.replace('function ','').replace('(','()'));
}

// ── 6. HTML structure ──
console.log('\n[ HTML structure ]');
check(idx.includes('href="style.css"'),       'links style.css');
check(idx.includes('src="data.js"'),           'loads data.js');
check(idx.includes('src="app.js"'),            'loads app.js');
check(!idx.includes('<style>'),                'no inline <style>');
check(!idx.includes('<script>'),               'no inline <script>');
check(idx.includes('id="page-home"'),          'home page exists');
check(idx.includes('id="page-dfs"'),           'dfs page exists');
check(idx.includes('id="page-sharp"'),         'sharp page exists');
check(idx.includes('id="page-articles"'),      'articles page exists');
check(idx.includes('id="page-pricing"'),       'pricing page exists');

// ── 7. No wrong matchups ──
console.log('\n[ Data quality ]');
const knownBadMatchups = [
  'Thunder vs Timberwolves',
  'Knicks vs Celtics',
];
for (const bad of knownBadMatchups) {
  check(!dataJs.includes(bad), `No wrong matchup: "${bad}"`);
}

// Check salary cap sanity (DK UFC cap = 50000)
const salaries = [...dataJs.matchAll(/sal:\{dk:(\d+)/g)].map(m => parseInt(m[1]));
if (salaries.length) {
  const min = Math.min(...salaries), max = Math.max(...salaries);
  check(max <= 15000, `Max DK salary $${max} reasonable (≤$15k)`);
  check(min >= 4000,  `Min DK salary $${min} reasonable (≥$4k)`);
  check(salaries.length >= 20, `Pool has ${salaries.length} fighters (≥20)`);
}

// currentArticleFilter declared
check(appJs.includes("currentArticleFilter='all'") || dataJs.includes("currentArticleFilter"),
      'currentArticleFilter declared');

// ── Summary ──
console.log('\n' + '='.repeat(42));
console.log(`  ${errors} error(s)   ${warnings} warning(s)`);
if (errors > 0) {
  console.log('\n  ✗ VALIDATION FAILED — deploy blocked\n');
  process.exit(1);
} else {
  console.log('\n  ✓ ALL CHECKS PASSED — safe to deploy\n');
  process.exit(0);
}
