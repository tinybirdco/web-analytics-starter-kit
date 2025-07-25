import { Button } from './ui/Button'
import { FormatIcon } from './ui/Icons'
import { Text } from './ui/Text'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface HeaderProps {
  onAskAiClick?: () => void
}

export const Header = ({ onAskAiClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAskAi, setShowAskAi] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 48)
      setShowAskAi(scrollTop > 96)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`h-16 sticky top-0 z-20 -mt-10 py-2.5 px-5 bg-[var(--background-01-color)] transition-all duration-75 flex justify-between items-center gap-4 overflow-hidden ${
        isScrolled ? 'border-b border-[var(--border-01-color)]' : ''
      }`}
    >
      <a
        href="https://tinybird.co"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2.5"
      >
        <div className="aspect-square w-6 h-6 bg-[var(--primary-color)] rounded flex items-center justify-center">
          <img src="/icon.svg" alt="" width={16} height={16} />
        </div>
        <Text variant="button" color="default">
          tinybird.co
        </Text>
      </a>

      <AnimatePresence>
        {showAskAi && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: "easeIn" }}
          >
            <Button
              variant="solid"
              color="dark"
              size="large"
              className="!bg-[var(--alternative-color)] !rounded-lg"
              onClick={onAskAiClick}
            >
              <FormatIcon size={16} className="-ml-1" color="white" />
              Ask AI
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
