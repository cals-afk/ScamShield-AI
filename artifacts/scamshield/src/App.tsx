import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import Activation from "@/pages/activation";
import HeroReveal from "@/pages/hero-reveal";
import Splash from "@/pages/splash";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import ParticleBackground from "@/components/ParticleBackground";
import HudOverlay from "@/components/HudOverlay";

const queryClient = new QueryClient();

function AppShell() {
  const { phase, theme } = useTheme();

  return (
    <>
      {/* Always-on particle canvas — behind everything at z-0 */}
      <ParticleBackground theme={theme} phase={phase} />

      {/* HUD overlay — shown on persistent interactive pages */}
      {(phase === "splash" || phase === "onboarding" || phase === "ready") && <HudOverlay />}

      {phase === "splash" && <Splash />}
      {phase === "onboarding" && <Onboarding />}
      {phase === "hero_reveal" && <HeroReveal />}
      {phase === "activating" && <Activation />}
      {phase === "ready" && (
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/" component={Home} />
            <Route component={NotFound} />
          </Switch>
        </WouterRouter>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
