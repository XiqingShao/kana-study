# 五十音练习

一个给中文母语者学习日语五十音的轻量前端 MVP。界面采用日系文具学习本风格，重点提供做题导向的练习中心：随机 50 题、全会挑战、平假名/片假名题型筛选、即时反馈、结果页错题复盘和按题型回炉的本轮错题重练，同时保留可点击五十音表、当前假名学习卡、发音提示和翻卡片练习。

当前版本不需要登录，也不做长期进度条；每轮结果只分为「全会」和「未完成」。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物会输出到 `dist/`。项目已使用相对资源路径，适合部署到 GitHub Pages。

## GitHub Pages

仓库推送到 GitHub 后，在仓库设置里启用 Pages，并选择 GitHub Actions 作为部署来源。`.github/workflows/deploy.yml` 会在推送到 `main` 分支时自动构建并发布。

## 测试

```bash
npm test
```
