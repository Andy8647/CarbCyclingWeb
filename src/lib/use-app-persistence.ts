import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import type {
  PersistentAppState,
  UserSettings,
  CycleTrainingConfig,
} from './persistence-types';
import {
  defaultPersistentAppState,
  defaultUserSettings,
  createDefaultCycleTrainingConfig,
  STORAGE_KEYS,
} from './persistence-types';
import type { FormData } from './form-context';

/**
 * Main hook for managing all app persistence
 * Provides a clean interface for components to save/load data
 */
export function useAppPersistence() {
  // Main app state storage
  const [appState, setAppState, removeAppState] =
    useLocalStorage<PersistentAppState>(
      STORAGE_KEYS.APP_STATE,
      defaultPersistentAppState
    );

  // Helper function to update app state
  const updateAppState = useCallback(
    (updates: Partial<PersistentAppState>) => {
      setAppState((prevState) => ({
        ...prevState,
        ...updates,
        lastSaved: Date.now(),
      }));
    },
    [setAppState]
  );

  // Form Data persistence
  const saveFormData = useCallback(
    (formData: Partial<FormData>) => {
      updateAppState({
        formData: {
          ...appState.formData,
          ...formData,
        },
      });
    },
    [appState.formData, updateAppState]
  );

  const getFormData = useCallback((): Partial<FormData> => {
    return appState.formData;
  }, [appState.formData]);

  // User Settings persistence
  const saveUserSettings = useCallback(
    (settings: Partial<UserSettings>) => {
      updateAppState({
        userSettings: {
          ...appState.userSettings,
          ...settings,
        },
      });
    },
    [appState.userSettings, updateAppState]
  );

  const getUserSettings = useCallback((): UserSettings => {
    return { ...defaultUserSettings, ...appState.userSettings };
  }, [appState.userSettings]);

  // Training Configuration persistence
  const saveTrainingConfig = useCallback(
    (cycleDays: number, config: Partial<CycleTrainingConfig>) => {
      const currentConfig =
        appState.trainingConfigs[cycleDays] ||
        createDefaultCycleTrainingConfig(cycleDays);

      updateAppState({
        trainingConfigs: {
          ...appState.trainingConfigs,
          [cycleDays]: {
            ...currentConfig,
            ...config,
            lastUpdated: Date.now(),
          },
        },
      });
    },
    [appState.trainingConfigs, updateAppState]
  );

  const getTrainingConfig = useCallback(
    (cycleDays: number): CycleTrainingConfig => {
      return (
        appState.trainingConfigs[cycleDays] ||
        createDefaultCycleTrainingConfig(cycleDays)
      );
    },
    [appState.trainingConfigs]
  );

  const saveTrainingWorkouts = useCallback(
    (cycleDays: number, dailyWorkouts: Record<number, string>) => {
      saveTrainingConfig(cycleDays, { dailyWorkouts });
    },
    [saveTrainingConfig]
  );

  const saveTrainingOrder = useCallback(
    (cycleDays: number, dayOrder: number[]) => {
      saveTrainingConfig(cycleDays, { dayOrder });
    },
    [saveTrainingConfig]
  );

  // Utility functions
  const clearAllData = useCallback(() => {
    removeAppState();
  }, [removeAppState]);

  const exportData = useCallback(() => {
    return JSON.stringify(appState, null, 2);
  }, [appState]);

  const importData = useCallback(
    (jsonData: string) => {
      try {
        const importedState = JSON.parse(jsonData) as PersistentAppState;

        // Validate the imported data structure
        if (typeof importedState === 'object' && importedState !== null) {
          setAppState({
            ...defaultPersistentAppState,
            ...importedState,
            lastSaved: Date.now(),
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to import data:', error);
        return false;
      }
    },
    [setAppState]
  );

  const getDataSize = useCallback(() => {
    const dataString = JSON.stringify(appState);
    return new Blob([dataString]).size;
  }, [appState]);

  return {
    // State
    appState,

    // Form data methods
    saveFormData,
    getFormData,

    // User settings methods
    saveUserSettings,
    getUserSettings,

    // Training configuration methods
    saveTrainingConfig,
    getTrainingConfig,
    saveTrainingWorkouts,
    saveTrainingOrder,

    // Utility methods
    clearAllData,
    exportData,
    importData,
    getDataSize,

    // Direct state update for advanced use cases
    updateAppState,
  };
}
