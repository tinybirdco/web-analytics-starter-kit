import useAuth from '../lib/hooks/use-auth'

export default function Footer() {
  const { token } = useAuth()

  return (
    <footer className="w-full text-center text-sm flex flex-col gap-2">
      <p>
        Built with speed and privacy in mind using{' '}
        <a
          href="https://tinybird.co"
          target="_blank"
          rel="noreferrer"
          className="text-primary font-semibold"
        >
          Tinybird
        </a>
      </p>
      {!!token && (
        <a
          className="underline text-primary text-sm"
          href="https://github.com/tinybirdco/web-analytics-starter-kit"
          target="blank"
          rel="noreferrer"
        >
          Customize this dashboard
        </a>
      )}
    </footer>
  )
}
