'use client'

import { useWorkspace } from '@/lib/hooks/use-workspace'
import { ChevronDownIcon, LogOutIcon } from './ui/Icons'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  dropdownMenuStyles as styles,
} from './ui/DropdownMenu'

interface WorkspaceMenuProps {
  onLogout?: () => void
}

export function WorkspaceMenu({ onLogout }: WorkspaceMenuProps) {
  const { workspace, isLoading } = useWorkspace()

  if (isLoading) {
    return <div className="text-sm text-[var(--text-02-color)]">Loading...</div>
  }

  if (!workspace) {
    return null
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className={styles.trigger}>
          <div className={styles.triggerContent}>
            <span className={styles.triggerName}>{workspace.name}</span>
            <span className={styles.triggerMeta}>
              {workspace.provider.toLowerCase()} /{' '}
              {workspace.region.toLowerCase()}
            </span>
          </div>
          <ChevronDownIcon className={styles.triggerIcon} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={{ width: 200 }}>
        {onLogout && (
          <DropdownMenuItem onClick={onLogout}>
            Log Out
            <LogOutIcon size={16} />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
