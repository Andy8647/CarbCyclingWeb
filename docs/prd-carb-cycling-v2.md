# PRD: 三分化碳循环计划生成 V2（以高/低碳为核心）

## 1. 背景与目标

- 背景：现有算法通过“周总量 -> 天类型百分比分配”的方式按高/中/低对碳水和脂肪做均摊，用户反馈灵活度不足，且与实际训练节奏不完全匹配。
- 目标：
  - 采用“训练三天（低碳）+ 休息一天（高碳）循环”的范式为默认模板，强调按天类型的宏量系数（g/kg）直接产出每日摄入，而非先聚合再按百分比分配。
  - 删除“中碳”类型与“碳水/脂肪百分比分配”UI与逻辑；仅保留“高/低碳”两类，并保留“循环天数”的灵活选项与“高/低天数分配”的自由调整。
  - 重新引入 Mifflin-St Jeor 的 TDEE 计算，用“相对 TDEE 的差值（盈余/缺口）”辅助用户理解当前系数下的能量平衡（不与日型绑定）。
  - 为不同日型（高/低）提供各自可调的三大营养素系数（g/kg）。

## 2. 核心概念

- 日型（DayType）：仅保留 `low` 与 `high` 两种。
- 宏量系数（Macro Coefficients）：以 g/kg 表示的 C/P/F 系数，分别对高/低碳日单独配置。
- TDEE：基于 Mifflin-St Jeor + 活动系数，作为热量基线；结果展示的“热量差值”恒以 TDEE 为参照，与日型无关。
- 循环（Cycle）：保留“循环天数”配置；默认 4 天循环（低、低、低、高），用户可任意调整高/低天数及顺序以适配训练安排。

## 3. 用户价值与场景

- 新手：直接使用默认模板（3 低 + 1 高），按推荐系数得到清晰的每日目标。
- 进阶：结合 TDEE 与热量缺口百分比，对高/低两种日型分别微调 C/P/F 系数以匹配个人恢复与减脂目标。
- 教练/自定义：更改循环天数与高/低分配，匹配不同训练周节奏。

## 4. 默认方案（产品文案与数值）

- 训练与碳循环结构（默认）：
  - 第1天：胸+三头（低碳）
  - 第2天：背+二头（低碳）
  - 第3天：肩+腿（低碳）
  - 第4天：休息（高碳）
  - 循环方式：三天低碳日后一天高碳日，反复循环。
- 低碳日（训练日）建议范围：
  - 碳水：1–1.5 g/kg；蛋白：1.5–1.8 g/kg；脂肪：1–1.2 g/kg
  - 默认值：碳水 1.25、蛋白 1.7、脂肪 1.1（g/kg）
- 高碳日（休息日）建议范围：
  - 碳水：3–5 g/kg；蛋白：≈1 g/kg；脂肪：0.5–0.8 g/kg
  - 默认值：碳水 4.0、蛋白 1.0、脂肪 0.7（g/kg）
- 参考目标热量（项目常量）：
  - 低碳日目标 = TDEE × (1 − LOW_DAY_DEFICIT_PCT)
  - 高碳日目标 = TDEE × (1 + HIGH_DAY_SURPLUS_PCT)
  - 两个百分比在项目配置常量中定义（不可在 UI 调整）。

## 5. 计算规范（公式）

- 单位：体重 kg、身高 cm、年龄岁、能量 kcal。
- BMR（Mifflin-St Jeor）：
  - 男：BMR = 10×体重(kg) + 6.25×身高(cm) − 5×年龄(岁) + 5
  - 女：BMR = 10×体重(kg) + 6.25×身高(cm) − 5×年龄(岁) − 161
- 活动系数（参考值）：
  - 1.2（久坐）/ 1.375（轻度）/ 1.55（中等）/ 1.725（重度）/ 1.9（高强度）
- TDEE = BMR × 活动系数
- 日型宏量：
  - grams(carbs|protein|fat) = 体重(kg) × 对应日型系数(g/kg)
  - CaloriesFromMacros = 4×Carbs + 4×Protein + 9×Fat
  - Deficit/Surplus vs TDEE（展示用）= CaloriesFromMacros − TDEE
    - 负值（缺口）红色并显示“−”；正值（盈余）绿色并显示“+”。
  - 参考目标热量（非强制配平）：
    - Low 参考目标 = TDEE × (1 − LOW_DAY_DEFICIT_PCT)
    - High 参考目标 = TDEE × (1 + HIGH_DAY_SURPLUS_PCT)
