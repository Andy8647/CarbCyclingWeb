import { useState, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { InputForm } from '@/components/core/InputForm';
import { ResultCard } from '@/components/core/ResultCard';
import { ParticleBackground } from '@/components/shared/ParticleBackground';
import { ThemeProvider } from '@/lib/theme-context';
import { FormProvider, formSchema, type FormData } from '@/lib/form-context';

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
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [dailyWorkouts, setDailyWorkouts] = useState<Record<number, string>>(
    {}
  );
  const [dayOrder, setDayOrder] = useState<number[]>([]);

  const setDailyWorkout = (day: number, workout: string) => {
    setDailyWorkouts((prev) => ({ ...prev, [day]: workout }));
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 25,
      gender: 'male',
      weight: 70,
      height: 175,
      activityFactor: 'moderate',
      bodyType: 'mesomorph',
      carbCoeff: 2.5,
      proteinCoeff: 1.2,
      fatCoeff: 0.9,
      cycleDays: 7,
    },
    mode: 'onChange',
  });

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
      </div>
    </FormProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="carb-cycling-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
