import { HomeAssistant } from "./ha/data/homeassistant";

function isNewerVersion(oldVersion: string, newVersion: string) {
  const oldParts = oldVersion.split(".");
  const newParts = newVersion.split(".");
  for (let i = 0; i < newParts.length; i++) {
    const a = ~~newParts[i];  // Parse int
    const b = ~~oldParts[i];  // Parse int
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}

function getCurrentHAVersion() {
  const homeAssistant: (Element & { hass?: HomeAssistant }) | undefined =
    document.getElementsByTagName("home-assistant")[0];
  return homeAssistant?.hass?.config?.version || null;
}

function isLessThan2023_4() {
  const currentVersion = getCurrentHAVersion();

  return currentVersion == null
    ? false  // Assume newer if we can't determine the version
    : isNewerVersion(currentVersion, "2023.4");
}

export { isNewerVersion, isLessThan2023_4 };
