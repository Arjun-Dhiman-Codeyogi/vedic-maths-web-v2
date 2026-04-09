import { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGame } from '@/contexts/GameContext';
import { supabase } from '@/integrations/supabase/client';
import { User as UserIcon, TrendingUp, Target, Zap, Brain, BarChart3, Globe, Flame, LogIn, LogOut, Calendar, ShieldCheck, CheckCircle, XCircle, BookOpen, KeyRound, RefreshCw, Copy, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { fetchPracticeHistory, type PracticeHistory } from '@/lib/fetchHistory';

const ProfilePage = () => {
  const { lang, toggleLang, t } = useLanguage();
  const { student, daysCount } = useGame();
  const navigate = useNavigate();
  const xpPercent = Math.round((student.xp / student.xpToNext) * 100);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<PracticeHistory | null>(null);
  const [parentCode, setParentCode] = useState<string | null>(null);
  const [codeSecondsLeft, setCodeSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showCodePopup, setShowCodePopup] = useState(false);
  const codeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchPracticeHistory(session.user.id).then(setHistory);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchPracticeHistory(session.user.id).then(setHistory);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (user) {
      await supabase.from('user_activity_log').insert({ user_id: user.id, activity_type: 'logout', activity_value: new Date().toISOString() });
    }
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const generateParentCode = async () => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();
    await supabase.from('parent_invites').insert({ student_id: user.id, code, expires_at: expiresAt });
    setParentCode(code);
    setCodeSecondsLeft(180);
    setShowCodePopup(true);
    setCopied(false);
    if (codeTimerRef.current) clearInterval(codeTimerRef.current);
    codeTimerRef.current = setInterval(() => {
      setCodeSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(codeTimerRef.current!);
          setParentCode(null);
          setShowCodePopup(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const copyCode = () => {
    if (!parentCode) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(parentCode);
    } else {
      // fallback for HTTP / non-secure contexts
      const el = document.createElement('textarea');
      el.value = parentCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmtCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const weeklyData = [
    { day: 'Mon', problems: 25, accuracy: 80 },
    { day: 'Tue', problems: 32, accuracy: 75 },
    { day: 'Wed', problems: 18, accuracy: 88 },
    { day: 'Thu', problems: 40, accuracy: 72 },
    { day: 'Fri', problems: 35, accuracy: 85 },
    { day: 'Sat', problems: 45, accuracy: 90 },
    { day: 'Sun', problems: 28, accuracy: 82 },
  ];

  const topicMastery = [
    { name: t('Addition', 'जोड़'), progress: 85 },
    { name: t('Subtraction', 'घटाव'), progress: 60 },
    { name: t('Multiplication', 'गुणा'), progress: 40 },
    { name: t('Division', 'भाग'), progress: 20 },
    { name: t('Squares', 'वर्ग'), progress: 10 },
  ];

  const weakAreas = [
    { topic: t('Large number multiplication', 'बड़ी संख्या गुणा'), type: t('Calculation Error', 'गणना त्रुटि'), suggestion: t('Practice Urdhva Tiryagbhyam', 'ऊर्ध्व तिर्यग्भ्याम का अभ्यास करें') },
    { topic: t('Division with remainders', 'शेषफल वाला भाग'), type: t('Concept Gap', 'अवधारणा अंतर'), suggestion: t('Review Paravartya method', 'परावर्त्य विधि की समीक्षा करें') },
  ];

  return (
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-7xl mx-auto">
      {/* Quick Settings Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-2 bg-card rounded-xl p-3 shadow-card border-2 border-border"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-muted px-2 py-1.5 rounded-full">
            <Flame className="w-3.5 h-3.5 text-streak animate-fire-flicker" />
            <span className="text-xs font-bold">{student.streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-muted px-2 py-1.5 rounded-full">
            <span className="text-xs">⚡</span>
            <span className="text-xs font-bold">{student.xp} XP</span>
          </div>
          <button onClick={toggleLang} className="flex items-center gap-1 bg-muted px-2 py-1.5 rounded-full hover:bg-accent/20 transition-colors">
            <Globe className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-bold">{lang === 'en' ? 'हि' : 'EN'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              {user.email === 'weareallforyou12345@gmail.com' && (
                <button onClick={() => navigate('/admin')} className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
                  <ShieldCheck className="w-3 h-3" />
                  <span className="text-xs font-bold">Admin</span>
                </button>
              )}
              <button onClick={handleLogout} className="flex items-center gap-1 bg-destructive/10 text-destructive px-2.5 py-1.5 rounded-full hover:bg-destructive/20 transition-colors">
                <LogOut className="w-3 h-3" />
                <span className="text-xs font-bold">{t('Logout', 'लॉगआउट')}</span>
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/auth')} className="flex items-center gap-1 gradient-primary text-primary-foreground px-2.5 py-1.5 rounded-full shadow-warm">
              <LogIn className="w-3 h-3" />
              <span className="text-xs font-bold">{t('Login', 'लॉगिन')}</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-hero rounded-2xl p-5 text-primary-foreground text-center relative overflow-hidden"
      >
        <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/10 dark:bg-green-400/10" />
        <div className="w-16 h-16 gradient-warm rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white/30 dark:border-green-400/30 shadow-lg">
          <UserIcon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="font-display font-bold text-xl">{student.name}</h2>
        <p className="text-sm opacity-80">{t('Class', 'कक्षा')} {student.classGrade} • {t('Level', 'स्तर')} {student.level}</p>
        <div className="mt-3 max-w-[200px] mx-auto">
          <div className="flex justify-between text-xs opacity-80 mb-1">
            <span>XP</span>
            <span>{student.xp}/{student.xpToNext}</span>
          </div>
          <div className="h-2 bg-white/20 dark:bg-green-400/20 rounded-full overflow-hidden">
            <motion.div className="h-full bg-white/80 dark:bg-primary/80 rounded-full" animate={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Target, label: t('Accuracy', 'सटीकता'), value: `${student.accuracy}%`, color: 'text-level' },
          { icon: Brain, label: t('Problems', 'सवाल'), value: student.totalProblems.toString(), color: 'text-secondary' },
          { icon: Zap, label: t('Streak', 'स्ट्रीक'), value: `${student.streak}🔥`, color: 'text-streak' },
          { icon: Calendar, label: t('Days', 'दिन'), value: `${daysCount}`, color: 'text-xp' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl p-3 shadow-card text-center border-2 border-border">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="font-display font-bold text-lg">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Generate Parent Code */}
      {user && (
        <div className="bg-card rounded-xl p-4 shadow-card border-2 border-border">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4 text-secondary" />
            <h3 className="font-display font-bold text-sm">{t('Parent Access', 'पैरेंट एक्सेस')}</h3>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">{t('Generate a 6-digit code for your parent (valid 3 min)', 'अभिभावक के लिए 6-अंकी कोड बनाएं (3 मिनट वैध)')}</p>
            <button
              onClick={generateParentCode}
              className="w-full py-2.5 rounded-xl gradient-warm text-primary-foreground font-display font-bold text-sm shadow-warm flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              {t('Generate Code', 'कोड बनाएं')}
            </button>
          </div>
        </div>
      )}

      {/* Weekly Activity */}
      <div className="bg-card rounded-xl p-4 shadow-card border-2 border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm">{t('Weekly Activity', 'साप्ताहिक गतिविधि')}</h3>
        </div>
        <div className="flex items-end justify-between gap-1 h-24">
          {weeklyData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.problems / 50) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="w-full gradient-primary rounded-t-md min-h-[4px]"
              />
              <span className="text-[10px] text-muted-foreground font-medium">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Mastery */}
      <div className="bg-card rounded-xl p-4 shadow-card border-2 border-border">
        <h3 className="font-display font-bold text-sm mb-3">{t('Topic Mastery', 'विषय महारत')}</h3>
        <div className="space-y-3">
          {topicMastery.map(topic => (
            <div key={topic.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{topic.name}</span>
                <span className="font-bold text-muted-foreground">{topic.progress}%</span>
              </div>
              <Progress value={topic.progress} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Weak Areas */}
      <div className="bg-card rounded-xl p-4 shadow-card border-2 border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-secondary" />
          <h3 className="font-display font-bold text-sm">{t('Areas to Improve', 'सुधार के क्षेत्र')}</h3>
        </div>
        <div className="space-y-3">
          {weakAreas.map(area => (
            <div key={area.topic} className="bg-muted rounded-lg p-3">
              <p className="text-sm font-semibold">{area.topic}</p>
              <p className="text-xs text-destructive font-medium mt-0.5">{area.type}</p>
              <p className="text-xs text-secondary font-medium mt-1">💡 {area.suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Practice History */}
      {user && (
        <div className="bg-card rounded-xl p-4 shadow-card border-2 border-border">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-sm">{t('Practice History', 'अभ्यास इतिहास')}</h3>
          </div>

          {history === null ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.total === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">{t('No questions attempted yet. Start practicing!', 'अभी तक कोई सवाल हल नहीं किया। अभ्यास शुरू करें!')}</p>
          ) : (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { icon: Target, label: t('Total', 'कुल'), value: history.total, color: 'text-primary', bg: 'bg-primary/10' },
                  { icon: CheckCircle, label: t('Correct', 'सही'), value: history.totalCorrect, color: 'text-level', bg: 'bg-level/10' },
                  { icon: XCircle, label: t('Wrong', 'गलत'), value: history.totalWrong, color: 'text-destructive', bg: 'bg-destructive/10' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                    <p className={`font-display font-bold text-lg ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Accuracy bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">{t('Overall Accuracy', 'कुल सटीकता')}</span>
                  <span className="font-bold text-primary">{history.accuracy}%</span>
                </div>
                <Progress value={history.accuracy} className="h-2" />
              </div>

              {/* Per category */}
              {history.categoryStats.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{t('By Category', 'श्रेणी अनुसार')}</p>
                  {history.categoryStats.map(cat => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold">{cat.label}</span>
                        <span className="text-muted-foreground">
                          {cat.correct}/{cat.total} • <span className="text-primary font-bold">{cat.accuracy}%</span>
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.accuracy}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full gradient-primary rounded-full"
                        />
                      </div>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-level">✓ {cat.correct} {t('correct', 'सही')}</span>
                        <span className="text-[10px] text-destructive">✗ {cat.wrong} {t('wrong', 'गलत')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Badges */}
      <div>
        <h3 className="font-display font-bold text-sm mb-3">{t('All Badges', 'सभी बैज')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {student.badges.map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-3 shadow-card border-2 border-border flex items-center gap-2 hover:shadow-elevated hover:scale-105 hover:border-primary/30 transition-all duration-200 cursor-default"
            >
              <span className="text-2xl">{badge.split(' ')[0]}</span>
              <span className="text-xs font-semibold">{badge.split(' ').slice(1).join(' ')}</span>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Code Popup Modal */}
      <AnimatePresence>
        {showCodePopup && parentCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
            onClick={e => { if (e.target === e.currentTarget) setShowCodePopup(false); }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              className="bg-card rounded-2xl w-full max-w-sm shadow-elevated border-2 border-border overflow-hidden"
            >
              {/* Header */}
              <div className="gradient-hero px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-white">{t('Parent Access Code', 'पैरेंट एक्सेस कोड')}</h3>
                  <p className="text-[11px] text-white/70 mt-0.5">{t('Share this code with your parent', 'यह कोड अपने अभिभावक को दें')}</p>
                </div>
                <button
                  onClick={() => setShowCodePopup(false)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Code input with copy button */}
                <div className="relative">
                  <input
                    readOnly
                    value={parentCode.split('').join('  ')}
                    className="w-full bg-muted rounded-xl py-4 px-4 font-mono text-2xl font-bold tracking-widest text-primary text-center border-2 border-border focus:outline-none select-all cursor-text"
                  />
                  <button
                    onClick={copyCode}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      copied ? 'bg-level/20 text-level' : 'bg-card hover:bg-primary/10 text-muted-foreground hover:text-primary border-2 border-border'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Timer */}
                <div className="text-center space-y-1">
                  <p className={`font-display font-bold text-lg ${codeSecondsLeft < 60 ? 'text-destructive' : 'text-secondary'}`}>
                    ⏱ {fmtCountdown(codeSecondsLeft)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{t('Code valid for 3 minutes only', 'कोड केवल 3 मिनट के लिए वैध है')}</p>
                </div>

                {/* Generate new */}
                <button
                  onClick={generateParentCode}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t('Generate new code', 'नया कोड बनाएं')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
