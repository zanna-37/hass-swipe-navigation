# Lovelace Swipe Navigation
Swipe through Lovelace views on mobile.<br>
Original idea by [@themoffatt](https://github.com/themoffatt) <br><br>
<a href="https://www.buymeacoffee.com/FgwNR2l" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/black_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a><br>

**This is included as a feature in compact-custom-header, there is no need to install this if you already use CCH.**

# Features:
* Configure views to skip over.
* Set the swipe length needed.
* Option to disable a browsers default swipe actions.
* Wrap from first view to last view and vice versa.
* Compatible with [swipe-card](https://github.com/bramkragten/custom-ui/tree/master/swipe-card).

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
Until I impliment a better solution config is reset after each update.
* At the top of the `lovelace-swipe-navigation.js` file there is a "config" section where you can play with some of the options.
* If you installed with the manual option you will need to add to the version number in your Lovelace resources after editing the file.
* Refresh page after editing.

**Current config options:**<br>
* swipe_amount: Minimum percent of screen needed to be swiped in order to navigate. Any number between 1-100.
* skip_tabs: A comma seperated list of views to skip when swiping. Surround in brackets. e.g., `[1,3,5]`.
* wrap: Wrap from first tab to last tab and vice versa. Can be `true` or `false`.
* prevent_default: Prevents browsers default horizontal swipe actions. Can be `true` or `false`.

**Experimental config options:**<br>
*These options may not behave as expected.*
* animate: Swipe animations. Can be: `"none"`, `"swipe"`, `"fade"`, or `"flip"`. Must be in quotes.
