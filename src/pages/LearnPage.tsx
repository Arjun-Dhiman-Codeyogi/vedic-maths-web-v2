import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle2, ChevronRight, BookOpen, Play, ArrowRight, ScrollText } from 'lucide-react';
import { useState } from 'react';

interface Topic {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  sutra?: string;
  icon: string;
  progress: number;
  locked: boolean;
  lessons: number;
}

const topicsByCategory: Record<string, Topic[]> = {
  vedic: [
    { id: 'add', titleEn: 'Vedic Addition', titleHi: 'वैदिक जोड़', descEn: 'Master lightning-fast addition with Vedic Sutras', descHi: 'वैदिक सूत्रों से तेज जोड़ सीखें', sutra: 'Ekadhikena Purvena', icon: '➕', progress: 85, locked: false, lessons: 8 },
    { id: 'sub', titleEn: 'Vedic Subtraction', titleHi: 'वैदिक घटाव', descEn: 'Nikhilam method for instant subtraction', descHi: 'निखिलम विधि से तुरंत घटाव', sutra: 'Nikhilam Sutra', icon: '➖', progress: 60, locked: false, lessons: 6 },
    { id: 'mul', titleEn: 'Multiplication Tricks', titleHi: 'गुणा की ट्रिक्स', descEn: 'Urdhva Tiryagbhyam & cross multiplication', descHi: 'ऊर्ध्व तिर्यग्भ्याम और क्रॉस गुणा', sutra: 'Urdhva Tiryagbhyam', icon: '✖️', progress: 40, locked: false, lessons: 12 },
    { id: 'div', titleEn: 'Division Mastery', titleHi: 'भाग में महारत', descEn: 'Paravartya Yojayet for fast division', descHi: 'परावर्त्य योजयेत से तेज भाग', sutra: 'Paravartya Yojayet', icon: '➗', progress: 20, locked: false, lessons: 8 },
    { id: 'sq', titleEn: 'Squares & Cubes', titleHi: 'वर्ग और घन', descEn: 'Yavadunam sutra for perfect squares', descHi: 'यावदूनम सूत्र से पूर्ण वर्ग', sutra: 'Yavadunam', icon: '²', progress: 0, locked: false, lessons: 10 },
    { id: 'sqrt', titleEn: 'Square & Cube Roots', titleHi: 'वर्गमूल और घनमूल', descEn: 'Find roots instantly with Vedic methods', descHi: 'वैदिक विधियों से तुरंत मूल ज्ञात करें', icon: '√', progress: 0, locked: true, lessons: 8 },
    { id: 'dec', titleEn: 'Decimal Operations', titleHi: 'दशमलव संक्रियाएं', descEn: 'Vedic tricks for decimal calculations', descHi: 'दशमलव गणना की वैदिक ट्रिक्स', icon: '🔢', progress: 0, locked: true, lessons: 6 },
    { id: 'pct', titleEn: 'Percentages', titleHi: 'प्रतिशत', descEn: 'Calculate percentages in seconds', descHi: 'सेकंडों में प्रतिशत निकालें', icon: '%', progress: 0, locked: true, lessons: 5 },
    { id: 'alg', titleEn: 'Algebraic Tricks', titleHi: 'बीजगणित ट्रिक्स', descEn: 'Solve algebra with Vedic shortcuts', descHi: 'वैदिक शॉर्टकट से बीजगणित हल करें', icon: '𝑥', progress: 0, locked: true, lessons: 10 },
  ],
  finger: [
    { id: 'f-count', titleEn: 'Finger Counting Basics', titleHi: 'उंगली गिनती मूल बातें', descEn: 'Learn to count 1-99 on your fingers', descHi: 'उंगलियों पर 1-99 गिनना सीखें', icon: '🖐️', progress: 70, locked: false, lessons: 5 },
    { id: 'f-add', titleEn: 'Finger Addition', titleHi: 'उंगली जोड़', descEn: 'Add numbers quickly using finger positions', descHi: 'उंगली की स्थिति से तेज जोड़', icon: '👆', progress: 45, locked: false, lessons: 6 },
    { id: 'f-sub', titleEn: 'Finger Subtraction', titleHi: 'उंगली घटाव', descEn: 'Subtract using complementary finger methods', descHi: 'पूरक उंगली विधि से घटाव', icon: '👇', progress: 20, locked: false, lessons: 5 },
    { id: 'f-mul', titleEn: 'Finger Multiplication', titleHi: 'उंगली गुणा', descEn: 'Multiply 6-10 using finger tricks', descHi: '6-10 की गुणा उंगली ट्रिक्स से', icon: '✌️', progress: 10, locked: false, lessons: 8 },
    { id: 'f-9table', titleEn: '9 Times Table Trick', titleHi: '9 का पहाड़ा ट्रिक', descEn: 'Master 9x table with one hand', descHi: 'एक हाथ से 9 का पहाड़ा', icon: '9️⃣', progress: 0, locked: false, lessons: 3 },
    { id: 'f-chisanbop', titleEn: 'Chisanbop Method', titleHi: 'चिसनबॉप विधि', descEn: 'Korean finger math for fast calculations', descHi: 'तेज गणना के लिए कोरियन उंगली गणित', icon: '🤟', progress: 0, locked: true, lessons: 7 },
    { id: 'f-advanced', titleEn: 'Advanced Finger Math', titleHi: 'उन्नत उंगली गणित', descEn: 'Two-hand techniques for complex operations', descHi: 'जटिल संक्रियाओं के लिए दो-हाथ तकनीक', icon: '🙌', progress: 0, locked: true, lessons: 6 },
  ],
  brain: [
    { id: 'b-visual', titleEn: 'Visual Memory', titleHi: 'दृश्य स्मृति', descEn: 'Strengthen number visualization skills', descHi: 'संख्या दृश्य कौशल मजबूत करें', icon: '👁️', progress: 55, locked: false, lessons: 6 },
    { id: 'b-speed', titleEn: 'Speed Processing', titleHi: 'गति प्रसंस्करण', descEn: 'Train your brain to process faster', descHi: 'मस्तिष्क को तेज प्रसंस्करण के लिए प्रशिक्षित करें', icon: '⚡', progress: 30, locked: false, lessons: 8 },
    { id: 'b-pattern', titleEn: 'Pattern Recognition', titleHi: 'पैटर्न पहचान', descEn: 'Spot number patterns instantly', descHi: 'संख्या पैटर्न तुरंत पहचानें', icon: '🧩', progress: 15, locked: false, lessons: 7 },
    { id: 'b-mental', titleEn: 'Mental Arithmetic', titleHi: 'मानसिक अंकगणित', descEn: 'Solve multi-step problems in your head', descHi: 'दिमाग में बहु-चरणीय समस्याएं हल करें', icon: '🧠', progress: 10, locked: false, lessons: 10 },
    { id: 'b-focus', titleEn: 'Focus & Concentration', titleHi: 'ध्यान और एकाग्रता', descEn: 'Build laser focus for math problem solving', descHi: 'गणित समस्या समाधान के लिए तीव्र ध्यान बनाएं', icon: '🎯', progress: 0, locked: false, lessons: 5 },
    { id: 'b-memory', titleEn: 'Number Memory Palace', titleHi: 'संख्या स्मृति महल', descEn: 'Memorize long numbers using palace technique', descHi: 'महल तकनीक से लंबी संख्याएं याद करें', icon: '🏰', progress: 0, locked: true, lessons: 6 },
    { id: 'b-logic', titleEn: 'Logical Reasoning', titleHi: 'तार्किक तर्क', descEn: 'Develop mathematical reasoning skills', descHi: 'गणितीय तर्क कौशल विकसित करें', icon: '🔗', progress: 0, locked: true, lessons: 8 },
    { id: 'b-creative', titleEn: 'Creative Problem Solving', titleHi: 'रचनात्मक समस्या समाधान', descEn: 'Think outside the box with math puzzles', descHi: 'गणित पहेलियों से अलग सोचें', icon: '💡', progress: 0, locked: true, lessons: 7 },
  ],
};

