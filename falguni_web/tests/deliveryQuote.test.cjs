const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(name, requireMock) {
  const source = fs.readFileSync(path.join(__dirname, '../lib', name + '.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', code)(requireMock, mod, mod.exports);
  return mod.exports;
}
const pricing = load('deliveryPricing');
function setup({ cart = [{ price: 2500, quantity: 2, selected: '4kg', productID: 'p', name: 'Snacks' }], coupon = 0, enabled = true, settings = {}, product = {} } = {}) {
  const data = {
    'users/u/Cart': cart,
    'users/u': { 'Coupon Reward': coupon },
    'Coupon System/Coupon System': { Status: enabled },
    'Delivery Settings/Framework': settings,
    'Products/p': product,
  };
  function ref(key) {
    return { collection: name => ref(`${key}/${name}`), doc: name => ref(`${key}/${name}`), get: async () => {
      const value = data[key];
      return { exists: value !== undefined, empty: !value || Array.isArray(value) && !value.length, data: () => value, docs: Array.isArray(value) ? value.map(v => ({ data: () => v })) : [] };
    }};
  }
  return load('deliveryQuote', name => name === './firebase-admin' ? { adminDb: { collection: name => ref(name) } } : pricing);
}
process.env.GOOGLE_MAPS_GEOCODING_KEY = 'test-only';
let location = { lat: 23.3, lng: 72.5294 };
global.fetch = async () => ({ ok: true, json: async () => ({ status: 'OK', results: [{ geometry: { location }, address_components: [{ types: ['administrative_area_level_1'], long_name: 'Gujarat' }] }] }) });

test('server uses post-discount value and slab excess; ignores client fees and coordinates', async () => {
  const { buildDeliveryQuote } = setup();
  const q = await buildDeliveryQuote('u', { deliveryAddress: 'Ahmedabad, Gujarat', deliveryLat:23.036, deliveryLng:72.5294, fee:0, deliverySpeed:'express' });
  assert.equal(q.delivery.tier,'Gujarat Outstation');
  assert.equal(q.delivery.chargeableWeight,10.25);
  assert.equal(q.fee,210);
  assert.equal(q.finalTotal,2710);
  assert.equal(q.delivery.weightBasis,'buffered-product-weight-estimate');
});
test('coupon changes allowance, disabled coupon does not reduce subtotal', async () => {
  const discounted = await setup({ coupon: 25 }).buildDeliveryQuote('u',{isApp:true,deliveryAddress:'Gujarat'});
  assert.equal(discounted.discountedTotal,1875);
  assert.equal(discounted.fee,410);
  const disabled = await setup({ coupon: 25, enabled:false }).buildDeliveryQuote('u',{isApp:true,deliveryAddress:'Gujarat'});
  assert.equal(disabled.discountedTotal,2500);
  assert.equal(disabled.fee,210);
});
test('pickup does not require address, shipping metadata or geocoding config', async () => {
  delete process.env.GOOGLE_MAPS_GEOCODING_KEY;
  const q = await setup({cart:[{price:300,quantity:1,selected:'Box'}]}).buildDeliveryQuote('u',{isPickup:true});
  assert.equal(q.fee,0);
  assert.equal(q.delivery,null);
  process.env.GOOGLE_MAPS_GEOCODING_KEY = 'test-only';
});
test('local orders do not require weight data', async () => {
  location = {lat:23.036,lng:72.5294};
  const q = await setup({cart:[{price:400,quantity:1,selected:'Box'}]}).buildDeliveryQuote('u',{deliveryAddress:'Gujarat'});
  assert.equal(q.fee,0);
  assert.equal(q.delivery.chargeableWeight,null);
  location = {lat:23.3,lng:72.5294};
});
test('unknown weights fail; configured volumetric measurements affect bill', async () => {
  await assert.rejects(()=>setup({cart:[{price:300,quantity:1,selected:'Box'}]}).buildDeliveryQuote('u',{deliveryAddress:'Gujarat'}),/weight is missing/);
  const q = await setup({settings:{volumetricEnabled:true,volumetricDivisor:5000},product:{shippingVariants:{'4kg':{actualWeightKg:4,lengthCm:50,widthCm:40,heightCm:15}}}}).buildDeliveryQuote('u',{deliveryAddress:'Gujarat'});
  assert.equal(q.delivery.chargeableWeight,12);
  assert.equal(q.fee,280);
});
test('missing address and invalid quantities fail before payment', async () => {
  await assert.rejects(()=>setup().buildDeliveryQuote('u',{}),/Select a delivery address/);
  await assert.rejects(()=>setup({cart:[{price:300,quantity:-1}]}).buildDeliveryQuote('u',{isPickup:true}),/invalid price or quantity/);
});

test('packing buffer can be configured or disabled without affecting local/pickup', async () => {
  const details = { deliveryAddress: 'Gujarat' };
  const raw = await setup({ settings: { packingBuffer: { enabled: false } } }).buildDeliveryQuote('u', details);
  assert.equal(raw.delivery.chargeableWeight, 8);
  assert.equal(raw.fee, 120);
  const buffered = await setup({ settings: { packingBuffer: { enabled: true, multiplier: 1.5, tareKg: .5 } } }).buildDeliveryQuote('u', details);
  assert.equal(buffered.delivery.chargeableWeight, 12.5);
  assert.equal(buffered.fee, 300);
});
