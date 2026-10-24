export const DEFAULT_RATING_BOUNDS = { min: 1, max: 100 };

export function validRatingBounds(min: number, max: number): boolean {
  return Number.isInteger(min) && Number.isInteger(max) && min >= 1 && max <= 100 && min < max;
}

export function getRatingBounds(settings: unknown): { min: number; max: number } {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return { ...DEFAULT_RATING_BOUNDS };
  const data = settings as Record<string, unknown>;
  const min = typeof data.min === 'number' ? data.min : 1;
  const max = typeof data.max === 'number' ? data.max : 100;
  return validRatingBounds(min, max) ? { min, max } : { ...DEFAULT_RATING_BOUNDS };
}

export function isValidRating(value: unknown, settings: unknown): boolean {
  const { min, max } = getRatingBounds(settings);
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

export function updateRatingBounds(settings: unknown, min: number, max: number) {
  const existing = settings && typeof settings === 'object' && !Array.isArray(settings) ? settings : {};
  return { ...existing, min, max };
}