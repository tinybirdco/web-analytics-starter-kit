import { expect, test, vi } from 'vitest'
import { useRouter } from 'next/router'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Credentials from '../components/Credentials'

test.skip('Credentials', async () => {
  vi.mock('next/router', () => {
    return {
      useRouter: () => ({
        query: {},
        isReady: true,
        push: vi.fn(),
        pathname: '/',
      }),
    }
  })
  const token = 'my_token'
  render(<Credentials />)
  const form = within(screen.getByRole('form'))
  const input = form.getByRole('textbox', { name: /token/i })
  await userEvent.type(input, token)
  const button = form.getByRole('button', { name: /view dashboard/i })
  await userEvent.click(button)
  expect(useRouter().push).toHaveBeenCalledTimes(1)
})
