import { readdirSync } from 'fs';
import { join } from 'path';

function enumerateFiles(directoryPath) {
  try {
    const files = readdirSync(directoryPath);
    return files.map(file => join(directoryPath, file));
  } catch (err) {
    console.error(`Error reading directory: ${ err }`);
    return [];
  }
}

// Example usage:
const directory = './decorations';
const fileList = enumerateFiles(directory);

if (fileList.length > 0) {
  console.log("Files in directory:");
  fileList.forEach(file => {
    console.log(file);
  });
} else {
  console.log("No files found or error reading directory.");
}

function enumerateFileNames(directoryPath) {
  try {
    const files = readdirSync(directoryPath);
    return files;
  } catch (err) {
    console.error(`Error reading directory: ${ err }`);
    return [];
  }
}

const fileNames = enumerateFileNames(directory);

if (fileNames.length > 0) {
  console.log("File names in directory:");
  fileNames.forEach(file => {
    console.log(file);
  });
} else {
  console.log("No files found or error reading directory.");
}
