import { ReactNode } from 'react'
import { cx } from '../lib/utils'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'inverted' | 'text'
  onClick?: () => void
  className?: string
  children: ReactNode
  href?: string
  type?: 'button' | 'submit'
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className,
  href,
  ...props
}: ButtonProps) {
  const Component = href ? 'a' : 'button'
  return (
    <Component
      type={href ? undefined : type}
      href={href}
      className={cx(
        className,
        'cursor-pointer text-sm font-semibold px-4 py-0 flex items-center rounded h-9',
        variant === 'primary' && 'bg-success text-white',
        variant === 'secondary' &&
          'bg-white text-secondary border-secondaryLight border hover:border-secondary focus:outline-secondary',
        variant === 'inverted' &&
          'text-secondary border-transparent border hover:bg-neutral-01 hover:border-neutral-24 hover:border-solid',
        variant === 'text' && 'bg-transparent text-primary'
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