const categories = [
  { id: 'vedic', labelEn: 'Vedic Math', labelHi: 'वैदिक गणित' },
  { id: 'finger', labelEn: 'Finger Math', labelHi: 'उंगली गणित' },
  { id: 'brain', labelEn: 'Brain Dev', labelHi: 'मस्तिष्क विकास' },
];

const LearnPage = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('vedic');

  return (
    <div className="px-4 py-4 md:py-8 space-y-4 max-w-7xl mx-auto">
      <div>
        <h2 className="font-display font-bold text-xl">{t('Learn & Master', 'सीखें और महारत हासिल करें')}</h2>
        <p className="text-sm text-muted-foreground">{t('Vedic Math, Abacus & Brain Power', 'वैदिक गणित, अबेकस और मस्तिष्क शक्ति')}</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? 'gradient-primary text-primary-foreground shadow-warm'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {t(cat.labelEn, cat.labelHi)}
          </button>
        ))}
      </div>

      {/* AI Recommended */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-warm rounded-xl p-4 text-primary-foreground"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🤖</span>
          <h3 className="font-display font-bold text-sm">{t('AI Recommends', 'AI की सिफारिश')}</h3>
        </div>
        <p className="text-xs opacity-90 mb-2">
          {t('Based on your progress, focus on Multiplication today!', 'आपकी प्रगति के आधार पर, आज गुणा पर ध्यान दें!')}
        </p>
        <Link to="/practice" className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">
          {t('Start Now', 'अभी शुरू करें')} <ArrowRight className="w-3 h-3" />
        </Link>
      </motion.div>

      {/* 📜 Vedic Sutras - Featured Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-card to-secondary/10 p-1"
      >
        <Link to="/sutras" className="block rounded-xl bg-card/80 backdrop-blur-sm p-5 hover:bg-card/60 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center flex-shrink-0 shadow-warm group-hover:scale-110 transition-transform">
              <ScrollText className="w-8 h-8 text-primary-foreground dark:text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-display font-bold text-base">{t('📜 16 Vedic Sutras', '📜 16 वैदिक सूत्र')}</h4>
                <span className="text-[10px] font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-full">{t('MUST READ', 'जरूर पढ़ें')}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(
                  'Discover all 16 ancient Vedic Math formulas with detailed history, step-by-step examples & usage guide by Jagadguru Shankaracharya',
                  'जगद्गुरु शंकराचार्य द्वारा रचित सभी 16 प्राचीन वैदिक गणित सूत्र — विस्तृत इतिहास, चरण-दर-चरण उदाहरण और उपयोग गाइड'
                )}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </motion.div>

      {/* Topics List */}
      <div className="space-y-3">
        {(topicsByCategory[activeCategory] || []).map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
          >
            <Link
              to={topic.locked ? '#' : `/practice?topic=${topic.id}`}
              className={`flex items-center gap-3 bg-card rounded-xl p-4 shadow-card border-2 border-border transition-all active:scale-[0.98] ${topic.locked ? 'opacity-50' : ''}`}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-xl flex-shrink-0">
                {topic.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-sm truncate">{t(topic.titleEn, topic.titleHi)}</h4>
                  {topic.locked && <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  {topic.progress === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-level flex-shrink-0" />}
                </div>
                {topic.sutra && (
                  <p className="text-[10px] text-secondary font-semibold italic">{topic.sutra}</p>
                )}
                <p className="text-xs text-muted-foreground truncate">{t(topic.descEn, topic.descHi)}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${topic.progress}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">{topic.progress}%</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <BookOpen className="w-3 h-3" /> {topic.lessons}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LearnPage;
