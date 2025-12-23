import { StockData, TradeResult, BacktestStats, StockSummary, StockMetadata } from '../types';
import { STOCK_NAMES_CSV } from '../constants';

// Robust line splitter for CSVs with quotes e.g. "1,000.00"
const splitCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

// Original helper kept for compatibility (returns id -> name map)
export const getStockNameMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  if (!STOCK_NAMES_CSV) return map;

  const lines = STOCK_NAMES_CSV.trim().split('\n');
  const startIndex = lines[0].includes('股票代碼') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const code = parts[0].trim();
      const name = parts[1].trim();
      if (code) {
        map[code] = name;
      }
    }
  }
  return map;
};

// New helper to parse full metadata (id -> Metadata Object)
export const getStockMetadataMap = (): Record<string, StockMetadata> => {
  const map: Record<string, StockMetadata> = {};
  if (!STOCK_NAMES_CSV) return map;

  const lines = STOCK_NAMES_CSV.trim().split('\n');
  const startIndex = lines[0].includes('股票代碼') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const code = parts[0].trim();
      const name = parts[1].trim();
      const market = parts[2]?.trim() || '';
      const industry = parts[3]?.trim() || '';
      const weight = parts[4]?.trim() || '';
      
      if (code) {
        map[code] = { name, market, industry, weight };
      }
    }
  }
  return map;
};

