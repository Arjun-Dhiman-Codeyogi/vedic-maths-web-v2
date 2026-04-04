import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudentData {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  totalProblems: number;
  accuracy: number;
  badges: string[];
  classGrade: number;
  joinedAt: string | null;
  lastActiveAt: string | null;
}

interface GameContextType {
  student: StudentData;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addBadge: (badge: string) => void;
  updateAccuracy: (correct: boolean) => void;
  daysCount: number;
}

const defaultStudent: StudentData = {
  name: 'Student',
  level: 1,
  xp: 0,
  xpToNext: 200,
  streak: 0,
  totalProblems: 0,
  accuracy: 0,
  badges: [],
  classGrade: 6,
  joinedAt: null,
  lastActiveAt: null,
};

const GameContext = createContext<GameContextType>({
  student: defaultStudent,
  addXP: () => {},
  incrementStreak: () => {},
  resetStreak: () => {},
  addBadge: () => {},
  updateAccuracy: () => {},
  daysCount: 0,
});

export const useGame = () => useContext(GameContext);

const calcDays = (joinedAt: string | null) => {
  if (!joinedAt) return 0;
  const diff = Date.now() - new Date(joinedAt).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentData>(defaultStudent);
  const [userId, setUserId] = useState<string | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load progress from DB
  const loadProgress = async (uid: string) => {
    const { data } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', uid)
      .single();

    if (data) {
      setStudent(prev => ({
        ...prev,
        level: data.current_level ?? prev.level,
        xp: data.total_xp ?? prev.xp,
        streak: data.daily_streak ?? prev.streak,
        badges: data.achievements || [],
        classGrade: data.grade_level ?? prev.classGrade,
        joinedAt: data.created_at ?? prev.joinedAt,
        lastActiveAt: data.last_activity_date ?? prev.lastActiveAt,
      }));
    }
  };

  // Save progress to DB (debounced)
  const saveProgress = (data: StudentData) => {
    if (!userId) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await supabase
        .from('student_profiles')
        .update({
          current_level: data.level,
          total_xp: data.xp,
          daily_streak: data.streak,
          achievements: data.badges,
          grade_level: data.classGrade,
          last_activity_date: new Date().toISOString().split('T')[0],
        })
        .eq('user_id', userId);
    }, 1000);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const displayName = session.user.user_metadata?.display_name || 
                           session.user.email?.split('@')[0] || 'Student';
        setUserId(session.user.id);
        setStudent(prev => ({ ...prev, name: displayName }));
        loadProgress(session.user.id);
      } else {
        setUserId(null);
        setStudent({ ...defaultStudent });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const displayName = session.user.user_metadata?.display_name || 
                           session.user.email?.split('@')[0] || 'Student';
        setUserId(session.user.id);
        setStudent(prev => ({ ...prev, name: displayName }));
        loadProgress(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addXP = (amount: number) => {
    setStudent(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNext;
      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel++;
        newXPToNext = Math.floor(newXPToNext * 1.3);
      }
      const updated = { ...prev, xp: newXP, level: newLevel, xpToNext: newXPToNext };
      saveProgress(updated);
      return updated;
    });
  };

  const incrementStreak = () => {
    setStudent(prev => {
      const updated = { ...prev, streak: prev.streak + 1 };
      saveProgress(updated);
      return updated;
    });
  };

  const resetStreak = () => {
    setStudent(prev => {
      const updated = { ...prev, streak: 0 };
      saveProgress(updated);
      return updated;
    });
  };

  const addBadge = (badge: string) => {
    setStudent(prev => {
      if (prev.badges.includes(badge)) return prev;
      const updated = { ...prev, badges: [...prev.badges, badge] };
      saveProgress(updated);
      return updated;
    });
  };

  const updateAccuracy = (correct: boolean) => {
    setStudent(prev => {
      const total = prev.totalProblems + 1;
      const correctCount = Math.round(prev.accuracy * prev.totalProblems / 100) + (correct ? 1 : 0);
      const updated = { ...prev, totalProblems: total, accuracy: total > 0 ? Math.round(correctCount / total * 100) : 0 };
      saveProgress(updated);
      return updated;
    });
  };

  const daysCount = calcDays(student.joinedAt);

  return (
    <GameContext.Provider value={{ student, addXP, incrementStreak, resetStreak, addBadge, updateAccuracy, daysCount }}>
      {children}
    </GameContext.Provider>
  );
};
