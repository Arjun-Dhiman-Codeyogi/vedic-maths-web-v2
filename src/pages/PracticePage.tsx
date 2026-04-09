import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGame } from '@/contexts/GameContext';
import { Check, Timer, Zap, Brain, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { logActivity } from '@/lib/logActivity';
import { supabase } from '@/integrations/supabase/client';
import { getQuestion, classToDefaultDifficulty, type Difficulty } from '@/data/questionBank';
type PracticeCategory = 'vedic' | 'finger' | 'brain';

type VedicOp = '+' | '-' | '×' | '÷' | 'x²' | '√' | 'x³' | '∛' | '%' | 'alg';
type FingerOp = 'f-count' | 'f-add' | 'f-sub' | 'f-mul' | 'f-9table';
type BrainOp = 'b-visual' | 'b-speed' | 'b-pattern' | 'b-mental' | 'b-focus';
type Operation = VedicOp | FingerOp | BrainOp;

const categoryOps: Record<PracticeCategory, { ops: Operation[]; labels: Record<string, { en: string; hi: string }> }> = {
  vedic: {
    ops: ['+', '-', '×', '÷', 'x²', '√', 'x³', '∛', '%', 'alg'],
    labels: {
      '+': { en: 'Add', hi: 'जोड़' },
      '-': { en: 'Sub', hi: 'घटाव' },
      '×': { en: 'Mul', hi: 'गुणा' },
      '÷': { en: 'Div', hi: 'भाग' },
      'x²': { en: 'Square', hi: 'वर्ग' },
      '√': { en: 'Root', hi: 'मूल' },
      'x³': { en: 'Cube', hi: 'घन' },
      '∛': { en: 'CubeRt', hi: 'घनमूल' },
      '%': { en: 'Percent', hi: 'प्रतिशत' },
      'alg': { en: 'Algebra', hi: 'बीजगणित' },
    },
  },
  finger: {
    ops: ['f-count', 'f-add', 'f-sub', 'f-mul', 'f-9table'],
    labels: {
      'f-count': { en: 'Count', hi: 'गिनती' },
      'f-add': { en: 'Add', hi: 'जोड़' },
      'f-sub': { en: 'Sub', hi: 'घटाव' },
      'f-mul': { en: 'Mul', hi: 'गुणा' },
      'f-9table': { en: '9 Table', hi: '9 पहाड़ा' },
    },
  },
  brain: {
    ops: ['b-visual', 'b-speed', 'b-pattern', 'b-mental', 'b-focus'],
    labels: {
      'b-visual': { en: 'Visual', hi: 'दृश्य' },
      'b-speed': { en: 'Speed', hi: 'गति' },
      'b-pattern': { en: 'Pattern', hi: 'पैटर्न' },
      'b-mental': { en: 'Mental', hi: 'मानसिक' },
      'b-focus': { en: 'Focus', hi: 'ध्यान' },
    },
  },
};

const categoryLabels: Record<PracticeCategory, { en: string; hi: string }> = {
  vedic: { en: 'Vedic Math', hi: 'वैदिक गणित' },
  finger: { en: 'Finger Math', hi: 'उंगली गणित' },
  brain: { en: 'Brain Dev', hi: 'मस्तिष्क विकास' },
};


const topicToCategory = (topic: string | null): PracticeCategory => {
  if (!topic) return 'vedic';
  if (topic.startsWith('f-')) return 'finger';
  if (topic.startsWith('b-')) return 'brain';
  return 'vedic';
};

const topicToOp = (topic: string | null, category: PracticeCategory): Operation => {
  if (!topic) return categoryOps[category].ops[0];
  // Map vedic topic ids to operations
  const vedicMap: Record<string, VedicOp> = { add: '+', sub: '-', mul: '×', div: '÷', sq: 'x²', sqrt: '√', dec: '+', pct: '%', alg: 'alg' };
  if (category === 'vedic' && vedicMap[topic]) return vedicMap[topic];
  // For finger/brain, the topic id matches the op
  if (categoryOps[category].ops.includes(topic as Operation)) return topic as Operation;
  return categoryOps[category].ops[0];
};

const PracticePage = () => {
  const { t } = useLanguage();
  const { addXP, updateAccuracy, student } = useGame();
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const initialCategory = topicToCategory(topicParam);
  const defaultDiff = classToDefaultDifficulty(student.classGrade);
  const [category, setCategory] = useState<PracticeCategory>(initialCategory);
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDiff);
  const [operation, setOperation] = useState<Operation>(topicToOp(topicParam, initialCategory));
  const [problem, setProblem] = useState(() => getQuestion(topicToOp(topicParam, initialCategory), defaultDiff, student.level));
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showVedicHint, setShowVedicHint] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const [xpFloat, setXpFloat] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0 || timerPaused) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, timerPaused]);

  useEffect(() => {
    if (timeLeft <= 0 && isPlaying) {
      setIsPlaying(false);
    }
  }, [timeLeft, isPlaying]);

  useEffect(() => {
    if (userId) logActivity(userId, 'practice_category', category);
  }, [userId]);

  const handleCategoryChange = (cat: PracticeCategory) => {
    setCategory(cat);
    const firstOp = categoryOps[cat].ops[0];
    setOperation(firstOp);
    setProblem(getQuestion(firstOp, difficulty, student.level));
    if (userId) logActivity(userId, 'practice_category', cat);
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setTotalAnswered(0);
    setCorrectCount(0);
    setProblem(getQuestion(operation, difficulty, student.level));
    setUserAnswer('');
    setResult(null);
    setTimerPaused(false);
    setShowSolution(false);
    setQuestionKey(0);
    setXpFloat(null);
  };

  const checkAnswer = useCallback(() => {
    if (!userAnswer) return;
    const isCorrect = parseInt(userAnswer) === problem.answer;
    setResult(isCorrect ? 'correct' : 'wrong');
    setTotalAnswered(p => p + 1);
    updateAccuracy(isCorrect);

    if (userId) logActivity(userId, 'question_result', `${isCorrect ? 'correct' : 'wrong'}:${category}`);

    if (isCorrect) {
      const xpAward = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
      setScore(s => s + xpAward);
      setStreak(s => s + 1);
      setCorrectCount(c => c + 1);
      addXP(xpAward);
      setXpFloat(xpAward);
      setTimeout(() => setXpFloat(null), 1000);
      setTimeout(() => {
        setResult(null);
        setUserAnswer('');
        setProblem(getQuestion(operation, difficulty, student.level));
        setShowVedicHint(false);
        setShowSolution(false);
        setQuestionKey(k => k + 1);
      }, 800);
    } else {
      setStreak(0);
      setTimerPaused(true);
      setShowSolution(true);
      setTimeout(() => {
        setResult(null);
        setUserAnswer('');
        setProblem(getQuestion(operation, difficulty, student.level));
        setShowVedicHint(false);
        setShowSolution(false);
        setTimerPaused(false);
        setQuestionKey(k => k + 1);
      }, 3500);
    }
  }, [userAnswer, problem, difficulty, operation, streak, updateAccuracy, student.level]);

  const handleKeyPad = (key: string) => {
    if (key === 'del') setUserAnswer(prev => prev.slice(0, -1));
    else if (key === 'go') checkAnswer();
    else setUserAnswer(prev => prev + key);
  };

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const categories: PracticeCategory[] = ['vedic', 'finger', 'brain'];

  if (!isPlaying) {
    return (
      <div className="px-4 py-4 md:py-8 space-y-5 max-w-7xl mx-auto">
        <div>
          <h2 className="font-display font-bold text-xl">{t('Practice Mode', 'अभ्यास मोड')}</h2>
          <p className="text-sm text-muted-foreground">{t('Train your mental math skills', 'अपने गणित कौशल को प्रशिक्षित करें')}</p>
        </div>

        {totalAnswered > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="gradient-hero rounded-2xl p-6 text-primary-foreground text-center">
            <Trophy className="w-12 h-12 mx-auto mb-2" />
            <h3 className="font-display font-bold text-2xl">{t('Great Job!', 'शानदार!')}</h3>
            <p className="text-3xl font-bold mt-2">{score} XP</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div><p className="opacity-70">{t('Correct', 'सही')}</p><p className="font-bold text-lg">{correctCount}/{totalAnswered}</p></div>
              <div><p className="opacity-70">{t('Accuracy', 'सटीकता')}</p><p className="font-bold text-lg">{totalAnswered ? Math.round(correctCount / totalAnswered * 100) : 0}%</p></div>
            </div>
          </motion.div>
        )}

        {/* Category Tabs */}
        <div>
          <h3 className="font-display font-bold text-sm mb-2">{t('Category', 'श्रेणी')}</h3>
          <div className="flex gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${category === cat ? 'gradient-primary text-primary-foreground shadow-warm' : 'bg-card border-2 border-border text-foreground'}`}
              >
                {t(categoryLabels[cat].en, categoryLabels[cat].hi)}
              </button>
            ))}
          </div>
        </div>

        {/* Operation Select */}
        <div>
          <h3 className="font-display font-bold text-sm mb-2">{t('Operation', 'संक्रिया')}</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {categoryOps[category].ops.map(op => (
              <button key={op} onClick={() => { setOperation(op); setProblem(getQuestion(op, difficulty, student.level)); }}
                className={`flex-shrink-0 px-3 py-2.5 rounded-xl font-display font-bold text-xs transition-all ${operation === op ? 'gradient-primary text-primary-foreground shadow-warm' : 'bg-card border-2 border-border text-foreground'}`}
              >
                {t(categoryOps[category].labels[op].en, categoryOps[category].labels[op].hi)}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Select */}
        <div>
          <h3 className="font-display font-bold text-sm mb-2">{t('Difficulty', 'कठिनाई')}</h3>
          <div className="flex gap-2">
            {difficulties.map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${difficulty === d ? 'gradient-warm text-primary-foreground shadow-warm' : 'bg-card border-2 border-border text-foreground'}`}
              >{d}</button>
            ))}
          </div>
        </div>

        <Button onClick={startGame} className="w-full h-14 gradient-primary text-primary-foreground font-display font-bold text-lg rounded-xl shadow-warm hover:shadow-glow transition-shadow border-0">
          <Zap className="w-5 h-5 mr-2" /> {t('Start Practice', 'अभ्यास शुरू करें')}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:py-8 space-y-4 h-full flex flex-col max-w-7xl mx-auto w-full">
      {/* Timer & Score Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-card rounded-full px-3 py-1.5 shadow-card">
          <Timer className={`w-4 h-4 ${timerPaused ? 'text-secondary animate-pulse' : timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
          <span className={`font-display font-bold text-sm ${timerPaused ? 'text-secondary' : timeLeft <= 10 ? 'text-destructive' : ''}`}>{timerPaused ? '⏸' : `${timeLeft}s`}</span>
        </div>
        <div className="flex items-center gap-3">
          {streak >= 3 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-full">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-bold text-accent">{streak}x</span>
            </motion.div>
          )}
          <div className="bg-card rounded-full px-3 py-1.5 shadow-card">
            <span className="font-display font-bold text-sm">{score} XP</span>
          </div>
        </div>
      </div>

      {/* Per-question progress strip */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          key={questionKey}
          className="h-full gradient-primary rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: timerPaused ? '100%' : '0%' }}
          transition={{ duration: 30, ease: 'linear' }}
        />
      </div>

      {/* XP Float Popup */}
      <AnimatePresence>
        {xpFloat !== null && (
          <motion.div
            key="xp-float"
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -40, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="fixed top-32 right-6 z-50 pointer-events-none"
          >
            <span className="text-lg font-display font-bold text-level drop-shadow-lg">
              +{xpFloat} XP ⚡
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Problem Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={problem.display}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`w-full max-w-xs rounded-2xl p-8 text-center shadow-elevated border-2 transition-colors ${result === 'correct' ? 'bg-level/10 border-level' : result === 'wrong' ? 'bg-destructive/10 border-destructive' : 'bg-card border-border'}`}
          >
            <p className="font-display font-bold text-2xl text-foreground whitespace-pre-line">{problem.display}</p>
            <p className="text-lg mt-2 font-display font-bold text-muted-foreground">= ?</p>

            <button onClick={() => setShowVedicHint(!showVedicHint)} className="mt-3 text-xs text-secondary font-semibold flex items-center gap-1 mx-auto">
              <Brain className="w-3 h-3" /> {t('Hint', 'संकेत')}
            </button>
            {showVedicHint && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-secondary mt-2 bg-secondary/10 rounded-lg p-2">
                {t(problem.hint.en, problem.hint.hi)}
              </motion.p>
            )}

            {showSolution && result === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-left"
              >
                <p className="text-xs font-bold text-destructive mb-1">{t('Correct Answer:', 'सही उत्तर:')}</p>
                <p className="text-xl font-display font-bold text-foreground">{problem.answer}</p>
                {problem.solution && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground mt-2 mb-0.5">{t('Solution:', 'हल:')}</p>
                    <p className="text-xs text-foreground font-medium">{t(problem.solution.en, problem.solution.hi)}</p>
                  </>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">{t('Next question in 3 seconds…', '3 सेकंड में अगला सवाल…')}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 w-full max-w-xs">
          <div className="bg-card rounded-xl border-2 border-border p-3 text-center min-h-[52px] flex items-center justify-center">
            <span className={`font-display font-bold text-2xl ${userAnswer ? 'text-foreground' : 'text-muted-foreground/30'}`}>
              {userAnswer || '?'}
            </span>
          </div>
        </div>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto w-full pb-2">
        {['1','2','3','4','5','6','7','8','9','del','0','go'].map(key => (
          <button key={key} onClick={() => handleKeyPad(key)}
            className={`h-12 rounded-xl font-display font-bold text-lg transition-all active:scale-95 ${key === 'go' ? 'gradient-primary text-primary-foreground shadow-warm' : key === 'del' ? 'bg-muted text-muted-foreground' : 'bg-card border-2 border-border text-foreground shadow-card'}`}
          >
            {key === 'del' ? '⌫' : key === 'go' ? <Check className="w-5 h-5 mx-auto" /> : key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PracticePage;
