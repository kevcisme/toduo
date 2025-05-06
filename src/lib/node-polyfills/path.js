/**
 * Browser polyfill for Node.js path module
 */

export function join(...parts) {
  return parts.join("/");
}

export function resolve(...parts) {
  return parts.join("/");
}

export function dirname(path) {
  return path.split("/").slice(0, -1).join("/");
}

export function basename(path, ext) {
  const base = path.split("/").pop();
  if (ext && base.endsWith(ext)) {
    return base.slice(0, -ext.length);
  }
  return base;
}

export default {
  join,
  resolve,
  dirname,
  basename,
};
