import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, ChevronDown, ChevronUp, Sparkles, Calculator, User, Lightbulb, History } from 'lucide-react';

type Sutra = {
  id: number;
  nameEn: string;
  nameHi: string;
  meaningEn: string;
  meaningHi: string;
  descEn: string;
  descHi: string;
  historyEn: string;
  historyHi: string;
  usageEn: string;
  usageHi: string;
  exampleProblem: string;
  exampleSteps: { en: string; hi: string }[];
  formulaHighlight: string;
};

const sutras: Sutra[] = [
  {
    id: 1, nameEn: 'Ekadhikena Purvena', nameHi: 'एकाधिकेन पूर्वेण',
    meaningEn: 'By one more than the previous one', meaningHi: 'पिछले से एक अधिक द्वारा',
    descEn: 'Used for squaring numbers ending in 5, and for specific division problems. Multiply the preceding digit by one more than itself, then append 25.',
    descHi: '5 से समाप्त होने वाली संख्याओं के वर्ग और विशेष भाग की समस्याओं के लिए। पिछले अंक को उसमें एक जोड़कर गुणा करें, फिर 25 जोड़ दें।',
    historyEn: 'Discovered by Jagadguru Shankaracharya Bharati Krishna Tirthaji (1884-1960) from the Atharva Veda appendix (Parishishta). He spent 8 years (1911-1918) in deep meditation at Sringeri Math to decode these sutras from ancient Sanskrit texts.',
    historyHi: 'जगद्गुरु शंकराचार्य भारती कृष्ण तीर्थजी (1884-1960) ने अथर्ववेद परिशिष्ट से इसकी खोज की। उन्होंने श्रृंगेरी मठ में 8 वर्ष (1911-1918) गहन ध्यान में बिताकर प्राचीन संस्कृत ग्रंथों से इन सूत्रों को समझा।',
    usageEn: 'Best for: Squaring numbers ending in 5 (25², 35², 45²...), recurring decimals (1/19, 1/29), and competitive exam mental math shortcuts.',
    usageHi: 'सबसे अच्छा: 5 से समाप्त संख्याओं का वर्ग (25², 35², 45²...), आवर्ती दशमलव (1/19, 1/29), और प्रतियोगी परीक्षा मानसिक गणित।',
    exampleProblem: '35² = ?',
    exampleSteps: [
      { en: 'Take 3 (digit before 5)', hi: '3 लें (5 से पहले का अंक)' },
      { en: '3 × (3+1) = 3 × 4 = 12', hi: '3 × (3+1) = 3 × 4 = 12' },
      { en: 'Append 25 → 1225', hi: '25 जोड़ें → 1225' },
      { en: 'Answer: 35² = 1225', hi: 'उत्तर: 35² = 1225' },
    ],
    formulaHighlight: 'n5² = n×(n+1) | 25',
  },
  {
    id: 2, nameEn: 'Nikhilam Navatashcaramam Dashatah', nameHi: 'निखिलम् नवतश्चरमं दशतः',
    meaningEn: 'All from 9 and the last from 10', meaningHi: 'सब 9 से और अंतिम 10 से',
    descEn: 'Used for multiplication of numbers close to a base (10, 100, 1000). Subtract each number from the base, cross-subtract, and multiply the remainders.',
    descHi: 'आधार (10, 100, 1000) के करीब संख्याओं के गुणन के लिए। प्रत्येक संख्या को आधार से घटाएं, क्रॉस-घटाव करें, और शेषफलों को गुणा करें।',
    historyEn: 'One of the most celebrated Vedic sutras, rediscovered by Tirthaji from Vedic manuscripts. This method was likely used by ancient Indian mathematicians for trade calculations, as numbers near 100 and 1000 were common in commerce.',
    historyHi: 'सबसे प्रसिद्ध वैदिक सूत्रों में से एक, तीर्थजी ने वैदिक पांडुलिपियों से पुनः खोजा। यह विधि संभवतः प्राचीन भारतीय गणितज्ञों द्वारा व्यापार गणना के लिए उपयोग की जाती थी।',
    usageEn: 'Best for: Multiplying numbers near 10, 100, 1000 (97×96, 988×997). Also used for finding complements and quick subtraction from round numbers.',
    usageHi: 'सबसे अच्छा: 10, 100, 1000 के पास की संख्याओं का गुणन (97×96, 988×997)। पूरक खोजने और गोल संख्याओं से त्वरित घटाव के लिए भी।',
    exampleProblem: '97 × 96 = ?',
    exampleSteps: [
      { en: 'Base = 100. Deficiency: 97→-3, 96→-4', hi: 'आधार = 100. कमी: 97→-3, 96→-4' },
      { en: 'Cross: 97-4 = 93 (or 96-3 = 93)', hi: 'क्रॉस: 97-4 = 93 (या 96-3 = 93)' },
      { en: 'Multiply deficiencies: 3×4 = 12', hi: 'कमियों को गुणा: 3×4 = 12' },
      { en: 'Answer: 9312', hi: 'उत्तर: 9312' },
    ],
    formulaHighlight: '(Base-a)(Base-b) = (a-b̃)|ab̃',
  },
  {
    id: 3, nameEn: 'Urdhva Tiryagbhyam', nameHi: 'ऊर्ध्व तिर्यग्भ्याम्',
    meaningEn: 'Vertically and crosswise', meaningHi: 'ऊर्ध्वाधर और तिरछा',
    descEn: 'The most powerful general multiplication sutra. Works for any multiplication by combining vertical and crosswise products. Can multiply numbers of any size!',
    descHi: 'सबसे शक्तिशाली सामान्य गुणन सूत्र। किसी भी गुणन के लिए ऊर्ध्वाधर और तिरछे गुणनफलों को मिलाकर काम करता है। किसी भी आकार की संख्याएं गुणा कर सकता है!',
    historyEn: 'Considered the crown jewel of Vedic Mathematics. Tirthaji described this as the most versatile sutra. Ancient Indian mathematicians like Aryabhata (476 CE) and Brahmagupta (598 CE) used similar cross-multiplication concepts.',
    historyHi: 'वैदिक गणित का मुकुट मणि माना जाता है। तीर्थजी ने इसे सबसे बहुमुखी सूत्र बताया। आर्यभट (476 ई.) और ब्रह्मगुप्त (598 ई.) जैसे प्राचीन भारतीय गणितज्ञों ने समान क्रॉस-गुणन अवधारणाओं का उपयोग किया।',
    usageEn: 'Best for: ANY multiplication (2-digit, 3-digit, polynomials). The universal method that replaces long multiplication. Essential for competitive exams like IIT-JEE, Olympiads.',
    usageHi: 'सबसे अच्छा: कोई भी गुणन (2-अंक, 3-अंक, बहुपद)। सार्वभौमिक विधि जो लंबी गुणा की जगह लेती है। IIT-JEE, ओलंपियाड जैसी प्रतियोगी परीक्षाओं के लिए आवश्यक।',
    exampleProblem: '23 × 14 = ?',
    exampleSteps: [
      { en: 'Vertical right: 3×4 = 12, write 2 carry 1', hi: 'दाएं ऊर्ध्वाधर: 3×4 = 12, 2 लिखो 1 हाथ' },
      { en: 'Cross: (2×4)+(3×1) = 8+3 = 11, +1 = 12, write 2 carry 1', hi: 'तिरछा: (2×4)+(3×1) = 8+3 = 11, +1 = 12, 2 लिखो 1 हाथ' },
      { en: 'Vertical left: 2×1 = 2, +1 = 3', hi: 'बाएं ऊर्ध्वाधर: 2×1 = 2, +1 = 3' },
      { en: 'Answer: 322', hi: 'उत्तर: 322' },
    ],
    formulaHighlight: 'ab × cd = a·c | (a·d+b·c) | b·d',
  },
  {
    id: 4, nameEn: 'Paravartya Yojayet', nameHi: 'परावर्त्य योजयेत्',
    meaningEn: 'Transpose and adjust', meaningHi: 'स्थानांतरित करें और समायोजित करें',
    descEn: 'Used for division by numbers slightly greater than a power of 10. Also useful for solving linear equations by transposing terms.',
    descHi: '10 की घात से थोड़ी बड़ी संख्याओं से भाग के लिए। पदों को स्थानांतरित करके रैखिक समीकरणों को हल करने के लिए भी उपयोगी।',
    historyEn: 'This sutra reflects the ancient Indian understanding of algebraic manipulation. Bhaskaracharya II (1114 CE) in his work "Lilavati" used similar transposition techniques for solving equations.',
    historyHi: 'यह सूत्र बीजगणितीय हेरफेर की प्राचीन भारतीय समझ को दर्शाता है। भास्कराचार्य II (1114 ई.) ने अपनी रचना "लीलावती" में समीकरण हल करने के लिए समान स्थानांतरण तकनीकों का उपयोग किया।',
    usageEn: 'Best for: Division by 11, 12, 13... (numbers just above 10/100), solving linear equations (ax+b=c), and simplifying algebraic expressions.',
    usageHi: 'सबसे अच्छा: 11, 12, 13 से भाग, रैखिक समीकरण हल करना (ax+b=c), और बीजगणितीय व्यंजकों को सरल बनाना।',
    exampleProblem: '1234 ÷ 12 = ?',
    exampleSteps: [
      { en: 'Divisor 12, flag = -2', hi: 'भाजक 12, फ्लैग = -2' },
      { en: 'Bring down 1. 1×(-2)=-2, 2+(-2)=0', hi: '1 नीचे लाएं। 1×(-2)=-2, 2+(-2)=0' },
      { en: '0×(-2)=0, 3+0=3. 3×(-2)=-6, 4+(-6)=-2→adjust', hi: '0×(-2)=0, 3+0=3। 3×(-2)=-6, 4+(-6)=-2→समायोजन' },
      { en: 'Answer: 102 remainder 10', hi: 'उत्तर: 102 शेषफल 10' },
    ],
    formulaHighlight: 'Flag = -(divisor - base)',
  },
  {
    id: 5, nameEn: 'Shunyam Saamyasamuccaye', nameHi: 'शून्यम् साम्यसमुच्चये',
    meaningEn: 'When the sum is the same, that sum is zero', meaningHi: 'जब योग समान हो, तो वह योग शून्य है',
    descEn: 'If the sum of numerator and denominator on both sides of an equation are equal, then that sum equals zero. A powerful shortcut for specific equation types.',
    descHi: 'यदि किसी समीकरण के दोनों पक्षों में अंश और हर का योग बराबर हो, तो वह योग शून्य है। विशिष्ट समीकरण प्रकारों के लिए शक्तिशाली शॉर्टकट।',
    historyEn: 'This sutra embodies the concept of "Shunya" (zero) which was India\'s greatest contribution to mathematics. Brahmagupta first formalized the rules of zero in 628 CE in "Brahmasphutasiddhanta".',
    historyHi: 'यह सूत्र "शून्य" की अवधारणा को मूर्त करता है जो गणित में भारत का सबसे बड़ा योगदान था। ब्रह्मगुप्त ने 628 ई. में "ब्रह्मस्फुटसिद्धांत" में शून्य के नियमों को औपचारिक रूप दिया।',
    usageEn: 'Best for: Solving equations where LHS and RHS have equal coefficient sums, simplifying complex fractions, and finding roots quickly.',
    usageHi: 'सबसे अच्छा: जहां LHS और RHS के गुणांक योग बराबर हों, जटिल भिन्नों को सरल बनाना, और मूल तेजी से ज्ञात करना।',
    exampleProblem: '(x+3)(x+4) = (x+1)(x+12)',
    exampleSteps: [
      { en: 'Sum of constants left: 3+4 = 7', hi: 'बाईं ओर स्थिरांकों का योग: 3+4 = 7' },
      { en: 'Sum of constants right: 1+12 = 13', hi: 'दाईं ओर स्थिरांकों का योग: 1+12 = 13' },
      { en: 'Expand and solve: x²+7x+12 = x²+13x+12', hi: 'विस्तार करें: x²+7x+12 = x²+13x+12' },
      { en: '6x = 0 → x = 0', hi: '6x = 0 → x = 0' },
    ],
    formulaHighlight: 'If Σ(LHS) = Σ(RHS) → Σ = 0',
  },
  {
    id: 6, nameEn: 'Anurupye Shunyamanyat', nameHi: 'आनुरूप्ये शून्यमन्यत्',
    meaningEn: 'If one is in ratio, the other is zero', meaningHi: 'यदि एक अनुपात में है, तो दूसरा शून्य है',
    descEn: 'Used in simultaneous equations. If one variable\'s coefficients are in the same ratio as the constants, the other variable is zero.',
    descHi: 'युगपत समीकरणों में उपयोग। यदि एक चर के गुणांक स्थिरांकों के समान अनुपात में हों, तो दूसरा चर शून्य है।',
    historyEn: 'This reflects the deep algebraic understanding of ancient Indian scholars. Mahavira (9th century CE), a Jain mathematician, extensively worked with simultaneous equations in his "Ganita Sara Sangraha".',
    historyHi: 'यह प्राचीन भारतीय विद्वानों की गहन बीजगणितीय समझ को दर्शाता है। महावीर (9वीं सदी ई.), एक जैन गणितज्ञ, ने अपने "गणित सार संग्रह" में युगपत समीकरणों पर व्यापक कार्य किया।',
    usageEn: 'Best for: Solving simultaneous linear equations quickly by identifying ratio patterns, saving significant time in competitive exams.',
    usageHi: 'सबसे अच्छा: अनुपात पैटर्न पहचानकर युगपत रैखिक समीकरण तेजी से हल करना, प्रतियोगी परीक्षाओं में समय बचाना।',
    exampleProblem: '3x + 7y = 2, 4x + 21y = 6',
    exampleSteps: [
      { en: 'Constants ratio: 2:6 = 1:3', hi: 'स्थिरांक अनुपात: 2:6 = 1:3' },
      { en: 'y coefficients ratio: 7:21 = 1:3 (same!)', hi: 'y गुणांक अनुपात: 7:21 = 1:3 (समान!)' },
      { en: 'Since ratios match, x = 0', hi: 'चूँकि अनुपात मिलते हैं, x = 0' },
      { en: 'Substitute: 7y = 2, y = 2/7', hi: 'प्रतिस्थापन: 7y = 2, y = 2/7' },
    ],
    formulaHighlight: 'Ratio match → other var = 0',
  },
  {
    id: 7, nameEn: 'Sankalana-vyavakalanabhyam', nameHi: 'संकलन-व्यवकलनाभ्याम्',
    meaningEn: 'By addition and subtraction', meaningHi: 'जोड़ और घटाव द्वारा',
    descEn: 'Solve simultaneous equations by adding or subtracting them to eliminate one variable directly. Simple yet extremely effective.',
    descHi: 'युगपत समीकरणों को जोड़कर या घटाकर एक चर को सीधे हटाकर हल करें। सरल लेकिन अत्यंत प्रभावी।',
    historyEn: 'A fundamental technique used across civilizations, but systematized in Indian mathematics. Aryabhata\'s "Aryabhatiya" (499 CE) contains early examples of elimination methods.',
    historyHi: 'सभ्यताओं में उपयोग की जाने वाली मौलिक तकनीक, लेकिन भारतीय गणित में व्यवस्थित। आर्यभट के "आर्यभटीय" (499 ई.) में उन्मूलन विधियों के प्रारंभिक उदाहरण हैं।',
    usageEn: 'Best for: Simultaneous equations, verification of answers, and simplifying paired expressions in algebra.',
    usageHi: 'सबसे अच्छा: युगपत समीकरण, उत्तरों का सत्यापन, और बीजगणित में युग्मित व्यंजकों को सरल बनाना।',
    exampleProblem: 'x+y=10, x-y=4',
    exampleSteps: [
      { en: 'Add both: 2x = 14, x = 7', hi: 'दोनों जोड़ें: 2x = 14, x = 7' },
      { en: 'Subtract: 2y = 6, y = 3', hi: 'घटाएं: 2y = 6, y = 3' },
      { en: 'Answer: x=7, y=3', hi: 'उत्तर: x=7, y=3' },
    ],
    formulaHighlight: 'Add/Subtract → Eliminate',
  },
  {
    id: 8, nameEn: 'Puranapuranabhyam', nameHi: 'पूरणापूरणाभ्याम्',
    meaningEn: 'By completion or non-completion', meaningHi: 'पूरा करने या न करने द्वारा',
    descEn: 'Complete the expression to a known form (like completing the square) to simplify calculations. Transforms complex problems into simpler ones.',
    descHi: 'गणना को सरल बनाने के लिए व्यंजक को एक ज्ञात रूप में पूरा करें (जैसे वर्ग पूरा करना)। जटिल समस्याओं को सरल में बदलता है।',
    historyEn: 'Completing the square was known to Indian mathematicians centuries before Al-Khwarizmi. Sridhara (750 CE) used this technique in his algebraic works, predating European methods by over 500 years.',
    historyHi: 'वर्ग पूरा करना अल-ख्वारिज्मी से सदियों पहले भारतीय गणितज्ञों को ज्ञात था। श्रीधर (750 ई.) ने अपने बीजगणितीय कार्यों में इस तकनीक का उपयोग किया, यूरोपीय विधियों से 500 वर्ष पहले।',
    usageEn: 'Best for: Solving quadratic equations, simplifying expressions, integration problems, and geometric calculations.',
    usageHi: 'सबसे अच्छा: द्विघात समीकरण हल करना, व्यंजकों को सरल बनाना, समाकलन समस्याएं, और ज्यामितीय गणना।',
    exampleProblem: 'x² + 6x = 7',
    exampleSteps: [
      { en: 'Complete the square: add (6/2)²=9 both sides', hi: 'वर्ग पूरा करें: दोनों तरफ (6/2)²=9 जोड़ें' },
      { en: 'x² + 6x + 9 = 16', hi: 'x² + 6x + 9 = 16' },
      { en: '(x+3)² = 16 → x+3 = ±4', hi: '(x+3)² = 16 → x+3 = ±4' },
      { en: 'x = 1 or x = -7', hi: 'x = 1 या x = -7' },
    ],
    formulaHighlight: 'x²+bx → (x+b/2)²',
  },
  {
    id: 9, nameEn: 'Chalana-Kalanabhyam', nameHi: 'चलन-कलनाभ्याम्',
    meaningEn: 'Differences and similarities', meaningHi: 'अंतर और समानताएं',
    descEn: 'Used for finding roots of quadratic equations by observing differences and ratios in coefficients. Find two numbers whose sum and product match.',
    descHi: 'गुणांकों में अंतर और अनुपात देखकर द्विघात समीकरणों के मूल ज्ञात करने के लिए। दो संख्याएँ ज्ञात करें जिनका योग और गुणनफल मिलता हो।',
    historyEn: 'This technique is related to the ancient Indian concept of "Indeterminate Analysis" (Kuttaka). Brahmagupta and later Bhaskara II developed sophisticated methods for solving such equations.',
    historyHi: 'यह तकनीक "कुट्टक" (अनिश्चित विश्लेषण) की प्राचीन भारतीय अवधारणा से संबंधित है। ब्रह्मगुप्त और बाद में भास्कर II ने ऐसे समीकरणों को हल करने के लिए परिष्कृत विधियां विकसित कीं।',
    usageEn: 'Best for: Factoring quadratic expressions, finding roots mentally, and solving polynomial equations in competitive exams.',
    usageHi: 'सबसे अच्छा: द्विघात व्यंजकों का गुणनखंडन, मानसिक रूप से मूल ज्ञात करना, और प्रतियोगी परीक्षाओं में बहुपद समीकरण हल करना।',
    exampleProblem: 'x² - 7x + 12 = 0',
    exampleSteps: [
      { en: 'Find two numbers: product=12, sum=7', hi: 'दो संख्याएँ ज्ञात करें: गुणनफल=12, योग=7' },
      { en: 'Numbers: 3 and 4 (3×4=12, 3+4=7)', hi: 'संख्याएँ: 3 और 4 (3×4=12, 3+4=7)' },
      { en: '(x-3)(x-4) = 0', hi: '(x-3)(x-4) = 0' },
      { en: 'x = 3 or x = 4', hi: 'x = 3 या x = 4' },
    ],
    formulaHighlight: 'Sum & Product → Factors',
  },
  {
    id: 10, nameEn: 'Yavadunam', nameHi: 'यावदूनम्',
    meaningEn: 'Whatever the extent of its deficiency', meaningHi: 'जितनी भी कमी हो',
    descEn: 'For squaring numbers near a base (10, 100, 1000). Calculate deficiency from base, double-subtract, then square the deficiency.',
    descHi: 'किसी आधार (10, 100, 1000) के पास की संख्याओं के वर्ग के लिए। आधार से कमी निकालें, दोगुना-घटाव करें, फिर कमी का वर्ग करें।',
    historyEn: 'This sutra leverages the algebraic identity (a-b)² = a²-2ab+b². Ancient Indian mathematicians were masters of algebraic identities, as documented in Sulba Sutras (800 BCE), among the oldest mathematical texts.',
    historyHi: 'यह सूत्र बीजगणितीय सर्वसमिका (a-b)² = a²-2ab+b² का लाभ उठाता है। शुल्ब सूत्र (800 ई.पू.) में प्रलेखित, प्राचीन भारतीय गणितज्ञ बीजगणितीय सर्वसमिकाओं के विशेषज्ञ थे।',
    usageEn: 'Best for: Squaring numbers near 100 (96², 98², 102², 104²), mental calculation tricks, and speed mathematics competitions.',
    usageHi: 'सबसे अच्छा: 100 के पास की संख्याओं का वर्ग (96², 98², 102², 104²), मानसिक गणना ट्रिक्स, और गति गणित प्रतियोगिताएं।',
    exampleProblem: '98² = ?',
    exampleSteps: [
      { en: 'Base = 100, deficiency = 2', hi: 'आधार = 100, कमी = 2' },
      { en: '98 - 2 = 96 (first part)', hi: '98 - 2 = 96 (पहला भाग)' },
      { en: '2² = 04 (second part)', hi: '2² = 04 (दूसरा भाग)' },
      { en: 'Answer: 9604', hi: 'उत्तर: 9604' },
    ],
    formulaHighlight: 'n² = (n-d)(Base) + d²',
  },
  {
    id: 11, nameEn: 'Vyashtisamanstih', nameHi: 'व्यष्टिसमष्टिः',
    meaningEn: 'Part and whole', meaningHi: 'भाग और संपूर्ण',
    descEn: 'Problems involving averages, sums and parts. When individual parts relate to the whole systematically, use this to find unknowns.',
    descHi: 'औसत, योग और भागों से जुड़ी समस्याएं। जब व्यक्तिगत भाग व्यवस्थित रूप से संपूर्ण से संबंधित हों, तो अज्ञात ज्ञात करने के लिए इसका उपयोग करें।',
    historyEn: 'The part-whole relationship was extensively studied in Jain mathematics. Mahavira\'s "Ganita Sara Sangraha" (850 CE) contains elaborate problems on mixtures and averages using this principle.',
    historyHi: 'भाग-संपूर्ण संबंध का जैन गणित में व्यापक अध्ययन किया गया। महावीर के "गणित सार संग्रह" (850 ई.) में इस सिद्धांत का उपयोग करते हुए मिश्रण और औसत पर विस्तृत समस्याएं हैं।',
    usageEn: 'Best for: Average problems, mixture problems, data interpretation, and finding missing values in statistics.',
    usageHi: 'सबसे अच्छा: औसत समस्याएं, मिश्रण समस्याएं, डेटा व्याख्या, और सांख्यिकी में लुप्त मान ज्ञात करना।',
    exampleProblem: 'Avg of 5 numbers is 20. One removed, avg is 18. Find removed.',
    exampleSteps: [
      { en: 'Total = 5×20 = 100', hi: 'कुल = 5×20 = 100' },
      { en: 'New total = 4×18 = 72', hi: 'नया कुल = 4×18 = 72' },
      { en: 'Removed = 100-72 = 28', hi: 'हटाई गई = 100-72 = 28' },
    ],
    formulaHighlight: 'Whole - Remaining = Part',
  },
  {
    id: 12, nameEn: 'Shesanyankena Charamena', nameHi: 'शेषाण्यङ्केन चरमेण',
    meaningEn: 'The remainders by the last digit', meaningHi: 'शेष अंतिम अंक द्वारा',
    descEn: 'Express fractions as decimals using the last digit pattern. Works beautifully for denominators ending in 9, giving recurring decimals.',
    descHi: 'अंतिम अंक पैटर्न का उपयोग करके भिन्नों को दशमलव में बदलें। 9 से समाप्त होने वाले हर के लिए, आवर्ती दशमलव देता है।',
    historyEn: 'Ancient Indian mathematicians were pioneers of decimal systems. The concept of expressing fractions as recurring decimals was known in India long before Europe adopted the decimal system.',
    historyHi: 'प्राचीन भारतीय गणितज्ञ दशमलव प्रणाली के अग्रदूत थे। भिन्नों को आवर्ती दशमलव के रूप में व्यक्त करने की अवधारणा यूरोप से बहुत पहले भारत में ज्ञात थी।',
    usageEn: 'Best for: Converting fractions to decimals (1/7, 1/13, 1/19, 1/29), finding repeating decimal patterns, and number theory problems.',
    usageHi: 'सबसे अच्छा: भिन्नों को दशमलव में बदलना (1/7, 1/13, 1/19, 1/29), दोहराव दशमलव पैटर्न खोजना, और संख्या सिद्धांत समस्याएं।',
    exampleProblem: '1/19 = ?',
    exampleSteps: [
      { en: 'Last digit of 19 is 9. Use Ekadhikena with 2', hi: '19 का अंतिम अंक 9 है। एकाधिकेन 2 के साथ उपयोग करें' },
      { en: 'Start: 1, ×2=2, ×2=4, ×2=8, ×2=16(carry)...', hi: 'शुरू: 1, ×2=2, ×2=4, ×2=8, ×2=16(हाथ)...' },
      { en: '1/19 = 0.052631578947368421 (repeating)', hi: '1/19 = 0.052631578947368421 (दोहराव)' },
    ],
    formulaHighlight: '1/x9 → multiply by (x+1)',
  },
  {
    id: 13, nameEn: 'Sopantyadvayamantyam', nameHi: 'सोपान्त्यद्वयमन्त्यम्',
    meaningEn: 'The ultimate and twice the penultimate', meaningHi: 'अंतिम और उपांत्य का दोगुना',
    descEn: 'Used in specific fraction addition patterns where terms telescope. Each term cancels partially with the next, leaving only first and last.',
    descHi: 'विशिष्ट भिन्न जोड़ पैटर्न में जहां पद टेलीस्कोप होते हैं। प्रत्येक पद आंशिक रूप से अगले से रद्द होता है, केवल पहला और अंतिम शेष रहता है।',
    historyEn: 'Telescoping series were understood by Indian mathematicians well before Leibniz. The Kerala School of Mathematics (14th-16th century) developed many such series techniques, including the Madhava series for π.',
    historyHi: 'टेलीस्कोपिंग श्रेणी लाइबनिज से बहुत पहले भारतीय गणितज्ञों को समझ में आ गई थी। केरल गणित विद्यालय (14वीं-16वीं सदी) ने π के लिए माधव श्रेणी सहित ऐसी कई श्रेणी तकनीकें विकसित कीं।',
    usageEn: 'Best for: Summing series of fractions (1/n(n+1) type), telescoping sums, and simplifying complex fraction additions.',
    usageHi: 'सबसे अच्छा: भिन्नों की श्रेणी का योग (1/n(n+1) प्रकार), टेलीस्कोपिंग योग, और जटिल भिन्न जोड़ को सरल बनाना।',
    exampleProblem: '1/(2×3) + 1/(3×4) + 1/(4×5)',
    exampleSteps: [
      { en: 'Each term = 1/n - 1/(n+1) (telescoping)', hi: 'प्रत्येक पद = 1/n - 1/(n+1) (टेलीस्कोपिंग)' },
      { en: '= 1/2 - 1/3 + 1/3 - 1/4 + 1/4 - 1/5', hi: '= 1/2 - 1/3 + 1/3 - 1/4 + 1/4 - 1/5' },
      { en: '= 1/2 - 1/5 = 3/10', hi: '= 1/2 - 1/5 = 3/10' },
    ],
    formulaHighlight: 'Telescoping: first - last',
  },
  {
    id: 14, nameEn: 'Ekanyunena Purvena', nameHi: 'एकन्यूनेन पूर्वेण',
    meaningEn: 'By one less than the previous one', meaningHi: 'पिछले से एक कम द्वारा',
    descEn: 'For multiplication where one number consists entirely of 9s. Uses the pattern: (n-1) followed by complement of n.',
    descHi: 'जब एक संख्या पूरी तरह 9 से बनी हो तब गुणन के लिए। पैटर्न: (n-1) फिर n का पूरक।',
    historyEn: 'The elegance of multiplying by 9s was well known in ancient Indian marketplace arithmetic. Merchants used these tricks for rapid trade calculations, making India a center of mathematical commerce.',
    historyHi: 'प्राचीन भारतीय बाजार अंकगणित में 9 से गुणा की सुंदरता प्रसिद्ध थी। व्यापारी तेज व्यापार गणना के लिए इन ट्रिक्स का उपयोग करते थे।',
    usageEn: 'Best for: Multiplying by 9, 99, 999, 9999 etc. Extremely fast mental calculation trick used in speed math competitions worldwide.',
    usageHi: 'सबसे अच्छा: 9, 99, 999, 9999 से गुणा। दुनिया भर में गति गणित प्रतियोगिताओं में उपयोग की जाने वाली अत्यंत तेज मानसिक गणना ट्रिक।',
    exampleProblem: '76 × 99 = ?',
    exampleSteps: [
      { en: '76 - 1 = 75 (first part)', hi: '76 - 1 = 75 (पहला भाग)' },
      { en: '100 - 76 = 24 (second part)', hi: '100 - 76 = 24 (दूसरा भाग)' },
      { en: 'Answer: 7524', hi: 'उत्तर: 7524' },
    ],
    formulaHighlight: 'n × 99 = (n-1) | (100-n)',
  },
  {
    id: 15, nameEn: 'Gunitasamuchyah', nameHi: 'गुणितसमुच्चयः',
    meaningEn: 'The product of the sum equals the sum of the product', meaningHi: 'योग का गुणनफल, गुणनफल के योग के बराबर',
    descEn: 'A verification sutra — check multiplication by comparing digit sums. The digit sum of the product must equal the product of individual digit sums.',
    descHi: 'एक सत्यापन सूत्र — अंक योग की तुलना करके गुणन की जांच करें। गुणनफल का अंक योग, व्यक्तिगत अंक योगों के गुणनफल के बराबर होना चाहिए।',
    historyEn: 'This "casting out nines" verification method was described by Tirthaji as an integral part of Vedic checking. Similar methods appear in the works of Indian mathematician Narayana Pandit (14th century).',
    historyHi: 'इस "नौ निकालो" सत्यापन विधि को तीर्थजी ने वैदिक जांच का अभिन्न अंग बताया। समान विधियां भारतीय गणितज्ञ नारायण पंडित (14वीं सदी) के कार्यों में दिखाई देती हैं।',
    usageEn: 'Best for: Verifying multiplication, division, and algebraic factorization results. A quick sanity check before submitting answers.',
    usageHi: 'सबसे अच्छा: गुणन, भाग, और बीजगणितीय गुणनखंडन परिणामों का सत्यापन। उत्तर जमा करने से पहले त्वरित जांच।',
    exampleProblem: 'Verify: 23 × 14 = 322',
    exampleSteps: [
      { en: 'Digit sum of 23: 2+3 = 5', hi: '23 का अंक योग: 2+3 = 5' },
      { en: 'Digit sum of 14: 1+4 = 5', hi: '14 का अंक योग: 1+4 = 5' },
      { en: '5 × 5 = 25 → digit sum = 7', hi: '5 × 5 = 25 → अंक योग = 7' },
      { en: 'Digit sum of 322: 3+2+2 = 7 ✓ Verified!', hi: '322 का अंक योग: 3+2+2 = 7 ✓ सत्यापित!' },
    ],
    formulaHighlight: 'DigitSum(a×b) = DigitSum(DigitSum(a)×DigitSum(b))',
  },
  {
    id: 16, nameEn: 'Gunakasamuchyah', nameHi: 'गुणकसमुच्चयः',
    meaningEn: 'The factors of the sum equal the sum of the factors', meaningHi: 'योग के गुणनखंड, गुणनखंडों के योग के बराबर',
    descEn: 'Verification sutra for factorization. Put x=1 in both sides — if the values match, the factorization is correct.',
    descHi: 'गुणनखंडन के सत्यापन सूत्र। दोनों पक्षों में x=1 रखें — यदि मान मिलते हैं, तो गुणनखंडन सही है।',
    historyEn: 'This checking method complements Sutra 15. Together they form a powerful verification system. Tirthaji emphasized that Vedic Mathematics always provides built-in checks for every calculation.',
    historyHi: 'यह जांच विधि सूत्र 15 की पूरक है। साथ मिलकर ये एक शक्तिशाली सत्यापन प्रणाली बनाते हैं। तीर्थजी ने जोर दिया कि वैदिक गणित हर गणना के लिए अंतर्निहित जांच प्रदान करता है।',
    usageEn: 'Best for: Verifying polynomial factorization, checking HCF/LCM calculations, and confirming algebraic simplifications.',
    usageHi: 'सबसे अच्छा: बहुपद गुणनखंडन सत्यापन, HCF/LCM गणना जांच, और बीजगणितीय सरलीकरण की पुष्टि।',
    exampleProblem: 'Verify: x²+5x+6 = (x+2)(x+3)',
    exampleSteps: [
      { en: 'Put x=1 in LHS: 1+5+6 = 12', hi: 'LHS में x=1 रखें: 1+5+6 = 12' },
      { en: 'Put x=1 in RHS: (1+2)(1+3) = 3×4 = 12', hi: 'RHS में x=1 रखें: (1+2)(1+3) = 3×4 = 12' },
      { en: '12 = 12 ✓ Factorization verified!', hi: '12 = 12 ✓ गुणनखंडन सत्यापित!' },
    ],
    formulaHighlight: 'f(1) = product of factor(1)s',
  },
];

