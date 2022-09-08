import { useInView } from 'react-intersection-observer'

type InViewProps = {
  children: JSX.Element
  height: number
}

export default function InView({ children, height }: InViewProps) {
  const [ref, inView] = useInView({ threshold: 0, triggerOnce: true })
  return (
    <div ref={ref} style={{ height }}>
      {inView && children}
    </div>
  )
}
