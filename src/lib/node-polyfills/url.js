// Browser polyfill for Node.js url module
export function fileURLToPath(url) {
  // Simple implementation that works for our use case
  if (typeof url === "string") {
    return url;
  }

  // If it's a URL object with pathname
  if (url && url.pathname) {
    return url.pathname;
  }

  console.warn("fileURLToPath polyfill received unexpected input:", url);
  return String(url);
}
