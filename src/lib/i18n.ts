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
    title: '活动参数',
    cycleDays: '循环天数',
    days: '天',
    activityLevel: '活动系数',
    activityTooltip:
      '活动系数用于计算 TDEE（每日总能量消耗），不会影响碳循环计划的分配。若不确定，推荐选择"中度"。',
    sedentary: '久坐 – 几乎不运动（办公室）',
    light: '轻度 – 轻运动 1–3 次/周',
    moderate: '中度 – 规律训练 3–5 次/周',
    active: '活跃 – 高强度训练 6–7 次/周',
    very_active: '极高 – 职业运动员 / 体力劳动',
  },
  results: {
    title: '营养方案',
    copyResults: '复制结果',
    copyAsMarkdown: '复制为 Markdown',
    copyAsCSV: '复制为 CSV',
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
    totalCaloriesFull: '总热量',
    calorieDeficitFull: '热量差',
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
  accessibility: {
    switchToLanguage: '切换到{{language}}',
    currentTheme: '当前主题：{{theme}}',
    switchToUnits: '切换到{{units}}单位',
    themeLight: '浅色',
    themeDark: '深色',
    themeSystem: '系统',
    unitsMetric: '公制',
    unitsImperial: '英制',
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
    title: 'Basic Information',
    ageUnit: 'yrs',
    heightUnit: 'cm',
    weightUnit: 'kg',
  },
  nutrition: {
    title: 'Macronutrient Settings',
    bodyType: 'Body Type',
    endomorph: 'Endomorph',
    mesomorph: 'Mesomorph',
    ectomorph: 'Ectomorph',
    carbCoeff: 'Carbs',
    proteinCoeff: 'Protein',
    fatCoeff: 'Fat',
    descriptions: {
      endomorph:
        'Endomorph: Prone to weight gain with a slower metabolism. Best suited for a low-carb, high-protein diet. Suggested protein intake: 0.8–2.5 g/kg body weight.',
      mesomorph:
        'Mesomorph: Muscular build with balanced metabolism. Can adapt flexibly to different nutrition strategies. Suggested protein intake: 0.8–2.5 g/kg body weight.',
      ectomorph:
        'Ectomorph: Naturally lean with a fast metabolism. Requires more carbs to maintain weight. Suggested protein intake: 0.8–2.5 g/kg body weight.',
      default:
        'Select a body type to view tailored nutrition guidance. Suggested protein intake: 0.8–2.5 g/kg body weight, adjusted by training intensity.',
    },
  },
  activity: {
    title: 'Activity Settings',
    cycleDays: 'Cycle Length',
    days: 'days',
    activityLevel: 'Activity Factor',
    activityTooltip:
      'Activity factor is used to calculate TDEE (total daily energy expenditure). It does not affect carb cycling plan distribution. If unsure, choose "Moderate".',
    sedentary: 'Sedentary – Office job, little/no exercise',
    light: 'Lightly active – Exercise 1–3 times/week',
    moderate: 'Moderate – Exercise 3–5 times/week',
    active: 'Very active – Exercise 6–7 times/week',
    very_active: 'Extra active – Athlete or physical job',
  },
  results: {
    title: 'Nutrition Plan',
    copyResults: 'Copy Results',
    copyAsMarkdown: 'Copy as Markdown',
    copyAsCSV: 'Copy as CSV',
    exportPNG: 'Export PNG (Coming Soon)',
    dailyProtein: 'Daily Protein',
    weeklyCarbs: 'Weekly Carbs',
    weeklyFat: 'Weekly Fat',
    weeklyCalories: 'Weekly Calories',
    dailyTDEE: 'TDEE',
    calorieInfo: 'Calories',
    dayTypes: {
      high: '🔥 High Carb',
      medium: '⚖️ Medium Carb',
      low: '🌿 Low Carb',
    },
    carbs: 'Carbs',
    fat: 'Fat',
    protein: 'Protein',
    totalCalories: 'Total',
    calorieDeficit: 'Diff',
    totalCaloriesFull: 'Total Calories',
    calorieDeficitFull: 'Calorie Deficit',
    workout: 'Workout',
    selectWorkout: 'Select Workout',
    nutritionBreakdown: 'Nutrition Breakdown',
    dayNumber: 'Day {{day}}',
    dropCardHere: 'Drag & drop here',
    fillFormFirst: 'Please complete all required fields',
    fillFormDescription:
      'Once weight, body type, protein setting, and cycle length are set, a 3–7 day plan will be generated instantly.',
    carbCyclingPlan: 'Carb Cycling Plan',
    weeklySummary: 'Weekly Summary',
    dailyDetails: 'Daily Breakdown',
    day: 'Day',
    dayType: 'Type',
    copySuccess: 'Copied to clipboard!',
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
      'This calculator is for reference only. Please consult a certified nutritionist for personalized dietary advice.',
  },
  accessibility: {
    switchToLanguage: 'Switch to {{language}}',
    currentTheme: 'Current theme: {{theme}}',
    switchToUnits: 'Switch to {{units}} units',
    themeLight: 'light',
    themeDark: 'dark',
    themeSystem: 'system',
    unitsMetric: 'metric',
    unitsImperial: 'imperial',
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
