# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased


## [1.4.0] - 2023-04-12
### Added
- [Script] Add support to set the domain for the cookie

## [1.3.0] - 2023-03-15
### Added
- [Script] Add support to send attributes set in the script tag

## [1.2.3] - 2022-11-06
### Fixed
- [Dashboard] Fix total KPIs for arbitrary date ranges (#37)
- [Dashboard] Fix tooltip for the last data point in the chart
- [Data project]  Fix `analytics_pages` query

## [1.2.2] - 2022-09-28
### Fixed
- [Dashboard] Stop using Google's favicon service (#30)
- [Script] Fix `Content-Type` (#33)

## [1.2.1] - 2022-09-27
### Fixed
- [Script] Remove source maps (#24)
- [Dashboard] Fix UTC date detection (#25)
- [Dashboard] Improve domain guessing
- [Dashboard] Fix chart tooltip
- [Dashboard] Fix date selector width (#23)
- [Dashboard] Fix scroll behaviour (#17)

## [1.2.0] - 2022-09-06
### Changed
- [Dashboard] Optmize bundle size and Core Web Vitals
- [Script] Use `XMLHttpRequest` instead of `sendBeacon`

## [1.1.0] - 2022-09-05
### Changed
- [Script] Improve script listeners, now can be imported as `defer`

### Added
- [Dashboard] Add tracking script to dashboard

### Fixed
- [Dashboard] Use Tailwind theme colors

## [1.0.0] - 2022-09-02
### Added
- [Data project] Create data project template
- [Middleware] Add Vercel middleware
- [Script] Add tracking script
- [Dashboard] Add dashboard

[Unreleased]: https://github.com/tinybirdco/web-analytics-starter-kit/compare/1.2.3...HEAD
[1.2.3]: https://github.com/tinybirdco/web-analytics-starter-kit/compare/1.2.2...1.2.3
[1.2.2]: https://github.com/tinybirdco/web-analytics-starter-kit/compare/1.2.1...1.2.2
[1.2.1]: https://github.com/tinybirdco/web-analytics-starter-kit/compare/1.2.0...1.2.1
[1.2.0]: https://github.com/tinybirdco/web-analytics-starter-kit/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/tinybirdco/web-analytics-starter-kit/compare/1.1.0...1.0.0
[1.0.0]: https://github.com/tinybirdco/web-analytics-starter-kit/tree/1.0.0
