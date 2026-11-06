const fs = require('node:fs');
const path = require('node:path');

// Хранилище вынесено в JSON, чтобы данные переживали перезапуск сервера.
const filePath = path.join(__dirname, 'data', 'db.json');
function read() { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
function write(data) {
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, filePath);
}
module.exports = { read, write };
