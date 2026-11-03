const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const source = fs.readFileSync(
  new URL('../lib/server.ts', `file://${__filename}`),
  'utf8'
)
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const sandbox = {
  exports: {},
  require: () => ({}),
  process: {
    env: {
      TINYBIRD_TOKEN: 'server-secret',
      TINYBIRD_HOST: 'https://server.example',
    },
  },
}
vm.runInNewContext(compiled, sandbox)
const credentials = sandbox.exports.getRequestCredentials
for (const headers of [
  {},
  { 'X-Tinybird-Host': 'https://caller.example' },
  { 'X-Tinybird-Token': 'caller-token' },
  { Cookie: 'dashboard_session=x' },
]) {
  assert.equal(credentials(new Request('http://dashboard', { headers })), null)
}
const result = credentials(
  new Request('http://dashboard', {
    headers: {
      'X-Tinybird-Host': 'https://caller.example',
      'X-Tinybird-Token': 'caller-token',
    },
  })
)
assert.equal(result.token, 'caller-token')
assert.equal(result.host, 'https://caller.example')
console.log(
  'Passed: credentials require both caller headers and never use the environment'
)
