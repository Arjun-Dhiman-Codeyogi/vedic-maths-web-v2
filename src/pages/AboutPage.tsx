import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Target, BookOpen, Users, Star, Mail, Github, Globe, Sparkles, GraduationCap, Code, Linkedin, Twitter } from 'lucide-react';
import arjunPhoto from '@/assets/arjun-dhiman.jpg';

const AboutPage = () => {
  const { t } = useLanguage();

  const features = [
    { icon: BookOpen, title: t('Vedic Mathematics', 'वैदिक गणित'), desc: t('Learn ancient Indian math techniques for lightning-fast calculations', 'बिजली की तेज़ गणना के लिए प्राचीन भारतीय गणित तकनीकें सीखें') },
    { icon: Sparkles, title: t('AI-Powered Solver', 'AI-संचालित सॉल्वर'), desc: t('Snap a photo of any math problem and get instant dual solutions', 'किसी भी गणित की समस्या की फोटो लें और तुरंत दोहरा समाधान पाएं') },
    { icon: GraduationCap, title: t('Finger Math', 'फिंगर मैथ'), desc: t('Master calculations using finger techniques from basics to advanced', 'बेसिक्स से एडवांस तक फिंगर तकनीक से गणना में महारत हासिल करें') },
    { icon: Target, title: t('Brain Development', 'मस्तिष्क विकास'), desc: t('Activities designed to boost memory, speed & pattern recognition', 'याददाश्त, गति और पैटर्न पहचान बढ़ाने के लिए डिज़ाइन की गई गतिविधियाँ') },
  ];

  const stats = [
    { value: '16+', label: t('Vedic Sutras', 'वैदिक सूत्र') },
    { value: '100+', label: t('Practice Problems', 'अभ्यास प्रश्न') },
    { value: '14+', label: t('Video Tutorials', 'वीडियो ट्यूटोरियल') },
    { value: '2', label: t('Languages', 'भाषाएँ') },
  ];

  return (
    <div className="px-4 py-4 md:py-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero rounded-2xl p-6 md:p-10 text-primary-foreground text-center relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10 dark:bg-green-400/10" />
        <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/10 dark:bg-green-400/10" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 gradient-warm rounded-2xl flex items-center justify-center mx-auto mb-4 border-4 border-white/30 dark:border-green-400/30 shadow-lg rotate-6"
        >
          <span className="text-4xl font-display font-bold text-primary-foreground -rotate-6">M</span>
        </motion.div>
        <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">MathGenius</h1>
        <p className="text-sm md:text-base opacity-90 max-w-md mx-auto">
          {t(
            'Making math fun, fast & intuitive through Vedic Mathematics, Finger Math & Brain Development',
            'वैदिक गणित, फिंगर मैथ और मस्तिष्क विकास के माध्यम से गणित को मज़ेदार, तेज़ और सहज बनाना'
          )}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="bg-card rounded-xl p-3 shadow-card border-2 border-border text-center"
          >
            <p className="font-display font-bold text-lg gradient-text">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-5 shadow-card border-2 border-border"
      >
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-destructive" />
          <h2 className="font-display font-bold text-base">{t('Our Mission', 'हमारा मिशन')}</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t(
            'We believe every student deserves access to powerful mathematical techniques that were developed thousands of years ago in India. MathGenius combines ancient Vedic wisdom with modern AI technology to create a learning experience that makes math not just easy, but truly enjoyable.',
            'हम मानते हैं कि हर छात्र को उन शक्तिशाली गणितीय तकनीकों तक पहुँच मिलनी चाहिए जो हज़ारों साल पहले भारत में विकसित की गई थीं। MathGenius प्राचीन वैदिक ज्ञान को आधुनिक AI तकनीक के साथ जोड़कर एक ऐसा सीखने का अनुभव बनाता है जो गणित को न केवल आसान बल्कि वाकई आनंददायक बनाता है।'
          )}
        </p>
      </motion.div>

      {/* Features */}
      <div>
        <h2 className="font-display font-bold text-base mb-3">{t('What We Offer', 'हम क्या प्रदान करते हैं')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="bg-card rounded-xl p-4 shadow-card border-2 border-border flex gap-3"
            >
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Who is it for */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-5 shadow-card border-2 border-border"
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-secondary" />
          <h2 className="font-display font-bold text-base">{t('Who Is It For?', 'यह किसके लिए है?')}</h2>
        </div>
        <div className="space-y-2">
          {[
            t('Students (Class 1-10) who want to excel in math', 'छात्र (कक्षा 1-10) जो गणित में उत्कृष्ट होना चाहते हैं'),
            t('Parents looking for smart learning tools for their kids', 'माता-पिता जो अपने बच्चों के लिए स्मार्ट लर्निंग टूल्स ढूंढ रहे हैं'),
            t('Teachers who want to introduce Vedic Math in classrooms', 'शिक्षक जो कक्षाओं में वैदिक गणित पेश करना चाहते हैं'),
            t('Anyone curious about ancient Indian mathematics!', 'कोई भी जो प्राचीन भारतीय गणित के बारे में उत्सुक है!'),
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Star className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="gradient-primary rounded-xl p-5 text-primary-foreground text-center"
      >
        <h2 className="font-display font-bold text-base mb-1">{t('Get In Touch', 'संपर्क करें')}</h2>
        <p className="text-xs opacity-80 mb-3">
          {t('Have questions or suggestions? We\'d love to hear from you!', 'कोई सवाल या सुझाव? हम आपसे सुनना चाहेंगे!')}
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="mailto:hello@mathgenius.app" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <Mail className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <Globe className="w-5 h-5" />
          </a>
        </div>
      </motion.div>

      {/* About Developer */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="bg-card rounded-xl p-5 shadow-card border-2 border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-base">{t('About the Developer', 'डेवलपर के बारे में')}</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-elevated shrink-0">
            <img src={arjunPhoto} alt="Arjun Dhiman" className="w-full h-full object-cover" />
          </div>
           <div className="text-center sm:text-left">
            <h3 className="font-display font-bold text-lg">{t('Arjun Dhiman', 'अर्जुन धीमान')}</h3>
            <p className="text-sm text-primary font-semibold">{t('Founder & Developer', 'संस्थापक और डेवलपर')}</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {t(
                'I am Arjun Dhiman, 18 years old, currently pursuing BCA from HSR College under Maa Shakumbari University. Son of Mr. Deepak Kumar. I built MathGenius for students who struggle with math — to make it simple, fun and easy for them using Vedic Math tricks and AI. My goal is that no student should feel scared of math ever again.',
                'मैं अर्जुन धीमान हूँ, 18 साल का, वर्तमान में माँ शाकुम्भरी विश्वविद्यालय के अंतर्गत HSR कॉलेज से BCA कर रहा हूँ। पिता श्री दीपक कुमार। मैंने MathGenius उन बच्चों के लिए बनाया है जो गणित में कमजोर हैं — ताकि वैदिक गणित ट्रिक्स और AI की मदद से गणित उनके लिए आसान, मज़ेदार और सरल बन जाए। मेरा लक्ष्य है कि कोई भी बच्चा गणित से कभी न डरे।'
              )}
            </p>
            <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
              <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground pb-4">
        {t('Made with ❤️ in India', 'भारत में ❤️ से बनाया गया')}
      </p>
    </div>
  );
};

export default AboutPage;
