# Lovelace Swipe Navigation

[![hacs_badge](https://img.shields.io/badge/HACS-Default-yellow.svg)](https://github.com/custom-components/hacs) [![hacs_badge](https://img.shields.io/badge/Buy-Me%20a%20Coffee-critical)](https://www.buymeacoffee.com/FgwNR2l)

Swipe through Lovelace views on mobile.

# Features:
* Animated swiping through Lovelace views.
* Configure views to skip over.
* Set the swipe length needed.
* Option to disable a browsers default swipe actions.
* Wrap from first view to last view and vice versa.
* Support RTL languages.

# Installation:
Follow only one of these installation methods.

<details>
  <summary><b>Installation and tracking with HACS:</b></summary>

1. In "Frontend" hit the plus at the bottom right, search for "swipe navigation" and install.

2. Refresh the Lovelace page, may need to clear cache.
</details>

<details>
  <summary><b>Manual installation:</b></summary>
  
1. Copy [swipe-navigation.js](https://github.com/maykar/lovelace-swipe-navigation/releases/latest) from the latest release into `/www/lovelace-swipe-navigation/`

2. Add the resource in `ui-lovelace.yaml` or in Lovelace Resources.

```yaml
resources:
  # increase this version number at end of URL after each update
  - url: /local/lovelace-swipe-navigation/swipe-navigation.js?v=1.0.0
    type: module
```

3. Refresh the page, may need to clear cache.
</details>

# Config:

Mark Watt does an excellent job covering configuation [in this youtube video](https://www.youtube.com/watch?v=03IPN9lBEfE&t=663s).

* Configuration is done in the root of your lovelace configuration.
* If you just want to use the default config values you don't need to add a config at all.

**Config Options:**<br>

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| swipe_amount | number | 15 | Minimum percent of screen needed to be swiped in order to navigate.
| skip_tabs | string | | A comma seperated list of views to skip when swiping. e.g., `1,3,5`.
| skip_hidden | boolean | true | Automatically skips hidden tabs.
| wrap | boolean | true | Wrap from first tab to last tab and vice versa.
| prevent_default | boolean | false | Prevents the browsers default horizontal swipe actions. May require a browser refresh to take effect, if using an HA companion app this can be done by closing the app and reopening.
| animate | string |  | Swipe animations. Can be: `swipe`, `fade`, `flip`. The swipe animation should be considered experimental and depending on your setup may appear buggy.

**Example:**<br>
Don't just copy the example, it won't fit your needs. Build your own using the config options above.
```yaml
swipe_nav:
  wrap: false
  animate: swipe
  skip_tabs: 5,6,7,8
  prevent_default: true
  swipe_amount: 30
  
views:
```

# Thank you
Big thanks to:
* [@themoffatt](https://github.com/themoffatt) for beating me to the punch and letting me make a duplicate project.
* [@RomRider](https://github.com/RomRider) and his [decluttering-card](https://github.com/custom-cards/decluttering-card/) for the configuration method.
