const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, '../db.json');

async function readData() {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

async function writeData(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readData,
  writeData,
  delayReadFile: readData
};
