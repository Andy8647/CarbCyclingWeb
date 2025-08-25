# 🚀 部署指南

本项目是基于 Vite + React + TypeScript 的纯前端应用，支持多种免费部署方案。

## 📊 方案对比（国内访问角度）

| 平台                 | 国内访问   | 部署难度 | 免费额度 | 推荐指数        |
| -------------------- | ---------- | -------- | -------- | --------------- |
| **Cloudflare Pages** | ⭐⭐⭐⭐⭐ | 简单     | 无限制   | 🥇 **强烈推荐** |
| **Vercel**           | ⭐⭐⭐⭐   | 简单     | 充足     | 🥈 推荐         |
| **Netlify**          | ⭐⭐⭐     | 简单     | 充足     | 🥉 推荐         |
| **GitHub Pages**     | ⭐         | 简单     | 免费     | ❌ 不推荐       |

## 🌟 推荐方案：Cloudflare Pages

### 优势

- ✅ **国内访问友好**: Cloudflare 在中国大陆有 CDN 节点
- ✅ **完全免费**: 无带宽和构建时间限制
- ✅ **自动部署**: Git 集成，推送即部署
- ✅ **全球 CDN**: 响应速度快
- ✅ **支持自定义域名**: 免费 SSL 证书

### 部署步骤

#### 1. 准备工作

确保项目可以正常构建：

```bash
npm install
npm run build
```

#### 2. 方式一：通过 Cloudflare Dashboard（推荐）

1. **注册 Cloudflare 账号**
   - 访问 [https://dash.cloudflare.com](https://dash.cloudflare.com)
   - 注册免费账号

2. **创建 Pages 项目**
   - 进入 Cloudflare Dashboard
   - 点击 "Pages" → "创建项目"
   - 选择 "连接到 Git"

3. **连接 GitHub 仓库**
   - 授权 Cloudflare 访问 GitHub
   - 选择 `CarbCyclingWeb` 仓库
   - 选择 `main` 分支

4. **配置构建设置**

   ```
   构建命令: npm run build
   构建输出目录: dist
   根目录: /
   环境变量: NODE_VERSION=18
   ```

5. **部署完成**
   - 点击 "保存并部署"
   - 等待构建完成（约 1-3 分钟）
   - 获得类似 `https://carb-cycling-web.pages.dev` 的域名

#### 3. 方式二：使用 GitHub Actions（自动化）

已为你准备好 GitHub Actions 配置文件：`.github/workflows/deploy.yml`

需要在 GitHub 仓库设置中添加以下 Secrets：

- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID

## 🔧 其他部署选项

### Vercel 部署

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 登录
3. 导入 `CarbCyclingWeb` 仓库
4. 配置：
   - 构建命令: `npm run build`
   - 输出目录: `dist`
5. 部署完成

### Netlify 部署

1. 访问 [netlify.com](https://netlify.com)
2. 使用 GitHub 登录
3. "New site from Git" → 选择仓库
4. 配置：
   - 构建命令: `npm run build`
   - 发布目录: `dist`
5. 部署完成

## 🌐 自定义域名

如果你有自己的域名，可以：

1. 在部署平台添加自定义域名
2. 在域名 DNS 设置中添加 CNAME 记录
3. 启用 HTTPS（通常自动配置）

## 📱 PWA 支持

项目支持 PWA（渐进式 Web 应用），用户可以：

- 添加到手机主屏幕
- 离线访问基础功能
- 获得类似原生应用的体验

## 🔍 部署验证

部署完成后，请验证：

- ✅ 页面正常加载
- ✅ 中英文切换正常
- ✅ 主题切换正常
- ✅ 表单输入和计算功能正常
- ✅ 数据持久化正常
- ✅ 拖拽功能正常
- ✅ 复制功能正常

## 🚨 常见问题

**Q: 国内用户访问慢怎么办？**
A: 推荐使用 Cloudflare Pages，在国内有较好的访问速度。

**Q: 如何更新部署？**
A: 直接推送代码到 main 分支，会自动触发重新部署。

**Q: 支持移动端吗？**
A: 是的，项目完全响应式，支持手机和平板访问。
