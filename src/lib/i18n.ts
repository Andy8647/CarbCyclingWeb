import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 中文翻译
const zhCN = {
  common: {
    age: '年龄',
    gender: '性别',
    height: '身高',
    weight: '体重',
    male: '男',
    female: '女',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    metric: '公制',
    imperial: '英制',
  },
  header: {
    title: '碳循环饮食计算器',
  },
  basicInfo: {
    title: '基础信息',
    ageUnit: '岁',
    heightUnit: 'cm',
    weightUnit: 'kg',
  },
  nutrition: {
    title: '营养素系数',
    bodyType: '体型',
    endomorph: '内胚型',
    mesomorph: '中胚型',
    ectomorph: '外胚型',
    carbCoeff: '碳水',
    proteinCoeff: '蛋白质',
    fatCoeff: '脂肪',
    descriptions: {
      endomorph:
        '内胚型：易增重，代谢较慢，适合低碳水高蛋白饮食。蛋白质建议0.8-2.5g/kg体重。',
      mesomorph:
        '中胚型：肌肉发达，代谢均衡，营养分配相对灵活。蛋白质建议0.8-2.5g/kg体重。',
      ectomorph:
        '外胚型：偏瘦难增重，代谢快，需要更多碳水维持体重。蛋白质建议0.8-2.5g/kg体重。',
      default:
        '选择体型后显示对应的营养建议。蛋白质建议0.8-2.5g/kg体重，根据训练强度调整。',
    },
  },
  activity: {
    title: '循环天数',
    days: '天',
    activityLevel: '每日活动量',
    sedentary: '久坐',
    light: '轻度',
    moderate: '中度',
    active: '活跃',
    very_active: '极活跃',
  },
  results: {
    title: '营养方案',
    copyResults: '复制结果',
    exportPNG: '导出 PNG (待实现)',
    dailyProtein: '每日蛋白',
    weeklyCarbs: '周碳水',
    weeklyFat: '周脂肪',
    weeklyCalories: '周热量',
    dailyTDEE: '每日TDEE',
    calorieInfo: '热量信息',
    dayTypes: {
      high: '🔥 高碳日',
      medium: '⚖️ 中碳日',
      low: '🌿 低碳日',
    },
    carbs: '碳水',
    fat: '脂肪',
    protein: '蛋白',
    totalCalories: '总热量',
    calorieDeficit: '热量差',
    workout: '训练项目',
    selectWorkout: '选择训练',
    nutritionBreakdown: '营养配比',
    dayNumber: '第{{day}}天',
    dropCardHere: '拖拽卡片到此处',
    fillFormFirst: '请先填写完整信息',
    fillFormDescription:
      '体重、体型、蛋白系数与循环天数就绪后，这里会即时展示你的 3–7 天计划。',
    carbCyclingPlan: '碳循环饮食计划',
    weeklySummary: '周度摘要',
    dailyDetails: '每日明细',
    day: '天数',
    dayType: '日型',
    copySuccess: '结果已复制到剪贴板！',
    copyError: '复制失败',
  },
  workouts: {
    chest: '胸部',
    back: '背部',
    legs: '腿部',
    shoulders: '肩部',
    arms: '手臂',
    abs: '腹部',
    full_body: '全身',
    cardio: '有氧',
    rest: '休息',
  },
  footer: {
    disclaimer: '本计算器仅供参考，具体饮食请咨询专业营养师。',
  },
};

// 英文翻译
const enUS = {
  common: {
    age: 'Age',
    gender: 'Gender',
    height: 'Height',
    weight: 'Weight',
    male: 'Male',
    female: 'Female',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    metric: 'Metric',
    imperial: 'Imperial',
  },
  header: {
    title: 'Carb Cycling Calculator',
  },
  basicInfo: {
    title: 'Basic Info',
    ageUnit: 'yrs',
    heightUnit: 'cm',
    weightUnit: 'kg',
  },
  nutrition: {
    title: 'Nutrition Coefficients',
    bodyType: 'Body Type',
    endomorph: 'Endomorph',
    mesomorph: 'Mesomorph',
    ectomorph: 'Ectomorph',
    carbCoeff: 'Carbs',
    proteinCoeff: 'Protein',
    fatCoeff: 'Fat',
    descriptions: {
      endomorph:
        'Endomorph: Gains weight easily, slower metabolism, suitable for low-carb high-protein diet. Protein: 0.8-2.5g/kg body weight.',
      mesomorph:
        'Mesomorph: Muscular build, balanced metabolism, flexible nutrition allocation. Protein: 0.8-2.5g/kg body weight.',
      ectomorph:
        'Ectomorph: Lean build, hard to gain weight, fast metabolism, needs more carbs. Protein: 0.8-2.5g/kg body weight.',
      default:
        'Select body type to see nutrition recommendations. Protein: 0.8-2.5g/kg body weight, adjust based on training intensity.',
    },
  },
  activity: {
    title: 'Cycle Days',
    days: 'days',
    activityLevel: 'Daily Activity',
    sedentary: 'Sedentary',
    light: 'Light',
    moderate: 'Moderate',
    active: 'Active',
    very_active: 'Very Active',
  },
  results: {
    title: 'Nutrition Plan',
    copyResults: 'Copy Results',
    exportPNG: 'Export PNG (Coming Soon)',
    dailyProtein: 'Daily Protein',
    weeklyCarbs: 'Weekly Carbs',
    weeklyFat: 'Weekly Fat',
    weeklyCalories: 'Weekly Calories',
    dailyTDEE: 'Daily TDEE',
    calorieInfo: 'Calorie Info',
    dayTypes: {
      high: '🔥 High Carb',
      medium: '⚖️ Medium Carb',
      low: '🌿 Low Carb',
    },
    carbs: 'Carbs',
    fat: 'Fat',
    protein: 'Protein',
    totalCalories: 'Total Calories',
    calorieDeficit: 'Calorie Diff',
    workout: 'Workout',
    selectWorkout: 'Select Workout',
    nutritionBreakdown: 'Nutrition Breakdown',
    dayNumber: 'Day {{day}}',
    dropCardHere: 'Drop card here',
    fillFormFirst: 'Please fill in complete information',
    fillFormDescription:
      'Once weight, body type, protein coefficient and cycle days are set, your 3-7 day plan will be displayed here instantly.',
    carbCyclingPlan: 'Carb Cycling Diet Plan',
    weeklySummary: 'Weekly Summary',
    dailyDetails: 'Daily Details',
    day: 'Day',
    dayType: 'Day Type',
    copySuccess: 'Results copied to clipboard!',
    copyError: 'Copy failed',
  },
  workouts: {
    chest: 'Chest',
    back: 'Back',
    legs: 'Legs',
    shoulders: 'Shoulders',
    arms: 'Arms',
    abs: 'Abs',
    full_body: 'Full Body',
    cardio: 'Cardio',
    rest: 'Rest',
  },
  footer: {
    disclaimer:
      'This calculator is for reference only. Please consult a professional nutritionist for specific diet plans.',
  },
};

// 配置i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
    },
    lng: 'zh-CN', // 默认语言
    fallbackLng: 'zh-CN', // 回退语言

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
