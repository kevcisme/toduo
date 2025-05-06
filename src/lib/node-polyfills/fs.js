/**
 * Browser polyfill for Node.js fs module
 */

export function readFileSync() {
  console.warn(
    "File system operations are not supported in browser environment",
  );
  return null;
}

export function writeFileSync() {
  console.warn(
    "File system operations are not supported in browser environment",
  );
  return null;
}

export function existsSync() {
  console.warn(
    "File system operations are not supported in browser environment",
  );
  return false;
}

export function mkdirSync() {
  console.warn(
    "File system operations are not supported in browser environment",
  );
  return null;
}

export default {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
};
