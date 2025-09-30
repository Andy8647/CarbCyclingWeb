import { useCallback } from 'react';
import { useLocalStorage } from '@/lib/use-local-storage';
import type { FormData } from '@/lib/form-schema';
import {
  STORAGE_KEYS,
  defaultPersistentAppState,
  type PersistentAppState,
} from '@/lib/persistence-types';

export function useFormPersistence() {
  const [appState, setAppState] = useLocalStorage(
    STORAGE_KEYS.APP_STATE,
    defaultPersistentAppState
  );

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

  return {
    saveFormData,
    getFormData,
  };
}
