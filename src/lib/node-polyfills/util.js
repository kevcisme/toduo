/**
 * Browser polyfill for Node.js util module
 */

export function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };
}

export default {
  promisify,
};
