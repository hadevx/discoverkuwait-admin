export const GOVERNORATE_POINTS: Record<string, number> = {
  jahra: 120,
  capital: 150,
  hawalli: 110,
  farwaniya: 100,
  mubarak: 130,
  ahmadi: 140,
};

export const GOVERNORATE_NAMES: Record<string, { en: string; ar: string }> = {
  jahra:     { en: "Al Jahra",          ar: "الجهراء" },
  capital:   { en: "Al Asimah",         ar: "العاصمة" },
  hawalli:   { en: "Hawalli",           ar: "حولي" },
  farwaniya: { en: "Al Farwaniyah",     ar: "الفروانية" },
  mubarak:   { en: "Mubarak Al-Kabeer", ar: "مبارك الكبير" },
  ahmadi:    { en: "Al Ahmadi",         ar: "الأحمدي" },
};

export const LEVELS = [
  { min: 0,    en: "Visitor",             ar: "زائر" },
  { min: 100,  en: "Explorer",            ar: "مستكشف" },
  { min: 300,  en: "Voyager",             ar: "رحّالة" },
  { min: 600,  en: "Connoisseur",         ar: "خبير" },
  { min: 1000, en: "Kuwait Devotee",      ar: "عاشق الكويت" },
  { min: 1600, en: "Heritage Ambassador", ar: "سفير التراث" },
];

export type PointsBreakdown = {
  quiz: number;
  explore: number;
  contrib: number;
  votes: number;
  total: number;
};

export function computePoints(user: any): PointsBreakdown {
  const quiz    = (user?.quizTotalCorrect     || 0) * 10;
  const contrib = (user?.submittedWords?.length || 0) * 15;
  const votes   = (user?.votedWords?.length     || 0) * 2;
  const explore = (user?.exploredAreas          || []).reduce(
    (sum: number, id: string) => sum + (GOVERNORATE_POINTS[id] || 0),
    0,
  );
  return { quiz, explore, contrib, votes, total: quiz + explore + contrib + votes };
}

export function getLevel(totalPoints: number) {
  let level = LEVELS[0];
  for (const l of LEVELS) if (totalPoints >= l.min) level = l;
  return level;
}
