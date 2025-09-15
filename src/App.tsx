import { useState, memo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { InputForm } from '@/components/core/InputForm';
import { ResultCard } from '@/components/core/ResultCard';
import { ParticleBackground } from '@/components/shared/ParticleBackground';
import { ThemeProvider } from '@/lib/theme-context';
import { FormProvider, formSchema, type FormData } from '@/lib/form-context';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { useAppPersistence } from '@/lib/use-app-persistence';

const StableBackground = memo(() => (
  <>
    <div
      className="fixed inset-0 -z-20"
      style={{
        background: 'var(--background)',
        opacity: 0.8,
      }}
    />
    <ParticleBackground />
  </>
));

StableBackground.displayName = 'StableBackground';

const MainContent = () => (
  <main className="w-full px-8 py-6 space-y-6 flex flex-col items-center">
    <div className="w-full max-w-[1600px] space-y-6">
      <InputForm />
      <ResultCard />
    </div>
  </main>
);

MainContent.displayName = 'MainContent';

function AppContent() {
  const {
    saveFormData,
    getFormData,
    saveUserSettings,
    getUserSettings,
    saveTrainingWorkouts,
    saveTrainingOrder,
    getTrainingConfig,
  } = useAppPersistence();

  // Get saved user settings or use defaults
  const userSettings = getUserSettings();
  const [unitSystem, setUnitSystemState] = useState<'metric' | 'imperial'>(
    userSettings.unitSystem
  );
  const [dailyWorkouts, setDailyWorkoutsState] = useState<
    Record<number, string>
  >({});
  const [dayOrder, setDayOrderState] = useState<number[]>([]);

  // Enhanced setters that also save to persistence
  const setUnitSystem = (unit: 'metric' | 'imperial') => {
    setUnitSystemState(unit);
    saveUserSettings({ unitSystem: unit });
  };

  const setDailyWorkout = (day: number, workout: string) => {
    setDailyWorkoutsState((prev) => {
      const newWorkouts = { ...prev, [day]: workout };
      // Save to persistence - we need to get current cycle days from form
      const formData = form.getValues();
      if (formData.cycleDays) {
        saveTrainingWorkouts(formData.cycleDays, newWorkouts);
      }
      return newWorkouts;
    });
  };

  const setDayOrder = (order: number[]) => {
    setDayOrderState(order);
    // Save to persistence - we need to get current cycle days from form
    const formData = form.getValues();
    if (formData.cycleDays) {
      saveTrainingOrder(formData.cycleDays, order);
    }
  };

  // Get saved form data and merge with defaults
  const savedFormData = getFormData();
  const formDefaults = {
    age: 25,
    gender: 'male' as const,
    weight: 70,
    height: 175,
    activityFactor: 'moderate' as const,
    bodyType: 'mesomorph' as const,
    carbCoeff: 2.5,
    proteinCoeff: 1.2,
    fatCoeff: 0.9,
    cycleDays: 7,
    ...savedFormData, // Override defaults with saved data
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formDefaults,
    mode: 'onChange',
  });

  // Save form data whenever it changes
  useEffect(() => {
    const subscription = form.watch((formData) => {
      // Only save if form data is valid and not empty
      if (formData && Object.keys(formData).length > 0) {
        saveFormData(formData as Partial<FormData>);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, saveFormData]);

  // Load training config when cycle days changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'cycleDays' && value.cycleDays) {
        const trainingConfig = getTrainingConfig(value.cycleDays);
        setDailyWorkoutsState(trainingConfig.dailyWorkouts);
        setDayOrderState(trainingConfig.dayOrder);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, getTrainingConfig]);

  // Load initial training config based on default cycle days (run once)
  useEffect(() => {
    const cycleDays = form.getValues('cycleDays') || 7;
    const trainingConfig = getTrainingConfig(cycleDays);
    setDailyWorkoutsState(trainingConfig.dailyWorkouts);
    setDayOrderState(trainingConfig.dayOrder);
  }, [form]);

  return (
    <FormProvider
      form={form}
      unitSystem={unitSystem}
      setUnitSystem={setUnitSystem}
      dailyWorkouts={dailyWorkouts}
      setDailyWorkout={setDailyWorkout}
      dayOrder={dayOrder}
      setDayOrder={setDayOrder}
    >
      <div
        className="min-h-screen text-foreground relative flex flex-col select-none"
        style={{
          background: 'transparent',
          color: 'var(--foreground)',
        }}
      >
        <StableBackground />
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
        <Footer />
        <Toaster />
      </div>
    </FormProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="carb-cycling-theme">
      <TooltipProvider delayDuration={300}>
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
