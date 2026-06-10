import { useState, useEffect } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import { Sparkles, Terminal, Code, ArrowRight } from "lucide-react";

// Read keys from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

// Simple custom router hook
function usePath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };

  return { path, navigate };
}

// Instantiate Convex Client if URL is present
const convexClient = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : null;

export default function App() {
  const { path, navigate } = usePath();

  // If environment variables are missing, display the onboarding dashboard helper
  if (!CLERK_PUBLISHABLE_KEY || !CONVEX_URL) {
    return <SetupGuide />;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convexClient!} useAuth={useAuth}>
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-brand-500/30 selection:text-white">
          <Header currentPath={path} navigate={navigate} />
          
          <main className="flex-grow">
            {path === "/" && <LandingPage />}
            {path === "/dashboard" && <DashboardPage />}
            {path !== "/" && path !== "/dashboard" && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 space-y-4">
                <h1 className="text-4xl font-extrabold text-white">404 - Not Found</h1>
                <p className="text-slate-400 max-w-sm">This client-side page does not exist.</p>
                <button
                  onClick={() => navigate("/")}
                  className="bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-6 py-2.5 font-semibold transition shadow-md active:scale-95"
                >
                  Go Home
                </button>
              </div>
            )}
          </main>
        </div>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

// Gorgeous Setup Guide Component
function SetupGuide() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="absolute top-0 left-0 h-96 w-96 bg-glow-radial -z-10 rounded-full blur-3xl opacity-40" />

      <div className="max-w-2xl w-full p-8 glass-card rounded-3xl border border-slate-800 shadow-2xl space-y-8 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Set Up Your Environment
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Welcome to <span className="text-white font-bold">Scissor</span>! You are just a few steps away from running your URL shortener.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          
          {/* Step 1: Convex config */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 font-mono text-sm font-bold text-slate-300">
              1
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-brand-400" />
                <span>Initialize Convex Backend</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Run the Convex development command. It will prompt you to log in, create a project, and generate files:
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-xs text-brand-100 flex justify-between items-center">
                <span>npx convex dev</span>
                <span className="text-slate-600 text-[10px] uppercase font-bold">Terminal</span>
              </div>
            </div>
          </div>

          {/* Step 2: Create .env.local */}
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 font-mono text-sm font-bold text-slate-300">
              2
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Code className="h-4 w-4 text-accent-violet" />
                <span>Configure Environment Keys</span>
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Create a <code className="text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded text-[11px] font-mono">.env.local</code> file in your project root and paste your Clerk and Convex credentials:
              </p>
              <pre className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-300 leading-normal overflow-x-auto">
{`# Clerk Auth Keys (from dashboard.clerk.com)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Convex Deployment URL (generated in step 1)
VITE_CONVEX_URL=https://your-deployment.convex.cloud`}
              </pre>
            </div>
          </div>

        </div>

        {/* Action instruction */}
        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center flex items-center justify-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            Once you create `.env.local` and restart the Vite server, this guide will disappear automatically.
          </span>
          <ArrowRight className="h-4 w-4 text-slate-500" />
        </div>

      </div>
    </div>
  );
}
