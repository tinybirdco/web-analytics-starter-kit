import { expect, test, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Credentials from '../components/Credentials'
import { HostType } from '../lib/types/credentials'

const push = vi.fn()
const pathname = '/'

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    isReady: true,
    push,
    pathname,
  }),
}))

test('Credentials', async () => {
  const token = 'my_token'
  render(<Credentials />)
  const form = within(screen.getByRole('form'))
  const input = form.getByRole('textbox', { name: /token/i })
  await userEvent.type(input, token)
  const button = form.getByRole('button', { name: /view dashboard/i })
  await userEvent.click(button)
  expect(push).toHaveBeenCalledWith({
    pathname,
    search: new URLSearchParams(
      `token=${token}&host=${HostType.Eu}`
    ).toString(),
  })
})