- 数值规范（统一取整）：
  - 所有结果展示数字（g 与 kcal）一律四舍五入为整数。

## 6. 交互与 UX

- 基本信息卡片（新增/改版）：
  - 性别、年龄、身高、体重、活动系数（下拉/滑块）。
- 日型设置卡片（高/低）：
  - 各自 3 个输入：碳水/蛋白/脂肪（g/kg），内联显示建议范围与默认值按钮；
  - 展示“按当前体重计算的当日 g 与 kcal”，并显示“相对 TDEE 的热量差值（盈余/缺口，色彩与正负号）”；
  - 同时展示“参考目标热量”（由常量 LOW_DAY_DEFICIT_PCT / HIGH_DAY_SURPLUS_PCT 计算），仅作参考不强制配平。
- 循环构建器：
  - “循环天数”（保留），默认 4；
  - “高/低天数”与“序列编辑”（拖动/点击切换），默认 [低,低,低,高]；
  - 可保存为不同循环长度的独立配置（继续沿用现有 per-cycle 持久化策略）。
- 结果展示：
  - 不展示“每周总览”；
  - 按天列出：日序号、日型、高/低标签、三大 g、合计 kcal、相对 TDEE 的差值（红/绿、带正负号），以及“参考目标热量”；
  - 导出 Markdown/CSV 同步更新（不再包括“周总量分配环形图”）。

## 7. 范围与不做事项

- In scope：
  - 删除“中碳”类型与碳水/脂肪百分比分配 UI 与算法；
  - 新增 TDEE & 缺口%、高/低独立 g/kg 系数、循环构建器；
  - 结果页/导出更新；数据持久化与版本迁移；
  - 对 MealSlotPlanner 暴露“当日宏量目标/建议热量”的只读接口用于对齐进食计划。
- Out of scope（本次不做）：
  - 自动将宏量系数反向拟合至参考目标热量（仅提示差值，不自动回填）；
  - 训练周历/日期层面的日历排期；
  - 食物库与拖拽 UI 的大改（另有独立任务跟进）。

## 8. 数据模型与类型（建议）

- 项目配置（新增）：
  - 文件：`src/lib/config.ts`
  - 导出：`Config.CYCLE_TARGETS` { LOW_DAY_DEFICIT_PCT: number; HIGH_DAY_SURPLUS_PCT: number }
- Profile 与 TDEE 设置：
  - UserProfile { sex: 'male'|'female'; age: number; heightCm: number; weightKg: number; activityFactor: number }
  - EnergySettings { globalDeficitPct: number; perDayOverride?: { low?: number; high?: number } }
- 日型系数：
  - DayType = 'low' | 'high'
  - MacroCoefficients { carbsGPerKg: number; proteinGPerKg: number; fatGPerKg: number }
  - CycleMacroConfig { low: MacroCoefficients; high: MacroCoefficients }
- 循环配置：
  - CycleConfig { cycleDays: number; pattern: DayType[] } // 例：[low, low, low, high]
- 计划输出：
  - PlanDay { index: number; type: DayType; carbsG: number; proteinG: number; fatG: number; calories: number; targetCalories: number; energyDelta: number }
  - CyclePlan { days: PlanDay[]; tdee: number }

## 9. 算法与接口（伪代码）

```
function calculateTDEE(profile) {
  const { sex, age, heightCm, weightKg, activityFactor } = profile;
  const bmr = sex === 'male'
    ? 10*weightKg + 6.25*heightCm - 5*age + 5
    : 10*weightKg + 6.25*heightCm - 5*age - 161;
  return Math.round(bmr * activityFactor);
}

function gramsFromCoeff(weightKg, coeff) {
  return {
    carbsG:  Math.round(weightKg * coeff.carbsGPerKg),
    proteinG: Math.round(weightKg * coeff.proteinGPerKg),
    fatG:    Math.round(weightKg * coeff.fatGPerKg),
  };
}

function caloriesFromMacros({ carbsG, proteinG, fatG }) {
  return Math.round(carbsG*4 + proteinG*4 + fatG*9);
}

function generateCyclePlan(profile, cycleConfig, coeffs, config) {
  const tdee = calculateTDEE(profile);
  const days = cycleConfig.pattern.map((type, idx) => {
    const g = gramsFromCoeff(profile.weightKg, coeffs[type]);
    const calories = caloriesFromMacros(g);
    const targetCalories = Math.round(
      type === 'low'
        ? tdee * (1 - config.CYCLE_TARGETS.LOW_DAY_DEFICIT_PCT)
        : tdee * (1 + config.CYCLE_TARGETS.HIGH_DAY_SURPLUS_PCT)
    );
    const deltaVsTDEE = calories - tdee; // 红/绿展示依据
    return { index: idx+1, type, ...g, calories, targetCalories, deltaVsTDEE };
  });
  return { days, tdee };
}
```

