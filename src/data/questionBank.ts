/**
 * Question Bank — 50+ questions per topic per difficulty
 * NCERT-aligned, level-progressive, class-wise appropriate
 * Vedic Math | Finger Math | Brain Development
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  display: string;
  answer: number;
  hint: { en: string; hi: string };
  solution?: { en: string; hi: string };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Level within difficulty (1-3 for easy, 4-6 for medium, 7-10 for hard)
// Returns 0-1 scaling factor for fine-grained progression
const subScale = (level: number): number => {
  const pos = ((level - 1) % 3); // 0,1,2
  return pos / 3;                 // 0, 0.33, 0.66
};

// ── VEDIC MATH GENERATORS ─────────────────────────────────────────────────────

// ─ Addition ─────────────────────────────────────────────────────────────────
const vedicAdd = (d: Difficulty, level = 1): Question => {
  let a: number, b: number;
  if (d === 'easy') {
    // Class 1-4: single to double digit
    const max = level <= 2 ? 9 : level <= 3 ? 20 : 49;
    a = rand(1, max); b = rand(1, max);
  } else if (d === 'medium') {
    // Class 5-7: two to three digit
    const min = level <= 5 ? 10 : 50;
    const max = level <= 4 ? 99 : level <= 5 ? 199 : 499;
    a = rand(min, max); b = rand(min, max);
  } else {
    // Class 8-10: three digit+, multiple addends
    const min = level <= 8 ? 100 : 500;
    a = rand(min, 999); b = rand(min, 999);
  }
  const ans = a + b;
  return {
    display: `${a} + ${b} = ?`,
    answer: ans,
    hint: {
      en: d === 'easy' ? 'Count on from the bigger number' : d === 'medium' ? 'Add tens first, then ones' : 'Use Vedic Sutra — split and add',
      hi: d === 'easy' ? 'बड़ी संख्या से आगे गिनो' : d === 'medium' ? 'पहले दहाई जोड़ो, फिर इकाई' : 'वैदिक सूत्र — तोड़कर जोड़ो',
    },
    solution: {
      en: `${a} + ${b} = ${ans}. Split: ${Math.floor(a/10)*10} + ${a%10} + ${Math.floor(b/10)*10} + ${b%10} = ${ans}`,
      hi: `${a} + ${b} = ${ans}`,
    },
  };
};

// ─ Subtraction ───────────────────────────────────────────────────────────────
const vedicSub = (d: Difficulty, level = 1): Question => {
  let a: number, b: number;
  if (d === 'easy') {
    b = rand(1, level <= 2 ? 9 : 19);
    a = rand(b, b + (level <= 2 ? 9 : 20));
  } else if (d === 'medium') {
    b = rand(10, level <= 4 ? 49 : 99);
    a = rand(b + 1, b + rand(10, 100));
  } else {
    b = rand(100, level <= 8 ? 499 : 799);
    a = rand(b + 1, b + rand(100, 500));
  }
  const ans = a - b;
  return {
    display: `${a} − ${b} = ?`,
    answer: ans,
    hint: {
      en: d === 'easy' ? 'Count back from the bigger number' : d === 'medium' ? 'Subtract tens then ones. Nikhilam method for near-100 numbers' : 'Use Vedic complement method (Nikhilam Sutra)',
      hi: d === 'easy' ? 'बड़ी संख्या से पीछे गिनो' : d === 'medium' ? 'पहले दहाई घटाओ फिर इकाई। 100 के पास की संख्या के लिए निखिलम सूत्र' : 'वैदिक पूरक विधि (निखिलम सूत्र) का उपयोग करो',
    },
    solution: {
      en: `${a} − ${b} = ${ans}`,
      hi: `${a} − ${b} = ${ans}`,
    },
  };
};

// ─ Multiplication ─────────────────────────────────────────────────────────────
const vedicMul = (d: Difficulty, level = 1): Question => {
  let a: number, b: number;
  if (d === 'easy') {
    // Times tables 2-10
    const maxTable = level <= 1 ? 5 : level <= 2 ? 10 : 12;
    a = rand(2, maxTable); b = rand(2, maxTable);
  } else if (d === 'medium') {
    const useSpecial = Math.random() > 0.5;
    if (useSpecial) {
      // Vedic special patterns: numbers near 100, same first digit, sum of last digits = 10
      const patterns = [
        () => { const n = rand(91, 99); return [n, 200 - n]; }, // n × (200-n) near 100
        () => { const n = rand(11, 19); return [n, n]; }, // square near 10
        () => { const d1 = rand(2, 9); const d2 = rand(1, 9), d3 = 10 - d2; return [d1 * 10 + d2, d1 * 10 + d3]; }, // same tens, last sum 10
        () => [rand(11, 49), rand(2, 9)],
      ];
      [a, b] = pick(patterns)();
    } else {
      a = rand(11, 49); b = rand(11, 49);
    }
  } else {
    const patterns: Array<() => [number, number]> = [
      () => [rand(51, 99), rand(51, 99)],
      () => [rand(100, 299), rand(11, 49)],
      () => [rand(100, 499), rand(2, 9)],
      () => { const n = rand(21, 59); return [n, n]; }, // square
    ];
    [a, b] = pick(patterns)();
  }
  const ans = a * b;
  const hint = d === 'easy'
    ? { en: `${a} × ${b}: Use multiplication table`, hi: `${a} × ${b}: पहाड़ा याद करो` }
    : d === 'medium'
    ? { en: 'Try Urdhva-Tiryagbhyam or base method (near 100)', hi: 'ऊर्ध्व-तिर्यग्भ्याम या आधार विधि (100 के पास) आज़माओ' }
    : { en: 'Urdhva-Tiryagbhyam: vertical & crosswise multiplication', hi: 'ऊर्ध्व-तिर्यग्भ्याम: ऊपर और तिरछा गुणा' };
  return {
    display: `${a} × ${b} = ?`,
    answer: ans,
    hint,
    solution: {
      en: `${a} × ${b} = ${ans}. ${a} = ${Math.floor(a/10)}|${a%10}, ${b} = ${Math.floor(b/10)}|${b%10}`,
      hi: `${a} × ${b} = ${ans}`,
    },
  };
};

// ─ Division ──────────────────────────────────────────────────────────────────
const vedicDiv = (d: Difficulty, level = 1): Question => {
  let divisor: number, quotient: number;
  if (d === 'easy') {
    divisor = rand(2, level <= 2 ? 5 : 9);
    quotient = rand(1, level <= 2 ? 9 : 12);
  } else if (d === 'medium') {
    divisor = rand(2, 12);
    quotient = rand(10, level <= 4 ? 25 : 50);
  } else {
    divisor = rand(7, 25);
    quotient = rand(10, level <= 8 ? 50 : 99);
  }
  const dividend = divisor * quotient;
  return {
    display: `${dividend} ÷ ${divisor} = ?`,
    answer: quotient,
    hint: {
      en: d === 'easy' ? `How many times does ${divisor} go into ${dividend}?` : d === 'medium' ? 'Use Paravartya Yojayet for division' : 'Vedic flag division (Dhvajanka method)',
      hi: d === 'easy' ? `${divisor} कितनी बार ${dividend} में जाता है?` : d === 'medium' ? 'परावर्त्य योजयेत सूत्र का उपयोग करो' : 'वैदिक ध्वजांक भाग विधि',
    },
    solution: {
      en: `${dividend} ÷ ${divisor} = ${quotient} (verify: ${divisor} × ${quotient} = ${dividend})`,
      hi: `${dividend} ÷ ${divisor} = ${quotient}`,
    },
  };
};

// ─ Square ─────────────────────────────────────────────────────────────────────
const vedicSquare = (d: Difficulty, level = 1): Question => {
  let n: number;
  if (d === 'easy') n = rand(2, level <= 2 ? 9 : 15);
  else if (d === 'medium') n = rand(11, level <= 4 ? 25 : 39);
  else n = rand(25, level <= 8 ? 59 : 99);
  const ans = n * n;
  const duplex = (x: number) => {
    const s = x.toString();
    if (s.length === 2) return 2 * parseInt(s[0]) * parseInt(s[1]);
    return 0;
  };
  return {
    display: `${n}² = ?`,
    answer: ans,
    hint: {
      en: d === 'easy' ? `${n} × ${n} — multiply the number by itself` : d === 'medium' ? `Ekadhikena: (${n} − 5) × (${n} + 5) + 25, or Duplex method` : `Duplex (Dvandva): for ${n} = split into two digits and apply Dvandva`,
      hi: d === 'easy' ? `${n} को खुद से गुणा करो` : d === 'medium' ? `एकाधिकेन: (${n}−5)×(${n}+5)+25 या द्विगुण विधि` : `द्वन्द्व (Duplex) विधि का उपयोग करो`,
    },
    solution: {
      en: `${n}² = ${ans}. Duplex of ${n}: ${duplex(n)}`,
      hi: `${n}² = ${ans}`,
    },
  };
};

// ─ Square Root ───────────────────────────────────────────────────────────────
const PERFECT_SQUARES = [1,4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400,441,484,529,576,625,676,729,784,841,900,961,1024,1089,1156,1225,1296,1369,1444,1521,1600,1681,1764,1849,1936,2025,2116,2209,2304,2401,2500,2601,2704,2809,2916,3025,3136,3249,3364,3481,3600,3721,3844,3969,4096,4225,4356,4489,4624,4761,4900,5041,5184,5329,5476,5625,5776,5929,6084,6241,6400,6561,6724,6889,7056,7225,7396,7569,7744,7921,8100,8281,8464,8649,8836,9025,9216,9409,9604,9801];

const vedicSqrt = (d: Difficulty, level = 1): Question => {
  let sq: number, n: number;
  if (d === 'easy') {
    n = rand(1, level <= 2 ? 9 : 12);
    sq = n * n;
  } else if (d === 'medium') {
    n = rand(10, level <= 4 ? 25 : 40);
    sq = n * n;
  } else {
    n = rand(25, level <= 8 ? 70 : 99);
    sq = n * n;
  }
  return {
    display: `√${sq} = ?`,
    answer: n,
    hint: {
      en: d === 'easy' ? `What number × itself = ${sq}?` : d === 'medium' ? `Last digit of ${sq} tells the last digit of root. First group gives first digit` : `Group digits in pairs from right. Estimate first digit, use subtraction method`,
      hi: d === 'easy' ? `कौन सी संख्या × खुद = ${sq}?` : d === 'medium' ? `${sq} का अंतिम अंक मूल का अंतिम अंक बताता है` : `दाईं से जोड़े में समूह बनाओ, पहला अंक अनुमान करो`,
    },
    solution: {
      en: `√${sq} = ${n} (since ${n} × ${n} = ${sq})`,
      hi: `√${sq} = ${n} (क्योंकि ${n} × ${n} = ${sq})`,
    },
  };
};

// ─ Cube ──────────────────────────────────────────────────────────────────────
const vedicCube = (d: Difficulty, level = 1): Question => {
  let n: number;
  if (d === 'easy') n = rand(1, level <= 2 ? 5 : 8);
  else if (d === 'medium') n = rand(5, level <= 4 ? 12 : 15);
  else n = rand(10, level <= 8 ? 20 : 25);
  const ans = n * n * n;
  return {
    display: `${n}³ = ?`,
    answer: ans,
    hint: {
      en: d === 'easy' ? `${n} × ${n} × ${n}` : d === 'medium' ? `Use (a+b)³ = a³ + 3a²b + 3ab² + b³` : `Anurupyena method: ratio pattern for cubing`,
      hi: d === 'easy' ? `${n} × ${n} × ${n}` : d === 'medium' ? `(a+b)³ = a³ + 3a²b + 3ab² + b³` : `अनुरूप्येण विधि: अनुपात पैटर्न`,
    },
    solution: {
      en: `${n}³ = ${n} × ${n} × ${n} = ${n * n} × ${n} = ${ans}`,
      hi: `${n}³ = ${ans}`,
    },
  };
};

// ─ Cube Root ─────────────────────────────────────────────────────────────────
const PERFECT_CUBES: Record<number, number> = {1:1,8:2,27:3,64:4,125:5,216:6,343:7,512:8,729:9,1000:10,1331:11,1728:12,2197:13,2744:14,3375:15,4096:16,4913:17,5832:18,6859:19,8000:20,9261:21,10648:22,12167:23,13824:24,15625:25};

const vedicCubeRoot = (d: Difficulty): Question => {
  const easyKeys = [1,8,27,64,125,216,343,512,729,1000];
  const medKeys = [1331,1728,2197,2744,3375,4096,4913,5832,6859,8000];
  const hardKeys = [9261,10648,12167,13824,15625];
  const keys = d === 'easy' ? easyKeys : d === 'medium' ? medKeys : [...medKeys, ...hardKeys];
  const cube = pick(keys);
  const ans = PERFECT_CUBES[cube];
  return {
    display: `∛${cube} = ?`,
    answer: ans,
    hint: {
      en: d === 'easy' ? `What number cubed = ${cube}?` : `Last digit of ${cube} gives last digit of cube root. Group in 3s for first digit`,
      hi: d === 'easy' ? `कौन सी संख्या का घन = ${cube}?` : `${cube} का अंतिम अंक घनमूल का अंतिम अंक देता है`,
    },
    solution: {
      en: `∛${cube} = ${ans} (since ${ans}³ = ${cube})`,
      hi: `∛${cube} = ${ans}`,
    },
  };
};

// ─ Percentage ─────────────────────────────────────────────────────────────────
const vedicPercent = (d: Difficulty, level = 1): Question => {
  const easyPcts = [10, 20, 25, 50, 100];
  const medPcts = [5, 15, 30, 40, 60, 75, 80];
  const hardPcts = [12, 17, 22, 35, 45, 55, 65, 70, 85, 90, 95];

  if (d === 'easy') {
    const pct = pick(easyPcts);
    const base = rand(1, level <= 2 ? 20 : 100) * (pct === 25 ? 4 : pct === 20 ? 5 : 10);
    const ans = Math.round(base * pct / 100);
    return {
      display: `${pct}% of ${base} = ?`,
      answer: ans,
      hint: { en: `${pct}% = ${pct}/100. Multiply ${base} × ${pct} ÷ 100`, hi: `${pct}% = ${pct}/100. ${base} × ${pct} ÷ 100` },
      solution: { en: `${pct}% of ${base} = ${base} × ${pct}/100 = ${ans}`, hi: `${pct}% of ${base} = ${ans}` },
    };
  } else if (d === 'medium') {
    const pct = pick(medPcts);
    const base = rand(20, 200);
    const ans = Math.round(base * pct / 100);
    return {
      display: `${pct}% of ${base} = ?`,
      answer: ans,
      hint: { en: `Split ${pct}% = 10% + remaining. 10% of ${base} = ${base / 10}`, hi: `${pct}% को 10% + बाकी में बांटो` },
      solution: { en: `${pct}% of ${base} = ${base * pct / 100} ≈ ${ans}`, hi: `${pct}% of ${base} = ${ans}` },
    };
  } else {
    const pct = pick(hardPcts);
    const base = rand(50, 500);
    const ans = Math.round(base * pct / 100);
    return {
      display: `${pct}% of ${base} = ?`,
      answer: ans,
      hint: { en: `${pct}% = 100% − ${100 - pct}%. Or split into friendly parts`, hi: `${pct}% = 100% − ${100 - pct}%` },
      solution: { en: `${pct}% of ${base} = ${base} × ${pct}/100 = ${ans}`, hi: `${pct}% of ${base} = ${ans}` },
    };
  }
};

// ─ Algebra ───────────────────────────────────────────────────────────────────
const vedicAlgebra = (d: Difficulty, level = 1): Question => {
  if (d === 'easy') {
    // x + a = b
    const a = rand(1, level <= 2 ? 9 : 20);
    const x = rand(1, level <= 2 ? 9 : 20);
    const b = x + a;
    return {
      display: `x + ${a} = ${b}\nFind x`,
      answer: x,
      hint: { en: `Subtract ${a} from both sides: x = ${b} − ${a}`, hi: `दोनों तरफ से ${a} घटाओ: x = ${b} − ${a}` },
      solution: { en: `x + ${a} = ${b} → x = ${b} − ${a} = ${x}`, hi: `x = ${b} − ${a} = ${x}` },
    };
  } else if (d === 'medium') {
    const type = rand(1, 3);
    if (type === 1) {
      // ax = b
      const a = rand(2, 9), x = rand(2, 12);
      return {
        display: `${a}x = ${a * x}\nFind x`,
        answer: x,
        hint: { en: `Divide both sides by ${a}`, hi: `दोनों तरफ ${a} से भाग दो` },
        solution: { en: `${a}x = ${a * x} → x = ${a * x}/${a} = ${x}`, hi: `x = ${x}` },
      };
    } else if (type === 2) {
      // ax + b = c
      const a = rand(2, 5), b = rand(1, 10), x = rand(1, 10);
      const c = a * x + b;
      return {
        display: `${a}x + ${b} = ${c}\nFind x`,
        answer: x,
        hint: { en: `Step 1: ${c} − ${b} = ${c - b}. Step 2: divide by ${a}`, hi: `चरण 1: ${c} − ${b} = ${c - b}. चरण 2: ${a} से भाग दो` },
        solution: { en: `${a}x = ${c} − ${b} = ${c - b} → x = ${c - b}/${a} = ${x}`, hi: `x = ${x}` },
      };
    } else {
      // x/a = b
      const a = rand(2, 6), x = rand(2, 10);
      return {
        display: `x ÷ ${a} = ${x}\nFind x`,
        answer: x * a,
        hint: { en: `Multiply both sides by ${a}`, hi: `दोनों तरफ ${a} से गुणा करो` },
        solution: { en: `x = ${x} × ${a} = ${x * a}`, hi: `x = ${x * a}` },
      };
    }
  } else {
    // ax² = b or ax + b = cx + d
    const type = rand(1, 2);
    if (type === 1) {
      const a = rand(2, 4), x = rand(2, 8);
      const b = a * x * x;
      return {
        display: `${a}x² = ${b}\nFind x (positive)`,
        answer: x,
        hint: { en: `x² = ${b}/${a} = ${b / a}. Take square root`, hi: `x² = ${b / a}. वर्गमूल लो` },
        solution: { en: `x² = ${b / a} → x = √${b / a} = ${x}`, hi: `x = ${x}` },
      };
    } else {
      const a = rand(2, 5), b = rand(1, 15), c = rand(1, a - 1 > 0 ? a - 1 : 1), d = rand(b + 1, b + 20);
      const x = Math.round((d - b) / (a - c));
      if (x <= 0 || a === c) return vedicAlgebra('medium', level); // fallback
      const lhs = a * x + b, rhs = c * x + d;
      if (lhs !== rhs) return vedicAlgebra('medium', level);
      return {
        display: `${a}x + ${b} = ${c}x + ${d}\nFind x`,
        answer: x,
        hint: { en: `Bring x terms to left: (${a}−${c})x = ${d}−${b}`, hi: `x को बाईं तरफ लाओ: (${a}−${c})x = ${d}−${b}` },
        solution: { en: `${a - c}x = ${d - b} → x = ${x}`, hi: `x = ${x}` },
      };
    }
  }
};

// ── FINGER MATH ───────────────────────────────────────────────────────────────

const fingerCount = (d: Difficulty, level = 1): Question => {
  let n: number;
  if (d === 'easy') n = rand(1, level <= 2 ? 10 : 20);
  else if (d === 'medium') n = rand(10, level <= 4 ? 50 : 99);
  else n = rand(50, 200);
  return {
    display: `🖐️ Show ${n} on fingers.\nHow many fingers up?`,
    answer: n <= 10 ? n : n % 10 === 0 ? n / 10 : n,
    hint: {
      en: 'Right hand = 1-5, Left hand = 6-10. For larger: right = tens, left = ones',
      hi: 'दायां हाथ = 1-5, बायां हाथ = 6-10. बड़े के लिए: दायां = दहाई, बायां = इकाई',
    },
    solution: {
      en: `${n} on fingers: ${n <= 10 ? `use ${n} fingers` : `tens hand: ${Math.floor(n/10)}, ones hand: ${n%10}`}`,
      hi: `उत्तर: ${n}`,
    },
  };
};

const fingerAdd = (d: Difficulty, level = 1): Question => {
  const max = d === 'easy' ? (level <= 2 ? 5 : 10) : d === 'medium' ? 15 : 25;
  const a = rand(1, max), b = rand(1, max);
  return {
    display: `🤟 ${a} + ${b} = ?\n(Use finger counting)`,
    answer: a + b,
    hint: {
      en: `Start with ${a} fingers up, add ${b} more fingers`,
      hi: `${a} उंगलियां उठाओ, फिर ${b} और उठाओ`,
    },
    solution: { en: `${a} + ${b} = ${a + b}`, hi: `${a} + ${b} = ${a + b}` },
  };
};

const fingerSub = (d: Difficulty, level = 1): Question => {
  const max = d === 'easy' ? 10 : d === 'medium' ? 15 : 20;
  const b = rand(1, max - 1), a = rand(b, max);
  return {
    display: `👆 ${a} − ${b} = ?\n(Use finger counting)`,
    answer: a - b,
    hint: {
      en: `Start with ${a} fingers, fold down ${b}`,
      hi: `${a} उंगलियां उठाओ, ${b} वापस मोड़ो`,
    },
    solution: { en: `${a} − ${b} = ${a - b}`, hi: `${a} − ${b} = ${a - b}` },
  };
};

const fingerMul = (d: Difficulty, level = 1): Question => {
  if (d === 'easy') {
    // 6-10 multiplication on fingers
    const a = rand(6, 10), b = rand(6, 10);
    const ans = a * b;
    return {
      display: `🖐️🖐️ ${a} × ${b} = ?\n(Finger multiply method)`,
      answer: ans,
      hint: {
        en: `Finger method: (a-5) + (b-5) = tens. (10-(a-5)) × (10-(b-5)) = ones`,
        hi: `उंगली विधि: (${a}-5) + (${b}-5) = दहाई। (10-(${a}-5)) × (10-(${b}-5)) = इकाई`,
      },
      solution: { en: `${a} × ${b} = ${ans}`, hi: `${a} × ${b} = ${ans}` },
    };
  } else if (d === 'medium') {
    const a = rand(6, 9), b = rand(6, 9);
    const ans = a * b;
    return {
      display: `🤙 ${a} × ${b} = ?\n(6-9 finger trick)`,
      answer: ans,
      hint: {
        en: `For 6-9 finger trick: raised fingers = tens part. Folded fingers multiply = ones part`,
        hi: `6-9 उंगली ट्रिक: उठी उंगलियां = दहाई। मुड़ी उंगलियां × = इकाई`,
      },
      solution: { en: `${a} × ${b} = ${ans}`, hi: `${a} × ${b} = ${ans}` },
    };
  } else {
    const a = rand(11, 15), b = rand(11, 15);
    return {
      display: `${a} × ${b} = ?\n(Finger method for teens)`,
      answer: a * b,
      hint: { en: `Teens trick: (10+a) × (10+b) = 100 + 10(a+b) + ab`, hi: `किशोर ट्रिक: (10+a) × (10+b) = 100 + 10(a+b) + ab` },
      solution: { en: `${a} × ${b} = ${a * b}`, hi: `${a} × ${b} = ${a * b}` },
    };
  }
};

const finger9Table = (d: Difficulty): Question => {
  const max = d === 'easy' ? 9 : d === 'medium' ? 15 : 20;
  const n = rand(2, max);
  return {
    display: `9 × ${n} = ?\n(9-finger trick)`,
    answer: 9 * n,
    hint: {
      en: `9-finger trick: hold down finger #${n}. Left fingers = tens, right fingers = ones`,
      hi: `9-उंगली ट्रिक: ${n}वीं उंगली दबाओ। बाईं = दहाई, दाईं = इकाई`,
    },
    solution: { en: `9 × ${n} = ${9 * n}. Tens: ${n - 1}, Ones: ${10 - n}`, hi: `9 × ${n} = ${9 * n}` },
  };
};

// ── BRAIN DEVELOPMENT ─────────────────────────────────────────────────────────

// ─ Pattern Recognition ──────────────────────────────────────────────────────
const PATTERNS_EASY: Question[] = [
  ...Array.from({length: 20}, (_, i) => {
    const step = i % 9 + 2; // steps 2-10
    const start = Math.floor(i / 9) * 5 + 1;
    const seq = [start, start+step, start+2*step, start+3*step];
    return { display: `${seq.join(', ')}, ?\nNext number`, answer: start+4*step, hint: { en: `Each number increases by ${step}`, hi: `हर संख्या ${step} बढ़ती है` }, solution: { en: `+${step} each time → ${start+4*step}`, hi: `${start+4*step}` } };
  }),
  // Simple decreasing
  ...Array.from({length: 15}, (_, i) => {
    const step = i % 5 + 2;
    const start = 50 + i * 3;
    const seq = [start, start-step, start-2*step, start-3*step];
    return { display: `${seq.join(', ')}, ?\nNext number`, answer: start-4*step, hint: { en: `Each number decreases by ${step}`, hi: `हर संख्या ${step} घटती है` }, solution: { en: `−${step} each time → ${start-4*step}`, hi: `${start-4*step}` } };
  }),
  // Even/odd sequences
  { display: '2, 4, 6, 8, ?\nNext number', answer: 10, hint: { en: 'Even numbers', hi: 'सम संख्याएं' }, solution: { en: '+2 each time → 10', hi: '10' } },
  { display: '1, 3, 5, 7, ?\nNext number', answer: 9, hint: { en: 'Odd numbers', hi: 'विषम संख्याएं' }, solution: { en: '+2 each time → 9', hi: '9' } },
  { display: '10, 20, 30, 40, ?\nNext number', answer: 50, hint: { en: 'Multiples of 10', hi: '10 के गुणज' }, solution: { en: '+10 each time → 50', hi: '50' } },
  { display: '5, 10, 15, 20, ?\nNext number', answer: 25, hint: { en: 'Multiples of 5', hi: '5 के गुणज' }, solution: { en: '+5 each time → 25', hi: '25' } },
  { display: '3, 6, 9, 12, ?\nNext number', answer: 15, hint: { en: 'Multiples of 3', hi: '3 के गुणज' }, solution: { en: '+3 each time → 15', hi: '15' } },
  { display: '100, 90, 80, 70, ?\nNext number', answer: 60, hint: { en: 'Decreasing by 10', hi: '10 से घटती है' }, solution: { en: '−10 each time → 60', hi: '60' } },
  { display: '50, 45, 40, 35, ?\nNext number', answer: 30, hint: { en: 'Decreasing by 5', hi: '5 से घटती है' }, solution: { en: '−5 each time → 30', hi: '30' } },
  { display: '1, 2, 4, 8, ?\nNext number', answer: 16, hint: { en: 'Each number doubles', hi: 'हर संख्या दोगुनी होती है' }, solution: { en: '×2 each time → 16', hi: '16' } },
  { display: '81, 27, 9, 3, ?\nNext number', answer: 1, hint: { en: 'Each number divides by 3', hi: 'हर संख्या 3 से भागी होती है' }, solution: { en: '÷3 each time → 1', hi: '1' } },
  { display: '1, 4, 9, 16, ?\nNext number', answer: 25, hint: { en: 'Perfect squares: 1², 2², 3², 4²…', hi: 'पूर्ण वर्ग: 1², 2², 3², 4²…' }, solution: { en: '5² = 25', hi: '25' } },
];

const PATTERNS_MEDIUM: Question[] = [
  { display: '1, 1, 2, 3, 5, 8, ?\nNext number', answer: 13, hint: { en: 'Fibonacci: each = sum of previous two', hi: 'फिबोनाची: हर संख्या = पिछली दो का योग' }, solution: { en: '5 + 8 = 13', hi: '13' } },
  { display: '2, 6, 12, 20, 30, ?\nNext number', answer: 42, hint: { en: 'n×(n+1): 1×2, 2×3, 3×4, 4×5, 5×6…', hi: 'n×(n+1) pattern' }, solution: { en: '6×7 = 42', hi: '42' } },
  { display: '1, 8, 27, 64, ?\nNext number', answer: 125, hint: { en: 'Perfect cubes: 1³, 2³, 3³, 4³…', hi: 'पूर्ण घन: 1³, 2³, 3³, 4³…' }, solution: { en: '5³ = 125', hi: '125' } },
  { display: '2, 3, 5, 7, 11, ?\nNext number', answer: 13, hint: { en: 'Prime numbers', hi: 'अभाज्य संख्याएं' }, solution: { en: 'Next prime after 11 = 13', hi: '13' } },
  { display: '1, 3, 7, 13, 21, ?\nNext number', answer: 31, hint: { en: 'Differences: 2, 4, 6, 8… (increasing by 2)', hi: 'अंतर: 2, 4, 6, 8…' }, solution: { en: 'Next diff = 10, so 21+10 = 31', hi: '31' } },
  { display: '3, 6, 11, 18, 27, ?\nNext number', answer: 38, hint: { en: 'Differences: 3, 5, 7, 9… (odd numbers)', hi: 'अंतर: 3, 5, 7, 9…' }, solution: { en: 'Next diff = 11, so 27+11 = 38', hi: '38' } },
  { display: '4, 9, 16, 25, 36, ?\nNext number', answer: 49, hint: { en: 'Squares from 2: 2², 3², 4², 5², 6²…', hi: '2 से वर्ग: 2², 3², 4², 5², 6²…' }, solution: { en: '7² = 49', hi: '49' } },
  { display: '2, 5, 10, 17, 26, ?\nNext number', answer: 37, hint: { en: 'n² + 1: 1²+1, 2²+1, 3²+1…', hi: 'n²+1 pattern' }, solution: { en: '6²+1 = 37', hi: '37' } },
  { display: '1, 2, 4, 7, 11, 16, ?\nNext number', answer: 22, hint: { en: 'Differences increase by 1: 1, 2, 3, 4, 5…', hi: 'अंतर 1 से बढ़ता है' }, solution: { en: 'Next diff = 6, so 16+6 = 22', hi: '22' } },
  ...Array.from({length: 40}, (_, i) => {
    const a = rand(2, 8), b = rand(1, a - 1 > 0 ? a - 1 : 1);
    const seq = Array.from({length: 4}, (_, j) => a * Math.pow(b === 0 ? 1 : b, j) + (i % 5));
    const next = a * Math.pow(b === 0 ? 1 : b, 4) + (i % 5);
    return { display: `${seq.map(Math.round).join(', ')}, ?\nNext number`, answer: Math.round(next), hint: { en: `Multiply by ${b} each time`, hi: `हर बार ${b} से गुणा` }, solution: { en: `×${b} → ${Math.round(next)}`, hi: `${Math.round(next)}` } };
  }),
];

const PATTERNS_HARD: Question[] = [
  { display: '1, 1, 2, 3, 5, 8, 13, 21, ?\nNext number', answer: 34, hint: { en: 'Fibonacci series', hi: 'फिबोनाची श्रृंखला' }, solution: { en: '13 + 21 = 34', hi: '34' } },
  { display: '2, 2, 4, 12, 48, ?\nNext number', answer: 240, hint: { en: 'Multiply by 1, 2, 3, 4, 5…', hi: '1, 2, 3, 4, 5… से गुणा' }, solution: { en: '48 × 5 = 240', hi: '240' } },
  { display: '1, 5, 14, 30, 55, ?\nNext number', answer: 91, hint: { en: 'Sum of squares: 1², 1²+2², 1²+2²+3²…', hi: 'वर्गों का योग' }, solution: { en: '1+4+9+16+25+36 = 91', hi: '91' } },
  { display: '0, 1, 3, 6, 10, 15, ?\nNext number', answer: 21, hint: { en: 'Triangular numbers: n(n+1)/2', hi: 'त्रिभुजाकार संख्याएं' }, solution: { en: '6×7/2 = 21', hi: '21' } },
  { display: '1, 3, 6, 10, 15, 21, ?\nNext number', answer: 28, hint: { en: 'Triangular numbers', hi: 'त्रिभुजाकार संख्याएं' }, solution: { en: '7×8/2 = 28', hi: '28' } },
  ...Array.from({length: 45}, (_, i) => {
    const type = i % 5;
    if (type === 0) {
      const base = rand(2, 4), start = rand(1, 5);
      const seq = [start, start*base, start*base*base, start*base*base*base];
      const ans = start * Math.pow(base, 4);
      return { display: `${seq.join(', ')}, ?\nNext`, answer: ans, hint: { en: `Multiply by ${base}`, hi: `${base} से गुणा` }, solution: { en: `×${base} → ${ans}`, hi: `${ans}` } };
    } else {
      const diff1 = rand(2, 5), diff2 = rand(1, 3);
      const seq: number[] = [rand(1, 10)];
      for (let j = 1; j < 5; j++) seq.push(seq[j-1] + diff1 + (j-1) * diff2);
      return { display: `${seq.slice(0,4).join(', ')}, ?\nNext`, answer: seq[4], hint: { en: 'Second differences are constant', hi: 'द्वितीय अंतर समान है' }, solution: { en: `${seq[4]}`, hi: `${seq[4]}` } };
    }
  }),
];

// ─ Mental Math (b-mental) ────────────────────────────────────────────────────
const brainMental = (d: Difficulty, level = 1): Question => {
  if (d === 'easy') {
    const type = rand(1, 4);
    if (type === 1) { const a = rand(1,9), b = rand(1,9); return { display: `Think fast!\n${a} + ${b} = ?`, answer: a+b, hint: { en: 'Count on mentally', hi: 'मन में गिनो' }, solution: { en: `${a+b}`, hi: `${a+b}` } }; }
    if (type === 2) { const a = rand(5,15), b = rand(1,5); return { display: `Quick!\n${a} − ${b} = ?`, answer: a-b, hint: { en: 'Count back mentally', hi: 'मन में पीछे गिनो' }, solution: { en: `${a-b}`, hi: `${a-b}` } }; }
    if (type === 3) { const a = rand(2,5), b = rand(2,5); return { display: `Fast!\n${a} × ${b} = ?`, answer: a*b, hint: { en: 'Recall multiplication table', hi: 'पहाड़ा याद करो' }, solution: { en: `${a*b}`, hi: `${a*b}` } }; }
    const n = rand(1,9); return { display: `Quick!\nDouble of ${n} = ?`, answer: n*2, hint: { en: `${n} + ${n}`, hi: `${n} + ${n}` }, solution: { en: `${n*2}`, hi: `${n*2}` } };
  } else if (d === 'medium') {
    const type = rand(1, 5);
    if (type === 1) { const a = rand(10,49), b = rand(10,49); return { display: `Mental math:\n${a} + ${b} = ?`, answer: a+b, hint: { en: 'Add tens then units', hi: 'दहाई फिर इकाई जोड़ो' }, solution: { en: `${a+b}`, hi: `${a+b}` } }; }
    if (type === 2) { const a = rand(20,99), b = rand(5,20); return { display: `Quick!\n${a} − ${b} = ?`, answer: a-b, hint: { en: 'Subtract in parts', hi: 'भागों में घटाओ' }, solution: { en: `${a-b}`, hi: `${a-b}` } }; }
    if (type === 3) { const a = rand(11,15), b = rand(2,9); return { display: `Fast!\n${a} × ${b} = ?`, answer: a*b, hint: { en: 'Distribute: (10+a) × b', hi: '(10+a) × b से बांटो' }, solution: { en: `${a*b}`, hi: `${a*b}` } }; }
    if (type === 4) { const a = rand(2,9), b = rand(2,9); return { display: `Mental:\n${a}² + ${b}² = ?`, answer: a*a+b*b, hint: { en: `${a}² = ${a*a}, ${b}² = ${b*b}`, hi: `${a}² = ${a*a}, ${b}² = ${b*b}` }, solution: { en: `${a*a}+${b*b}=${a*a+b*b}`, hi: `${a*a+b*b}` } }; }
    const n = rand(10,99); return { display: `Quick!\nHalf of ${n*2} = ?`, answer: n, hint: { en: 'Divide by 2', hi: '2 से भाग दो' }, solution: { en: `${n}`, hi: `${n}` } };
  } else {
    const type = rand(1, 4);
    if (type === 1) { const a = rand(50,199), b = rand(50,199); return { display: `${a} + ${b} = ?\nMental calculation`, answer: a+b, hint: { en: 'Round and compensate', hi: 'गोल करो और क्षतिपूर्ति करो' }, solution: { en: `${a+b}`, hi: `${a+b}` } }; }
    if (type === 2) { const a = rand(11,19), b = rand(11,19); return { display: `${a} × ${b} = ?\nMental only!`, answer: a*b, hint: { en: `(10+${a-10}) × (10+${b-10}) = 100 + 10×(${a-10}+${b-10}) + ${(a-10)*(b-10)}`, hi: 'किशोर गुणन विधि' }, solution: { en: `${a*b}`, hi: `${a*b}` } }; }
    if (type === 3) { const a = rand(5,15); return { display: `${a}³ = ?\nMental cube`, answer: a*a*a, hint: { en: `${a}² = ${a*a}, then × ${a}`, hi: `${a}² = ${a*a}, फिर × ${a}` }, solution: { en: `${a*a*a}`, hi: `${a*a*a}` } }; }
    const a = rand(100,300), b = rand(10,50); return { display: `${a} × ${b} = ?\nMental`, answer: a*b, hint: { en: 'Break into parts', hi: 'भागों में तोड़ो' }, solution: { en: `${a*b}`, hi: `${a*b}` } };
  }
};

// ─ Speed Math (b-speed) ──────────────────────────────────────────────────────
const brainSpeed = (d: Difficulty, level = 1): Question => {
  const ops = ['+', '-', '×'];
  const op = pick(d === 'easy' ? ['+', '-'] : ops);
  const ranges = { easy: [1, level <= 2 ? 10 : 20], medium: [5, 50], hard: [10, 99] };
  const [min, max] = ranges[d];
  const a = rand(min, max), b = rand(min, op === '-' ? a : max);
  const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const display = op === '×' ? `${a} × ${b}` : op === '+' ? `${a} + ${b}` : `${a} − ${b}`;
  return {
    display: `⚡ SPEED!\n${display} = ?`,
    answer: ans,
    hint: { en: 'As fast as you can!', hi: 'जितनी जल्दी हो सके!' },
    solution: { en: `${display} = ${ans}`, hi: `${ans}` },
  };
};

// ─ Visual Math (b-visual) ───────────────────────────────────────────────────
const VISUAL_EASY: Question[] = [
  { display: '👁️ Count: ⭐⭐⭐⭐⭐\nHow many stars?', answer: 5, hint: { en: 'Count each star', hi: 'हर तारा गिनो' }, solution: { en: '5 stars', hi: '5 तारे' } },
  { display: '👁️ Count: 🔴🔴🔴🔴🔴🔴🔴\nHow many circles?', answer: 7, hint: { en: 'Count each circle', hi: 'हर वृत्त गिनो' }, solution: { en: '7 circles', hi: '7 वृत्त' } },
  { display: '👁️ 12345678\nHow many EVEN digits?', answer: 4, hint: { en: 'Even: 2,4,6,8', hi: 'सम: 2,4,6,8' }, solution: { en: '2,4,6,8 → 4 even digits', hi: '4 सम अंक' } },
  { display: '👁️ 19283746\nHow many ODD digits?', answer: 4, hint: { en: 'Odd: 1,3,5,7,9', hi: 'विषम: 1,3,5,7,9' }, solution: { en: '1,9,3,7 → 4 odd digits', hi: '4 विषम अंक' } },
  { display: '👁️ 1+2+3+4+5\nWhat is the sum?', answer: 15, hint: { en: 'Add all numbers', hi: 'सब जोड़ो' }, solution: { en: '15', hi: '15' } },
  ...Array.from({length: 45}, (_, i) => {
    const n = rand(3, 15);
    const emoji = pick(['🔢','⭐','🔴','🔵','🟡','🟢']);
    return { display: `👁️ How many?\n${Array(n).fill('●').join('')}`, answer: n, hint: { en: 'Count carefully', hi: 'ध्यान से गिनो' }, solution: { en: `${n}`, hi: `${n}` } };
  }),
];

const VISUAL_MEDIUM: Question[] = [
  { display: '👁️ 246810121416\nSum of all digits?', answer: 2+4+6+8+1+0+1+2+1+4+1+6, hint: { en: 'Add each digit: 2+4+6+8+1+0+1+2+1+4+1+6', hi: 'हर अंक जोड़ो' }, solution: { en: `${2+4+6+8+1+0+1+2+1+4+1+6}`, hi: `${2+4+6+8+1+0+1+2+1+4+1+6}` } },
  { display: '👁️ 123 + 321\nAdd the mirror numbers', answer: 444, hint: { en: 'Add normally', hi: 'सामान्य जोड़' }, solution: { en: '444', hi: '444' } },
  { display: '👁️ ABCDE = 12345\nA+C+E = ?', answer: 9, hint: { en: 'A=1, C=3, E=5', hi: 'A=1, C=3, E=5' }, solution: { en: '1+3+5=9', hi: '9' } },
  ...Array.from({length: 47}, (_, i) => {
    const a = rand(10, 99), b = rand(10, 99);
    const type = i % 3;
    if (type === 0) return { display: `👁️ ${a}\n×2 = ?`, answer: a * 2, hint: { en: `Double ${a}`, hi: `${a} दोगुना` }, solution: { en: `${a*2}`, hi: `${a*2}` } };
    if (type === 1) return { display: `👁️ ${a * 2}\n÷2 = ?`, answer: a, hint: { en: 'Half of it', hi: 'आधा' }, solution: { en: `${a}`, hi: `${a}` } };
    return { display: `👁️ ${a} + ${b}\n= ?`, answer: a + b, hint: { en: 'Add the two numbers', hi: 'दो संख्याएं जोड़ो' }, solution: { en: `${a+b}`, hi: `${a+b}` } };
  }),
];

const VISUAL_HARD: Question[] = [
  { display: '👁️ 1×1=1, 11×11=121\n111×111 = ?', answer: 12321, hint: { en: 'Pattern: 1,121,12321…', hi: 'पैटर्न देखो' }, solution: { en: '12321', hi: '12321' } },
  { display: '👁️ Sum 1 to 10\n= ?', answer: 55, hint: { en: 'n(n+1)/2 = 10×11/2', hi: 'n(n+1)/2 सूत्र' }, solution: { en: '55', hi: '55' } },
  { display: '👁️ Sum 1 to 20\n= ?', answer: 210, hint: { en: '20×21/2 = 210', hi: '20×21/2 = 210' }, solution: { en: '210', hi: '210' } },
  ...Array.from({length: 47}, (_, i) => {
    const a = rand(50, 200), b = rand(50, 200), c = rand(10, 50);
    const type = i % 4;
    if (type === 0) return { display: `👁️ ${a} + ${b} + ${c}\n= ?`, answer: a+b+c, hint: { en: 'Add step by step', hi: 'एक-एक करके जोड़ो' }, solution: { en: `${a+b+c}`, hi: `${a+b+c}` } };
    if (type === 1) return { display: `👁️ ${a} × ${c % 10 + 2}\n= ?`, answer: a*(c%10+2), hint: { en: 'Multiply carefully', hi: 'ध्यान से गुणा करो' }, solution: { en: `${a*(c%10+2)}`, hi: `${a*(c%10+2)}` } };
    if (type === 2) return { display: `👁️ ${a+b} − ${b}\n= ?`, answer: a, hint: { en: 'Subtract', hi: 'घटाओ' }, solution: { en: `${a}`, hi: `${a}` } };
    return { display: `👁️ ${a * 2} ÷ 2\n= ?`, answer: a, hint: { en: 'Divide by 2', hi: '2 से भाग दो' }, solution: { en: `${a}`, hi: `${a}` } };
  }),
];

// ─ Focus / Attention (b-focus) ───────────────────────────────────────────────
const FOCUS_EASY: Question[] = [
  { display: '🎯 3 + 4 − 2 + 1\n= ?', answer: 6, hint: { en: 'Left to right: 3+4=7, 7-2=5, 5+1=6', hi: 'बाएं से दाएं: 7-2=5, 5+1=6' }, solution: { en: '6', hi: '6' } },
  { display: '🎯 10 − 3 + 2 − 1\n= ?', answer: 8, hint: { en: '10-3=7, 7+2=9, 9-1=8', hi: '10-3=7, 7+2=9, 9-1=8' }, solution: { en: '8', hi: '8' } },
  { display: '🎯 2 × 3 + 4\n= ?', answer: 10, hint: { en: 'Multiply first: 2×3=6, then 6+4=10', hi: 'पहले गुणा: 2×3=6, फिर 6+4=10' }, solution: { en: '10', hi: '10' } },
  ...Array.from({length: 47}, (_, i) => {
    const a = rand(1, 9), b = rand(1, 9), c = rand(1, 5);
    const ops = [[a, '+', b, '+', c, a+b+c], [a, '+', b, '-', c, a+b-c], [a, '*', b, '+', c, a*b+c]];
    const [n1, op1, n2, op2, n3, ans] = pick(ops);
    if (typeof ans !== 'number' || ans < 0) return { display: `🎯 ${a} + ${b} = ?`, answer: a+b, hint: { en: 'Add', hi: 'जोड़ो' }, solution: { en: `${a+b}`, hi: `${a+b}` } };
    const dispOp1 = op1 === '*' ? '×' : op1;
    const dispOp2 = op2 === '*' ? '×' : op2;
    return { display: `🎯 ${n1} ${dispOp1} ${n2} ${dispOp2} ${n3}\n= ?`, answer: ans as number, hint: { en: 'BODMAS order', hi: 'BODMAS क्रम' }, solution: { en: `${ans}`, hi: `${ans}` } };
  }),
];

const FOCUS_MEDIUM: Question[] = Array.from({length: 50}, (_, i) => {
  const a = rand(5, 20), b = rand(2, 10), c = rand(1, 5), d = rand(1, 5);
  const type = i % 4;
  if (type === 0) { const ans = a * b + c; return { display: `🎯 ${a} × ${b} + ${c}\n= ?`, answer: ans, hint: { en: `${a}×${b}=${a*b}, then +${c}`, hi: `${a}×${b}=${a*b}, फिर +${c}` }, solution: { en: `${ans}`, hi: `${ans}` } }; }
  if (type === 1) { const ans = a + b * c; return { display: `🎯 ${a} + ${b} × ${c}\n= ?`, answer: ans, hint: { en: `Multiply first: ${b}×${c}=${b*c}, then +${a}`, hi: `पहले गुणा: ${b}×${c}=${b*c}` }, solution: { en: `${ans}`, hi: `${ans}` } }; }
  if (type === 2) { const ans = (a + b) * c; return { display: `🎯 (${a} + ${b}) × ${c}\n= ?`, answer: ans, hint: { en: `Bracket first: ${a+b} × ${c}`, hi: `कोष्ठक पहले: ${a+b} × ${c}` }, solution: { en: `${ans}`, hi: `${ans}` } }; }
  const ans = a * b - c * d; return { display: `🎯 ${a}×${b} − ${c}×${d}\n= ?`, answer: ans, hint: { en: `${a*b} − ${c*d}`, hi: `${a*b} − ${c*d}` }, solution: { en: `${ans}`, hi: `${ans}` } };
});

const FOCUS_HARD: Question[] = Array.from({length: 50}, (_, i) => {
  const a = rand(10, 30), b = rand(5, 15), c = rand(2, 8), d = rand(2, 6);
  const type = i % 3;
  if (type === 0) { const ans = a * b + c * d; return { display: `🎯 ${a}×${b} + ${c}×${d}\n= ?`, answer: ans, hint: { en: `${a*b} + ${c*d}`, hi: `${a*b} + ${c*d}` }, solution: { en: `${ans}`, hi: `${ans}` } }; }
  if (type === 1) { const ans = (a + b) * (c + d); return { display: `🎯 (${a}+${b}) × (${c}+${d})\n= ?`, answer: ans, hint: { en: `${a+b} × ${c+d}`, hi: `${a+b} × ${c+d}` }, solution: { en: `${ans}`, hi: `${ans}` } }; }
  const ans = a * b - c; return { display: `🎯 ${a} × ${b} − ${c}\n= ?`, answer: ans, hint: { en: `${a*b} − ${c}`, hi: `${a*b} − ${c}` }, solution: { en: `${ans}`, hi: `${ans}` } };
});

// ── QUESTION BANKS (curated) ─────────────────────────────────────────────────
const BANKS: Record<string, Record<Difficulty, Question[]>> = {
  'b-pattern': { easy: PATTERNS_EASY, medium: PATTERNS_MEDIUM, hard: PATTERNS_HARD },
  'b-visual':  { easy: VISUAL_EASY,   medium: VISUAL_MEDIUM,   hard: VISUAL_HARD },
  'b-focus':   { easy: FOCUS_EASY,    medium: FOCUS_MEDIUM,    hard: FOCUS_HARD },
};

// Track question index per session (to avoid repeats)
const bankIndices: Record<string, number> = {};

const getFromBank = (key: string, d: Difficulty): Question => {
  const bank = BANKS[key]?.[d];
  if (!bank || bank.length === 0) return brainMental(d);
  const idxKey = `${key}-${d}`;
  if (bankIndices[idxKey] === undefined) bankIndices[idxKey] = Math.floor(Math.random() * bank.length);
  const q = bank[bankIndices[idxKey] % bank.length];
  bankIndices[idxKey] = (bankIndices[idxKey] + 1) % bank.length;
  return q;
};

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

/**
 * Get a question for the given operation, difficulty and student level.
 * Level (1-10) further refines the range within each difficulty tier.
 */
