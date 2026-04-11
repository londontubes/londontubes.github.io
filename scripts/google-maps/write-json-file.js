const fs = require('fs');
const path = require('path');

const [, , outputPath] = process.argv;

if (!outputPath) {
  console.error('Usage: node scripts/google-maps/write-json-file.js <output-path>');
  process.exit(1);
}

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  const parsed = JSON.parse(input);
  const normalized = `${JSON.stringify(parsed, null, 2)}\n`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, normalized, 'utf8');
});