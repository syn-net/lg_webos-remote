`use strict`;

import assert from 'node:assert';

import {
  getEnv,
  isNode,
  isBrowser,
  isWebExtension,
  getRuntime,
} from '../src/js/utils.js';

assert.notEqual(getEnv, null);

console.log(getRuntime());

assert.equal(isNode(), true);
assert.equal(isWebExtension(), false);
assert.equal(isBrowser(), false);
console.log(`getEnv=${JSON.stringify(getEnv)}`);

assert.equal(getEnv.node, true);
assert.equal(getEnv.browser, false);
assert.equal(getEnv.webextension, false);

