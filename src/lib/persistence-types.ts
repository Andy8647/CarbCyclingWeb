import type { FormData } from './form-context';

/**
 * User Settings (Header configuration)
 * - Theme preference
 * - Language preference
 * - Unit system preference
 */
export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  language: 'zh-CN' | 'en-US';
  unitSystem: 'metric' | 'imperial';
}

/**
 * Training configuration for a specific cycle length
 * Each cycle length (3-7 days) gets its own configuration
 */
export interface CycleTrainingConfig {
  /** Mapping of day index to workout type */
  dailyWorkouts: Record<number, string>;
  /** Order of days for drag & drop sorting */
  dayOrder: number[];
  /** Timestamp when this config was last updated */
  lastUpdated: number;
}

/**
 * All training configurations keyed by cycle length
 * e.g., { 3: {...}, 4: {...}, 5: {...}, 6: {...}, 7: {...} }
 */
export interface TrainingConfigurations {
  [cycleDays: number]: CycleTrainingConfig;
}

/**
 * Complete persistent application state
 */
export interface PersistentAppState {
  /** User form input data */
  formData: Partial<FormData>;
  /** User interface preferences */
  userSettings: UserSettings;
  /** Training configurations for different cycle lengths */
  trainingConfigs: TrainingConfigurations;
  /** Metadata */
  version: string;
  lastSaved: number;
}

/**
 * Default values for user settings
 */
export const defaultUserSettings: UserSettings = {
  theme: 'system',
  language: 'zh-CN',
  unitSystem: 'metric',
};

/**
 * Default values for cycle training config
 */
export const createDefaultCycleTrainingConfig = (
  cycleDays: number
): CycleTrainingConfig => ({
  dailyWorkouts: {},
  dayOrder: Array.from({ length: cycleDays }, (_, i) => i),
  lastUpdated: Date.now(),
});

/**
 * Default values for complete app state
 */
export const defaultPersistentAppState: PersistentAppState = {
  formData: {},
  userSettings: defaultUserSettings,
  trainingConfigs: {},
  version: '1.0.0',
  lastSaved: Date.now(),
};

/**
 * Storage keys for different data types
 */
export const STORAGE_KEYS = {
  APP_STATE: 'carb-cycling-app-state',
  USER_SETTINGS: 'carb-cycling-user-settings',
  FORM_DATA: 'carb-cycling-form-data',
  TRAINING_CONFIGS: 'carb-cycling-training-configs',
} as const;
