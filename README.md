# 🔄 Carb Cycling Planner | 碳循环饮食计算器

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

A science-based carb cycling calculator that generates personalized macro plans. Built with modern web technologies for a smooth, privacy-first experience.

[English](#english) | [中文](#中文)

---

## English

### ✨ Features

- **🎯 Smart Macro Calculation** - Based on body weight, body type, and customizable coefficients
- **📊 Flexible Cycle Length** - 3-7 day cycles with intelligent day allocation
- **🎨 Interactive Distribution** - Drag-and-drop ring interface to adjust carb/fat distribution
- **💪 Workout Planning** - Assign workout types to each day of your cycle
- **📤 Multiple Export Formats** - Markdown, CSV, and PNG image export
- **🌐 Bilingual Support** - Full Chinese (简体中文) and English localization
- **⚖️ Unit Flexibility** - Switch between metric (kg) and imperial (lb) systems
- **🎨 Theme Options** - Light, dark, and system-adaptive themes
- **💾 Auto-Save** - All settings persist in browser localStorage
- **🔒 Privacy-First** - No account required, all calculations happen locally

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 📦 Tech Stack

- **Framework**: React 19 + TypeScript 5 + Vite 7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui patterns
- **Form Handling**: react-hook-form + Zod validation
- **Drag & Drop**: @atlaskit/pragmatic-drag-and-drop
- **Internationalization**: i18next + react-i18next
- **Export**: html-to-image for PNG generation
- **Analytics**: PostHog (optional, env-gated)

### 📝 Available Scripts

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `npm run dev`      | Start development server with HMR   |
| `npm run build`    | Type-check and build for production |
| `npm run preview`  | Preview production build locally    |
| `npm run lint`     | Run ESLint checks                   |
| `npm run format`   | Format code with Prettier           |
| `npm test`         | Run tests in watch mode             |
| `npm run test:run` | Run tests once (for CI)             |

### 🎮 CLI Mode

Calculate plans directly from command line:

```bash
# Basic usage: weight bodyType proteinLevel cycleDays
npm run cli -- 70 mesomorph experienced 7

# Custom protein coefficient
npm run cli -- 80 endomorph custom 1.8 5

# Minimal cycle
npm run cli -- 60 ectomorph beginner 3
```

### ⚙️ Configuration

Copy `.env.example` to `.env.local` and configure as needed:

```env
# Site Configuration
VITE_SITE_URL=https://your-domain.com
VITE_SITE_NAME=Carb Cycling Planner
VITE_META_DESCRIPTION=Your site description
VITE_OG_IMAGE=/og.png

# Optional: PostHog Analytics
VITE_PUBLIC_POSTHOG_KEY=your-key
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Base UI components (shadcn-style)
│   ├── core/            # Domain components (InputForm, ResultCard)
│   ├── layout/          # Layout components (Header, Footer)
│   └── shared/          # Shared components (ParticleBackground)
├── lib/
│   ├── calculator.ts    # Core calculation logic
│   ├── i18n.ts         # Internationalization setup
│   └── *-context.tsx   # React contexts for state
├── main.tsx            # Application entry point
└── App.tsx             # Root component
```

### 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/)
4. Run tests and linting (`npm run lint && npm test`)
5. Push to your branch
6. Open a Pull Request

### 📄 License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

- ✅ Free for personal, educational, and non-commercial use
- ✅ Modify and share with same license
- ❌ Commercial use prohibited
- 📝 Attribution required

---

## 中文

### ✨ 功能特性

- **🎯 智能宏量计算** - 基于体重、体型和自定义系数
- **📊 灵活周期长度** - 3-7 天循环，智能天数分配
- **🎨 交互式分布调节** - 拖拽环形界面调整碳水/脂肪分配
- **💪 训练规划** - 为每天分配训练类型
- **📤 多格式导出** - 支持 Markdown、CSV 和 PNG 图片导出
- **🌐 双语支持** - 完整的中英文本地化
- **⚖️ 单位切换** - 公制（千克）和英制（磅）自由切换
- **🎨 主题选项** - 亮色、暗色和跟随系统主题
- **💾 自动保存** - 所有设置自动保存到浏览器本地存储
- **🔒 隐私优先** - 无需登录，所有计算在本地完成

### 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 📦 技术栈

- **框架**: React 19 + TypeScript 5 + Vite 7
- **样式**: Tailwind CSS v4
- **UI 组件**: Radix UI + shadcn/ui 模式
- **表单处理**: react-hook-form + Zod 验证
- **拖拽**: @atlaskit/pragmatic-drag-and-drop
- **国际化**: i18next + react-i18next
- **导出**: html-to-image 生成 PNG
- **分析**: PostHog（可选，环境变量控制）

### 📝 可用命令

| 命令               | 说明                         |
| ------------------ | ---------------------------- |
| `npm run dev`      | 启动开发服务器（支持热更新） |
| `npm run build`    | 类型检查并构建生产版本       |
| `npm run preview`  | 预览生产构建                 |
| `npm run lint`     | 运行 ESLint 检查             |
| `npm run format`   | 使用 Prettier 格式化代码     |
| `npm test`         | 运行测试（监听模式）         |
| `npm run test:run` | 运行测试一次（CI 模式）      |

### 🎮 命令行模式

直接通过命令行计算方案：

```bash
# 基本用法：体重 体型 蛋白质等级 周期天数
npm run cli -- 70 mesomorph experienced 7

# 自定义蛋白质系数
npm run cli -- 80 endomorph custom 1.8 5

# 最小周期
npm run cli -- 60 ectomorph beginner 3
```

### 📁 项目结构

```
src/
├── components/
│   ├── ui/              # 基础 UI 组件（shadcn 风格）
│   ├── core/            # 核心业务组件（输入表单、结果卡片）
│   ├── layout/          # 布局组件（头部、尾部）
│   └── shared/          # 共享组件（粒子背景等）
├── lib/
│   ├── calculator.ts    # 核心计算逻辑
│   ├── i18n.ts         # 国际化配置
│   └── *-context.tsx   # React 状态上下文
├── main.tsx            # 应用入口
└── App.tsx             # 根组件
```

### 🤝 参与贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feat/amazing-feature`）
3. 使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/) 提交更改
4. 运行测试和代码检查（`npm run lint && npm test`）
5. 推送到您的分支
6. 提交 Pull Request

### 📄 许可证

本项目采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可证。

- ✅ 允许个人、教育和非商业用途
- ✅ 允许修改和分享（需保持相同许可）
- ❌ 禁止商业用途
- 📝 需要署名

---

Made with ❤️ for the fitness community
