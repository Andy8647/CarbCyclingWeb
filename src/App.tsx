import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { InputForm } from '@/components/core/InputForm';
import { ResultCard } from '@/components/core/ResultCard';
import { ParticleBackground } from '@/components/shared/ParticleBackground';
import { ThemeProvider } from '@/lib/theme-context';

function App() {
  const isReady = false; // TODO: 用你的表单校验结果驱动

  return (
    <ThemeProvider defaultTheme="system" storageKey="carb-cycling-theme">
      <div
        className="min-h-screen text-foreground relative"
        style={{
          background: 'transparent',
          color: 'var(--foreground)',
        }}
      >
        {/* Background overlay to ensure readability but allow particles to show */}
        <div
          className="fixed inset-0 -z-20"
          style={{
            background: 'var(--background)',
            opacity: 0.8,
          }}
        />
        <ParticleBackground />
        <Header />

        <main className="container mx-auto px-4 py-6 main-grid">
          <section
            aria-labelledby="form-title"
            className="grid-col-1 rounded-3xl border border-border bg-card/80 backdrop-blur-2xl shadow-lg hover:shadow-xl transition-all duration-500"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground text-lg">📋</span>
                </div>
                <h2
                  id="form-title"
                  className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                >
                  基础信息
                </h2>
              </div>

              <InputForm />
            </div>
          </section>

          <section
            aria-labelledby="result-title"
            className="grid-col-2 rounded-3xl border border-border bg-card/80 backdrop-blur-2xl shadow-lg hover:shadow-xl transition-all duration-500"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground text-lg">📊</span>
                  </div>
                  <h2
                    id="result-title"
                    className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                  >
                    计算结果
                  </h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/20 rounded-full">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-accent-foreground">
                    实时计算 · 无需提交
                  </span>
                </div>
              </div>

              <ResultCard />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
