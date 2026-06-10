import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-react";
import LinkTable from "../components/LinkTable";
import { LayoutDashboard, Link, MousePointerClick, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const links = useQuery(api.links.getUserLinks);
  const [now] = useState(() => Date.now());

  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <span className="animate-pulse font-semibold">Verifying session...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-md w-full my-16 p-8 glass-card rounded-2xl border border-slate-800 text-center space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white">Access Dashboard</h2>
          <p className="text-slate-400 text-sm">
            Please sign in to view your shortened links and detailed click analytics.
          </p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalLinks = links ? links.length : 0;
  const totalClicks = links ? links.reduce((sum, link) => sum + link.clickCount, 0) : 0;
  
  const checkExpired = (link: Doc<"links">) => {
    if (link.expired) return true;
    if (link.expiresAt && now > link.expiresAt) return true;
    return false;
  };

  const activeLinks = links ? links.filter(link => !checkExpired(link)).length : 0;
  const expiredLinks = totalLinks - activeLinks;

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 md:px-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-brand-500" />
            <span>Link Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, {user.firstName || user.username || "User"}. Manage your links and view performance logs.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric: Total Links */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-md flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Link className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Links</span>
            <span className="text-2xl font-black text-white font-mono">{totalLinks}</span>
          </div>
        </div>

        {/* Metric: Total Clicks */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-md flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
            <MousePointerClick className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Clicks</span>
            <span className="text-2xl font-black text-white font-mono">{totalClicks.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric: Active Links */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-md flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Active Links</span>
            <span className="text-2xl font-black text-white font-mono">{activeLinks}</span>
          </div>
        </div>

        {/* Metric: Expired Links */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-md flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Expired Links</span>
            <span className="text-2xl font-black text-white font-mono">{expiredLinks}</span>
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <LinkTable links={links || []} isLoading={links === undefined} />

    </div>
  );
}
