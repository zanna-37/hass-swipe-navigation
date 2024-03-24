# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

-----

## 🏷️ [v1.13.3] - 2024-03-24
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.13.2...v1.13.3)

### Fixed 🐛
- Ensure that dragging cards in Sections doesn't trigger a swipe ([`aaf0f2a`](https://github.com/zanna-37/hass-swipe-navigation/commit/aaf0f2a1a8ac85b552049f7aa3a3cc2bf7fb07a1), closes [`#72`](https://github.com/zanna-37/hass-swipe-navigation/issues/72))


## 🏷️ [v1.13.2] - 2023-11-25
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.13.1...v1.13.2)

### Fixed 🐛
- `input[type=range]` has been added to swipe exceptions ([`#64`](https://github.com/zanna-37/hass-swipe-navigation/pull/64))


## 🏷️ [v1.13.1] - 2023-09-20
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.13.0...v1.13.1)

### Fixed 🐛
- Fixed a bug that caused the swipe navigation to not work when swiping with the mouse on a Firefox browser ([`#63`](https://github.com/zanna-37/hass-swipe-navigation/pull/63), closes [`#62`](https://github.com/zanna-37/hass-swipe-navigation/issues/62))


## 🏷️ [v1.13.0] - 2023-09-10
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.12.1...v1.13.0)

### Added 🎉
- You can now use your mouse 🖱️ to swipe through tabs thanks to [@wrabel](https://github.com/wrabel). **This feature is disabled by default** but can be enabled by setting `enable_mouse_swipe: true` in the configuration ([`#59`](https://github.com/zanna-37/hass-swipe-navigation/pull/59))

### Fixed 🐛
- Android TV Card and Bubble Card have been added to swipe exceptions thanks to [@Nerwyn](https://github.com/Nerwyn) ([`#60`](https://github.com/zanna-37/hass-swipe-navigation/pull/60), closes [`#61`](https://github.com/zanna-37/hass-swipe-navigation/issues/61))


## 🏷️ [v1.12.1] - 2023-08-23
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.12.0...v1.12.1)

### Fixed 🐛
- skip_tabs can now contain a single tab number without throwing an error ([`165a46f`](https://github.com/zanna-37/hass-swipe-navigation/commit/165a46f77b5812406783a2ce53dc037484c35661), closes [`#58`](https://github.com/zanna-37/hass-swipe-navigation/issues/58))
- Big Slider Card has been added to swipe exceptions thanks to [@tkadauke](https://github.com/tkadauke) ([`87042ed`](https://github.com/zanna-37/hass-swipe-navigation/commit/87042ed5bc9d8f1784dd7c38172c3b1af8d9c84a), closes [`#57`](https://github.com/zanna-37/hass-swipe-navigation/pull/57))


## 🏷️ [v1.12.0] - 2023-06-27
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.11.1...v1.12.0)

### Added 🎉
- The animation duration can now be adjusted thanks to [@ambroseus](https://github.com/ambroseus) who added the new configuration option `animation_duration` ([`1cbdcca`](https://github.com/zanna-37/hass-swipe-navigation/commit/1cbdcca893b14db9dd2412fb503bfcb8d1f2c016), closes [`#56`](https://github.com/zanna-37/hass-swipe-navigation/pull/56))

### Fixed 🐛
- floor3d-card has been added to swipe exceptions ([`8f0237f`](https://github.com/zanna-37/hass-swipe-navigation/commit/8f0237fea37aab32e2333352e376ca2ceb9a3f24), closes [`#48`](https://github.com/zanna-37/hass-swipe-navigation/issues/48))
- Gallery Card has been added to swipe exceptions ([`fa54775`](https://github.com/zanna-37/hass-swipe-navigation/commit/fa547759e68ba8d01f1516cbc0f26a3d1870391f), closes [`#51`](https://github.com/zanna-37/hass-swipe-navigation/issues/51))


## 🏷️ [v1.11.1] - 2023-04-04
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.11.0...v1.11.1)

### Fixed 🐛
- Adapt to changes introduced by the Home Assistant 2023.4 release ([`da23102`](https://github.com/zanna-37/hass-swipe-navigation/commit/da23102c515f780b5cc76db4e30733ad616eed85), closes [`#45`](https://github.com/zanna-37/hass-swipe-navigation/issues/45))
- Sankey Chart Card has been added to swipe exceptions ([`380476e`](https://github.com/zanna-37/hass-swipe-navigation/commit/380476e233d08a113d811ee1e898c5e945906de7), closes [`#35`](https://github.com/zanna-37/hass-swipe-navigation/issues/35))
- Meteoalarm Card has been added to swipe exceptions ([`55ebfce`](https://github.com/zanna-37/hass-swipe-navigation/commit/55ebfce481eae65e32624c74e8cec373bc0fb445), closes [`#43`](https://github.com/zanna-37/hass-swipe-navigation/issues/43))


## 🏷️ [v1.11.0] - 2023-02-28
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.10.2...v1.11.0)

### Added 🎉
- You can now disable the swipe navigation on certain dashboards by using the new configuration option `enable: false` ([`d5709a5`](https://github.com/zanna-37/hass-swipe-navigation/commit/d5709a50a3e5f1d928439d2a95403acf0dc23387), closes [`#15`](https://github.com/zanna-37/hass-swipe-navigation/issues/15))

### Fixed 🐛
- Detect new sliders introduced with Home Assistant core `v2023.3` ([`28391b6`](https://github.com/zanna-37/hass-swipe-navigation/commit/28391b61c33759a06dd58995d3e52d248bc2ae83))
- Add built-in scrollbar to the swipe exception list ([`278b842`](https://github.com/zanna-37/hass-swipe-navigation/commit/278b8428e06d1d9def499e93d6c5fde12e409c8f), closes [`#41`](https://github.com/zanna-37/hass-swipe-navigation/issues/41))


## 🏷️ [v1.10.2] - 2023-02-23
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.10.1...v1.10.2)

### Fixed 🐛
- Configuration is now reloaded when switching dashboards and when the configuration is changed from the raw configuration editor ([`8925c3f`](https://github.com/zanna-37/hass-swipe-navigation/commit/8925c3f6b58bd0834e98fc5c580e186e270b800b), closes [`#12`](https://github.com/zanna-37/hass-swipe-navigation/issues/12))
- material/mwc-tab-bar (used by Tabbed Card) has been added to swipe exceptions ([`e5f1f35`](https://github.com/zanna-37/hass-swipe-navigation/commit/e5f1f35b0a668e51e0b14e0ac67442c08ccaa914), closes [`#36`](https://github.com/zanna-37/hass-swipe-navigation/issues/36))


## 🏷️ [v1.10.1] - 2023-02-11
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.10.0...v1.10.1)

### Fixed 🐛
- History explorer card has been added to swipe exceptions ([`1cb14be`](https://github.com/zanna-37/hass-swipe-navigation/commit/1cb14bec90bb463e45a9729bb01450ab611ef60a), closes [`#34`](https://github.com/zanna-37/hass-swipe-navigation/issues/34))


## 🏷️ [v1.10.0] - 2022-12-26
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.9.0...v1.10.0)

### Added 🎉
- my-slider-v2 has been added to swipe exceptions ([`4601c62`](https://github.com/zanna-37/hass-swipe-navigation/commit/4601c6279a10d2b19028884c0d0fcdf0f5c53b2b), closes [`#33`](https://github.com/zanna-37/hass-swipe-navigation/issues/33))


## 🏷️ [v1.9.0] - 2022-12-25
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.8.1...v1.9.0)

### Added 🎉
- UI Card for Better Thermostat has been added to swipe exceptions (by [@csidirop](https://github.com/csidirop) in [`#32`](https://github.com/zanna-37/hass-swipe-navigation/pull/32))


## 🏷️ [v1.8.1] - 2022-12-14
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.8.0...v1.8.1)

### Fixed 🐛
- "ApexCharts Card by RomRider" has been added to swipe exceptions ([`7935ea0`](https://github.com/zanna-37/hass-swipe-navigation/commit/7935ea0c65c44a4ff6ca95586f236d4b7b12aa49), closes [`#30`](https://github.com/zanna-37/hass-swipe-navigation/issues/30))


## 🏷️ [v1.8.0] - 2022-12-08
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.7.0...v1.8.0)

### Added 🎉
- The project is now protected by a number of tests to ensure that the code is working as expected ([`#27`](https://github.com/zanna-37/hass-swipe-navigation/pull/27))


## 🏷️ [v1.7.0] - 2022-12-08
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.6.5...v1.7.0)

### Added 🎉
- Tile slider has been added to swipe exceptions ([`39911fa`](https://github.com/zanna-37/hass-swipe-navigation/commit/39911facf9e075edb913027c3f826e8057216f41))


## 🏷️ [v1.6.5] - 2022-11-07
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.6.4...v1.6.5)

### Fixed 🐛
- Animations are now snappier (by [@dbuezas](https://github.com/dbuezas) in [`#19`](https://github.com/zanna-37/hass-swipe-navigation/pull/19), closes [`#18`](https://github.com/zanna-37/hass-swipe-navigation/issues/18))


## 🏷️ [v1.6.4] - 2022-11-02
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.6.3...v1.6.4)

### Fixed 🐛
- Ignore swipe when multitouch is detected, for example, when pinching to zoom (by [@MasterTim17](https://github.com/MasterTim17) in [`#17`](https://github.com/zanna-37/hass-swipe-navigation/pull/17), closes [`#16`](https://github.com/zanna-37/hass-swipe-navigation/issues/16))


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
- Fixed a bug that caused a fatal error when `logger_level` was not set in user configuration ([`6240772`](https://github.com/zanna-37/hass-swipe-navigation/commit/6240772c63a08aa01a3b62624a0bec43f6004efb), closes [`#11`](https://github.com/zanna-37/hass-swipe-navigation/issues/11))


## 🏷️ [v1.6.0] - 2022-09-17
[Full Changelog](https://github.com/zanna-37/hass-swipe-navigation/compare/v1.5.0...v1.6.0)

### Added 🎉
- Logging can be enabled via the `logger_level` setting ([`4f1f09c`](https://github.com/zanna-37/hass-swipe-navigation/commit/4f1f09c5a716c0bd83fe52673816f24118cfedf5))

### Fixed 🐛
- The entire code is now much more reliable and can auto heal even when the page changes considerably ([`71d3230`](https://github.com/zanna-37/hass-swipe-navigation/commit/71d3230e3fb92eb298310a0982f3eeeee7a35b7d) [`3076951`](https://github.com/zanna-37/hass-swipe-navigation/commit/30769514eaf52f69da9cbf116132b52d90490497), closes [`#6`](https://github.com/zanna-37/hass-swipe-navigation/issues/6))


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
