const fs = require('fs');
const vm = require('vm');

let required120 = null;

const sandbox = {
  window: {},
  document: {
    createElement: () => ({ setAttribute: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} }
  },
  navigator: { userAgent: 'Chrome' },
  setTimeout: () => {},
  clearTimeout: () => {},
  console: console
};
sandbox.window = sandbox;

// Read loader.js
let code = fs.readFileSync('loader.js', 'utf8');

// We intercept webpack require by hooking into the runtime:
// In loader.js: i(i.s=365) is called at the end.
// We can replace i(i.s=365) with global hook or we can export i.
code = code.replace(/i\(i\.s=365\)/, 'sandboxExports = i');

const ctx = vm.createContext(sandbox);
vm.runInContext(code, ctx);

console.log('Webpack require extracted:', typeof ctx.sandboxExports);
if (ctx.sandboxExports) {
  const mod120 = ctx.sandboxExports(120);
  console.log('Module 120 exports:', mod120);
  if (typeof mod120 === 'function') {
    console.log('Result for desktop:', JSON.stringify(mod120(false), null, 2));
    console.log('Result for mobile:', JSON.stringify(mod120(true), null, 2));
  } else if (mod120.default) {
    console.log('Result default desktop:', JSON.stringify(mod120.default(false), null, 2));
  } else if (mod120.a) {
    console.log('Result a desktop:', JSON.stringify(mod120.a(false), null, 2));
  }
}
