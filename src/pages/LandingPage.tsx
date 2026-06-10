import ShortenForm from "../components/ShortenForm";
import { Link2, QrCode, BarChart3, Clock, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between pt-12 md:pt-16 pb-12 px-4 md:px-8">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-glow-radial -z-10 rounded-full blur-3xl opacity-60" />

      {/* Main landing container */}
      <div className="mx-auto max-w-5xl w-full flex flex-col items-center space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold uppercase tracking-wider animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Simplify, Customize, Track</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none text-white">
            Shorten Your Links, <br />
            <span className="gradient-text">Elevate Your Reach</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Scissor turns long, complex URLs into concise, readable, and trackable links. 
            Generate customized QR codes, set expiry dates, and view live click analytics.
          </p>
        </div>

        {/* Shortening Form Widget */}
        <ShortenForm />

        {/* Features Pitch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full pt-8">
          
          {/* Feature: Custom Slugs */}
          <div className="p-6 glass-card rounded-2xl border border-slate-800 flex flex-col space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Link2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Custom Slugs</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Create branded aliases with real-time slug availability checks.
            </p>
          </div>

          {/* Feature: Expiration Dates */}
          <div className="p-6 glass-card rounded-2xl border border-slate-800 flex flex-col space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-rose/10 text-accent-rose border border-accent-rose/20">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Link Expiration</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Specify temporary lifespan limits. Automatically returns a 410 code when expired.
            </p>
          </div>

          {/* Feature: QR Codes */}
          <div className="p-6 glass-card rounded-2xl border border-slate-800 flex flex-col space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">QR Code Exports</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Instantly compile clean QR codes. Customize colors and export as PNG or SVG.
            </p>
          </div>

          {/* Feature: Real-time Analytics */}
          <div className="p-6 glass-card rounded-2xl border border-slate-800 flex flex-col space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live Analytics</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Track clicks, devices, referrers, and locations reactively in real-time.
            </p>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-xs font-semibold pt-16 border-t border-slate-900/50 mt-16 max-w-5xl mx-auto w-full">
        &copy; {new Date().getFullYear()} Scissor. Designed for modern web branding.
      </footer>
    </div>
  );
}
