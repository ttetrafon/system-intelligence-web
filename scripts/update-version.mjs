import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { existsSync } from 'fs';

console.log('Current working directory:', process.cwd());

const oldVersion = process.argv[2];
const newVersion = process.argv[3];

const files = [
  './website/package.json',
  './website/src/components/si-footer.js',
  './service-game-data/package.json',
  './package.json'
];

if (!oldVersion || !newVersion) {
  console.error('Usage: npm run update-version -- <oldVersion> <newVersion>');
  process.exit(1);
}

async function updateVersionInFile(file, oldVer, newVer) {
  const fullPath = resolve(file);

  if (!existsSync(fullPath)) {
    console.warn(`File not found: ${file}`);
    return;
  }

  const content = await readFile(fullPath, 'utf8');
  const updated = content.replaceAll(oldVer, newVer);

  if (content !== updated) {
    await writeFile(fullPath, updated, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes needed in ${file}`);
  }
}

async function main() {
  await Promise.all(files.map(file => updateVersionInFile(file, oldVersion, newVersion)));
  console.log('\nVersion update completed.');
}

main().catch(err => {
  console.error('Error updating versions:', err);
  process.exit(1);
});
