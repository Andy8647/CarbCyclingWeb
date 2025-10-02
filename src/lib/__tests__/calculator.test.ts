import { describe, it, expect } from 'vitest';
import {
  calculateNutritionPlan,
  convertWeight,
  validateWeight,
  validateProteinCoeff,
  type UserInput,
} from '../calculator';

describe('calculateNutritionPlan', () => {
  it('should calculate correct nutrition plan for mesomorph with 7-day cycle', () => {
    const input: UserInput = {
      weight: 70, // kg
      bodyType: 'mesomorph',
      proteinLevel: 'experienced',
      cycleDays: 7,
    };

    const result = calculateNutritionPlan(input);

    // Check weekly totals (PRD requirement: ±1g allowed)
    expect(result.summary.totalCarbs).toBe(1225); // 70 * 2.5 * 7 = 1225
    expect(result.summary.totalFat).toBe(441); // 70 * 0.9 * 7 = 441
    expect(result.summary.dailyProtein).toBe(105); // 70 * 1.5 = 105

    // Check day allocation for 7 days: 2 high, 3 medium, 2 low
    const highDays = result.dailyPlans.filter((day) => day.type === 'high');
    const mediumDays = result.dailyPlans.filter((day) => day.type === 'medium');
    const lowDays = result.dailyPlans.filter((day) => day.type === 'low');

    expect(highDays).toHaveLength(2);
    expect(mediumDays).toHaveLength(3);
    expect(lowDays).toHaveLength(2);

    // Check total days
    expect(result.dailyPlans).toHaveLength(7);

    // Check that protein is consistent across all days
    result.dailyPlans.forEach((day) => {
      expect(day.protein).toBe(105);
    });

    // Verify distribution percentages (high carb day should have 50% of weekly carbs / 2 days)
    const expectedHighCarbs = Math.round((1225 * 0.5) / 2); // 306.25 → 306
    const expectedHighFat = Math.round((441 * 0.15) / 2); // 33.075 → 33

    highDays.forEach((day) => {
      expect(day.carbs).toBe(expectedHighCarbs);
      expect(day.fat).toBe(expectedHighFat);
    });
  });

  it('should handle endomorph with custom protein coefficient', () => {
    const input: UserInput = {
      weight: 80,
      bodyType: 'endomorph',
      proteinLevel: 'custom',
      customProtein: 1.8,
      cycleDays: 5,
    };

    const result = calculateNutritionPlan(input);

    // Check coefficients: endomorph carbs: 2.0, fat: 1.0
    expect(result.summary.totalCarbs).toBe(800); // 80 * 2.0 * 5 = 800
    expect(result.summary.totalFat).toBe(400); // 80 * 1.0 * 5 = 400
    expect(result.summary.dailyProtein).toBe(144); // 80 * 1.8 = 144

    // Check day allocation for 5 days: 1 high, 2 medium, 2 low
    const highDays = result.dailyPlans.filter((day) => day.type === 'high');
    const mediumDays = result.dailyPlans.filter((day) => day.type === 'medium');
    const lowDays = result.dailyPlans.filter((day) => day.type === 'low');

    expect(highDays).toHaveLength(1);
    expect(mediumDays).toHaveLength(2);
    expect(lowDays).toHaveLength(2);
  });

  it('should handle ectomorph with beginner protein level', () => {
    const input: UserInput = {
      weight: 60,
      bodyType: 'ectomorph',
      proteinLevel: 'beginner',
      cycleDays: 3,
    };

    const result = calculateNutritionPlan(input);

    // Check coefficients: ectomorph carbs: 3.0, fat: 1.1
    expect(result.summary.totalCarbs).toBe(540); // 60 * 3.0 * 3 = 540
    expect(result.summary.totalFat).toBe(198); // 60 * 1.1 * 3 = 198
    expect(result.summary.dailyProtein).toBe(48); // 60 * 0.8 = 48

    // Check day allocation for 3 days: 1 high, 1 medium, 1 low
    const highDays = result.dailyPlans.filter((day) => day.type === 'high');
    const mediumDays = result.dailyPlans.filter((day) => day.type === 'medium');
    const lowDays = result.dailyPlans.filter((day) => day.type === 'low');

    expect(highDays).toHaveLength(1);
    expect(mediumDays).toHaveLength(1);
    expect(lowDays).toHaveLength(1);
  });

  it('should calculate calories correctly', () => {
    const input: UserInput = {
      weight: 70,
      bodyType: 'mesomorph',
      proteinLevel: 'experienced',
      cycleDays: 7,
    };

    const result = calculateNutritionPlan(input);

    // Check that each day's calories match carbs*4 + fat*9 + protein*4
    result.dailyPlans.forEach((day) => {
      const expectedCalories = day.carbs * 4 + day.fat * 9 + day.protein * 4;
      expect(day.calories).toBe(expectedCalories);
    });

    // Weekly calories can be derived if needed by aggregating daily values
    const totalCaloriesFromDays = result.dailyPlans.reduce(
      (sum, day) => sum + day.calories,
      0
    );
    expect(totalCaloriesFromDays).toBeGreaterThan(0);
  });

  it('should verify weekly totals match sum of daily amounts (PRD acceptance criteria)', () => {
    const input: UserInput = {
      weight: 75,
      bodyType: 'mesomorph',
      proteinLevel: 'experienced',
      cycleDays: 6,
    };

    const result = calculateNutritionPlan(input);

    // Sum up daily amounts
    const totalDailyCarbs = result.dailyPlans.reduce(
      (sum, day) => sum + day.carbs,
      0
    );
    const totalDailyFat = result.dailyPlans.reduce(
      (sum, day) => sum + day.fat,
      0
    );

    // PRD requirement: ±1g tolerance
    expect(
      Math.abs(totalDailyCarbs - result.summary.totalCarbs)
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(totalDailyFat - result.summary.totalFat)
    ).toBeLessThanOrEqual(1);
  });

  it('should handle edge case with minimum cycle days', () => {
    const input: UserInput = {
      weight: 50,
      bodyType: 'endomorph',
      proteinLevel: 'beginner',
      cycleDays: 3,
    };

    const result = calculateNutritionPlan(input);

    expect(result.dailyPlans).toHaveLength(3);
    expect(result.summary.totalCarbs).toBe(300); // 50 * 2.0 * 3
    expect(result.summary.totalFat).toBe(150); // 50 * 1.0 * 3
    expect(result.summary.dailyProtein).toBe(40); // 50 * 0.8
  });

  it('should handle edge case with maximum cycle days', () => {
    const input: UserInput = {
      weight: 90,
      bodyType: 'ectomorph',
      proteinLevel: 'experienced',
      cycleDays: 7,
    };

    const result = calculateNutritionPlan(input);

    expect(result.dailyPlans).toHaveLength(7);
    expect(result.summary.totalCarbs).toBe(1890); // 90 * 3.0 * 7
    expect(result.summary.totalFat).toBe(693); // 90 * 1.1 * 7
    expect(result.summary.dailyProtein).toBe(135); // 90 * 1.5
  });
});

