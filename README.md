# Stock Strategy Client (個股波段策略)

這是一個基於 React 和 Vite 構建的股票策略分析工具。

## 快速開始 (Getting Started)

### 1. 安裝依賴
```bash
npm install
```

### 2. 環境變數設定 (選用)
本專案可能需要 Google Gemini API Key。請在專案根目錄建立 `.env` 檔案（可參考 `.env.local`），並填入：
```
GEMINI_API_KEY=your_api_key_here
```

### 3. 啟動開發伺服器
```bash
npm run dev
```

### 4. 建置生產版本
```bash
npm run build
```

## 專案結構
- `src/components`: UI 元件
- `src/utils`: 工具函式
- `src/constants.ts`: 常數設定
- `public`: 靜態資源

## 部署 (Deployment)
本專案已設定 GitHub Actions 自動部署。
1. 推送程式碼至 `main` 或 `master` 分支。
2. 在 GitHub Repository 的 **Settings > Pages** 中，將 Source 設定為 `gh-pages` 分支 (第一次部署後會出現)。
3. 部署完成後，即可透過 `<username>.github.io/<repo-name>` 訪問。
