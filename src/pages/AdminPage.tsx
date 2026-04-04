import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Users, Activity, TrendingUp, User, ArrowLeft } from 'lucide-react';

const ADMIN_EMAIL = 'weareallforyou12345@gmail.com';

interface UserProfile {
  user_id: string;
  display_name: string | null;
  class_grade: number | null;
  created_at: string;
}

interface UserProgress {
  user_id: string;
  xp: number;
  level: number;
  streak: number;
  total_problems: number;
  accuracy: number;
  joined_at: string;
  last_active_at: string;
}

interface ActivityCount {
  value: string;
  count: number;
}

interface UserActivitySummary {
  page_visits: ActivityCount[];
  practice_categories: ActivityCount[];
}

interface AdminUser {
  user_id: string;
  name: string;
  class_grade: number | null;
  joined_at: string;
  last_active_at: string;
  xp: number;
  level: number;
  streak: number;
  total_problems: number;
  accuracy: number;
  activity: UserActivitySummary;
}

const formatDate = (iso: string) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const timeAgo = (iso: string) => {
  if (!iso) return 'N/A';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard', learn: 'Learn', practice: 'Practice',
  abacus: 'Abacus', solver: 'Solver', profile: 'Profile',
  videos: 'Videos', sutras: 'Sutras', about: 'About',
};

const CAT_LABELS: Record<string, string> = {
  vedic: 'Vedic Math', finger: 'Finger Math', brain: 'Brain Dev',
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

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
    const [profilesRes, progressRes, activityRes] = await Promise.all([
      supabase.from('profiles').select('user_id, display_name, class_grade, created_at'),
      supabase.from('student_progress').select('user_id, xp, level, streak, total_problems, accuracy, joined_at, last_active_at'),
      supabase.from('user_activity_log').select('user_id, activity_type, activity_value'),
    ]);

    const profiles: UserProfile[] = profilesRes.data || [];
    const progress: UserProgress[] = progressRes.data || [];
    const activityRows = activityRes.data || [];

    // Build activity summary per user
    const activityMap: Record<string, UserActivitySummary> = {};
    for (const row of activityRows) {
      if (!activityMap[row.user_id]) {
        activityMap[row.user_id] = { page_visits: [], practice_categories: [] };
      }
      const key = row.activity_type === 'page_visit' ? 'page_visits' : 'practice_categories';
      const existing = activityMap[row.user_id][key].find(x => x.value === row.activity_value);
      if (existing) existing.count++;
      else activityMap[row.user_id][key].push({ value: row.activity_value, count: 1 });
    }

    // Join profiles + progress
    const combined: AdminUser[] = profiles.map(p => {
      const prog = progress.find(x => x.user_id === p.user_id);
      return {
        user_id: p.user_id,
        name: p.display_name || 'Unknown',
        class_grade: p.class_grade,
        joined_at: prog?.joined_at || p.created_at,
        last_active_at: prog?.last_active_at || p.created_at,
        xp: prog?.xp || 0,
        level: prog?.level || 1,
        streak: prog?.streak || 0,
        total_problems: prog?.total_problems || 0,
        accuracy: prog?.accuracy || 0,
        activity: activityMap[p.user_id] || { page_visits: [], practice_categories: [] },
      };
    });

    combined.sort((a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime());
    setUsers(combined);
    setLoading(false);
  };

  const today = new Date().toDateString();
  const activeToday = users.filter(u => u.last_active_at && new Date(u.last_active_at).toDateString() === today).length;
  const activeWeek = users.filter(u => {
    if (!u.last_active_at) return false;
    return Date.now() - new Date(u.last_active_at).getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-bold text-lg">Admin Dashboard</h1>
      </div>

      <div className="px-4 py-4 space-y-5 max-w-7xl mx-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: 'Total Users', value: users.length },
            { icon: Activity, label: 'Active Today', value: activeToday },
            { icon: TrendingUp, label: 'Active This Week', value: activeWeek },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-xl p-3 border border-border text-center shadow-sm">
              <stat.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="font-bold text-xl">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* User Cards */}
        <div>
          <h2 className="font-bold text-sm text-muted-foreground mb-3 uppercase tracking-wide">All Users</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((user, i) => (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl p-4 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Level {user.level} • {user.xp} XP</p>
                    {user.class_grade && <p className="text-xs text-muted-foreground">Class {user.class_grade}</p>}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
                  <span>Joined: {formatDate(user.joined_at)}</span>
                  <span>{timeAgo(user.last_active_at)}</span>
                </div>
                <button className="mt-2 w-full text-xs text-primary font-semibold py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                  View Details →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={open => !open && setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedUser && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">Level {selectedUser.level} • {selectedUser.xp} XP • 🔥 {selectedUser.streak}</p>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4">
                {/* Basic Stats */}
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Stats</p>
                  {[
                    ['Joined', formatDate(selectedUser.joined_at)],
                    ['Last Active', timeAgo(selectedUser.last_active_at)],
                    ['Problems Solved', selectedUser.total_problems.toString()],
                    ['Accuracy', `${selectedUser.accuracy}%`],
                    ['Class Grade', selectedUser.class_grade ? `Class ${selectedUser.class_grade}` : 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Pages Visited */}
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Pages Visited</p>
                  {selectedUser.activity.page_visits.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No page visits recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.activity.page_visits
                        .sort((a, b) => b.count - a.count)
                        .map(({ value, count }) => {
                          const maxCount = Math.max(...selectedUser.activity.page_visits.map(x => x.count));
                          return (
                            <div key={value}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">{PAGE_LABELS[value] || value}</span>
                                <span className="text-muted-foreground">{count}x</span>
                              </div>
                              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Practice Categories */}
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Practice Categories</p>
                  {selectedUser.activity.practice_categories.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No practice recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.activity.practice_categories
                        .sort((a, b) => b.count - a.count)
                        .map(({ value, count }) => {
                          const maxCount = Math.max(...selectedUser.activity.practice_categories.map(x => x.count));
                          return (
                            <div key={value}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium">{CAT_LABELS[value] || value}</span>
                                <span className="text-muted-foreground">{count}x</span>
                              </div>
                              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-secondary rounded-full"
                                  style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminPage;
