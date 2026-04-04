import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Users, Activity, TrendingUp, ArrowLeft, Search, X, Zap, Flame, BookOpen, Star } from 'lucide-react';

const ADMIN_EMAIL = 'weareallforyou12345@gmail.com';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
}

interface UserProgress {
  user_id: string;
  total_xp: number;
  current_level: number;
  daily_streak: number;
  last_activity_date: string;
  grade_level: number | null;
  achievements: string[] | null;
  created_at: string;
}

interface ActivityCount { value: string; count: number; }
interface UserActivitySummary {
  page_visits: ActivityCount[];
  practice_categories: ActivityCount[];
}

interface AdminUser {
  user_id: string;
  name: string;
  email: string | null;
  grade_level: number | null;
  joined_at: string;
  last_active_at: string;
  xp: number;
  level: number;
  streak: number;
  activity: UserActivitySummary;
}

const formatDate = (iso: string) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const timeAgo = (iso: string) => {
  if (!iso) return 'N/A';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

const isActiveToday = (iso: string) => {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
};

const isActiveThisWeek = (iso: string) => {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 7 * 86400000;
};

const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const LEVEL_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#a855f7',
];
const getLevelColor = (level: number) => LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length];

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard', learn: 'Learn', practice: 'Practice',
  abacus: 'Abacus', solver: 'Solver', profile: 'Profile',
  videos: 'Videos', sutras: 'Sutras', about: 'About',
};

const CAT_LABELS: Record<string, string> = {
  vedic: 'Vedic Math', finger: 'Finger Math', brain: 'Brain Dev',
};

const CAT_COLORS: Record<string, string> = {
  vedic: '#f59e0b', finger: '#6366f1', brain: '#10b981',
};

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl p-5 flex flex-col gap-3"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
    </div>
  </motion.div>
);

