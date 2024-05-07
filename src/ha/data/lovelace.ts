import { HomeAssistant } from "./homeassistant";

export interface PanelLovelace {
  route?: Route;
  lovelace?: Lovelace;
  hass?: HomeAssistant;
}

export interface Route {
  prefix?: string,
  path?: string,
}

export interface Lovelace {
  config?: LovelaceConfig;
  // If not set, a strategy was used to generate everything
  rawConfig?: LovelaceConfig;
  editMode?: boolean;
  urlPath?: string | null;
  mode?: "generated" | "yaml" | "storage";
  locale?: unknown;
  enableFullEditMode?: () => void;
  setEditMode?: (editMode: boolean) => void;
  saveConfig?: (newConfig: LovelaceConfig) => Promise<void>;
  deleteConfig?: () => Promise<void>;
}

export interface LovelaceConfig {
  title?: string;
  strategy?: unknown;
  views?: LovelaceViewConfig[];
  background?: string;
}

export interface LovelaceViewConfig {
  index?: number,
  title?: string,
  type?: string,
  strategy?: unknown,
  cards?: unknown,
  path?: string,
  icon?: string,
  theme?: string,
  panel?: boolean,
  background?: string,
  visible?: boolean | ShowViewConfig[];
  subview?: boolean;
}

export interface ShowViewConfig {
  user?: string;
}
