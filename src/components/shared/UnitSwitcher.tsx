// import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/lib/form-context';

export function UnitSwitcher() {
  // const { t } = useTranslation();
  const { unitSystem, setUnitSystem } = useFormContext();

  const handleUnitSwitch = () => {
    const newSystem = unitSystem === 'metric' ? 'imperial' : 'metric';
    setUnitSystem(newSystem);
  };

  const getUnitIcon = () => {
    return unitSystem === 'metric' ? '⚖️' : '📏';
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleUnitSwitch}
      className="h-8 w-8 p-0 hover:bg-transparent dark:hover:bg-transparent rounded-full transition-all duration-200 cursor-pointer"
      title={`Switch to ${unitSystem === 'metric' ? 'Imperial' : 'Metric'} units`}
    >
      <span className="text-xl">{getUnitIcon()}</span>
    </Button>
  );
}
