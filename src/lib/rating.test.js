import { describe, expect, test } from 'bun:test';
import { getRatingBounds, isValidRating, updateRatingBounds, validRatingBounds } from './rating';

describe('rating bounds', () => {
  test('defaults to 1–100', () => {
    expect(getRatingBounds(undefined)).toEqual({ min: 1, max: 100 });
    expect(isValidRating(1, undefined)).toBe(true);
    expect(isValidRating(100, undefined)).toBe(true);
    expect(isValidRating(101, undefined)).toBe(false);
  });
  test('supports 1–50', () => {
    const settings = updateRatingBounds({ other: 'preserved' }, 1, 50);
    expect(getRatingBounds(settings)).toEqual({ min: 1, max: 50 });
    expect(settings['other']).toBe('preserved');
    expect(isValidRating(50, settings)).toBe(true);
    expect(isValidRating(51, settings)).toBe(false);
  });
  test('supports 1–10', () => {
    const settings = updateRatingBounds({}, 1, 10);
    expect(getRatingBounds(settings)).toEqual({ min: 1, max: 10 });
    expect(isValidRating(10, settings)).toBe(true);
    expect(isValidRating(11, settings)).toBe(false);
  });
  test('rejects invalid bounds and nonnumeric ratings', () => {
    expect(validRatingBounds(10, 1)).toBe(false);
    expect(validRatingBounds(0, 100)).toBe(false);
    expect(validRatingBounds(1, 101)).toBe(false);
    expect(isValidRating('10', { min: 1, max: 10 })).toBe(false);
    expect(isValidRating(1.5, undefined)).toBe(false);
  });
});