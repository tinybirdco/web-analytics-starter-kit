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
const env = {
  NODE_ENV: 'production',
  TINYBIRD_TOKEN: 'server-secret',
  TINYBIRD_HOST: 'https://server.example',
  TINYBIRD_ALLOWED_HOSTS: ' https://custom.example , https://second.example ',
  DASHBOARD_USERNAME: 'admin',
  DASHBOARD_PASSWORD: 'admin',
  DISABLE_AUTH: 'true',
}
const sandbox = { exports: {}, require: () => ({}), process: { env }, URL }
vm.runInNewContext(compiled, sandbox)
const resolve = headers =>
  sandbox.exports.resolveTinybirdCredentials(new Headers(headers))
for (const headers of [
  {},
  { 'X-Tinybird-Host': 'https://api.tinybird.co' },
  { 'X-Tinybird-Token': 'caller-token' },
  { Cookie: 'dashboard_session=x' },
  {
    'X-Tinybird-Host': 'https://server.example',
    Cookie: 'dashboard_session=x',
  },
]) {
  assert.equal(resolve(headers).status, 401)
}
function withHost(host) {
  return resolve({
    'X-Tinybird-Host': host,
    'X-Tinybird-Token': 'caller-token',
  })
}
for (const host of [
  'https://api.tinybird.co',
  'https://api.eu-central-1.aws.tinybird.co',
  'https://ui.tinybird.co',
  'https://ui.us-east.tinybird.co',
  'https://server.example',
  'https://custom.example',
  'https://second.example',
]) {
  const { credentials } = withHost(host)
  assert.equal(credentials.token, 'caller-token')
  assert.equal(credentials.host, host.replace('https://ui.', 'https://api.'))
}
for (const host of [
  'not a URL',
  'https://attacker.example',
  'https://api.tinybird.co.attacker.example',
  'http://api.tinybird.co',
  'https://api.tinybird.co:8443',
  'http://localhost:7181',
  'http://127.0.0.1:7181',
]) {
  assert.equal(withHost(host).status, 400, host)
}
env.NODE_ENV = 'development'
assert.equal(
  withHost('http://localhost:7181').credentials.token,
  'caller-token'
)
assert.equal(
  withHost('http://127.0.0.1:7181').credentials.token,
  'caller-token'
)
console.log('Passed: caller-only credentials and preserved allowed-host policy')
