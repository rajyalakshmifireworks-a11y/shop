const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const catalogCode = script.slice(0, script.indexOf('const $='));
const products = vm.runInNewContext(`${catalogCode}\nPRODUCTS;`);
test('4x4 Wheel uses exactly the supplied product photo, not another product or a carousel', () => {
  const product = products.find(p => p.id === 'P004');
  assert.equal(product.name, '4x4 Wheel');
  assert.equal(product.price, 280);
  assert.equal(product.mrp, 350);
  assert.equal(product.imgs.length, 1);
  assert.equal(product.imgs[0], 'images/P004.png');
  const bytes = fs.readFileSync(path.join(root, product.imgs[0]));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), '0d1159643d27cea80c9c71e70c5355af3acb78cdb546f4bd6e388315eac8dd0a');
});
test('catalogue stays intact and all mapped product images exist', () => {
  assert.equal(products.length, 76);
  assert.equal(new Set(products.map(p => p.id)).size, 76);
  for (const product of products) for (const image of product.imgs || []) {
    assert.ok(fs.existsSync(path.join(root, image)), `${product.name}: missing ${image}`);
  }
});
test('store script parses and retains Rajyalakshmi contact and share URLs', () => {
  new vm.Script(script);
  assert.ok(html.includes('waNumber: "919182286897"'));
  assert.ok(html.includes('https://rajyalakshmifireworks-a11y.github.io/shop/'));
  assert.ok(!html.includes('jiyaconsultancyservices-collab.github.io'));
});
