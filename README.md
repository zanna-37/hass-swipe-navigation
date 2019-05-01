# Lovelace Swipe Navigation
Swipe through Lovelace views on mobile.<br>
Original idea & [project](https://github.com/themoffatt/lovelace-swiper) by [@themoffatt](https://github.com/themoffatt) <br><br>
<a href="https://www.buymeacoffee.com/FgwNR2l" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/black_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a><br>

# Installation:
Follow only one of these installation methods.

### Manual installation:
1. Copy `lovelace-swipe-navigation.js` into `/www/lovelace-swipe-navigation/`

2. Add the resource in `ui-lovelace.yaml` or by using the "Raw Config Editor".

```yaml
resources:
  # increase this version number at end of URL after each update
  - url: /local/lovelace-swipe-navigation.js?v=1.0.0
    type: js
```

3. Refresh the page.

### Installation and tracking with custom_updater:

1. Make sure the [custom_updater](https://github.com/custom-components/custom_updater) component is installed and working.

2. Configure Lovelace to load the card.

```yaml
resources:
  - url: /customcards/github/maykar/lovelace-swipe-navigation.js?track=true
    type: js
```

3. Run the service `custom_updater.check_all` or click the "CHECK" button if you use the tracker-card.

4. Refresh the page.

# Config:
Until I impliment a better solution config is reset after each update.
* At the top of the `lovelace-swipe-navigation.js` file there is a "config" section where you can play with some of the options.
* If you installed with the manual option you will need to add to the version number in your Lovelace resources after editing the file.
* Refresh page after editing.

**Current config options:**<br>
* swipe_amount: The minimum percent of screen needed to be swiped in order to navigate. Any number between 1-100.
* skip_tabs: A comma seperated list of views to skip when swiping. Surround in brackets. e.g., `[1,3,5]`.
* wrap: Wrap from first tab to last tab and vice versa. Can be `true` or `false`.
