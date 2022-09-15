import '@testing-library/jest-dom/extend-expect'
import { server } from './mocks/server'

beforeAll(() => {
  window.location = {
    search: '?token=my_token&host=https://analytics-api.com',
  } as any
  server.listen({ onUnhandledRequest: 'error' })
})
afterAll(() => server.close())
afterEach(() => server.resetHandlers())
