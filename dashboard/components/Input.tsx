import { cx } from '../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperMessage?: string
  isSrLabel?: boolean
}

export default function Input({
  id,
  className,
  label,
  helperMessage,
  isSrLabel,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {!!label && (
        <label
          htmlFor={id}
          className={cx(
            'block text-sm font-normal text-neutral-64 mb-1',
            isSrLabel && 'sr-only'
          )}
        >
          {label}
        </label>
      )}
      <div>
        <input
          id={id}
          className={cx(
            className,
            'bg-white h-9 px-3 rounded border border-gray-300 text-secondary focus:outline-none focus:ring-secondary focus:border-secondary block w-full'
          )}
          {...props}
        />
      </div>
      {!!helperMessage && (
        <div className="mt-1">
          <p className="text-xs text-secondaryLight">{helperMessage}</p>
        </div>
      )}
    </div>
  )
}
