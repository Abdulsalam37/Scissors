import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Loader2, Globe, Monitor, Compass, MousePointerClick } from "lucide-react";

interface AnalyticsDashboardProps {
  linkId: Id<"links">;
}

export default function AnalyticsDashboard({ linkId }: AnalyticsDashboardProps) {
  const clicks = useQuery(api.clicks.getLinkClicks, { linkId });

  if (clicks === undefined) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500 mr-2" />
        <span>Aggregating analytics data...</span>
      </div>
    );
  }

  if (clicks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 glass-card rounded-xl border border-slate-800">
        <MousePointerClick className="h-12 w-12 text-slate-600 animate-bounce" />
        <h4 className="text-base font-bold text-white">No Click Data Yet</h4>
        <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
          Share this link and clicks will start appearing here in real-time.
        </p>
      </div>
    );
  }

  // 1. Process Clicks Over Time (Line Chart)
  // Group by date (local date string)
  const clicksByDateMap: Record<string, number> = {};
  clicks.forEach((click) => {
    const dateStr = new Date(click.timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    clicksByDateMap[dateStr] = (clicksByDateMap[dateStr] || 0) + 1;
  });

  const clicksOverTimeData = Object.entries(clicksByDateMap).map(([date, count]) => ({
    date,
    clicks: count,
  }));

  // 2. Process Referrers (Bar Chart)
  const referrersMap: Record<string, number> = {};
  clicks.forEach((click) => {
    const ref = click.referrer || "Direct";
    referrersMap[ref] = (referrersMap[ref] || 0) + 1;
  });

  const referrersData = Object.entries(referrersMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // top 5

  // 3. Process Devices (Pie Chart)
  const devicesMap: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
  clicks.forEach((click) => {
    const dev = click.device || "Desktop";
    devicesMap[dev] = (devicesMap[dev] || 0) + 1;
  });

  const devicesData = Object.entries(devicesMap)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const DEVICE_COLORS = {
    Mobile: "#0ea5e9",  // Sky
    Desktop: "#6366f1", // Indigo
    Tablet: "#8b5cf6",  // Violet
  };

  // 4. Summaries (Total, Top Country, Top Device, Top Referrer)
  const totalClicks = clicks.length;

  const getTopItem = (map: Record<string, number>): string => {
    let topName = "N/A";
    let maxVal = -1;
    Object.entries(map).forEach(([name, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topName = name;
      }
    });
    return topName;
  };

  const countriesMap: Record<string, number> = {};
  clicks.forEach((click) => {
    countriesMap[click.country] = (countriesMap[click.country] || 0) + 1;
  });

  const topCountry = getTopItem(countriesMap);
  const topDevice = getTopItem(devicesMap);
  const topReferrer = getTopItem(referrersMap);

  return (
    <div className="space-y-6">
      {/* Cards summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clicks */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-center space-x-3.5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
            <MousePointerClick className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Clicks</span>
            <span className="text-lg font-bold text-white font-mono">{totalClicks}</span>
          </div>
        </div>

        {/* Top Country */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-center space-x-3.5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Globe className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Top Country</span>
            <span className="text-base font-bold text-white truncate max-w-[110px] block">{topCountry}</span>
          </div>
        </div>

        {/* Top Referrer */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-center space-x-3.5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent-violet/10 text-accent-violet">
            <Compass className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Top Referrer</span>
            <span className="text-base font-bold text-white truncate max-w-[110px] block">{topReferrer}</span>
          </div>
        </div>

        {/* Top Device */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-center space-x-3.5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <Monitor className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Top Device</span>
            <span className="text-base font-bold text-white block">{topDevice}</span>
          </div>
        </div>
      </div>

      {/* Chart Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Clicks over Time */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/60 border border-slate-850 flex flex-col space-y-4">
          <h4 className="text-sm font-bold text-slate-200 tracking-wide">Clicks Over Time</h4>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clicksOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: "#6366f1", strokeWidth: 2, fill: "#0f172a" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Devices */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-850 flex flex-col space-y-4">
          <h4 className="text-sm font-bold text-slate-200 tracking-wide">Devices Breakdown</h4>
          <div className="w-full h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={devicesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {devicesData.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={DEVICE_COLORS[entry.name as keyof typeof DEVICE_COLORS] || "#cbd5e1"} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-300 font-semibold">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Referrers */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-850 flex flex-col space-y-4">
          <h4 className="text-sm font-bold text-slate-200 tracking-wide">Top Referrers</h4>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={referrersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                  {referrersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#8b5cf6" : index === 1 ? "#6366f1" : "#0ea5e9"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
