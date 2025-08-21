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
  <main className="w-full max-w-none px-8 py-6 main-grid">
    <InputForm className="grid-col-1" />
    <ResultCard className="grid-col-2" />
  </main>
);

MainContent.displayName = 'MainContent';

function AppContent() {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 25,
      gender: 'male',
      weight: 70,
      height: 175,
      activityFactor: 'moderate',
      bodyType: 'mesomorph',
      proteinLevel: 'beginner',
      cycleDays: 7,
    },
    mode: 'onChange',
  });

  return (
    <FormProvider
      form={form}
      unitSystem={unitSystem}
      setUnitSystem={setUnitSystem}
    >
      <div
        className="min-h-screen text-foreground relative"
        style={{
          background: 'transparent',
          color: 'var(--foreground)',
        }}
      >
        <StableBackground />
        <Header />
        <MainContent />
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
