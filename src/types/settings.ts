/** User-configurable audit settings, persisted via figma clientStorage. */
export interface AuditSettings {
  wcagVersion: '2.1' | '2.2';
  conformanceTarget: 'AA' | 'AAA';
  minFontSize: number;
  minTouchTarget: number;
  language: string;
  darkMode: boolean;
}

export const DEFAULT_SETTINGS: AuditSettings = {
  wcagVersion: '2.2',
  conformanceTarget: 'AA',
  minFontSize: 12,
  minTouchTarget: 44,
  language: 'en',
  darkMode: false,
};