export const getQuestion = (
  operation: string,
  difficulty: Difficulty,
  level = 1,
): Question => {
  switch (operation) {
    // Vedic Math
    case '+':   return vedicAdd(difficulty, level);
    case '-':   return vedicSub(difficulty, level);
    case '×':   return vedicMul(difficulty, level);
    case '÷':   return vedicDiv(difficulty, level);
    case 'x²':  return vedicSquare(difficulty, level);
    case '√':   return vedicSqrt(difficulty, level);
    case 'x³':  return vedicCube(difficulty, level);
    case '∛':   return vedicCubeRoot(difficulty);
    case '%':   return vedicPercent(difficulty, level);
    case 'alg': return vedicAlgebra(difficulty, level);
    // Finger Math
    case 'f-count':  return fingerCount(difficulty, level);
    case 'f-add':    return fingerAdd(difficulty, level);
    case 'f-sub':    return fingerSub(difficulty, level);
    case 'f-mul':    return fingerMul(difficulty, level);
    case 'f-9table': return finger9Table(difficulty);
    // Brain Dev
    case 'b-pattern': return getFromBank('b-pattern', difficulty);
    case 'b-visual':  return getFromBank('b-visual', difficulty);
    case 'b-focus':   return getFromBank('b-focus', difficulty);
    case 'b-mental':  return brainMental(difficulty, level);
    case 'b-speed':   return brainSpeed(difficulty, level);
    default: return vedicAdd(difficulty, level);
  }
};

/**
 * Class-to-difficulty mapping (NCERT-aligned)
 * Returns recommended difficulty for a student's class grade.
 */
export const classToDefaultDifficulty = (classGrade: number): Difficulty => {
  if (classGrade <= 4) return 'easy';
  if (classGrade <= 7) return 'medium';
  return 'hard';
};