// ── User Card ───────────────────────────────────────────────────────────────
const UserCard = ({ user, index, onClick }: { user: AdminUser; index: number; onClick: () => void }) => {
  const color = getLevelColor(user.level);
  const active = isActiveToday(user.last_active_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer group transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      whileHover={{ scale: 1.02, borderColor: `${color}44` }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${color}cc, ${color}66)` }}
          >
            {getInitials(user.name)}
          </div>
          {active && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2"
              style={{ borderColor: '#0f1117' }} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{user.name}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {user.email || 'No email'}
          </p>
        </div>

        {/* Level badge */}
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: `${color}22`, color }}
        >
          Lv.{user.level}
        </span>
      </div>

      {/* Stats row */}
      <div className="mt-3 pt-3 flex items-center gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3" style={{ color: '#f59e0b' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{user.xp} XP</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3" style={{ color: '#ef4444' }} />
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{user.streak}</span>
        </div>
        <div className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {timeAgo(user.last_active_at)}
        </div>
      </div>

      <div className="mt-2 text-xs flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
        <BookOpen className="w-3 h-3" />
        <span>Joined {formatDate(user.joined_at)}</span>
      </div>
    </motion.div>
  );
};

// ── Bar Row ─────────────────────────────────────────────────────────────────
const BarRow = ({ label, count, max, color }: { label: string; count: number; max: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1.5">
      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.35)' }}>{count}×</span>
    </div>
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(count / max) * 100}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== ADMIN_EMAIL) {
        navigate('/');
        return;
      }
      await fetchAllData();
    };
    init();
  }, []);

  const fetchAllData = async () => {
    setError(null);
    const [profilesRes, progressRes, activityRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, role, created_at'),
      supabase.from('student_profiles').select('user_id, total_xp, current_level, daily_streak, last_activity_date, grade_level, achievements, created_at'),
      supabase.from('user_activity_log').select('user_id, activity_type, activity_value'),
    ]);

    if (profilesRes.error) { setError(`Profiles error: ${profilesRes.error.message}`); setLoading(false); return; }

    const profiles: UserProfile[] = profilesRes.data || [];
    const progress: UserProgress[] = progressRes.data || [];
    const activityRows = activityRes.data || [];

    const activityMap: Record<string, UserActivitySummary> = {};
    for (const row of activityRows) {
      if (!activityMap[row.user_id]) activityMap[row.user_id] = { page_visits: [], practice_categories: [] };
      const key = row.activity_type === 'page_visit' ? 'page_visits' : 'practice_categories';
      const existing = activityMap[row.user_id][key].find(x => x.value === row.activity_value);
      if (existing) existing.count++;
      else activityMap[row.user_id][key].push({ value: row.activity_value, count: 1 });
    }

    const combined: AdminUser[] = profiles.map(p => {
      const prog = progress.find(x => x.user_id === p.id);
      return {
        user_id: p.id,
        name: p.full_name || 'Unknown',
        email: p.email,
        grade_level: prog?.grade_level || null,
        joined_at: prog?.created_at || p.created_at,
        last_active_at: prog?.last_activity_date || p.created_at,
        xp: prog?.total_xp || 0,
        level: prog?.current_level || 1,
        streak: prog?.daily_streak || 0,
        activity: activityMap[p.id] || { page_visits: [], practice_categories: [] },
      };
    });

    combined.sort((a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime());
    setUsers(combined);
    setLoading(false);
  };

  const filtered = useMemo(() =>
    users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  const activeToday = users.filter(u => isActiveToday(u.last_active_at)).length;
  const activeWeek = users.filter(u => isActiveThisWeek(u.last_active_at)).length;

  const bg = '#0b0d12';
  const card = 'rgba(255,255,255,0.04)';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Top bar */}
      <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Admin Dashboard</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Vedic Math — Control Center</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-5xl mx-auto">
        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
            ⚠️ {error} — Check Supabase RLS policies.
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Users} label="Total Users" value={users.length} color="#6366f1" />
          <StatCard icon={Activity} label="Active Today" value={activeToday} color="#10b981" />
          <StatCard icon={TrendingUp} label="This Week" value={activeWeek} color="#f59e0b" />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-xl pl-10 pr-10 py-2.5 text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
            </button>
          )}
        </div>

        {/* Users heading */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            All Users
          </p>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
            {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
          </span>
        </div>

        {/* User grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? 'No users match your search' : 'No users found — check RLS policies'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((user, i) => (
              <UserCard key={user.user_id} user={user} index={i} onClick={() => setSelectedUser(user)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={open => !open && setSelectedUser(null)}>
        <SheetContent
          className="overflow-y-auto border-0 p-0"
          style={{ background: '#13151c', borderLeft: '1px solid rgba(255,255,255,0.08)' }}
        >
          {selectedUser && (() => {
            const color = getLevelColor(selectedUser.level);
            const maxPage = Math.max(...selectedUser.activity.page_visits.map(x => x.count), 1);
            const maxCat = Math.max(...selectedUser.activity.practice_categories.map(x => x.count), 1);
            return (
              <div>
                {/* Header gradient */}
                <div className="px-5 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${color}18, transparent)` }}>
                  <SheetHeader>
                    <SheetTitle className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
                      >
                        {getInitials(selectedUser.name)}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold text-lg leading-tight">{selectedUser.name}</p>
                        <p className="text-xs mt-1 font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {selectedUser.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: `${color}22`, color }}>Level {selectedUser.level}</span>
                          {isActiveToday(selectedUser.last_active_at) && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>● Active today</span>
                          )}
                        </div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                </div>

                <div className="px-5 pb-8 space-y-5">
                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Zap, label: 'XP', value: selectedUser.xp, color: '#f59e0b' },
                      { icon: Flame, label: 'Streak', value: selectedUser.streak, color: '#ef4444' },
                      { icon: Star, label: 'Grade', value: selectedUser.grade_level ?? '—', color: '#8b5cf6' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3 text-center"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                        <p className="font-bold text-white text-base">{s.value}</p>
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Timeline info */}
                  <div className="rounded-xl p-4 space-y-2.5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>Timeline</p>
                    {[
                      ['Joined', formatDate(selectedUser.joined_at)],
                      ['Last Active', timeAgo(selectedUser.last_active_at)],
                      ['Last Date', formatDate(selectedUser.last_active_at)],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between items-center text-sm">
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</span>
                        <span className="font-semibold text-white">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pages Visited */}
                  <div className="rounded-xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>Pages Visited</p>
                    {selectedUser.activity.page_visits.length === 0 ? (
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>No visits recorded yet</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedUser.activity.page_visits
                          .sort((a, b) => b.count - a.count)
                          .map(({ value, count }) => (
                            <BarRow key={value} label={PAGE_LABELS[value] || value} count={count} max={maxPage} color="#6366f1" />
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Practice Categories */}
                  <div className="rounded-xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>Practice Categories</p>
                    {selectedUser.activity.practice_categories.length === 0 ? (
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>No practice recorded yet</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedUser.activity.practice_categories
                          .sort((a, b) => b.count - a.count)
                          .map(({ value, count }) => (
                            <BarRow key={value} label={CAT_LABELS[value] || value} count={count} max={maxCat}
                              color={CAT_COLORS[value] || '#6366f1'} />
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminPage;
