import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { fetchPracticeHistory, type PracticeHistory } from '@/lib/fetchHistory';
import { LogOut, UserPlus, KeyRound, X, Zap, Flame, Target, Star, BookOpen, Brain, Calculator, TrendingUp, CheckCircle, XCircle, Users, Calendar, Clock, GraduationCap, Trophy } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChildProfile {
  student_id: string;
  name: string;
  email: string;
  grade_level: number | null;
  xp: number;
  level: number;
  streak: number;
  last_active_at: string | null;
  last_logout_at: string | null;
  joined_at: string;
  achievements: string[];
}

interface WeeklyDay { day: string; date: string; active: number; count: number; dateLabel: string; }

const timeAgo = (iso: string | null) => {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

const formatDate = (iso: string | null) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (iso: string | null) => {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const CAT_LABELS: Record<string, string> = {
  vedic: 'Vedic Math', finger: 'Finger Math', brain: 'Brain Dev',
};
const CAT_ICONS: Record<string, React.ElementType> = {
  vedic: Calculator, finger: Brain, brain: Star,
};
const CAT_COLORS: Record<string, string> = {
  vedic: 'text-primary', finger: 'text-secondary', brain: 'text-accent',
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [parentId, setParentId] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childHistory, setChildHistory] = useState<PracticeHistory | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyDay[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addCode, setAddCode] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth', { replace: true }); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'parent') { navigate('/', { replace: true }); return; }
      setParentId(session.user.id);
    };
    init();
  }, [navigate]);

  const fetchChildren = useCallback(async (pid: string) => {
    setLoading(true);
    const { data: links } = await supabase
      .from('parent_child_links')
      .select('student_id')
      .eq('parent_id', pid);

    if (!links || links.length === 0) { setChildren([]); setLoading(false); return; }

    const ids = links.map(l => l.student_id);
    const [profilesRes, progressRes, activityRes] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email').in('id', ids),
      supabase.from('student_profiles').select('user_id, total_xp, current_level, daily_streak, last_activity_date, created_at, grade_level, achievements').in('user_id', ids),
      // fetch last logout per student
      supabase.from('user_activity_log')
        .select('user_id, activity_value, created_at')
        .in('user_id', ids)
        .eq('activity_type', 'logout')
        .order('created_at', { ascending: false }),
    ]);

    // last logout per user
    const lastLogout: Record<string, string> = {};
    for (const row of activityRes.data || []) {
      if (!lastLogout[row.user_id]) lastLogout[row.user_id] = row.created_at as string;
    }

    const combined: ChildProfile[] = ids.map(sid => {
      const prof = profilesRes.data?.find(p => p.id === sid);
      const prog = progressRes.data?.find(p => p.user_id === sid);
      return {
        student_id: sid,
        name: prof?.full_name || 'Student',
        email: prof?.email || '',
        grade_level: prog?.grade_level ?? null,
        xp: prog?.total_xp ?? 0,
        level: prog?.current_level ?? 1,
        streak: prog?.daily_streak ?? 0,
        last_active_at: prog?.last_activity_date ?? null,
        last_logout_at: lastLogout[sid] ?? null,
        joined_at: prog?.created_at ?? '',
        achievements: prog?.achievements || [],
      };
    });
    setChildren(combined);
    if (combined.length > 0 && !selectedChildId) setSelectedChildId(combined[0].student_id);
    setLoading(false);
  }, [selectedChildId]);

  useEffect(() => {
    if (parentId) fetchChildren(parentId);
  }, [parentId]);

  useEffect(() => {
    if (!selectedChildId) return;
    setChildHistory(null);
    setHistoryLoading(true);
    fetchPracticeHistory(selectedChildId).then(h => { setChildHistory(h); setHistoryLoading(false); });

    const past7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    supabase.from('user_activity_log')
      .select('created_at')
      .eq('user_id', selectedChildId)
      .then(({ data }) => {
        const countByDay: Record<string, number> = {};
        for (const r of data || []) {
          const day = (r.created_at as string).split('T')[0];
          countByDay[day] = (countByDay[day] || 0) + 1;
        }
        setWeeklyData(past7.map(date => {
          const d = new Date(date + 'T00:00:00');
          return {
            day: d.toLocaleDateString('en', { weekday: 'short' }),
            dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            date,
            count: countByDay[date] || 0,
            active: countByDay[date] ? 1 : 0,
          };
        }));
      });
  }, [selectedChildId]);

  const handleAddChild = async () => {
    if (!parentId || addCode.length < 6) return;
    setAddLoading(true);
    setAddError('');
    const code = addCode.trim().toUpperCase();
    const now = new Date().toISOString();
    const { data: invite, error } = await supabase
      .from('parent_invites')
      .select('id, student_id')
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', now)
      .single();

    if (error || !invite) {
      setAddError('Invalid or expired code. Ask your child to generate a new one from their Profile page.');
      setAddLoading(false);
      return;
    }
    const { data: existing } = await supabase
      .from('parent_child_links')
      .select('id')
      .eq('parent_id', parentId)
      .eq('student_id', invite.student_id)
      .single();
    if (!existing) {
      await supabase.from('parent_child_links').insert({ parent_id: parentId, student_id: invite.student_id });
    }
    await supabase.from('parent_invites').update({ used: true }).eq('id', invite.id);
    setShowAddDialog(false);
    setAddCode('');
    setAddError('');
    setSelectedChildId(invite.student_id);
    await fetchChildren(parentId);
    setAddLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const selectedChild = children.find(c => c.student_id === selectedChildId);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground font-body">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <div className="h-[60px] md:h-[70px] bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-2xl mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <img src="/brand_logo.png" alt="Logo" className="h-[44px] w-auto object-contain" />
            <div>
              <h1 className="font-display font-bold text-sm text-foreground leading-tight">Parent Dashboard</h1>
              <p className="text-[11px] text-muted-foreground">Monitor your child's progress</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* No children state */}
        {children.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-5"
          >
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto shadow-warm">
              <Users className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl">No children linked yet</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">Ask your child to open their Profile page and tap "Generate Code", then enter that code below.</p>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center gap-2 gradient-primary text-primary-foreground font-display font-bold px-6 py-3 rounded-xl shadow-warm text-sm"
            >
              <KeyRound className="w-4 h-4" /> Enter Child's Code
            </button>
          </motion.div>
        )}

        {children.length > 0 && (
          <>
            {/* Child Selector */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="font-display font-bold text-xs text-muted-foreground tracking-wider">MY CHILDREN</h2>
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-full"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add Child
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {children.map(child => (
                  <button
                    key={child.student_id}
                    onClick={() => setSelectedChildId(child.student_id)}
                    className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-2 transition-all ${
                      selectedChildId === child.student_id
                        ? 'gradient-primary text-primary-foreground border-transparent shadow-warm'
                        : 'bg-card border-border text-foreground hover:border-primary/30'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0 ${
                      selectedChildId === child.student_id ? 'bg-white/25 text-white' : 'gradient-primary text-white'
                    }`}>
                      {getInitials(child.name)}
                    </div>
                    <div className="text-left">
                      <p className="font-display font-bold text-sm leading-tight">{child.name}</p>
                      <p className={`text-[11px] ${selectedChildId === child.student_id ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {child.grade_level ? `Class ${child.grade_level}` : 'Student'} · Lvl {child.level}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Child */}
            <AnimatePresence mode="wait">
              {selectedChild && (
                <motion.div
                  key={selectedChildId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Profile Hero Card */}
                  <div className="gradient-hero rounded-2xl p-5 text-primary-foreground relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -left-4 -bottom-6 w-20 h-20 rounded-full bg-white/5" />
                    <div className="flex items-start gap-4 relative">
                      <div className="w-16 h-16 gradient-warm rounded-2xl flex items-center justify-center border-4 border-white/30 shadow-lg font-display font-bold text-2xl text-white flex-shrink-0">
                        {getInitials(selectedChild.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-xl leading-tight">{selectedChild.name}</h3>
                        <p className="text-sm opacity-80 mt-0.5">
                          {selectedChild.grade_level ? `Class ${selectedChild.grade_level} · ` : ''}Level {selectedChild.level}
                        </p>
                        <p className="text-[11px] opacity-60 mt-0.5 truncate">{selectedChild.email}</p>
                      </div>
                    </div>

                    {/* Info Row */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <Calendar className="w-3 h-3 opacity-70" />
                          <span className="text-[10px] opacity-70">Joined</span>
                        </div>
                        <p className="text-xs font-bold">{formatDate(selectedChild.joined_at)}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <Clock className="w-3 h-3 opacity-70" />
                          <span className="text-[10px] opacity-70">Last Active</span>
                        </div>
                        <p className="text-xs font-bold">{timeAgo(selectedChild.last_active_at)}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <LogOut className="w-3 h-3 opacity-70" />
                          <span className="text-[10px] opacity-70">Last Logout</span>
                        </div>
                        <p className="text-xs font-bold">{selectedChild.last_logout_at ? formatDateTime(selectedChild.last_logout_at) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { icon: Zap, label: 'Total XP', value: selectedChild.xp.toLocaleString(), color: 'text-xp', bg: 'bg-xp/10' },
                      { icon: Flame, label: 'Streak', value: `${selectedChild.streak} 🔥`, color: 'text-streak', bg: 'bg-streak/10' },
                      { icon: Target, label: 'Accuracy', value: childHistory ? `${childHistory.accuracy}%` : '—', color: 'text-level', bg: 'bg-level/10' },
                      { icon: BookOpen, label: 'Problems', value: childHistory ? childHistory.total.toLocaleString() : '—', color: 'text-secondary', bg: 'bg-secondary/10' },
                    ].map((stat, i) => (
                      <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="bg-card rounded-2xl p-3.5 shadow-card text-center border-2 border-border">
                        <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                          <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                        </div>
                        <p className="font-display font-bold text-xl">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Achievements */}
                  {selectedChild.achievements.length > 0 && (
                    <div className="bg-card rounded-2xl p-4 border-2 border-border shadow-card">
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-4 h-4 text-xp" />
                        <p className="font-display font-bold text-sm">Achievements</p>
                        <span className="ml-auto text-xs text-muted-foreground">{selectedChild.achievements.length} earned</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedChild.achievements.map(badge => (
                          <span key={badge} className="text-sm bg-xp/10 text-xp px-2.5 py-1 rounded-full font-medium">{badge}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weekly Activity */}
                  <div className="bg-card rounded-2xl p-4 border-2 border-border shadow-card">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <p className="font-display font-bold text-sm">Weekly Activity</p>
                      <span className="ml-auto text-[11px] text-muted-foreground">{weeklyData.filter(d => d.active).length}/7 days active</span>
                    </div>
                    {/* Bar chart */}
                    <div className="flex items-end justify-between gap-1 h-24 mb-2">
                      {weeklyData.map((d, i) => {
                        const maxCount = Math.max(...weeklyData.map(x => x.count), 1);
                        const heightPct = d.count > 0 ? Math.max(20, Math.round((d.count / maxCount) * 100)) : 8;
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-0.5 h-full">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPct}%` }}
                              transition={{ delay: i * 0.07, duration: 0.45, ease: 'easeOut' }}
                              className={`w-full rounded-t-md ${d.active ? 'gradient-primary' : 'bg-muted'}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Day + date labels */}
                    <div className="flex justify-between gap-1">
                      {weeklyData.map(d => (
                        <div key={d.date} className="flex-1 text-center">
                          <p className={`text-[10px] font-bold leading-tight ${d.active ? 'text-primary' : 'text-muted-foreground'}`}>{d.day}</p>
                          <p className="text-[9px] text-muted-foreground leading-tight">{d.dateLabel}</p>
                        </div>
                      ))}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm gradient-primary" />
                        <span className="text-[10px] text-muted-foreground">Active day</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-muted" />
                        <span className="text-[10px] text-muted-foreground">Inactive</span>
                      </div>
                      <span className="ml-auto text-[10px] text-muted-foreground">Bar height = activity count</span>
                    </div>
                  </div>

                  {/* Practice History */}
                  {historyLoading && (
                    <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-card text-center">
                      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                      <p className="text-xs text-muted-foreground mt-2">Loading practice history…</p>
                    </div>
                  )}

                  {childHistory && !historyLoading && (
                    <div className="bg-card rounded-2xl p-4 border-2 border-border shadow-card">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <p className="font-display font-bold text-sm">Practice History</p>
                      </div>

                      {/* Overall Stats */}
                      <div className="grid grid-cols-4 gap-2 bg-muted rounded-xl p-3 mb-4">
                        {[
                          { label: 'Total', value: childHistory.total, color: 'text-foreground' },
                          { label: 'Correct', value: childHistory.totalCorrect, color: 'text-level' },
                          { label: 'Wrong', value: childHistory.totalWrong, color: 'text-destructive' },
                          { label: 'Accuracy', value: `${childHistory.accuracy}%`, color: 'text-primary' },
                        ].map(s => (
                          <div key={s.label} className="text-center">
                            <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] text-muted-foreground">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Per Category */}
                      {childHistory.categoryStats.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">No practice sessions yet</p>
                      ) : (
                        <div className="space-y-3">
                          {childHistory.categoryStats.map(stat => {
                            const Icon = CAT_ICONS[stat.category] || BookOpen;
                            const color = CAT_COLORS[stat.category] || 'text-primary';
                            return (
                              <div key={stat.category} className="bg-muted/50 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg bg-card flex items-center justify-center`}>
                                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                                    </div>
                                    <span className="text-sm font-display font-bold">{stat.label}</span>
                                  </div>
                                  <span className={`text-sm font-bold ${color}`}>{stat.accuracy}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stat.accuracy}%` }}
                                    transition={{ duration: 0.6 }}
                                    className="h-full gradient-primary rounded-full"
                                  />
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                  <span className="flex items-center gap-1 text-level font-medium"><CheckCircle className="w-3 h-3" />{stat.correct} correct</span>
                                  <span className="flex items-center gap-1 text-destructive font-medium"><XCircle className="w-3 h-3" />{stat.wrong} wrong</span>
                                  <span className="ml-auto">{stat.total} total</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer info */}
                  <div className="bg-card rounded-xl p-3 border-2 border-border flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{selectedChild.name}</span> joined on {formatDate(selectedChild.joined_at)} · {selectedChild.email}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Add Child Dialog */}
      <AnimatePresence>
        {showAddDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
            onClick={e => { if (e.target === e.currentTarget) { setShowAddDialog(false); setAddCode(''); setAddError(''); } }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl w-full max-w-sm shadow-elevated border-2 border-border overflow-hidden"
            >
              {/* Dialog Header */}
              <div className="gradient-hero px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-white">Add Another Child</h3>
                  <p className="text-[11px] text-white/70 mt-0.5">Link a new child's account</p>
                </div>
                <button
                  onClick={() => { setShowAddDialog(false); setAddCode(''); setAddError(''); }}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Dialog Body */}
              <div className="p-5 space-y-4">
                <div className="bg-secondary/10 border border-secondary/20 rounded-xl px-3 py-2.5 text-xs text-secondary font-medium">
                  📱 Ask your child to open their <strong>Profile page</strong> → tap <strong>"Generate Code"</strong> → share the 6-digit code with you
                </div>

                <div>
                  <label className="text-sm font-display font-semibold block mb-2">Child's 6-digit Code</label>
                  <Input
                    value={addCode}
                    onChange={e => {
                      const val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
                      setAddCode(val);
                      setAddError('');
                    }}
                    placeholder="A 3 K 9 P 2"
                    className="h-14 rounded-xl font-mono tracking-[0.4em] text-center text-xl uppercase border-2 focus:border-primary"
                    maxLength={6}
                  />
                  {addError && (
                    <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> {addError}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1.5">Code is valid for 3 minutes only</p>
                </div>

                <Button
                  onClick={handleAddChild}
                  disabled={addLoading || addCode.length < 6}
                  className="w-full h-12 gradient-primary text-primary-foreground font-display font-bold rounded-xl shadow-warm border-0 text-base"
                >
                  {addLoading
                    ? <span className="animate-spin">⏳</span>
                    : <><KeyRound className="w-4 h-4 mr-2" />Link Child</>}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentDashboard;
