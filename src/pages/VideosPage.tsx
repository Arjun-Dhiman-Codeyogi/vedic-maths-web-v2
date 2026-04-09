import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play, Plus, Minus, X as TimesIcon, Divide, BookOpen, Brain, Sparkles, ArrowLeft, type LucideIcon } from 'lucide-react';

interface VideoItem {
  titleEn: string;
  titleHi: string;
  durationEn: string;
  durationHi: string;
  youtubeId: string;
}

interface VideoTopic {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  icon: LucideIcon;
  color: string;
  subtopics: VideoItem[];
}

const videoTopics: VideoTopic[] = [
  {
    id: 'addition',
    titleEn: 'Addition Tricks',
    titleHi: 'जोड़ की तरकीबें',
    descEn: 'Master fast addition with Vedic Math Ekadhikena Sutra',
    descHi: 'वैदिक गणित एकाधिकेन सूत्र से तेज़ जोड़ सीखें',
    icon: Plus,
    color: 'from-primary to-secondary',
    subtopics: [
      { titleEn: 'Vedic Maths Addition & Subtraction Tricks', titleHi: 'वैदिक गणित जोड़ और घटाव ट्रिक्स', durationEn: '30 min', durationHi: '30 मिनट', youtubeId: 'hdHTp0sQFXg' },
      { titleEn: 'Addition Tricks for Fast Calculation', titleHi: 'तेज गणना के लिए जोड़ ट्रिक्स', durationEn: '4 min', durationHi: '4 मिनट', youtubeId: 'hCg_xZgUkmw' },
      { titleEn: 'Speed Calculation - All Exams', titleHi: 'गति गणना - सभी परीक्षाएं', durationEn: '14 min', durationHi: '14 मिनट', youtubeId: 'WFSmHbf7f88' },
    ],
  },
  {
    id: 'subtraction',
    titleEn: 'Subtraction Tricks',
    titleHi: 'घटाव की तरकीबें',
    descEn: 'Learn Nikhilam Sutra for lightning-fast subtraction',
    descHi: 'निखिलम सूत्र से बिजली की तेज़ घटाव सीखें',
    icon: Minus,
    color: 'from-secondary to-accent',
    subtopics: [
      { titleEn: 'Subtraction Made Easy - Vedic Maths', titleHi: 'घटाव आसान बनाएं - वैदिक गणित', durationEn: '4 min', durationHi: '4 मिनट', youtubeId: '5XG7WETxBeM' },
      { titleEn: 'Nikhilam Subtraction Method', titleHi: 'निखिलम घटाव विधि', durationEn: '10 min', durationHi: '10 मिनट', youtubeId: 'dyQx1sHqaJE' },
      { titleEn: 'Fast Subtraction Tricks', titleHi: 'तेज घटाव ट्रिक्स', durationEn: '9 min', durationHi: '9 मिनट', youtubeId: 'grkWGeqW99c' },
    ],
  },
  {
    id: 'multiplication',
    titleEn: 'Multiplication Tricks',
    titleHi: 'गुणा की तरकीबें',
    descEn: 'Urdhva Tiryagbhyam - Cross multiplication magic',
    descHi: 'ऊर्ध्व तिर्यग्भ्याम - क्रॉस गुणा का जादू',
    icon: TimesIcon,
    color: 'from-accent to-primary',
    subtopics: [
      { titleEn: '2-Digit Multiplication Trick', titleHi: '2 अंकों की गुणा ट्रिक', durationEn: '8 min', durationHi: '8 मिनट', youtubeId: 'J1N64sosuoY' },
      { titleEn: 'Speed Calculation Tricks', titleHi: 'गति गणना ट्रिक्स', durationEn: '30 min', durationHi: '30 मिनट', youtubeId: 'R2AGn7D9N4E' },
      { titleEn: 'Squaring Numbers 1-100 in 3 Seconds', titleHi: '1-100 का वर्ग 3 सेकंड में', durationEn: '30 min', durationHi: '30 मिनट', youtubeId: 'Ko5Dl_QGj0g' },
      { titleEn: 'Vedic Math Multiplication Secrets', titleHi: 'वैदिक गणित गुणा रहस्य', durationEn: '25 min', durationHi: '25 मिनट', youtubeId: 'jsFmgrz3F-k' },
    ],
  },
  {
    id: 'division',
    titleEn: 'Division Tricks',
    titleHi: 'भाग की तरकीबें',
    descEn: 'Paravartya Yojayet - Transpose and apply',
    descHi: 'परावर्त्य योजयेत - स्थानांतरित करें और लागू करें',
    icon: Divide,
    color: 'from-primary to-accent',
    subtopics: [
      { titleEn: 'Divide Any Number in 5 Seconds', titleHi: 'किसी भी संख्या को 5 सेकंड में भाग दें', durationEn: '5 min', durationHi: '5 मिनट', youtubeId: 'RRaU9Iv3yAc' },
      { titleEn: 'Big Numbers Division Trick', titleHi: 'बड़ी संख्या भाग ट्रिक', durationEn: '9 min', durationHi: '9 मिनट', youtubeId: 'g9Z58h2yGWQ' },
      { titleEn: 'Division by 9, 99, 999 in Vedic Math', titleHi: 'वैदिक गणित में 9, 99, 999 से भाग', durationEn: '10 min', durationHi: '10 मिनट', youtubeId: 'IDvQvHDp8z4' },
      { titleEn: 'Long Division - Fast Vedic Method', titleHi: 'लंबा भाग - तेज वैदिक विधि', durationEn: '14 min', durationHi: '14 मिनट', youtubeId: 'ynpUpUZ_CAI' },
    ],
  },
];

