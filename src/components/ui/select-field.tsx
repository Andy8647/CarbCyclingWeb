import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label?: string;
  translationKey?: string;
}

export interface SelectFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  placeholderTranslationKey?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function SelectField({
  value,
  onValueChange,
  options,
  placeholder,
  placeholderTranslationKey,
  className,
  triggerClassName = 'h-9 text-sm',
  disabled = false,
}: SelectFieldProps) {
  const { t } = useTranslation();

  const computedPlaceholder =
    placeholder ??
    (placeholderTranslationKey ? t(placeholderTranslationKey) : undefined);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={`${triggerClassName} ${className || ''}`}>
        <SelectValue placeholder={computedPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label ??
              (option.translationKey ? t(option.translationKey) : option.value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// 预定义的常用选择器组件
export interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onValueChange,
  className,
  triggerClassName,
  disabled,
}: CategorySelectProps) {
  const options: SelectOption[] = [
    { value: 'protein', translationKey: 'mealPlanner.categories.protein' },
    { value: 'carb', translationKey: 'mealPlanner.categories.carb' },
    { value: 'fat', translationKey: 'mealPlanner.categories.fat' },
    { value: 'vegetable', translationKey: 'mealPlanner.categories.vegetable' },
    { value: 'fruit', translationKey: 'mealPlanner.categories.fruit' },
    {
      value: 'supplement',
      translationKey: 'mealPlanner.categories.supplement',
    },
    { value: 'other', translationKey: 'mealPlanner.categories.other' },
  ];

  return (
    <SelectField
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholderTranslationKey="mealPlanner.categoryPlaceholder"
      className={className}
      triggerClassName={triggerClassName}
      disabled={disabled}
    />
  );
}

export interface ServingUnitSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: string[];
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function ServingUnitSelect({
  value,
  onValueChange,
  options = ['per_100g', 'per_100ml', 'per_piece'],
  className,
  triggerClassName,
  disabled,
}: ServingUnitSelectProps) {
  const selectOptions: SelectOption[] = options.map((option) => ({
    value: option,
    translationKey: `mealPlanner.servingUnits.${option}`,
  }));

  return (
    <SelectField
      value={value}
      onValueChange={onValueChange}
      options={selectOptions}
      placeholderTranslationKey="mealPlanner.unitPlaceholder"
      className={className}
      triggerClassName={triggerClassName}
      disabled={disabled}
    />
  );
}

export interface PreparationSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function PreparationSelect({
  value,
  onValueChange,
  className,
  triggerClassName,
  disabled,
}: PreparationSelectProps) {
  const options: SelectOption[] = [
    { value: 'raw', translationKey: 'mealPlanner.preparationRaw' },
    { value: 'cooked', translationKey: 'mealPlanner.preparationCooked' },
  ];

  return (
    <SelectField
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholderTranslationKey="mealPlanner.preparationPlaceholder"
      className={className}
      triggerClassName={triggerClassName}
      disabled={disabled}
    />
  );
}
