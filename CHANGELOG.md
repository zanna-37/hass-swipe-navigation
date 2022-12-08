# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

-----

## 🏷️ [v1.7.0] - 2022-12-08
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.6.5...v1.7.0)

### Added 🎉
- Tile slider has been added to swipe exceptions ([`39911fa`](https://github.com/zanna-37/hass-swipe-navigation/commit/39911facf9e075edb913027c3f826e8057216f41))


## 🏷️ [v1.6.5] - 2022-11-07
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.6.4...v1.6.5)

### Fixed 🐛
- Animations are now snappier (by [@dbuezas](https://github.com/dbuezas) in [`#19`](https://github.com/zanna-37/hass-swipe-navigation/pull/19). Closes [`#18`](https://github.com/zanna-37/hass-swipe-navigation/issues/18))


## 🏷️ [v1.6.4] - 2022-11-02
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.6.3...v1.6.4)

### Fixed 🐛
- Ignore swipe when multitouch is detected, for example, when pinching to zoom (by [@MasterTim17](https://github.com/MasterTim17) in [`#17`](https://github.com/zanna-37/hass-swipe-navigation/pull/17). Closes [`#16`](https://github.com/zanna-37/hass-swipe-navigation/issues/16))


## 🏷️ [v1.6.3] - 2022-10-12
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.6.2...v1.6.3)

### Fixed 🐛
- Ignore-swipe exception list was not working when the swipe was initialized inside certain type of tags, e.g. `<svg>`.


## 🏷️ [v1.6.2] - 2022-10-06
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.6.1...v1.6.2)

### News 📰
- The project has been migrated to use TypeScript

### Fixed 🐛
- Fixed minor bugs


## 🏷️ [v1.6.1] - 2022-09-17
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.6.0...v1.6.1)

### Fixed 🐛
- Fixed a bug that caused a fatal error when `logger_level` was not set in user configuration ([`6240772`](https://github.com/zanna-37/hass-swipe-navigation/commit/6240772c63a08aa01a3b62624a0bec43f6004efb) Closes [`#11`](https://github.com/zanna-37/hass-swipe-navigation/issues/11))


## 🏷️ [v1.6.0] - 2022-09-17
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.5.0...v1.6.0)

### Added 🎉
- Logging can be enabled via the `logger_level` setting ([`4f1f09c`](https://github.com/zanna-37/hass-swipe-navigation/commit/4f1f09c5a716c0bd83fe52673816f24118cfedf5))

### Fixed 🐛
- The entire code is now much more reliable and can auto heal even when the page changes considerably ([`71d3230`](https://github.com/zanna-37/hass-swipe-navigation/commit/71d3230e3fb92eb298310a0982f3eeeee7a35b7d) [`3076951`](https://github.com/zanna-37/hass-swipe-navigation/commit/30769514eaf52f69da9cbf116132b52d90490497) Closes [`#6`](https://github.com/zanna-37/hass-swipe-navigation/issues/6))


## 🏷️ [v1.5.0] - 2022-06-20
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.4.1...v1.5.0)

### Added 🎉
- CSS selectors are now the default method to add swipe exceptions ([`49f8d76`](https://github.com/zanna-37/hass-swipe-navigation/commit/49f8d763d712dab6f10d9bed01372ff07e861f23))

### Changed 📝
- Increased specificity for plotly selector ([`c3e7fd4`](https://github.com/zanna-37/hass-swipe-navigation/commit/c3e7fd419466c63825c1d25f2f0f4e3ca70205b7))


## 🏷️ [v1.4.1] - 2022-06-20
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.4.0...v1.4.1)

### Added 🎉
- The repo is now part of HACS default! ([`37a2bde`](https://github.com/zanna-37/hass-swipe-navigation/commit/37a2bde7378d8029d1918ae5bcd123d2a7f3a78c))
- Add my-slider to the list of 3rd party exceptions (by [@usernein](https://github.com/usernein) in [`#3`](https://github.com/zanna-37/hass-swipe-navigation/pull/3))


## 🏷️ [v1.4.0] - 2022-06-10
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.3.7...v1.4.0)

### Added 🎉
- Ignore-swipe exceptions can now be specified using a combination of HTML tag name and css classes for an improved detection ([`5cddcea`](https://github.com/zanna-37/hass-swipe-navigation/commit/5cddcea923ba75f60b0117def5630b371818f2f3))
- Plotly Graph Card has been added to swipe exceptions ([`3d5ab78`](https://github.com/zanna-37/hass-swipe-navigation/commit/3d5ab78f1910f1c4550278638049842f08897177))
- Mushroom slider has been added to swipe exceptions ([`9136076`](https://github.com/zanna-37/hass-swipe-navigation/commit/9136076a2a7323cb6139110f4acd8c9f3ef61f4b))


## 🏷️ [v1.3.7] - 2022-06-09
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/1.3.6...v1.3.7)

### News 📰
**The owner of this project has changed! 🎉
[Zanna_37](https://github.com/zanna-37) 🎩 will maintain it from now on.** 👀

### Fixed 🐛
- Better compatibility by using the standard `event.composedPath()` instead of `event.path` ([`5bc0555`](https://github.com/zanna-37/hass-swipe-navigation/commit/5bc0555d111bd20a9ab1756051fb42ac1f915ee0))


## 🏷️ Older releases >= [1.3.6] - 2021-06-29
For older releases see the [old repository](https://github.com/maykar/lovelace-swipe-navigation/releases).
