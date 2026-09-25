import { AssessmentLevelConfig } from '../types';

export const ASSESSMENT_LEVELS: AssessmentLevelConfig[] = [
  {
    code: 'EE1',
    name: 'Exceeding Expectation 1',
    minMark: 90,
    maxMark: 100,
    points: 8,
    description: 'Demonstrates exceptional mastery of skills and concepts independently.',
    colorClass: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  {
    code: 'EE2',
    name: 'Exceeding Expectation 2',
    minMark: 75,
    maxMark: 89.9,
    points: 7,
    description: 'Demonstrates strong understanding and applies knowledge consistently.',
    colorClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    code: 'ME1',
    name: 'Meeting Expectation 1',
    minMark: 60,
    maxMark: 74.9,
    points: 6,
    description: 'Satisfactorily achieves all core learning outcomes with minor guidance.',
    colorClass: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    code: 'ME2',
    name: 'Meeting Expectation 2',
    minMark: 50,
    maxMark: 59.9,
    points: 5,
    description: 'Achieves standard learning outcomes with steady progress.',
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    code: 'AE1',
    name: 'Approaching Expectation 1',
    minMark: 40,
    maxMark: 49.9,
    points: 4,
    description: 'Approaches expected competency; requires targeted reinforcement.',
    colorClass: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  {
    code: 'AE2',
    name: 'Approaching Expectation 2',
    minMark: 30,
    maxMark: 39.9,
    points: 3,
    description: 'Partial attainment of concepts; needs frequent teacher support.',
    colorClass: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  {
    code: 'BE1',
    name: 'Below Expectation 1',
    minMark: 20,
    maxMark: 29.9,
    points: 2,
    description: 'Significant gaps in fundamental skills; remedial intervention required.',
    colorClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    code: 'BE2',
    name: 'Below Expectation 2',
    minMark: 0,
    maxMark: 19.9,
    points: 1,
    description: 'Critical learning difficulties requiring urgent remedial plan.',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export interface CalculationResult {
  level: string;
  points: number | null;
  name: string;
  colorClass: string;
}

/**
 * Pure Rubric lookup from code (independent of score or points)
 */
export function getRubricByCode(code: string): CalculationResult {
  const match = ASSESSMENT_LEVELS.find((l) => l.code === code);
  if (match) {
    return {
      level: match.code,
      points: match.points,
      name: match.name,
      colorClass: match.colorClass,
    };
  }
  return {
    level: code || '—',
    points: null,
    name: code ? `Level ${code}` : 'Unassessed',
    colorClass: 'bg-stone-100 text-stone-600 border-stone-200',
  };
}

/**
 * Pure Rubric lookup from points (independent of % score)
 */
export function getRubricFromPoints(points: number | null | undefined): CalculationResult {
  if (points === null || points === undefined || isNaN(points)) {
    return {
      level: '—',
      points: null,
      name: 'Unassessed',
      colorClass: 'bg-stone-100 text-stone-600 border-stone-200',
    };
  }

  const map: Record<number, { level: string; name: string; colorClass: string }> = {
    8: { level: 'EE1', name: 'Exceeding Expectation 1', colorClass: 'bg-sky-100 text-sky-900 border-sky-300' },
    7: { level: 'EE2', name: 'Exceeding Expectation 2', colorClass: 'bg-sky-50 text-sky-800 border-sky-200' },
    6: { level: 'ME1', name: 'Meeting Expectation 1', colorClass: 'bg-amber-100 text-amber-900 border-amber-300' },
    5: { level: 'ME2', name: 'Meeting Expectation 2', colorClass: 'bg-amber-50 text-amber-800 border-amber-200' },
    4: { level: 'AE1', name: 'Approaching Expectation 1', colorClass: 'bg-orange-100 text-orange-900 border-orange-300' },
    3: { level: 'AE2', name: 'Approaching Expectation 2', colorClass: 'bg-orange-50 text-orange-800 border-orange-200' },
    2: { level: 'BE1', name: 'Below Expectation 1', colorClass: 'bg-rose-100 text-rose-800 border-rose-300' },
    1: { level: 'BE2', name: 'Below Expectation 2', colorClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const res = map[points];
  if (res) {
    return { level: res.level, points, name: res.name, colorClass: res.colorClass };
  }
  return { level: '—', points, name: `Points ${points}`, colorClass: 'bg-stone-100 text-stone-600 border-stone-200' };
}

/**
 * Reference helper for legacy compatibility - Note: score works separately from points/rubrics
 */
export function getPointsFromScore(score: number): number {
  if (score >= 90) return 8;
  if (score >= 75) return 7;
  if (score >= 60) return 6;
  if (score >= 50) return 5;
  if (score >= 40) return 4;
  if (score >= 30) return 3;
  if (score >= 20) return 2;
  return 1;
}

/**
 * Independent Assessment Lookup: Returns rubric info without tying or forcing %score to points.
 */
export function calculateAssessment(mark: number | null | undefined): CalculationResult {
  if (mark === null || mark === undefined || isNaN(mark)) {
    return {
      level: '—',
      points: null,
      name: 'Unassessed',
      colorClass: 'bg-stone-100 text-stone-600 border-stone-200',
    };
  }

  // If mark is an integer 1-8, treat as points
  if (mark >= 1 && mark <= 8 && Number.isInteger(mark)) {
    return getRubricFromPoints(mark);
  }

  return {
    level: '—',
    points: null,
    name: 'Unassessed',
    colorClass: 'bg-stone-100 text-stone-600 border-stone-200',
  };
}

export function calculateOverallRubric(totalPoints: number): {
  level: string;
  name: string;
  colorClass: string;
} {
  // Total points evaluation independently
  if (totalPoints >= 65) {
    return { level: 'EE1', name: 'Exceeding Expectation 1', colorClass: 'bg-sky-100 text-sky-900' };
  } else if (totalPoints >= 58) {
    return { level: 'EE2', name: 'Exceeding Expectation 2', colorClass: 'bg-sky-50 text-sky-800' };
  } else if (totalPoints >= 50) {
    return { level: 'ME1', name: 'Meeting Expectation 1', colorClass: 'bg-amber-100 text-amber-900' };
  } else if (totalPoints >= 41) {
    return { level: 'ME2', name: 'Meeting Expectation 2', colorClass: 'bg-amber-50 text-amber-800' };
  } else if (totalPoints >= 33) {
    return { level: 'AE1', name: 'Approaching Expectation 1', colorClass: 'bg-orange-100 text-orange-900' };
  } else if (totalPoints >= 25) {
    return { level: 'AE2', name: 'Approaching Expectation 2', colorClass: 'bg-orange-50 text-orange-800' };
  } else if (totalPoints >= 17) {
    return { level: 'BE1', name: 'Below Expectation 1', colorClass: 'bg-rose-100 text-rose-900' };
  } else {
    return { level: 'BE2', name: 'Below Expectation 2', colorClass: 'bg-rose-50 text-rose-800' };
  }
}

/**
 * Validate % Score input (0 to 100) strictly independently
 */
export function validateMarkInput(input: string): {
  isValid: boolean;
  value: number | null;
  errorMessage?: string;
} {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { isValid: true, value: null };
  }

  const num = Number(trimmed);
  if (isNaN(num)) {
    return {
      isValid: false,
      value: null,
      errorMessage: 'Invalid score. Enter a percentage between 0 and 100.',
    };
  }

  if (num < 0 || num > 100) {
    return {
      isValid: false,
      value: null,
      errorMessage: 'Score must be between 0 and 100.',
    };
  }

  return {
    isValid: true,
    value: Math.round(num * 10) / 10,
  };
}

/**
 * Validate Points input (1 to 8) independently
 */
export function validatePointsInput(input: string): {
  isValid: boolean;
  value: number | null;
  errorMessage?: string;
} {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { isValid: true, value: null };
  }

  const num = Number(trimmed);
  if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 8) {
    return {
      isValid: false,
      value: null,
      errorMessage: 'Points must be an integer between 1 and 8.',
    };
  }

  return {
    isValid: true,
    value: num,
  };
}