const VideosPage = () => {
  const { t } = useLanguage();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  if (playingVideo) {
    return (
      <div className="px-4 py-4 md:py-8 space-y-4 max-w-7xl mx-auto">
        <button
          onClick={() => setPlayingVideo(null)}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('Back to Videos', 'वीडियो पर वापस')}
        </button>
        <h2 className="font-display font-bold text-lg">{t(playingVideo.titleEn, playingVideo.titleHi)}</h2>
        <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-elevated">
          <iframe
            src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=1&rel=0`}
            title={playingVideo.titleEn}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-sm text-muted-foreground">{t(playingVideo.durationEn, playingVideo.durationHi)}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="font-display font-bold text-xl">{t('Vedic Math Videos', 'वैदिक गणित वीडियो')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('Learn powerful Vedic Math techniques through video lessons', 'वीडियो पाठों से शक्तिशाली वैदिक गणित तकनीकें सीखें')}
        </p>
      </div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero rounded-2xl p-6 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-sm" />
        <Brain className="w-10 h-10 mb-2 opacity-90" />
        <h3 className="font-display font-bold text-lg">{t('Ancient Wisdom, Modern Speed', 'प्राचीन ज्ञान, आधुनिक गति')}</h3>
        <p className="text-sm opacity-80 mt-1">
          {t('4 categories • 14 video lessons • Real YouTube tutorials', '4 श्रेणियां • 14 वीडियो पाठ • असली YouTube ट्यूटोरियल')}
        </p>
      </motion.div>

      {/* Video Topics */}
      <div className="space-y-3">
        {videoTopics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl border-2 border-border shadow-card overflow-hidden"
          >
            {/* Topic Header */}
            <button
              onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
              className="w-full flex items-center gap-3 p-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center shadow-warm flex-shrink-0`}>
                <topic.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-display font-bold text-sm">{t(topic.titleEn, topic.titleHi)}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t(topic.descEn, topic.descHi)}</p>
              </div>
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full flex-shrink-0">
                <BookOpen className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground">{topic.subtopics.length}</span>
              </div>
            </button>

            {/* Subtopics */}
            {expandedTopic === topic.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-border"
              >
                {topic.subtopics.map((sub, j) => (
                  <button
                    key={j}
                    onClick={() => setPlayingVideo(sub)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${sub.youtubeId}/mqdefault.jpg`}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{t(sub.titleEn, sub.titleHi)}</p>
                      <p className="text-[10px] text-muted-foreground">{t(sub.durationEn, sub.durationHi)}</p>
                    </div>
                    <Play className="w-4 h-4 text-primary flex-shrink-0" />
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VideosPage;
