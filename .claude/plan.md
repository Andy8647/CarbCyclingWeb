# 碳循环饮食计算器 - 开发计划

本文档根据产品需求文档（PRD）制定，旨在将项目分解为可执行的开发任务，并规划开发流程。

## 项目进度概览

### ✅ 已完成的功能
- **项目初始化与技术栈搭建** - Vite + React + TypeScript + shadcn/ui
- **基础布局与响应式设计** - 桌面端/移动端布局适配
- **主题切换功能** - light/dark/system 模式，localStorage持久化
- **动态粒子背景** - react-tsparticles 集成，主题响应
- **玻璃拟态卡片样式** - InputForm 和 ResultCard 的 Glassmorphism 效果
- **InputForm 组件** - 完整的用户输入表单，包括：
  - 基础信息录入（年龄、性别、身高、体重）
  - 体型选择与营养系数自动填充
  - 动态描述显示
  - 活动水平和循环天数设置
  - 表单验证与用户体验优化
- **核心计算逻辑** - 基本的营养素计算框架
- **Footer 免责声明** - 页脚布局和免责信息

### 🚧 当前开发阶段 - v0.2 增强功能

**目标**: 完善计算功能、优化结果展示、增加导出功能

## 🎯 待完成功能（按优先级排序）

### 高优先级 (P0)
1. **TDEE计算与热量差显示** - 基于用户信息计算每日总消耗，在结果中显示热量差
2. **计算结果组件增强** - 更新emoji，优化展示逻辑
3. **CSV/PNG导出功能** - 替换实时计算按钮，添加导出选项

### 中优先级 (P1)  
4. **训练项目管理** - 可自定义的训练部位dropdown（胸、背、腿等）
5. **结果表格拖拽排序** - 实现每日计划的drag&drop重新排序
6. **数据持久化** - localStorage保存用户输入和训练项目设置

### 低优先级 (P2)
7. **Footer样式优化** - 调整宽度和视觉效果
8. **SEO优化** - 使用vite-plugin-pwa或react-helmet-async管理metadata
9. **国际化支持** - 中英文切换
10. **单位系统完善** - kg/lb转换优化

## 🛠 技术实现规划

### TDEE计算公式
- **BMR计算**: Mifflin-St Jeor公式
  - 男性: BMR = 88.362 + (13.397 × 体重kg) + (4.799 × 身高cm) - (5.677 × 年龄)
  - 女性: BMR = 447.593 + (9.247 × 体重kg) + (3.098 × 身高cm) - (4.330 × 年龄)
- **活动系数**: 
  - 久坐: 1.2, 轻度: 1.375, 中度: 1.55, 活跃: 1.725, 极活跃: 1.9

### 训练项目预设选项
- 胸部、背部、腿部、肩部、手臂、腹部、全身、有氧、休息

### 数据结构设计
```typescript
interface UserSettings {
  formData: FormData;
  customWorkouts: string[];
  dailyWorkouts: Record<number, string>; // day index -> workout
}
```

---

## 3. 技术选型确认

- **脚手架**: Vite
- **框架**: React 19+
- **语言**: TypeScript
- **UI 组件库**: shadcn/ui
- **表单管理**: react-hook-form
- **校验**: zod
- **动态背景**: react-tsparticles
- **国际化**: i18next
- **图片导出**: html-to-image

---

## 4. 组件设计 (初步)

```
src/
├── components/
│   ├── ui/ (来自 shadcn/ui)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeProvider.tsx
│   ├── core/
│   │   ├── InputForm.tsx         # 输入表单
│   │   ├── ResultCard.tsx        # 结果展示
│   │   ├── Summary.tsx           # 周度摘要
│   │   └── DailyTable.tsx        # 每日明细表
│   └── shared/
│       ├── ParticleBackground.tsx # 粒子背景
│       └── LanguageSwitcher.tsx   # 语言切换器
├── lib/
│   ├── calculator.ts             # 核心计算逻辑
│   ├── i18n.ts                   # 国际化配置
│   └── utils.ts                  # 工具函数
└── App.tsx                       # 应用主入口
```
