const db = require('../database/db');

async function getAllProducts() {
  return await db.readData();
}

async function getProductById(id) {
  const products = await db.readData();
  return products.find(item => item.id === Number(id)) || null;
}

async function createProduct(productData) {
  const products = await db.readData();
  const nextId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;
  const newProduct = { ...productData, id: productData.id !== undefined ? Number(productData.id) : nextId };
  products.push(newProduct);
  await db.writeData(products);
  return newProduct;
}

async function updateProduct(id, productData) {
  const products = await db.readData();
  const numId = Number(id);
  const index = products.findIndex(item => item.id === numId);
  if (index === -1) {
    return null;
  }
  const updatedProduct = { ...productData, id: numId };
  products[index] = updatedProduct;
  await db.writeData(products);
  return updatedProduct;
}

async function patchProduct(id, productData) {
  const products = await db.readData();
  const numId = Number(id);
  const index = products.findIndex(item => item.id === numId);
  if (index === -1) {
    return null;
  }
  const patchedProduct = { ...products[index], ...productData, id: numId };
  products[index] = patchedProduct;
  await db.writeData(products);
  return patchedProduct;
}

async function deleteProduct(id) {
  const products = await db.readData();
  const numId = Number(id);
  const index = products.findIndex(item => item.id === numId);
  if (index === -1) {
    return null;
  }
  const deleted = products.splice(index, 1)[0];
  await db.writeData(products);
  return deleted;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct
};