export const parseCSV = (csvContent: string): StockData[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return [];

  // Parse header to determine indices
  const headerRow = splitCSVLine(lines[0].toLowerCase());
  
  // Helper to find index by keywords
  const findIdx = (keywords: string[]) => headerRow.findIndex(col => keywords.some(k => col.includes(k)));

  // Dynamic detection based on common keywords (English/Chinese)
  let stockIdIdx = findIdx(['stock', 'id', '代碼', '代號', 'code']);
  let nameIdx = findIdx(['name', '名稱', '股票名稱']);
  let dateIdx = findIdx(['date', '日期', '時間', 'time']);
  let openIdx = findIdx(['open', '開盤']);
  let highIdx = findIdx(['high', '最高']);
  let lowIdx = findIdx(['low', '最低']);
  let closeIdx = findIdx(['close', '收盤']);

  // Fallback logic if headers are not detected
  if (dateIdx === -1 || openIdx === -1 || closeIdx === -1) {
    const sampleRow = lines.length > 1 ? splitCSVLine(lines[1]) : [];
    if (sampleRow.length === 5) {
      stockIdIdx = -1; nameIdx = -1;
      dateIdx = 0; openIdx = 1; highIdx = 2; lowIdx = 3; closeIdx = 4;
    } else if (sampleRow.length >= 7) {
      const col0 = sampleRow[0];
      const looksLikeDate = /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(col0);
      if (looksLikeDate) {
        dateIdx = 0; stockIdIdx = 1; nameIdx = 2; openIdx = 3; highIdx = 4; lowIdx = 5; closeIdx = 6;
      } else {
        stockIdIdx = 0; dateIdx = 1; openIdx = 3; highIdx = 4; lowIdx = 5; closeIdx = 6;
      }
    }
  }

  if (stockIdIdx === -1 && lines[1] && splitCSVLine(lines[1]).length >= 6) {
    dateIdx === 0 ? (stockIdIdx = 1) : (stockIdIdx = 0);
  }

  const data: StockData[] = [];
  const parseNumber = (val: string): number => {
    if (!val) return 0;
    return parseFloat(val.replace(/["',]/g, ''));
  };

  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    const requiredLen = Math.max(dateIdx, openIdx, highIdx, lowIdx, closeIdx);
    if (row.length <= requiredLen) continue;

    const stockId = stockIdIdx !== -1 && row[stockIdIdx] ? row[stockIdIdx] : 'Unknown';
    const stockName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : undefined;
    const dateStrRaw = row[dateIdx];
    const dateStr = dateStrRaw ? dateStrRaw.split(' ')[0] : '';
    const open = parseNumber(row[openIdx]);
    const high = parseNumber(row[highIdx]);
    const low = parseNumber(row[lowIdx]);
    const close = parseNumber(row[closeIdx]);

    const dateParts = dateStr.split(/[\/\-]/);
    if (dateParts.length !== 3) continue;

    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    if (isNaN(date.getTime())) continue;

    data.push({ stockId, stockName, date, dateStr, open, high, low, close });
  }

  return data.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const runBacktest = (
  data: StockData[],
  startYear: number,
  buyMonth: number,
  sellMonth: number,
  stopLossPct: number = 0 // 0 means disabled
): { results: TradeResult[]; stats: BacktestStats } => {
  const results: TradeResult[] = [];
  const uniqueYears = new Set<number>();
  for(const d of data) {
    const y = d.date.getFullYear();
    if(y >= startYear) uniqueYears.add(y);
  }
  const years = Array.from(uniqueYears).sort((a, b) => a - b);

  years.forEach((year) => {
    const buyMonthData = data.filter(
      (d) => d.date.getFullYear() === year && d.date.getMonth() + 1 === buyMonth
    );

    if (buyMonthData.length === 0) return;
    const buyEntry = buyMonthData[0];
    const entryPrice = buyEntry.close;

    let sellYear = year;
    if (sellMonth < buyMonth) {
      sellYear = year + 1;
    }

    // Get the range of data from buy date to target sell date
    const holdingPeriodData = data.filter(d => {
      const isAfterBuy = d.date.getTime() >= buyEntry.date.getTime();
      const isBeforeOrInSellMonth = d.date.getFullYear() < sellYear || 
        (d.date.getFullYear() === sellYear && d.date.getMonth() + 1 <= sellMonth);
      return isAfterBuy && isBeforeOrInSellMonth;
    });

    if (holdingPeriodData.length === 0) return;

    let sellDate = '';
    let sellPrice = 0;
    let isStopLossTriggered = false;

    // Stop Loss Check: Iterate through all days in the holding period
    if (stopLossPct > 0) {
      const stopLossPrice = entryPrice * (1 - stopLossPct / 100);
      for (const dayData of holdingPeriodData) {
        if (dayData.low <= stopLossPrice) {
          sellDate = dayData.dateStr;
          sellPrice = stopLossPrice;
          isStopLossTriggered = true;
          break;
        }
      }
    }

    // Normal Exit if stop loss wasn't triggered
    if (!isStopLossTriggered) {
      const sellMonthData = holdingPeriodData.filter(
        d => d.date.getFullYear() === sellYear && d.date.getMonth() + 1 === sellMonth
      );
      if (sellMonthData.length === 0) return;
      const sellExit = sellMonthData[sellMonthData.length - 1];
      sellDate = sellExit.dateStr;
      sellPrice = sellExit.close;
    }

    const profitPct = ((sellPrice - entryPrice) / entryPrice) * 100;
    const profitAbs = 10000 * (profitPct / 100); 

    const diffTime = Math.abs(new Date(sellDate).getTime() - buyEntry.date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    results.push({
      year,
      buyDate: buyEntry.dateStr,
      buyPrice: entryPrice,
      sellDate,
      sellPrice,
      profitPct,
      profitAbs,
      isWin: profitPct > 0,
      durationDays: diffDays
    });
  });

  const totalTrades = results.length;
  const wins = results.filter((r) => r.isWin).length;
  const losses = totalTrades - wins;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const totalReturn = results.reduce((acc, curr) => acc + curr.profitPct, 0);
  const avgProfit = totalTrades > 0 ? totalReturn / totalTrades : 0;
  const bestTrade = results.length > 0 ? Math.max(...results.map(r => r.profitPct)) : 0;
  const worstTrade = results.length > 0 ? Math.min(...results.map(r => r.profitPct)) : 0;

  let sharpeRatio = 0;
  if (results.length > 1) {
    const returns = results.map(r => r.profitPct);
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    sharpeRatio = stdDev !== 0 ? mean / stdDev : 0;
  }

  return {
    results,
    stats: {
      totalTrades, wins, losses, winRate, avgProfit, totalReturn, bestTrade, worstTrade, sharpeRatio
    },
  };
};

export const calculateBatchStats = (
  fullData: StockData[],
  uniqueIds: string[],
  startYear: number,
  buyMonth: number,
  sellMonth: number,
  stopLossPct: number = 0
): StockSummary[] => {
  const staticMetadata = getStockMetadataMap();
  const dynamicMap: Record<string, string> = {};
  const groupedData: Record<string, StockData[]> = {};
  
  for (let i = 0; i < fullData.length; i++) {
    const item = fullData[i];
    if (!groupedData[item.stockId]) {
      groupedData[item.stockId] = [];
      if (item.stockName && !dynamicMap[item.stockId]) {
        dynamicMap[item.stockId] = item.stockName;
      }
    }
    groupedData[item.stockId].push(item);
  }

  const targetIds = uniqueIds.length > 0 ? uniqueIds : Object.keys(groupedData);
  
  return targetIds.map(id => {
    const stockData = groupedData[id] || [];
    const { stats } = runBacktest(stockData, startYear, buyMonth, sellMonth, stopLossPct);
    const meta = staticMetadata[id];
    const name = meta?.name || dynamicMap[id] || '';

    return {
      stockId: id,
      stockName: name,
      market: meta?.market,
      industry: meta?.industry,
      weight: meta?.weight,
      ...stats
    };
  });
};