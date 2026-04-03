import { useEffect, useState, useCallback } from "react";
import {
  UserCog, Bell, Activity,
  TrendingUp, Clock, RefreshCw, AlertTriangle, CheckCircle,
  XCircle, WifiOff, User, Glasses, Wifi,
  Mail, MapPin,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN = () => localStorage.getItem("access_token") || "";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN()}`,
});

const BRAND      = "#11285A";
const BRAND_SOFT = "rgba(17,40,90,0.06)";
const BRAND_MID  = "rgba(17,40,90,0.07)";

const C = {
  text:   "#1F2937",
  sub:    "#6B7280",
  border: "#e5e7eb",
  white:  "#ffffff",
  bg:     "#f4f6fb",
  red:    "#dc2626",
  amber:  "#d97706",
  green:  "#16a34a",
};

// Chart color sets — shades of #11285A
const BRAND_SHADES = ["#11285A", "#1a3d7c", "#2352a0", "#3d6fbf", "#6e96d4", "#a8c0e8"];
const PIE_ADMIN  = ["#93b4e8", "#c4d8f5"];
const PIE_DEVICE = ["#6ee7b7", "#fcd34d", "#fca5a5"];
const PIE_INVITE = ["#fcd34d", "#6ee7b7", "#fca5a5", "#d1d5db"];

function ago(ts) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function getTodayLabel() {
  const now = new Date();
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  return {
    day:  days[now.getDay()],
    date: `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`,
  };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function activityColor(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("error") || t.includes("fail")) return C.red;
  if (t.includes("warn"))  return C.amber;
  if (t.includes("success") || t.includes("connect") || t.includes("pair")) return C.green;
  return BRAND;
}

function activityIcon(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("error") || t.includes("fail")) return <XCircle size={14} />;
  if (t.includes("warn"))  return <AlertTriangle size={14} />;
  if (t.includes("success") || t.includes("connect") || t.includes("pair")) return <CheckCircle size={14} />;
  return <Activity size={14} />;
}

function buildPairedByMonth(devices) {
  const counts = {};
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  devices.forEach(d => {
    if (d.is_paired && d.paired_at) {
      const dt  = new Date(d.paired_at);
      const key = `${months[dt.getMonth()]} ${dt.getFullYear()}`;
      counts[key] = (counts[key] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      const parse = l => { const [mo, yr] = l.split(" "); return new Date(`${mo} 1, ${yr}`); };
      return parse(a.label) - parse(b.label);
    });
}

function StatCard({ label, value, icon, loading, sub }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: "14px",
      padding: "20px 18px",
      boxShadow: "0 2px 14px rgba(17,40,90,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: "14px",
      border: `1px solid ${C.border}`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative corner blob */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "70px", height: "70px",
        borderRadius: "0 14px 0 70px",
        background: BRAND_MID,
      }} />

      {/* Icon — white bg with brand-colored icon */}
      <div style={{
        width: "42px", height: "42px", borderRadius: "10px",
        background: C.white,
        border: `1.5px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(17,40,90,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1, flexShrink: 0,
        color: BRAND,
      }}>
        {icon}
      </div>

      {/* Value + label */}
      <div style={{ zIndex: 1 }}>
        {loading
          ? <div style={{ height: "28px", width: "56px", borderRadius: "6px", background: BRAND_SOFT, animation: "pulse 1.5s infinite" }} />
          : <div style={{ fontSize: "26px", fontWeight: 800, color: C.text, letterSpacing: "-1px", lineHeight: 1 }}>
              {value ?? "—"}
            </div>
        }
        <div style={{ fontSize: "11px", color: C.sub, marginTop: "5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: "11px", color: C.sub, marginTop: "2px" }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children, action }) {
  return (
    <div style={{
      background: C.white, borderRadius: "14px",
      padding: "22px 24px",
      boxShadow: "0 2px 14px rgba(17,40,90,0.08)",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: BRAND, display: "flex" }}>{icon}</span>
          <h3 style={{ margin: 0, color: C.text, fontSize: "14px", fontWeight: 700 }}>{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`,
      borderRadius: "8px", padding: "10px 14px",
      boxShadow: "0 4px 12px rgba(17,40,90,0.12)", fontSize: "13px",
    }}>
      {label && <div style={{ color: C.sub, marginBottom: "4px" }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || BRAND, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div style={{
      height: "160px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "8px",
      color: C.sub, fontSize: "13px",
    }}>
      <WifiOff size={28} color={C.border} />
      {label}
    </div>
  );
}

export default function Dashboard() {
  const firstName = localStorage.getItem("first_name") || "Admin";
  const lastName  = localStorage.getItem("last_name")  || "";
  const role      = localStorage.getItem("role")        || "";
  const fullName  = [firstName, lastName].filter(Boolean).join(" ");
  const roleLabel = role === "super_admin" ? "Super Admin" : "Admin";
  const { day, date } = getTodayLabel();

  const [loading, setLoading]                 = useState(true);
  const [lastRefresh, setLastRefresh]         = useState(null);
  const [stats, setStats]                     = useState({});
  const [adminBreakdown, setAdminBreakdown]   = useState([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState([]);
  const [inviteBreakdown, setInviteBreakdown] = useState([]);
  const [recentLogs, setRecentLogs]           = useState([]);
  const [logFilter, setLogFilter]             = useState("all");
  const [activityTypes, setActivityTypes]     = useState([]);
  const [overviewBar, setOverviewBar]         = useState([]);
  const [pairedByMonth, setPairedByMonth]     = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetch(`${API_BASE}/api/admin/`,                { headers: authHeaders() }),
        fetch(`${API_BASE}/api/guardians/`,             { headers: authHeaders() }),
        fetch(`${API_BASE}/api/vips/`,                  { headers: authHeaders() }),
        fetch(`${API_BASE}/api/devices/`,               { headers: authHeaders() }),
        fetch(`${API_BASE}/api/devices/invitations/`,   { headers: authHeaders() }),
        fetch(`${API_BASE}/api/devices/logs/?limit=50`, { headers: authHeaders() }),
      ]);

      const [adminsRes, guardiansRes, vipsRes, devicesRes, invitesRes, logsRes] =
        results.map(r => r.status === "fulfilled" ? r.value : null);

      const admins      = adminsRes?.ok    ? await adminsRes.json()    : [];
      const guardians   = guardiansRes?.ok ? await guardiansRes.json() : [];
      const vips        = vipsRes?.ok      ? await vipsRes.json()      : [];
      const devices     = devicesRes?.ok   ? await devicesRes.json()   : [];
      const invitations = invitesRes?.ok   ? await invitesRes.json()   : [];
      const logsRaw     = logsRes?.ok      ? await logsRes.json()      : [];

      setAdminBreakdown([
        { name: "Super Admin", value: admins.filter(a => a.role === "super_admin").length },
        { name: "Admin",       value: admins.filter(a => a.role === "admin").length },
      ]);

      const now = Date.now();
      const ACTIVE_WINDOW = 24 * 60 * 60 * 1000;
      const activeDevices   = devices.filter(d => d.is_paired && d.last_active_at && (now - new Date(d.last_active_at).getTime()) < ACTIVE_WINDOW).length;
      const inactiveDevices = devices.filter(d => d.is_paired && (!d.last_active_at || (now - new Date(d.last_active_at).getTime()) >= ACTIVE_WINDOW)).length;
      const unpairedDevices = devices.filter(d => !d.is_paired).length;

      setDeviceBreakdown([
        { name: "Active (24h)", value: activeDevices   },
        { name: "Inactive",     value: inactiveDevices },
        { name: "Unpaired",     value: unpairedDevices },
      ]);

      setInviteBreakdown([
        { name: "Pending",  value: invitations.filter(i => i.status === "pending").length  },
        { name: "Accepted", value: invitations.filter(i => i.status === "accepted").length },
        { name: "Expired",  value: invitations.filter(i => i.status === "expired").length  },
        { name: "Revoked",  value: invitations.filter(i => i.status === "revoked").length  },
      ]);

      const logList = Array.isArray(logsRaw) ? logsRaw : (logsRaw.logs || logsRaw.data || []);
      setRecentLogs(logList.slice(0, 50));
      setActivityTypes([...new Set(logList.map(l => l.activity_type).filter(Boolean))]);

      // Compute pending admins (is_first_login === true)
      const pendingAdmins = admins.filter(a => a.is_first_login).length;

      setStats({
        totalGuardians: guardians.length,
        totalVIPs:      vips.length,
        totalAdmins:    admins.length,
        pendingAdmins,   // <-- new field
        totalDevices:   devices.length,
        activeDevices,
        pendingInvites: invitations.filter(i => i.status === "pending").length,
        totalLogs:      logList.length,
      });

      setOverviewBar([
        { label: "Guardians", count: guardians.length },
        { label: "VIPs",      count: vips.length      },
        { label: "Admins",    count: admins.length     },
        { label: "Devices",   count: devices.length    },
      ]);

      setPairedByMonth(buildPairedByMonth(devices));
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredLogs = logFilter === "all"
    ? recentLogs
    : recentLogs.filter(l => l.activity_type === logFilter);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#1F2937" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="700">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={{ fontFamily: "'Poppins', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .dash-row         { animation: fadeIn 0.35s ease both; }
        .log-row:hover    { background: ${BRAND_SOFT} !important; }
        .refresh-btn:hover { border-color: ${BRAND} !important; background: ${BRAND_SOFT} !important; }
        .filter-chip:hover { background: ${BRAND_SOFT} !important; }
      `}</style>

      <div className="dash-row" style={{
        background: C.white,
        borderRadius: "16px",
        padding: "26px 28px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 14px rgba(17,40,90,0.09)",
        border: `1px solid ${C.border}`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Left accent bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "5px", background: BRAND, borderRadius: "16px 0 0 16px",
        }} />

        {/* Left: greeting + name + role */}
        <div style={{ paddingLeft: "12px" }}>
          <p style={{ margin: "0 0 3px", fontSize: "13px", color: C.sub, fontWeight: 500 }}>
            {getGreeting()},
          </p>
          <h2 style={{ margin: "0 0 10px", fontSize: "22px", fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>
            {fullName} 
          </h2>
          <span style={{
            display: "inline-block", fontSize: "11px", fontWeight: 700,
            color: BRAND, background: BRAND_SOFT,
            borderRadius: "6px", padding: "4px 12px", letterSpacing: "0.5px",
            border: `1px solid ${BRAND_MID}`,
          }}>{roleLabel}</span>
        </div>

        {/* Right: day + date + refresh */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "26px", fontWeight: 800, color: C.text, letterSpacing: "-1px", lineHeight: 1 }}>
              {day}
            </div>
            <div style={{ fontSize: "13px", color: C.sub, marginTop: "4px", fontWeight: 500 }}>
              {date}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
            {lastRefresh && (
              <span style={{ fontSize: "11px", color: C.sub }}>
                Updated {ago(lastRefresh)}
              </span>
            )}
            <button
              className="refresh-btn"
              onClick={fetchAll}
              style={{
                border: `1px solid ${C.border}`,
                background: C.white,
                borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                color: BRAND, fontSize: "12px", fontWeight: 600,
                transition: "all 0.2s", fontFamily: "Poppins",
              }}>
              <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="dash-row" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
        gap: "14px", marginBottom: "24px",
        animationDelay: "0.05s",
      }}>
        <StatCard label="Total Guardians"  value={stats.totalGuardians}  loading={loading} icon={<User size={18} />}    sub="Registered guardians" />
        <StatCard label="Total VIPs"       value={stats.totalVIPs}       loading={loading} icon={<Glasses size={18} />} sub="VIP users" />
        <StatCard label="Total Admins"     value={stats.totalAdmins}     loading={loading} icon={<UserCog size={18} />} sub="Admins + Super Admins" />
        <StatCard label="Pending Admins"   value={stats.pendingAdmins}   loading={loading} icon={<Clock size={18} />}   sub="Awaiting setup" />
        <StatCard label="Total Devices"    value={stats.totalDevices}    loading={loading}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3c0 0 3 2 3 9s-3 9-3 9" /><path d="M9 21 L20 21" /><path d="M9 3 Q7 3 7 5" />
            </svg>
          }
          sub="All registered devices" />
        <StatCard label="Active Devices"   value={stats.activeDevices}   loading={loading} icon={<Wifi size={18} />}    sub="Active in last 24h" />
        <StatCard label="Pending Invites"  value={stats.pendingInvites}  loading={loading} icon={<Mail size={18} />}    sub="Guardian invitations" />
        <StatCard label="Total Log Events" value={stats.totalLogs}       loading={loading} icon={<MapPin size={18} />}  sub="Device log entries" />
      </div>

      <div className="dash-row" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: "16px", marginBottom: "24px", animationDelay: "0.1s",
      }}>
        <SectionCard title="Admin Roles" icon={<UserCog size={15} />}>
          {loading
            ? <div style={{ height: 200, background: BRAND_SOFT, borderRadius: 8, animation: "pulse 1.5s infinite" }} />
            : adminBreakdown.every(d => d.value === 0)
              ? <EmptyState label="No admin data" />
              : <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={adminBreakdown} cx="50%" cy="50%" outerRadius={72}
                      dataKey="value" labelLine={false} label={renderCustomLabel}>
                      {adminBreakdown.map((_, i) => <Cell key={i} fill={PIE_ADMIN[i % PIE_ADMIN.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={9}
                      formatter={v => <span style={{ fontSize: 12, color: C.text }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
          }
        </SectionCard>

        <SectionCard title="Device Status" icon={<Wifi size={15} />}>
          {loading
            ? <div style={{ height: 200, background: BRAND_SOFT, borderRadius: 8, animation: "pulse 1.5s infinite" }} />
            : deviceBreakdown.every(d => d.value === 0)
              ? <EmptyState label="No device data" />
              : <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deviceBreakdown} cx="50%" cy="50%" outerRadius={72}
                      dataKey="value" labelLine={false} label={renderCustomLabel}>
                      {deviceBreakdown.map((_, i) => <Cell key={i} fill={PIE_DEVICE[i % PIE_DEVICE.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={9}
                      formatter={v => <span style={{ fontSize: 12, color: C.text }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
          }
        </SectionCard>

        <SectionCard title="Guardian Invitations" icon={<Bell size={15} />}>
          {loading
            ? <div style={{ height: 200, background: BRAND_SOFT, borderRadius: 8, animation: "pulse 1.5s infinite" }} />
            : inviteBreakdown.every(d => d.value === 0)
              ? <EmptyState label="No invitation data" />
              : <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={inviteBreakdown} cx="50%" cy="50%" outerRadius={72}
                      dataKey="value" labelLine={false} label={renderCustomLabel}>
                      {inviteBreakdown.map((_, i) => <Cell key={i} fill={PIE_INVITE[i % PIE_INVITE.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={9}
                      formatter={v => <span style={{ fontSize: 12, color: C.text }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
          }
        </SectionCard>
      </div>

      <div className="dash-row" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "16px", marginBottom: "24px", animationDelay: "0.15s",
      }}>
        <SectionCard title="System Overview" icon={<TrendingUp size={15} />}>
          {loading
            ? <div style={{ height: 200, background: BRAND_SOFT, borderRadius: 8, animation: "pulse 1.5s infinite" }} />
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={overviewBar} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: C.sub, fontWeight: 500, fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.sub, fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: BRAND_SOFT }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Count">
                    {overviewBar.map((_, i) => <Cell key={i} fill={BRAND_SHADES[i % BRAND_SHADES.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </SectionCard>

        <SectionCard title="Devices Paired by Month" icon={<Activity size={15} />}>
          {loading
            ? <div style={{ height: 200, background: BRAND_SOFT, borderRadius: 8, animation: "pulse 1.5s infinite" }} />
            : pairedByMonth.length === 0
              ? <EmptyState label="No pairing data yet" />
              : <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={pairedByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.sub, fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.sub, fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone" dataKey="count" name="Paired Devices"
                      stroke={BRAND} strokeWidth={2.5}
                      dot={{ fill: BRAND, r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#1a3d7c" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
          }
        </SectionCard>
      </div>

      <div className="dash-row" style={{ animationDelay: "0.2s" }}>
        <SectionCard
          title="Recent Device Logs"
          icon={<Clock size={15} />}
          action={
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["all", ...activityTypes].map(type => (
                <button
                  key={type}
                  className="filter-chip"
                  onClick={() => setLogFilter(type)}
                  style={{
                    border: `1px solid ${logFilter === type ? BRAND : C.border}`,
                    background: logFilter === type ? BRAND_SOFT : C.white,
                    color: logFilter === type ? BRAND : C.sub,
                    borderRadius: "20px", padding: "3px 10px",
                    fontSize: "11px", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s", textTransform: "capitalize",
                    fontFamily: "Poppins",
                  }}>
                  {type === "all" ? "All" : type.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          }>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{ height: "44px", borderRadius: "8px", background: BRAND_SOFT, animation: "pulse 1.5s infinite", animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <EmptyState label="No logs found" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "360px", overflowY: "auto" }}>
              {filteredLogs.slice(0, 20).map((log, i) => {
                const color = activityColor(log.activity_type);
                return (
                  <div key={log.log_id || i} className="log-row" style={{
                    display: "grid", gridTemplateColumns: "28px 1fr auto",
                    alignItems: "center", gap: "10px",
                    padding: "10px", borderRadius: "8px",
                    borderBottom: i < filteredLogs.length - 1 ? `1px solid ${C.border}` : "none",
                    cursor: "default", transition: "background 0.15s",
                  }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "8px",
                      background: color + "18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color,
                    }}>
                      {activityIcon(log.activity_type)}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", color: C.text, fontWeight: 500, lineHeight: 1.3 }}>
                        {log.message || "—"}
                      </div>
                      <div style={{ fontSize: "11px", color: C.sub, marginTop: "2px", display: "flex", gap: "8px" }}>
                        <span style={{
                          background: color + "18", color, borderRadius: "4px",
                          padding: "1px 6px", fontWeight: 600, textTransform: "capitalize",
                        }}>
                          {(log.activity_type || "").replace(/_/g, " ")}
                        </span>
                        {log.device_id && <span>Device #{log.device_id}</span>}
                        {log.status && (
                          <span style={{ color: log.status === "success" ? C.green : C.sub }}>
                            {log.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: "11px", color: C.sub, whiteSpace: "nowrap" }}>
                      {ago(log.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}