import { GoogleGenAI } from "@google/genai";
import { StockData, TradeResult, BacktestStats, StockSummary } from '../types';

// 初始化 Google GenAI 客戶端
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MONTH_NAMES = [
  "一月", "二月", "三月", "四月", "五月", "六月", 
  "七月", "八月", "九月", "十月", "十一月", "十二月"
];

export const generateMarketAnalysis = async (
  fileName: string,
  data: StockData[],
  strategy: {
    startYear: number;
    buyMonth: number;
    sellMonth: number;
  },
  stats: BacktestStats,
  results: TradeResult[]
): Promise<string> => {
  if (!data || data.length === 0) {
    return "無資料可供分析。";
  }

  const strategyDesc = `${MONTH_NAMES[strategy.buyMonth - 1]}進場，${MONTH_NAMES[strategy.sellMonth - 1]}出場`;
  const holdType = strategy.sellMonth < strategy.buyMonth ? "跨年度持有" : "當年度持有";
  
  const tradeHistoryStr = results.map(r => {
    return `- ${r.year}年: ${r.isWin ? '獲利' : '虧損'} ${r.profitPct.toFixed(2)}% (持有 ${r.durationDays}天, ${r.buyDate}買 -> ${r.sellDate}賣)`;
  }).join('\n');

  const bestTrades = results.filter(r => r.profitPct > 20).map(r => r.year).join(', ');
  const worstTrades = results.filter(r => r.profitPct < -10).map(r => r.year).join(', ');

  const prompt = `
    你是一名專業的量化交易策略分析師。使用者正在對一支股票進行「季節性/月效應」回測。
    請針對這個**特定的策略結果**進行深度歸因分析。

    **基本資訊**：
    *   **股票/檔案名稱**：${fileName}
    *   **策略設定**：${strategyDesc} (${holdType})

    **回測結果數據**：
    *   **總勝率**：${stats.winRate.toFixed(1)}% (共 ${stats.totalTrades} 筆交易)
    *   **詳細交易紀錄**：
    ${tradeHistoryStr}

    請回答以下三個核心問題 (請用繁體中文)：
    ### 1. 策略有效性與勝率分析
    ### 2. 景氣循環 vs. 突發事件歸因
    ### 3. 未來風險提示
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { temperature: 0.4 }
    });
    return response.text || "無法產生分析結果。";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "分析過程中發生錯誤。";
  }
};

/**
 * 針對全市場篩選後的個股清單進行批次診斷
 */
export const generateBatchStockAnalysis = async (
  filteredStocks: StockSummary[],
  strategy: { buyMonth: number; sellMonth: number; startYear: number }
): Promise<string> => {
  if (filteredStocks.length === 0) return "請先篩選出個股再進行分析。";

  // 限制分析前 15 檔，避免 Prompt 過長
  const topStocks = filteredStocks.slice(0, 15);
  const strategyDesc = `${MONTH_NAMES[strategy.buyMonth - 1]}買進至${MONTH_NAMES[strategy.sellMonth - 1]}賣出`;

  const stockListStr = topStocks.map(s => 
    `- [${s.stockId} ${s.stockName}] 市場:${s.market}, 產業:${s.industry}, 勝率:${s.winRate.toFixed(1)}%, 平均報酬:${s.avgProfit.toFixed(2)}%`
  ).join('\n');

  const prompt = `
    你是一名資深產業研究員與量化分析師。使用者在進行全市場回測後，篩選出了以下績優股名單。
    回測策略：從 ${strategy.startYear} 年起，每年「${strategyDesc}」。

    **待分析個股清單**：
    ${stockListStr}

    請針對以上清單進行「勝率真實性」診斷，並依據以下架構回答（繁體中文）：

    ### 1. 產業景氣循環歸因
    *   在這些高勝率個股中，哪些屬於顯著的「景氣循環股」（Cyclical Stocks）？
    *   目前的篩選月份是否剛好對應到該產業的週期性上升段（如半導體週期、航運運價週期）？
    *   如果景氣反轉，這些個股的月效應勝率是否還能維持？

    ### 2. 歷史突發事件影響
    *   分析篩選出的產業，在過去幾年中（特別是高勝率年份）是否受到特定「非經常性事件」的強烈推升？（例如：AI 熱潮、疫情斷鏈、地緣政治、補貼政策）。
    *   區分哪些報酬是來自「產業長期紅利」，哪些是來自「短期突發紅利」。

    ### 3. 綜合篩選有效性結論
    *   這份名單的勝率是「具備統計意義的規律」還是「倖存者偏差」？
    *   給予使用者的操作建議（例如：哪些產業該避開，哪些具備防禦性）。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { temperature: 0.5 }
    });
    return response.text || "無法產生批次分析。";
  } catch (error) {
    console.error("Batch AI Error:", error);
    return "批次分析失敗，請稍後再試。";
  }
};