import { useCallback, useState } from 'react';
import type { QuickAddFormState } from '@/components/core/meal-slot/types';

const QUICK_FORM_DEFAULTS: QuickAddFormState = {
  name: '',
  category: 'other',
  defaultServing: '',
  servingUnit: 'per_100g',
  carbs: '',
  protein: '',
  fat: '',
  preparation: 'raw',
  emoji: '',
};

export function useQuickForm() {
  const [quickForm, setQuickForm] =
    useState<QuickAddFormState>(QUICK_FORM_DEFAULTS);

  const resetQuickForm = useCallback(() => {
    setQuickForm({ ...QUICK_FORM_DEFAULTS });
  }, []);

  const handleQuickFormFieldChange = useCallback(
    <Key extends keyof QuickAddFormState>(
      field: Key,
      value: QuickAddFormState[Key]
    ) => {
      setQuickForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return {
    quickForm,
    setQuickForm,
    resetQuickForm,
    handleQuickFormFieldChange,
  };
}
