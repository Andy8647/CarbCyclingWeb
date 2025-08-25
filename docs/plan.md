# 碳循环饮食计算器 - 开发计划

本文档根据产品需求文档（PRD）制定，旨在将项目分解为可执行的开发任务，并规划开发流程。

## 项目进度概览

### ✅ 已完成的功能

- **项目初始化与技术栈搭建** - Vite + React + TypeScript + shadcn/ui
- **基础布局与响应式设计** - 桌面端/移动端布局适配，多断点优化
- **主题切换功能** - light/dark/system 模式，localStorage持久化
- **动态粒子背景** - react-tsparticles 集成，主题响应
- **玻璃拟态卡片样式** - InputForm 和 ResultCard 的 Glassmorphism 效果
- **InputForm 组件** - 完整的用户输入表单，包括：
  - 基础信息录入（年龄、性别、身高、体重）
  - 体型选择与营养系数自动填充
  - 动态描述显示
  - 活动水平和循环天数设置
  - 表单验证与用户体验优化
  - 实时计算功能（移除"开始计算"按钮）
  - 响应式断点优化（768px/1280px断点）
- **核心计算逻辑** - 完整的营养素计算框架，包括：
  - BMR和TDEE计算（Mifflin-St Jeor公式）
  - 碳循环营养素分配
  - 热量差计算和显示
- **ResultCard 组件** - 高级结果展示，包括：
  - 周度摘要卡片展示
  - Kanban风格的每日计划布局
  - 训练项目管理（dropdown选择器）
  - 拖拽排序功能（@dnd-kit实现）
  - 复制结果到剪贴板功能
- **Footer 免责声明** - 页脚布局和免责信息

### 🚧 当前开发阶段 - v0.3 用户体验优化

**目标**: 完善响应式体验、增加导出功能、数据持久化

## 🎯 待完成功能（按优先级排序）

### 高优先级 (P0)

1. **响应式布局优化** - 1024px以下使用表格布局，更大屏幕使用Kanban布局
2. **CSV导出功能** - 导出营养计划为CSV格式
3. **PNG导出功能** - 导出营养计划为PNG图片

### 中优先级 (P1)

4. **数据持久化** - localStorage保存用户输入和训练项目设置
5. **拖拽体验优化** - 进一步完善拖拽交互和视觉反馈

### 低优先级 (P2)

6. **Footer样式优化** - 调整宽度和视觉效果
7. **SEO优化** - 使用vite-plugin-pwa或react-helmet-async管理metadata
8. **国际化支持** - 中英文切换
9. **单位系统完善** - kg/lb转换优化
10. **性能优化** - 代码分割和懒加载

## 🛠 技术实现规划

### 响应式布局断点设计

- **< 768px**: 手机端垂直布局
- **768px - 1023px**: 平板端，InputForm单行，ResultCard使用表格布局
- **1024px+**: 桌面端，InputForm单行，ResultCard使用Kanban布局

### 已实现的技术特性

#### TDEE计算公式

- **BMR计算**: Mifflin-St Jeor公式
  - 男性: BMR = 88.362 + (13.397 × 体重kg) + (4.799 × 身高cm) - (5.677 × 年龄)
  - 女性: BMR = 447.593 + (9.247 × 体重kg) + (3.098 × 身高cm) - (4.330 × 年龄)
- **活动系数**:
  - 久坐: 1.2, 轻度: 1.375, 中度: 1.55, 活跃: 1.725, 极活跃: 1.9

#### 拖拽功能技术栈

- **@dnd-kit/core**: 核心拖拽功能
- **@dnd-kit/sortable**: 排序功能
- **@dnd-kit/modifiers**: snapCenterToCursor修饰符

#### 训练项目预设选项

- 胸部、背部、腿部、肩部、手臂、腹部、全身、有氧、休息

### 数据结构设计

```typescript
interface UserSettings {
  formData: FormData;
  customWorkouts: string[];
  dailyWorkouts: Record<number, string>; // day index -> workout
  dayOrder: number[]; // drag&drop排序状态
}
```

---

## 3. 技术选型确认

### 核心技术栈

- **脚手架**: Vite
- **框架**: React 19+
- **语言**: TypeScript
- **UI 组件库**: shadcn/ui

### 功能库

- **表单管理**: react-hook-form + @hookform/resolvers
- **校验**: zod
- **拖拽功能**: @dnd-kit (core, sortable, modifiers)
- **动态背景**: react-tsparticles

### 待集成库

- **国际化**: i18next (计划中)
- **图片导出**: html-to-image (计划中)

---

## 4. 组件架构

### 当前实现状态

```
src/
├── components/
│   ├── ui/ (shadcn/ui + 自定义组件)
│   │   ├── glass-card.tsx       ✅ 玻璃拟态卡片
│   │   ├── compact-input.tsx    ✅ 紧凑输入框
│   │   ├── radio-card.tsx       ✅ 单选卡片
│   │   ├── section-card.tsx     ✅ 分组卡片
│   │   └── slider-section.tsx   ✅ 滑动选择器
│   ├── layout/
│   │   ├── Header.tsx           ✅ 头部导航
│   │   └── Footer.tsx           ✅ 页脚免责
│   ├── core/
│   │   ├── InputForm.tsx        ✅ 输入表单 (实时计算)
│   │   └── ResultCard.tsx       ✅ 结果展示 (Kanban布局)
│   └── shared/
│       └── ParticleBackground.tsx ✅ 粒子背景
├── lib/
│   ├── calculator.ts            ✅ 完整计算逻辑
│   ├── form-context.tsx         ✅ 表单状态管理
│   ├── theme-context.tsx        ✅ 主题管理
│   └── utils.ts                 ✅ 工具函数
└── App.tsx                      ✅ 应用主入口
```

---

## 5. 当前开发状态

### ✅ v0.2 已完成 (2024-08-23)

- 实时计算功能：移除"开始计算"按钮，表单变化时自动更新结果
- Kanban风格结果展示：按天数分列，支持拖拽排序
- 训练项目管理：每日可选择训练部位
- 高级拖拽功能：@dnd-kit实现，支持卡片交换和位置移动
- 响应式优化：多断点适配 (768px/1280px)
- 复制功能：Markdown格式复制到剪贴板

### ✅ v0.3 性能与体验优化 (2024-08-25)

**已完成的修复**:

1. **Select组件性能优化** - 移除transform动画和zoom效果，解决移动端卡顿
2. **Radio组件响应优化** - 禁用移动端过渡动画，提升点击响应速度
3. **体型切换系数更新** - 修复营养系数未自动切换问题，改用React批处理
4. **完整双语支持** - 补全移动端IOSCard组件和accessibility提示的翻译
5. **活动系数UI改进** - 重构为平级结构，添加专业tooltip组件，优化用户体验
6. **粒子背景性能调优** - 降低FPS和粒子数量，减少移动端性能影响

**技术改进**:

- 添加shadcn/ui Tooltip组件，提供专业的hover提示体验
- 优化动画策略：桌面端保留轻量动画，移动端完全禁用
- 统一emoji大小和视觉层级
- 完善i18n翻译覆盖，支持参数化字符串

### 🎯 v0.4 下一步计划

1. **响应式布局改进**: 1024px以下切换到表格布局
2. **导出功能**: CSV和PNG格式导出
3. **数据持久化**: localStorage存储用户设置

### 📋 技术债务与优化点

- 表格布局组件需要重新实现 (用于中等屏幕)
- 导出功能的UI集成
- 性能优化：大数据集的拖拽性能
- 单元测试覆盖率提升