## 10. 表单与持久化改动

- form-schema 变更：
  - 移除：`includeMidCarb`、`midDays`、所有 `*CarbPercent` 与 `*FatPercent` 字段、任何用户可编辑的缺口%字段；
  - 新增：`sex`、`age`、`heightCm`、`activityFactor`；
  - 新增：高/低两套宏量系数字段：`lowCarbCoeff`、`lowProteinCoeff`、`lowFatCoeff`、`highCarbCoeff`、`highProteinCoeff`、`highFatCoeff`；
  - 保留：`cycleDays` 与“高/低天数/序列”。
- 持久化：保留用户 Profile 与日型系数；目标热量使用项目常量，不入库。

## 11. UI/文案要点

- 替换“分配环形图”为“日型系数编辑 + TDEE 对比提示”。
- 高/低卡片各含：C/P/F (g/kg) 输入、默认按钮、建议范围小字、当日 g 与 kcal 以及与 TargetCalories 的差异提示（颜色+箭头）。
- 循环构建器：保留“循环天数”，支持拖拽/点击切换日型；默认 3 低 + 1 高。
- 结果页：不展示“每周总览”，导出包含：日序号、日型、三大 g、合计 kcal、参考目标热量、相对 TDEE 的差值（红/绿、±号）。

## 12. 与 MealSlotPlanner 的集成

- 提供 `getCyclePlan(cycleDays)` 读取接口，返回 `CyclePlan`；
- Planner 读取当天 `PlanDay` 的宏量目标（g/kcal）用于显示“目标 vs 已摄入”进度；
- 暂不做自动配平，仅数据对齐与展示。

## 13. 验收标准（Acceptance Criteria）

- 算法：
  - 仅存在高/低两种日型；按 g/kg×体重直出每日 g 与 kcal；
  - 使用 TDEE（Mifflin-St Jeor + 活动系数）作为唯一对比基线；
  - 结果中展示“相对 TDEE 的差值”，负值红/正值绿且带“−/+”；
  - 参考目标热量由配置常量计算，不受 UI 改动影响。
- 表单与 UI：
  - 能输入性别/年龄/身高/体重/活动系数/缺口%；
  - 能分别编辑高/低三大系数（g/kg）；
  - 能设置循环天数与高/低分配，并可调整顺序；
  - 结果导出包含日型、三大、kcal、TargetCalories、差值。
- 删除项：
  - 无“中碳”；无“碳水/脂肪百分比分配环形图与逻辑”。
- 数据与迁移：
  - 旧数据可加载；若存在旧单套系数，则迁移到高/低两套；
  - 版本号升级，localStorage 不报错。
- 测试：
  - 单测覆盖：TDEE 计算（男女/不同活动系数）、g/kg→g/kcal 计算、缺口/差值提示阈值、循环生成顺序；
  - e2e 或集成：表单填写→结果展示与导出内容匹配。

## 14. 里程碑与分工

- M1 算法与类型重构：新增 `calculateTDEE` 与 `generateCyclePlan`，移除旧 `calculateNutritionPlan` 的周分配逻辑；
- M2 表单与 UI：新增基本信息卡片、替换分配环图、日型系数卡片与循环构建器；
- M3 结果与导出：列结构更新与 i18n；
- M4 持久化迁移与测试完善。

## 15. 风险与缓解

- 用户习惯变化：用“默认按钮/建议区间/差值提示”降低学习成本。
- 数值偏差争议：将“缺口%”定位为辅助提示，不强制拟合，避免误导。
- 数据迁移：提供幂等迁移函数与版本回退保护。

## 16. 待决问题（需产品确认）

- 缺口%是否需要默认区分高/低（例如：低碳 -20%，高碳 -5%）？若是，默认值与上限？
- 结果页不展示“每周总览”。
- 是否提供“一键建议”将 C/P/F 系数微调至与 TargetCalories 相差 < 3%（可作为后续增强）。
