import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import QRCodeDisplay from "./QRCodeDisplay";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { 
  Search, Filter, Copy, Check, Trash2, QrCode, BarChart3, 
  ExternalLink, Calendar, ShieldCheck, ShieldAlert, Loader2, X 
} from "lucide-react";

interface LinkTableProps {
  links: any[];
  isLoading: boolean;
}

export default function LinkTable({ links, isLoading }: LinkTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal states
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [analyticsLink, setAnalyticsLink] = useState<{ id: string; slug: string } | null>(null);

  const deleteLink = useMutation(api.links.deleteLink);

  const handleCopy = (id: string, shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this shortened link and all of its analytics?")) return;
    setDeletingId(id);
    try {
      await deleteLink({ id });
    } catch (err) {
      alert("Failed to delete link: " + (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const getShortUrl = (slug: string) => {
    const convexUrl = import.meta.env.VITE_CONVEX_URL || "";
    const redirectBase = convexUrl.replace(".convex.cloud", ".convex.site");
    return `${redirectBase}/${slug}`;
  };

  const checkExpired = (link: any) => {
    if (link.expired) return true;
    if (link.expiresAt && Date.now() > link.expiresAt) return true;
    return false;
  };

  // Filter & Search Logic
  const filteredLinks = links.filter((link) => {
    const shortUrl = getShortUrl(link.slug);
    const matchesSearch = 
      link.slug.toLowerCase().includes(search.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
      shortUrl.toLowerCase().includes(search.toLowerCase());

    const isExpired = checkExpired(link);
    if (filter === "active") return matchesSearch && !isExpired;
    if (filter === "expired") return matchesSearch && isExpired;
    return matchesSearch;
  });

  return (
    <div className="w-full space-y-4">
      {/* Search and Filters Controls */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search links by slug or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm font-medium"
          />
        </div>

        {/* Filter Status */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "all" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "active" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("expired")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "expired" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 border-b border-slate-850 text-xs font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Short URL</th>
                <th className="px-6 py-4">Original URL</th>
                <th className="px-6 py-4">Clicks</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                      <span>Loading your links...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No shortened links found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLinks.map((link) => {
                  const shortUrl = getShortUrl(link.slug);
                  const isExpired = checkExpired(link);
                  
                  return (
                    <tr key={link._id} className="hover:bg-white/[0.02] transition">
                      {/* Short Link */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white tracking-wide">{link.slug}</span>
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-slate-300 transition"
                            title="Visit link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px] font-mono mt-0.5">{shortUrl}</div>
                      </td>

                      {/* Original URL */}
                      <td className="px-6 py-4">
                        <div className="max-w-[240px] truncate font-medium text-slate-300" title={link.originalUrl}>
                          {link.originalUrl}
                        </div>
                      </td>

                      {/* Clicks */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-200">
                        {link.clickCount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            <span>Expired</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleCopy(link._id, shortUrl)}
                            className={`p-2 rounded-lg border transition ${
                              copiedId === link._id 
                                ? "bg-emerald-600 border-emerald-500 text-white" 
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
                            }`}
                            title="Copy short link"
                          >
                            {copiedId === link._id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                          
                          <button
                            onClick={() => setQrUrl(shortUrl)}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                            title="QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setAnalyticsLink({ id: link._id, slug: link.slug })}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                            title="View analytics"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(link._id)}
                            disabled={deletingId === link._id}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-rose-400 hover:text-white hover:bg-rose-600 transition disabled:opacity-50"
                            title="Delete link"
                          >
                            {deletingId === link._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Customization Modal */}
      {qrUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-sm w-full animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setQrUrl(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1.5 hover:bg-slate-800 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            <QRCodeDisplay url={qrUrl} />
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-850 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                  <BarChart3 className="h-5.5 w-5.5 text-brand-500" />
                  <span>Analytics for: /{analyticsLink.slug}</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Real-time stats from clicks on this link</p>
              </div>
              <button
                onClick={() => setAnalyticsLink(null)}
                className="text-slate-400 hover:text-white transition p-1.5 hover:bg-slate-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <AnalyticsDashboard linkId={analyticsLink.id as any} />
          </div>
        </div>
      )}
    </div>
  );
}
