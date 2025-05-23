// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// msal-browser requires the Web Crypto API, which isn't provided by jsdom by default.
// Expose Node's implementation so tests using MSAL can run without errors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(globalThis as any).crypto) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  (globalThis as any).crypto = require('crypto').webcrypto;
}
