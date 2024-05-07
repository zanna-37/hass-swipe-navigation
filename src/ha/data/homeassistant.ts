
export interface HomeAssistant {
  auth?: unknown;
  connection?: unknown;
  connected?: boolean;
  states?: unknown;
  entities?: { [id: string]: unknown };
  devices?: { [id: string]: unknown };
  areas?: { [id: string]: unknown };
  services?: unknown;
  config?: unknown;
  themes?: unknown;
  selectedTheme?: unknown | null;
  panels?: unknown;
  panelUrl?: string;
  // i18n
  // current effective language in that order:
  //   - backend saved user selected language
  //   - language in local app storage
  //   - browser language
  //   - english (en)
  language?: string;
  // local stored language, keep that name for backward compatibility
  selectedLanguage?: string | null;
  locale?: unknown;
  resources?: unknown;
  localize?: unknown;
  translationMetadata?: unknown;
  suspendWhenHidden?: boolean;
  enableShortcuts?: boolean;
  vibrate?: boolean;
  dockedSidebar?: "docked" | "always_hidden" | "auto";
  defaultPanel?: string;
  moreInfoEntityId?: string | null;
  user?: CurrentUser;
  hassUrl?(path?: unknown): string;
  callService?(
      domain: unknown,
      service: unknown,
      serviceData?: unknown,
      target?: unknown
  ): Promise<unknown>;
  callApi?<T>(
      method: "GET" | "POST" | "PUT" | "DELETE",
      path: string,
      parameters?: Record<string, unknown>,
      headers?: Record<string, string>
  ): Promise<T>;
  fetchWithAuth?(path: string, init?: Record<string, unknown>): Promise<Response>;
  sendWS?(msg: unknown): void;
  callWS?<T>(msg: unknown): Promise<T>;
  loadBackendTranslation?(
      category: unknown,
      integration?: string | string[],
      configFlow?: boolean
  ): Promise<unknown>;
  formatEntityState?(stateObj: unknown, state?: string): string;
  formatEntityAttributeValue?(stateObj: unknown, attribute: string, value?: string): string;
  formatEntityAttributeName?(stateObj: unknown, attribute: string): string;
}

export interface CurrentUser {
  id?: string;
  is_owner?: boolean;
  is_admin?: boolean;
  name?: string;
  credentials?: Credential[];
  mfa_modules?: unknown[];
}