describe('convertWeight', () => {
  it('should convert kg to lb correctly', () => {
    expect(convertWeight(70, 'kg', 'lb')).toBeCloseTo(154.32, 2);
    expect(convertWeight(50, 'kg', 'lb')).toBeCloseTo(110.23, 2);
  });

  it('should convert lb to kg correctly', () => {
    expect(convertWeight(154.32, 'lb', 'kg')).toBeCloseTo(70, 2);
    expect(convertWeight(220, 'lb', 'kg')).toBeCloseTo(99.79, 2);
  });

  it('should return same value when units are the same', () => {
    expect(convertWeight(70, 'kg', 'kg')).toBe(70);
    expect(convertWeight(154, 'lb', 'lb')).toBe(154);
  });
});

describe('validateWeight', () => {
  it('should validate kg weight range (30-200)', () => {
    expect(validateWeight(30, 'kg')).toBe(true);
    expect(validateWeight(70, 'kg')).toBe(true);
    expect(validateWeight(200, 'kg')).toBe(true);

    expect(validateWeight(29, 'kg')).toBe(false);
    expect(validateWeight(201, 'kg')).toBe(false);
  });

  it('should validate lb weight range (66-440)', () => {
    expect(validateWeight(66, 'lb')).toBe(true);
    expect(validateWeight(154, 'lb')).toBe(true);
    expect(validateWeight(440, 'lb')).toBe(true);

    expect(validateWeight(65, 'lb')).toBe(false);
    expect(validateWeight(441, 'lb')).toBe(false);
  });
});

describe('validateProteinCoeff', () => {
  it('should validate protein coefficient range (0.8-2.0)', () => {
    expect(validateProteinCoeff(0.8)).toBe(true);
    expect(validateProteinCoeff(1.5)).toBe(true);
    expect(validateProteinCoeff(2.0)).toBe(true);

    expect(validateProteinCoeff(0.7)).toBe(false);
    expect(validateProteinCoeff(2.1)).toBe(false);
  });
});
