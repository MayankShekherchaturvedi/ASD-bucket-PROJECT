const assert = require('assert');
const app = require('./server');
const db = require('./database/db');
const { getCache } = require('./middleware/cache');

async function testSuite() {
  const originalData = await db.readData();
  const server = app.listen(3002);
  const baseUrl = 'http://localhost:3002';

  try {
    const res1 = await fetch(`${baseUrl}/products`);
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res1.headers.get('x-cache'), 'MISS');
    const data1 = await res1.json();
    assert.strictEqual(Array.isArray(data1), true);

    const res2 = await fetch(`${baseUrl}/products`);
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(res2.headers.get('x-cache'), 'HIT');
    const data2 = await res2.json();
    assert.deepStrictEqual(data2, data1);

    const res3 = await fetch(`${baseUrl}/products/1`);
    assert.strictEqual(res3.status, 200);
    assert.strictEqual(res3.headers.get('x-cache'), 'MISS');
    const data3 = await res3.json();
    assert.strictEqual(data3.id, 1);

    const res4 = await fetch(`${baseUrl}/products/1`);
    assert.strictEqual(res4.status, 200);
    assert.strictEqual(res4.headers.get('x-cache'), 'HIT');
    const data4 = await res4.json();
    assert.deepStrictEqual(data4, data3);

    const res404 = await fetch(`${baseUrl}/products/99999`);
    assert.strictEqual(res404.status, 404);

    const resPost = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Mechanical Keyboard', price: 129.99 })
    });
    assert.strictEqual(resPost.status, 201);
    const newProduct = await resPost.json();
    assert.strictEqual(newProduct.name, 'Mechanical Keyboard');
    assert.ok(newProduct.id);

    const resAfterPost = await fetch(`${baseUrl}/products`);
    assert.strictEqual(resAfterPost.status, 200);
    assert.strictEqual(resAfterPost.headers.get('x-cache'), 'MISS');
    const dataAfterPost = await resAfterPost.json();
    assert.ok(dataAfterPost.some(p => p.id === newProduct.id));

    const resPut = await fetch(`${baseUrl}/products/${newProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'RGB Keyboard', price: 149.99 })
    });
    assert.strictEqual(resPut.status, 200);
    const updatedProduct = await resPut.json();
    assert.strictEqual(updatedProduct.name, 'RGB Keyboard');

    const resAfterPut = await fetch(`${baseUrl}/products/${newProduct.id}`);
    assert.strictEqual(resAfterPut.status, 200);
    assert.strictEqual(resAfterPut.headers.get('x-cache'), 'MISS');
    const dataAfterPut = await resAfterPut.json();
    assert.strictEqual(dataAfterPut.name, 'RGB Keyboard');

    const resPatch = await fetch(`${baseUrl}/products/${newProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 139.99 })
    });
    assert.strictEqual(resPatch.status, 200);
    const patchedProduct = await resPatch.json();
    assert.strictEqual(patchedProduct.price, 139.99);
    assert.strictEqual(patchedProduct.name, 'RGB Keyboard');

    const resAfterPatch = await fetch(`${baseUrl}/products/${newProduct.id}`);
    assert.strictEqual(resAfterPatch.status, 200);
    assert.strictEqual(resAfterPatch.headers.get('x-cache'), 'MISS');

    const resDelete = await fetch(`${baseUrl}/products/${newProduct.id}`, {
      method: 'DELETE'
    });
    assert.strictEqual(resDelete.status, 200);

    const resAfterDelete = await fetch(`${baseUrl}/products/${newProduct.id}`);
    assert.strictEqual(resAfterDelete.status, 404);

    const resTtl1 = await fetch(`${baseUrl}/products/1`);
    assert.strictEqual(resTtl1.status, 200);
    assert.strictEqual(resTtl1.headers.get('x-cache'), 'MISS');

    const resTtl2 = await fetch(`${baseUrl}/products/1`);
    assert.strictEqual(resTtl2.status, 200);
    assert.strictEqual(resTtl2.headers.get('x-cache'), 'HIT');

    const cache = getCache();
    cache['/products/1'].createdAt = Date.now() - 65000;

    const resTtl3 = await fetch(`${baseUrl}/products/1`);
    assert.strictEqual(resTtl3.status, 200);
    assert.strictEqual(resTtl3.headers.get('x-cache'), 'MISS');

    console.log('All tests passed successfully.');
  } finally {
    await db.writeData(originalData);
    server.close();
    process.exit(0);
  }
}

testSuite();
