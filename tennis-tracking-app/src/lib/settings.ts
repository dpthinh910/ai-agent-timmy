/**
 * Club Settings — Persistent configuration for the tennis club.
 *
 * Stored in localStorage and used across all views.
 * Will be migrated to Supabase when cloud sync is implemented.
 */

export interface ClubSettings {
  /** Monthly court rental in VND (ref: May 2025 = 14,040,000₫) */
  courtRentalMonthly: number;
  /** Monthly tennis ball budget in VND (18 packs, ref: 3,000,000₫) */
  ballBudgetMonthly: number;
  /** Tip per ball kid per session in VND */
  tipPerBallKid: number;
  /** Default number of ball kids per session (2 courts = 2 kids) */
  defaultBallKidCount: number;
  /** Session duration in hours */
  sessionDurationHours: number;
  /** Monthly dues per person in VND (leader sets this on ~25th of each month) */
  monthlyDuesPerPerson: number;
}

const SETTINGS_KEY = 'cadence_tennis_settings';

export const DEFAULT_SETTINGS: ClubSettings = {
  courtRentalMonthly: 14_040_000,
  ballBudgetMonthly: 3_000_000,
  tipPerBallKid: 50_000,
  defaultBallKidCount: 2,
  sessionDurationHours: 2,
  monthlyDuesPerPerson: 0,
};

/**
 * Load settings from localStorage, merging with defaults for any missing keys.
 */
export function getSettings(): ClubSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage.
 */
export function saveSettings(settings: ClubSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

/**
 * Update a single field in settings.
 */
export function updateSetting<K extends keyof ClubSettings>(
  key: K,
  value: ClubSettings[K],
): ClubSettings {
  const current = getSettings();
  const updated = { ...current, [key]: value };
  saveSettings(updated);
  return updated;
}
