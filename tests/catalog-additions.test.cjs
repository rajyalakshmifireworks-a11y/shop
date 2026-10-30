const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const original = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/catalog-before-pdf.json')));
const additions = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/pdf-additions.json')));
function app(savedCart = {}) {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {value:'',innerHTML:'',textContent:'',classList:{toggle(){},add(){},remove(){},contains(){return false;}},addEventListener(){},focus(){},scrollIntoView(){}});
    return elements.get(id);
  };
  const storage = new Map([['cart',JSON.stringify(savedCart)]]);
  const context = vm.createContext({
    document:{getElementById:element,addEventListener(){},body:element('body'),querySelector(){return element('bar');}},
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    window:{matchMedia:()=>({matches:true}),location:{href:''}},
    crypto:require('node:crypto').webcrypto,
  });
  vm.runInContext(script, context);
  return {context,element,run:code=>vm.runInContext(code,context)};
}
test('adds exactly the 20 missing PDF products without changing the original 56', () => {
  const a = app();
  const products = JSON.parse(a.run('JSON.stringify(PRODUCTS)'));
  assert.equal(products.length,76);
  for (const old of original) {
    const current=products.find(p=>p.id===old.id);
    for(const [key,value] of Object.entries(old)) assert.deepEqual(current[key],value,`${old.id} ${key}`);
  }
  assert.deepEqual(products.filter(p=>Number(p.id.slice(1))>=57),additions);
  assert.deepEqual(additions.map(p=>p.price),[20,70,60,65,70,170,100,2000,40,380,10,10,60,250,60,250,320,360,400,1520]);
  assert.equal(new Set(products.map(p=>p.id)).size,76);
});
test('new items have packs and honest availability with no fabricated MRP or discount', () => {
  const a = app();
  const grid=a.element('grid').innerHTML;
  assert.equal((grid.match(/Availability on confirmation/g)||[]).length,20);
  for(const p of additions) {assert.ok(p.pack);assert.equal(p.stock,null);assert.equal(p.mrp,null);}
  a.run('query="bird";grid()');
  const card=a.element('grid').innerHTML;
  assert.match(card,/5 pcs per pack/);assert.match(card,/₹20/);assert.match(card,/Photo coming soon/);
  assert.doesNotMatch(card,/class="mrp"|class="tag"|Only .* left|In stock/);
  assert.ok(!html.includes('Flat 20% off on every item'));
});
test('new categories and product searches are available', () => {
  const a=app();
  for(const c of ['Natu Bombs','Walas','Novelties'])assert.ok(a.element('chips').innerHTML.includes(c));
  a.run('cat="Natu Bombs";grid()');assert.equal((a.element('grid').innerHTML.match(/class="card"/g)||[]).length,4);
  a.run('cat="All";query="75 cm";grid()');assert.match(a.element('grid').innerHTML,/75 cm Electric Sparklers Dlx/);
});
test('new items add, persist, remove and respect enquiry quantity limit while old stock limits remain', () => {
  const a=app({P057:2,P064:1,P004:99,P058:-2,UNKNOWN:5});
  assert.equal(a.run('cart.P057'),2);assert.equal(a.run('cart.P004'),5);assert.equal(a.run('cart.P058'),undefined);
  assert.equal(a.run('total()'),3440);
  a.run('change("P057",1)');assert.equal(a.run('cart.P057'),3);
  a.run('cart.P057=99;change("P057",1)');assert.equal(a.run('cart.P057'),99);
  a.run('cart.P057=1;change("P057",-1)');assert.equal(a.run('cart.P057'),undefined);
  assert.match(a.run('ctl({...byId.P057,stock:0})'),/disabled>Out of stock/);
});
test('WhatsApp order text includes pack, pending stock and RF order ID without sending a message', () => {
  const a=app({P064:1,P057:2});
  for(const [id,value] of Object.entries({nm:'Test Customer',ph:'9876543210',ad:'Test delivery address',pn:'500001'})) a.element(id).value=value;
  a.element('send').onclick();
  const url=new URL(a.context.window.location.href);
  assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/919182286897');
  const message=url.searchParams.get('text');
  assert.match(message,/Order ID:\* RF-\d{8}-\d{6}-[A-Z0-9]{4}/);
  assert.match(message,/60 Shot \(1 pc per pack\) x1 = ₹2,000 \[confirm stock\]/);
  assert.match(message,/Bird 2 inch \(5 pcs per pack\) x2 = ₹40/);
  assert.match(message,/Total: ₹2,040/);assert.match(message,/Please confirm availability/);
});
test('existing-only orders keep their normal wording and prices', () => {
  const a=app({P031:1});
  for(const [id,value] of Object.entries({nm:'Test Customer',ph:'9876543210',ad:'Test delivery address',pn:'500001'})) a.element(id).value=value;
  a.element('send').onclick();
  const message=new URL(a.context.window.location.href).searchParams.get('text');
  assert.match(message,/15 Multi Color x1 = ₹560/);assert.doesNotMatch(message,/confirm stock|per pack/);
});
