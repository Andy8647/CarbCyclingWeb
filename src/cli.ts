#!/usr/bin/env node

import {
  calculateNutritionPlan,
  calculateMetabolicData,
  type UserInput,
  type BodyType,
  type ProteinLevel,
  type ActivityFactor,
  type Gender,
} from './lib/calculator.js';

function printUsage() {
  console.log(`
Usage: npm run cli -- <weight> <bodyType> <proteinLevel> [customProtein] <cycleDays>

Arguments:
  weight        Body weight in kg (30-200)
  bodyType      Body type: endomorph | mesomorph | ectomorph
  proteinLevel  Protein level: beginner | experienced | custom
  customProtein Protein coefficient (0.8-2.0) - required only if proteinLevel is 'custom'
  cycleDays     Cycle length in days (3-7)

Examples:
  npm run cli -- 70 mesomorph experienced 7
  npm run cli -- 80 endomorph custom 1.8 5
  npm run cli -- 60 ectomorph beginner 3

Body Type Coefficients:
  endomorph:  carbs 2.0 g/kg, fat 1.0 g/kg
  mesomorph:  carbs 2.5 g/kg, fat 0.9 g/kg  
  ectomorph:  carbs 3.0 g/kg, fat 1.1 g/kg

Protein Levels:
  beginner:    0.8 g/kg
  experienced: 1.5 g/kg
  custom:      specify your own (0.8-2.0 g/kg)
`);
}

function parseArgs(): UserInput | null {
  const args = process.argv.slice(2);

  if (args.length < 4 || args.length > 5) {
    return null;
  }

  const weight = parseFloat(args[0]);
  const bodyType = args[1] as BodyType;
  const proteinLevel = args[2] as ProteinLevel;

  let customProtein: number | undefined;
  let cycleDays: number;

  if (proteinLevel === 'custom') {
    if (args.length !== 5) {
      console.error(
        'Error: customProtein is required when proteinLevel is "custom"'
      );
      return null;
    }
    customProtein = parseFloat(args[3]);
    cycleDays = parseInt(args[4]);
  } else {
    if (args.length !== 4) {
      console.error('Error: Too many arguments for non-custom protein level');
      return null;
    }
    cycleDays = parseInt(args[3]);
  }

  // Validation
  if (isNaN(weight) || weight < 30 || weight > 200) {
    console.error('Error: Weight must be a number between 30-200 kg');
    return null;
  }

  if (!['endomorph', 'mesomorph', 'ectomorph'].includes(bodyType)) {
    console.error(
      'Error: Body type must be: endomorph, mesomorph, or ectomorph'
    );
    return null;
  }

  if (!['beginner', 'experienced', 'custom'].includes(proteinLevel)) {
    console.error(
      'Error: Protein level must be: beginner, experienced, or custom'
    );
    return null;
  }

  if (proteinLevel === 'custom') {
    if (isNaN(customProtein!) || customProtein! < 0.8 || customProtein! > 2.0) {
      console.error(
        'Error: Custom protein must be a number between 0.8-2.0 g/kg'
      );
      return null;
    }
  }

  if (isNaN(cycleDays) || cycleDays < 3 || cycleDays > 7) {
    console.error('Error: Cycle days must be a number between 3-7');
    return null;
  }

  // Body type coefficients
  const bodyTypeCoefficients = {
    endomorph: { carbCoeff: 2.0, fatCoeff: 1.0 },
    mesomorph: { carbCoeff: 2.5, fatCoeff: 0.9 },
    ectomorph: { carbCoeff: 3.0, fatCoeff: 1.1 },
  };

  // Protein coefficients
  const proteinCoefficients = {
    beginner: 0.8,
    experienced: 1.5,
    custom: customProtein || 1.2,
  };

  const coeffs = bodyTypeCoefficients[bodyType];
  const proteinCoeff = proteinCoefficients[proteinLevel];

  return {
    age: 30, // Default age for CLI
    gender: 'male' as Gender, // Default gender for CLI
    weight,
    height: 175, // Default height for CLI
    activityFactor: 'moderate' as ActivityFactor, // Default activity
    bodyType,
    carbCoeff: coeffs.carbCoeff,
    proteinCoeff: proteinCoeff,
    fatCoeff: coeffs.fatCoeff,
    cycleDays,
  };
}

function formatResults(plan: ReturnType<typeof calculateNutritionPlan>) {
  console.log('\n🥗 CARB CYCLING NUTRITION PLAN');
  console.log('═'.repeat(50));

  console.log('\n📊 WEEKLY SUMMARY:');
  console.log(`🍚 Total Carbs:     ${plan.summary.totalCarbs}g`);
  console.log(`🧈 Total Fat:       ${plan.summary.totalFat}g`);
  console.log(`🥩 Daily Protein:   ${plan.summary.dailyProtein}g`);
  console.log(`🔥 Total Calories:  ${plan.summary.totalCalories} kcal`);

  console.log('\n📅 DAILY BREAKDOWN:');
  console.log('─'.repeat(60));
  console.log('Day | Type   | Carbs | Fat  | Protein | Calories');
  console.log('─'.repeat(60));

  plan.dailyPlans.forEach((day) => {
    const type = day.type.padEnd(6);
    const carbs = day.carbs.toString().padStart(5);
    const fat = day.fat.toString().padStart(4);
    const protein = day.protein.toString().padStart(7);
    const calories = day.calories.toString().padStart(8);

    console.log(
      `${day.day.toString().padStart(3)} | ${type} | ${carbs} | ${fat} | ${protein} | ${calories}`
    );
  });

  console.log('─'.repeat(60));

  // Summary by day type
  const dayTypes = ['high', 'medium', 'low'] as const;
  console.log('\n🔄 CYCLE DISTRIBUTION:');

  dayTypes.forEach((type) => {
    const days = plan.dailyPlans.filter((d) => d.type === type);
    if (days.length > 0) {
      const emoji = type === 'high' ? '⬆️' : type === 'medium' ? '➡️' : '⬇️';
      console.log(
        `${emoji} ${type.toUpperCase()} carb days (${days.length}): ${days[0].carbs}g carbs, ${days[0].fat}g fat`
      );
    }
  });

  console.log("\n💡 Based on Kaisheng Wang's Carb Cycling Theory");
  console.log(
    '⚠️  This tool is for reference only and does not constitute medical advice.'
  );
}

function main() {
  const input = parseArgs();

  if (!input) {
    printUsage();
    process.exit(1);
  }

  try {
    const plan = calculateNutritionPlan(input);
    formatResults(plan);
  } catch (error) {
    console.error('Error calculating nutrition plan:', error);
    process.exit(1);
  }
}

main();
