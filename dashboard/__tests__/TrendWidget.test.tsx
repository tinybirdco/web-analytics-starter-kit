import { expect, test, vi, beforeEach, afterEach } from 'vitest'
import {
  render,
  screen,
  within,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import TrendWidget from '../components/TrendWidget'

// https://github.com/maslianok/react-resize-detector#testing-with-enzyme-and-jest
const { ResizeObserver } = window

beforeEach(() => {
  //@ts-ignore
  delete window.ResizeObserver
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

afterEach(() => {
  window.ResizeObserver = ResizeObserver
  vi.restoreAllMocks()
})

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