const SutrasPage = () => {
  const { t, lang } = useLanguage();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="gradient-hero rounded-2xl p-6 text-primary-foreground text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-white/10 dark:bg-green-400/10" />
          <div className="absolute -left-8 -bottom-8 w-20 h-20 rounded-full bg-white/10 dark:bg-green-400/10" />
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-90 dark:text-white" />
          <h1 className="font-display font-bold text-2xl mb-1">{t('Vedic Math Sutras', 'वैदिक गणित सूत्र')}</h1>
          <p className="text-sm opacity-80">{t(`All ${sutras.length} Sutras with detailed explanations`, `सभी ${sutras.length} सूत्र विस्तृत व्याख्या के साथ`)}</p>
        </div>
      </motion.div>

      {/* Origin Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl p-4 shadow-card border-2 border-border"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg gradient-warm flex items-center justify-center shrink-0">
            <History className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm">{t('Origin & Creator', 'उत्पत्ति और रचयिता')}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              {t(
                'These 16 Vedic Sutras were rediscovered by Jagadguru Shankaracharya Sri Bharati Krishna Tirthaji Maharaj (1884-1960) from the Parishishta (appendix) of Atharva Veda. He spent 8 years (1911-1918) in deep study at Sringeri Math, Karnataka. His book "Vedic Mathematics" was published posthumously in 1965 and has since revolutionized mental mathematics worldwide.',
                'ये 16 वैदिक सूत्र जगद्गुरु शंकराचार्य श्री भारती कृष्ण तीर्थजी महाराज (1884-1960) ने अथर्ववेद के परिशिष्ट से पुनः खोजे। उन्होंने कर्नाटक के श्रृंगेरी मठ में 8 वर्ष (1911-1918) गहन अध्ययन किया। उनकी पुस्तक "वैदिक गणित" 1965 में मरणोपरांत प्रकाशित हुई और तब से दुनिया भर में मानसिक गणित में क्रांति ला दी है।'
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sutras List */}
      <div className="space-y-3">
        {sutras.map((sutra, index) => {
          const isOpen = expanded === sutra.id;
          return (
            <motion.div
              key={sutra.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-card rounded-xl shadow-card border-2 border-border overflow-hidden"
            >
              {/* Sutra Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : sutra.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-display font-bold text-xs">{sutra.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm truncate">
                    {lang === 'en' ? sutra.nameEn : sutra.nameHi}
                  </h3>
                  <p className="text-[10px] text-muted-foreground italic truncate">
                    {lang === 'en' ? `"${sutra.meaningEn}"` : `"${sutra.meaningHi}"`}
                  </p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                      {/* Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {lang === 'en' ? sutra.descEn : sutra.descHi}
                      </p>

                      {/* History */}
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <History className="w-3 h-3 text-accent" />
                          <span className="text-[10px] font-bold text-accent uppercase">{t('History & Origin', 'इतिहास और उत्पत्ति')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {lang === 'en' ? sutra.historyEn : sutra.historyHi}
                        </p>
                      </div>

                      {/* When to use */}
                      <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Lightbulb className="w-3 h-3 text-secondary" />
                          <span className="text-[10px] font-bold text-secondary uppercase">{t('When to Use', 'कब उपयोग करें')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {lang === 'en' ? sutra.usageEn : sutra.usageHi}
                        </p>
                      </div>

                      {/* Formula Highlight */}
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-bold text-primary uppercase">{t('Formula', 'सूत्र')}</span>
                        </div>
                        <p className="font-mono text-sm font-bold text-primary">{sutra.formulaHighlight}</p>
                      </div>

                      {/* Example */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Calculator className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-xs font-bold">{t('Example', 'उदाहरण')}: {sutra.exampleProblem}</span>
                        </div>
                        <div className="space-y-1.5">
                          {sutra.exampleSteps.map((step, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[10px] bg-secondary/20 text-secondary rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                              <p className="text-xs text-foreground">{lang === 'en' ? step.en : step.hi}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SutrasPage;
