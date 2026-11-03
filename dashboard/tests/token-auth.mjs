import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'

// Run against a local dashboard started with dummy deployment credentials and
// DISABLE_AUTH=true, so any accidental environment/session fallback is exercised.
const dashboard = process.env.TEST_DASHBOARD_URL || 'http://localhost:3097'
const requests = []
const upstream = createServer((req, res) => {
  requests.push({ url: req.url, authorization: req.headers.authorization })
  res.setHeader('Content-Type', 'application/json')
  res.end(
    JSON.stringify(
      req.url === '/v1/workspace'
        ? { id: 'test', name: 'Test workspace' }
        : { data: [], meta: [], rows: 0, statistics: {} }
    )
  )
})
upstream.listen(0, '127.0.0.1')
await once(upstream, 'listening')
const host = `http://127.0.0.1:${upstream.address().port}`
const token = 'caller-owned-test-token'
try {
  for (const [path, method] of [
    ['/api/config', 'GET'],
    ['/api/sql', 'POST'],
    ['/api/endpoints/domains', 'GET'],
  ]) {
    for (const headers of [
      {},
      { Cookie: 'dashboard_session=x' },
      { 'X-Tinybird-Host': host, Cookie: 'dashboard_session=x' },
      { 'X-Tinybird-Token': token },
    ]) {
      const response = await fetch(`${dashboard}${path}`, {
        method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        ...(method === 'POST' && { body: JSON.stringify({ sql: 'SELECT 1' }) }),
      })
      assert.equal(
        response.status,
        401,
        `${path} must reject incomplete credentials`
      )
    }
    assert.equal(
      requests.length,
      0,
      'unauthorized requests must not reach upstream'
    )
  }
  for (const path of ['/api/auth', '/api/auth/login', '/api/auth/logout']) {
    const response = await fetch(`${dashboard}${path}`, {
      method: path === '/api/auth' ? 'GET' : 'POST',
    })
    assert.equal(response.status, 404, `${path} must be removed`)
  }
  for (const [path, method] of [
    ['/api/config', 'GET'],
    ['/api/sql', 'POST'],
    ['/api/endpoints/domains', 'GET'],
  ]) {
    const before = requests.length
    const response = await fetch(`${dashboard}${path}`, {
      method,
      headers: {
        'X-Tinybird-Token': token,
        'X-Tinybird-Host': host,
        'Content-Type': 'application/json',
      },
      ...(method === 'POST' && { body: JSON.stringify({ sql: 'SELECT 1' }) }),
    })
    assert.equal(response.status, 200, `${path}: ${await response.text()}`)
    assert.ok(requests.length > before, `${path} must reach caller's upstream`)
  }
  assert.ok(requests.every(req => req.authorization === `Bearer ${token}`))
  console.log(
    'Passed: incomplete credentials, legacy cookie, removed auth routes, and caller-token forwarding on all three data routes'
  )
} finally {
  upstream.closeAllConnections()
  upstream.close()
}
