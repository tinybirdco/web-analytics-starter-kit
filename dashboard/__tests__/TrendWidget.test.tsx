import { expect, test, vi } from 'vitest'
import {
  render,
  screen,
  within,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import TrendWidget from '../components/TrendWidget'

vi.mock('../components/TrendWidget/TrendChart.tsx', () => ({
  __esModule: true,
  default: () => <div>TrendChart</div>,
}))

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
  }),
}))

test('TrendWidget', async () => {
  render(<TrendWidget />)
  const widget = within(screen.getByRole('region'))
  await waitForElementToBeRemoved(
    widget.getByRole('alert', { name: /loading/i })
  )
  expect(widget.getByRole('heading', { name: /7/i })).toBeDefined()
})
