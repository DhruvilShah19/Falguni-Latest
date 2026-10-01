const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../lib/deliveryPricing.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('exports', 'module', compiled)(mod.exports, mod);
const { calculateDeliveryFee: quote, getFreeDeliveryThreshold, volumetricWeightKg } = mod.exports;

test('local boundaries and inclusive free thresholds; no weight required', () => {
  for (const [distance, tier, threshold, fee] of [[0, 'Hyperlocal',400,50],[5,'Hyperlocal',400,50],[5.0001,'Nearby',1200,100],[10,'Nearby',1200,100],[10.0001,'Extended Local',1800,150],[15,'Extended Local',1800,150]]) {
    assert.equal(quote(distance, '', threshold - .01, NaN).fee, fee);
    const result = quote(distance, '', threshold, NaN);
    assert.equal(result.tier, tier);
    assert.equal(result.fee, 0);
    assert.equal(result.chargeableWeight, null);
  }
});
test('all supplied outstation examples', () => {
  for (const [state, value, weight, fee] of [['Gujarat',1500,4,160],['Gujarat',2500,5,0],['Gujarat',2500,8,120],['Gujarat',3500,7,0],['Gujarat',4500,12,80],['Maharashtra',2500,3,300],['Maharashtra',3800,5,0],['Maharashtra',3800,7,200],['Maharashtra',5500,7,0],['Maharashtra',7500,12,200]]) assert.equal(quote(15.01,state,value,weight).fee,fee);
});
test('every weight slab is inclusive and capped at 15 kg', () => {
  for (const [state, slabs, rate] of [['Gujarat',[[2000,5],[3000,7.5],[4000,10],[5000,15]],40],['Delhi',[[3500,5],[5000,7.5],[7000,10],[10000,15]],100]]) {
    let previous = 0;
    for (const [value, allowance] of slabs) {
      assert.equal(quote(16,state,value-.01,20).freeWeight,previous);
      assert.equal(quote(16,state,value,20).freeWeight,allowance);
      previous = allowance;
    }
    assert.equal(quote(16,state,100000,20).fee, 5 * rate);
  }
});
test('volumetric maximum, fractional kg, currency precision, discount eligibility', () => {
  assert.equal(volumetricWeightKg(50,40,15,5000),6);
  const result = quote(20,'Gujarat',2500,4,6);
  assert.equal(result.chargeableWeight,6);
  assert.equal(result.fee,40);
  assert.equal(quote(20,'GJ',1999,1.25).fee,50);
  assert.equal(quote(20,'Delhi',3000,.33333).fee,33.33);
  assert.equal(quote(3,'',400*.9,0).fee,50);
  assert.equal(getFreeDeliveryThreshold('PAN India',8),7000);
  assert.equal(getFreeDeliveryThreshold('PAN India',16),Infinity);
});
test('invalid inputs never silently produce a free quote', () => {
  for (const distance of [-1, NaN, Infinity]) assert.throws(()=>quote(distance,'Gujarat',1000,1));
  for (const weight of [-1,0,NaN,Infinity]) assert.throws(()=>quote(16,'Gujarat',1000,weight));
  assert.throws(()=>quote(16,'',1000,1));
  assert.throws(()=>quote(16,'Gujarat',-1,1));
  assert.throws(()=>volumetricWeightKg(10,10,10,0));
});
