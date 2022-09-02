import { Listbox } from '@headlessui/react'
import { OptionType } from '../lib/types/options'
import { cx } from '../lib/utils'
import { ChevronDownIcon } from './Icons'

interface SelectProps<T extends string | number> {
  value: T
  options: OptionType<T>[]
  icon?: React.ReactNode
  label?: string
  renderButton?: React.ReactNode
  id: string
  onChange: (value: T) => void
}

export default function Select<T extends string | number>({
  options,
  icon,
  label,
  renderButton,
  id,
  value,
  onChange,
}: SelectProps<T>) {
  const selected = options.find(option => option.value === value)
  return (
    <div className="relative">
      <Listbox value={selected?.value} onChange={onChange}>
        {({ open }) => (
          <>
            {label && (
              <Listbox.Label
                className="block text-sm font-normal text-neutral-64 mb-1"
                htmlFor={id}
              >
                {label}
              </Listbox.Label>
            )}
            <div className="relative">
              <Listbox.Button
                className={cx(
                  'relative flex text-secondary items-center gap-2 text-sm bg-white h-9 px-3 py-0 w-full border border-gray-300 hover:border-secondary rounded focus:outline-none focus:ring-secondary focus:border-secondary'
                )}
              >
                {icon}
                {renderButton ? renderButton : selected?.label}
                <div
                  className={cx(
                    'absolute right-2 transition-transform duration-200 ease-linear text-secondary',
                    open && 'rotate-180'
                  )}
                >
                  <ChevronDownIcon />
                </div>
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-2 w-full bg-white shadow-lg max-h-60 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                {options.map(option => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active, selected }) =>
                      cx(
                        'p-2 cursor-pointer',
                        active && !selected && 'bg-neutral-100',
                        selected && 'bg-secondary text-white '
                      )
                    }
                  >
                    {option.label}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}
