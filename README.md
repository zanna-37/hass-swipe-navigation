# Lovelace Swipe Navigation
Swipe through Lovelace views on mobile.

# Features:
* Animated swiping through Lovelace views.
* Configure views to skip over.
* Set the swipe length needed.
* Option to disable a browsers default swipe actions.
* Wrap from first view to last view and vice versa.


## Supporting Development
- :coffee:&nbsp;&nbsp;[Buy me a coffee](https://www.buymeacoffee.com/FgwNR2l)
- :1st_place_medal:&nbsp;&nbsp;[Tip some Crypto](https://github.com/sponsors/maykar)
- :heart:&nbsp;&nbsp;[Sponsor me on GitHub](https://github.com/sponsors/maykar)
  <br><br>

# Installation:
Follow only one of these installation methods.

<details>
  <summary><b>Manual installation:</b></summary>
  
1. Copy `swipe-navigation.js` into `/www/lovelace-swipe-navigation/`

2. Add the resource in `ui-lovelace.yaml` or by using the "Raw Config Editor".

```yaml
resources:
  # increase this version number at end of URL after each update
  - url: /local/lovelace-swipe-navigation/swipe-navigation.js?v=1.0.0
    type: js
```

3. Refresh the page.
</details>

<details>
  <summary><b>Installation and tracking with HACS:</b></summary>

1. In "store" search for lovelace-swipe-navigation and install.

2. Configure Lovelace to load the card:

```yaml
resources:
  - url: /community_plugin/lovelace-swipe-navigation/swipe-navigation.js
    type: js
```

3. Refresh the Lovelace page.
</details>


# Config:
Configuration is done in the root of your lovelace configuration.

Example:
```yaml
resources:
  - url: /local/lovelace-swipe-navigation/swipe-navigation.js?v=1.0.0
    type: js

swipe_nav:
  wrap: false
  animate: swipe
  skip_tabs: 5,6,7,8
  prevent_default: true
  swipe_amount: 30
  
views:
```

**Config Options:**<br>

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| swipe_amount | number | 15 | Minimum percent of screen needed to be swiped in order to navigate.
| skip_tabs | string | | A comma seperated list of views to skip when swiping. e.g., `1,3,5`.
| wrap | boolean | true | Wrap from first tab to last tab and vice versa.
| prevent_default | boolean | false | Prevents the browsers default horizontal swipe actions.
| animate | string | no animation | Swipe animations. Can be: `swipe`, `fade`, `flip`.

# Thank you
Big thanks to:
* [@themoffatt](https://github.com/themoffatt) for the original idea
* [@RomRider](https://github.com/RomRider) and his [decluttering-card](https://github.com/custom-cards/decluttering-card/) for the configuration method.
