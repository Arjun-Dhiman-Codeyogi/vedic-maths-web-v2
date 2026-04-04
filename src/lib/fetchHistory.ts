import { supabase } from '@/integrations/supabase/client';

export interface CategoryStat {
  category: string;
  label: string;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
}

export interface PracticeHistory {
  totalCorrect: number;
  totalWrong: number;
  total: number;
  accuracy: number;
  categoryStats: CategoryStat[];
}

const CAT_LABELS: Record<string, string> = {
  vedic: 'Vedic Math',
  finger: 'Finger Math',
  brain: 'Brain Dev',
};

export async function fetchPracticeHistory(userId: string): Promise<PracticeHistory> {
  const { data } = await supabase
    .from('user_activity_log')
    .select('activity_value')
    .eq('user_id', userId)
    .eq('activity_type', 'question_result');

  const rows = data || [];

  let totalCorrect = 0;
  let totalWrong = 0;
  const catMap: Record<string, { correct: number; wrong: number }> = {};

  for (const row of rows) {
    // format: "correct:vedic" or "wrong:finger"
    const [result, category] = (row.activity_value as string).split(':');
    if (result === 'correct') totalCorrect++;
    else totalWrong++;

    if (category) {
      if (!catMap[category]) catMap[category] = { correct: 0, wrong: 0 };
      if (result === 'correct') catMap[category].correct++;
      else catMap[category].wrong++;
    }
  }

  const total = totalCorrect + totalWrong;

  const categoryStats: CategoryStat[] = Object.entries(catMap).map(([cat, stats]) => {
    const catTotal = stats.correct + stats.wrong;
    return {
      category: cat,
      label: CAT_LABELS[cat] || cat,
      correct: stats.correct,
      wrong: stats.wrong,
      total: catTotal,
      accuracy: catTotal > 0 ? Math.round((stats.correct / catTotal) * 100) : 0,
    };
  }).sort((a, b) => b.total - a.total);

  return {
    totalCorrect,
    totalWrong,
    total,
    accuracy: total > 0 ? Math.round((totalCorrect / total) * 100) : 0,
    categoryStats,
  };
}
