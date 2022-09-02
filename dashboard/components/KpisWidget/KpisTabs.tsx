import * as Tabs from '@radix-ui/react-tabs'
import { KpiTotals, KpiType, KPI_OPTIONS } from '../../lib/types/kpis'

type KpisTabsProps = {
  value: KpiType
  onChange: (kpi: KpiType) => void
  totals?: KpiTotals
}

export default function KpisTabs({ onChange, value, totals }: KpisTabsProps) {
  return (
    <Tabs.Root
      value={value}
      onValueChange={value => onChange(value as KpiType)}
    >
      <Tabs.List className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap rounded-t-xl overflow-hidden">
        {KPI_OPTIONS.map(({ label, value, formatter }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="relative cursor-pointer p-6 md:p-9 text-left md:text-center text-secondary hover:bg-primaryLight transition-colors sm:border-b-4 sm:border-transparent sm:state-active:border-primary state-active:text-primary sm:mb-2"
          >
            <div className="flex flex-col gap-2 w-fit md:mx-auto">
              <span className="text-md lg:text-lg lg:leading-6 font-medium truncate capitalize">
                {label}
              </span>
              <span className="text-neutral-64 text-left font-normal">
                {totals ? formatter(totals[value]) : '-'}
              </span>
            </div>
            <div className="hidden sm:block arrow absolute h-3 w-3 bg-primary -bottom-5" />
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
