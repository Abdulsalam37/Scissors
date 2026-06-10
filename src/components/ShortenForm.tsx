import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useDebounce } from "../hooks/useDebounce";
import QRCodeDisplay from "./QRCodeDisplay";
import { Link2, Sparkles, Calendar, ArrowRight, Copy, Check, Plus, AlertCircle, Loader2 } from "lucide-react";

export default function ShortenForm() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ slug: string; shortUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const createLink = useMutation(api.links.createLink);

  // Debounced custom slug for availability checking
  const debouncedSlug = useDebounce(customSlug, 500);

  // Query availability only if slug is valid length
  const isSlugCheckingEnabled = debouncedSlug.length >= 3;
  const isSlugAvailable = useQuery(
    api.links.checkSlugAvailable,
    isSlugCheckingEnabled ? { slug: debouncedSlug } : "skip"
  );

  const handleCopy = () => {
    if (!successResult) return;
    navigator.clipboard.writeText(successResult.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!originalUrl.trim()) {
      setError("Please enter a URL.");
      setLoading(false);
      return;
    }

    if (!validateUrl(originalUrl.trim())) {
      setError("Please enter a valid URL including http:// or https://");
      setLoading(false);
      return;
    }

    if (customSlug && !/^[a-zA-Z0-9-]+$/.test(customSlug)) {
      setError("Slug can only contain alphanumeric characters and hyphens.");
      setLoading(false);
      return;
    }

    if (customSlug && (customSlug.length < 3 || customSlug.length > 50)) {
      setError("Slug must be between 3 and 50 characters.");
      setLoading(false);
      return;
    }

    if (customSlug && isSlugAvailable === false) {
      setError("Slug is already taken.");
      setLoading(false);
      return;
    }

    try {
      const expiryTimestamp = expiresAt ? new Date(expiresAt).getTime() : undefined;
      const result = await createLink({
        originalUrl: originalUrl.trim(),
        customSlug: customSlug.trim() || undefined,
        expiresAt: expiryTimestamp,
      });

      // Compute redirect URL using Convex deployment domain
      const convexUrl = import.meta.env.VITE_CONVEX_URL || "";
      const redirectBase = convexUrl.replace(".convex.cloud", ".convex.site");
      const shortUrl = `${redirectBase}/${result.slug}`;

      setSuccessResult({
        slug: result.slug,
        shortUrl,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOriginalUrl("");
    setCustomSlug("");
    setExpiresAt("");
    setError(null);
    setSuccessResult(null);
  };

  // Helper for availability message
  const renderSlugFeedback = () => {
    if (!customSlug) return null;
    if (customSlug.length < 3) {
      return <p className="text-xs text-amber-400">Must be at least 3 characters.</p>;
    }
    if (!/^[a-zA-Z0-9-]+$/.test(customSlug)) {
      return <p className="text-xs text-rose-400">Alphanumeric & hyphens only.</p>;
    }
    if (isSlugAvailable === undefined) {
      return (
        <div className="flex items-center space-x-1 text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs">Checking availability...</span>
        </div>
      );
    }
    if (isSlugAvailable) {
      return <p className="text-xs text-emerald-400">✓ Slug is available</p>;
    } else {
      return <p className="text-xs text-rose-400">✗ Slug is taken</p>;
    }
  };

  if (successResult) {
    return (
      <div className="mx-auto max-w-2xl w-full p-8 glass-card rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
        <div className="absolute top-0 right-0 h-40 w-40 bg-glow-radial -z-10 rounded-full" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Your URL is ready!</h2>
            <p className="text-slate-400 text-sm">Copy the link below or customize its QR code.</p>
          </div>

          {/* Short link box */}
          <div className="flex items-center justify-between w-full p-4 glass-input rounded-xl border border-slate-700">
            <span className="font-semibold text-brand-100 break-all select-all pr-4">{successResult.shortUrl}</span>
            <button
              onClick={handleCopy}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${
                copied 
                  ? "bg-emerald-600 border-emerald-500 text-white" 
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              title="Copy link"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>

          {/* QRCode details */}
          <div className="w-full">
            <QRCodeDisplay url={successResult.shortUrl} />
          </div>

          {/* Actions */}
          <button
            onClick={resetForm}
            className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white py-3 px-6 rounded-2xl text-sm font-semibold transition active:scale-98 w-full"
          >
            <Plus className="h-4 w-4" />
            <span>Shorten Another Link</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl w-full p-6 sm:p-8 glass-card rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="absolute -top-12 -left-12 h-48 w-48 bg-glow-radial -z-10 rounded-full blur-xl opacity-80" />
      
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Shorten a link <Sparkles className="h-5 w-5 text-accent-violet animate-pulse" />
          </h2>
          <p className="text-slate-400 text-sm mt-1">Paste your long URL below to create a trackable short link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main URL Input */}
          <div className="space-y-2">
            <label htmlFor="originalUrl" className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-brand-500" />
              <span>Original Destination URL</span>
            </label>
            <div className="relative">
              <input
                id="originalUrl"
                type="text"
                placeholder="https://example.com/very-long-path-to-destination"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="w-full py-3.5 pl-4 pr-12 rounded-2xl glass-input text-base placeholder-slate-500 font-medium"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet hover:from-brand-700 hover:to-brand-600 text-white hover:shadow-lg shadow-brand-500/10 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Custom Slug Input */}
            <div className="space-y-2">
              <label htmlFor="customSlug" className="text-sm font-semibold text-slate-300">
                Custom Slug <span className="text-xs text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                id="customSlug"
                type="text"
                placeholder="my-custom-slug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="w-full py-3 px-4 rounded-xl glass-input text-sm font-semibold placeholder-slate-500"
                disabled={loading}
              />
              <div className="min-h-5 pt-0.5">
                {renderSlugFeedback()}
              </div>
            </div>

            {/* Link Expiration Date Picker */}
            <div className="space-y-2">
              <label htmlFor="expiresAt" className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-accent-violet" />
                <span>Expiration Date <span className="text-xs text-slate-500 font-normal">(optional)</span></span>
              </label>
              <input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full py-3 px-4 rounded-xl glass-input text-sm font-medium text-slate-300 cursor-pointer"
                disabled={loading}
              />
              <div className="min-h-5 pt-0.5">
                {expiresAt && (
                  <p className="text-xs text-slate-400">
                    Expires on: {new Date(expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center space-x-2 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-700 hover:to-accent-violet border border-white/5 py-3.5 rounded-2xl text-white font-bold transition-all shadow-xl shadow-brand-600/10 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating Short URL...</span>
              </>
            ) : (
              <>
                <span>Shorten URL</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}