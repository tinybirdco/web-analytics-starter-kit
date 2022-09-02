import { expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import Dashboard from '../pages'

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
  }),
}))

test('Dashboard', () => {
  render(<Dashboard />)
  const main = within(screen.getByRole('main'))
  expect(main).toBeDefined()
})
