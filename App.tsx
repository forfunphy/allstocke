import React, { useState, useEffect, useMemo } from 'react';
import { parseCSV, runBacktest, calculateBatchStats, getStockNameMap } from './utils/dataProcessor';
import { generateMarketAnalysis } from './utils/aiService';
import { StockData, TradeResult, BacktestStats } from './types';
// DEFAULT_CSV_DATA removed to avoid bundle bloat

import Dashboard from './components/Dashboard';
import SettingsPanel from './components/SettingsPanel';
import DataTable from './components/DataTable';
import FileUpload from './components/FileUpload';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import StockSummaryTable from './components/StockSummaryTable';
import { LineChart, BarChart as BarChartIcon, Download, ExternalLink, FileText, ListFilter, LayoutGrid } from 'lucide-react';

type ViewMode = 'single' | 'summary';

const App: React.FC = () => {
  const [fullDataset, setFullDataset] = useState<StockData[]>([]);
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('single');

  const [startYear, setStartYear] = useState<number>(2024);
  const [buyMonth, setBuyMonth] = useState<number>(1);
  const [sellMonth, setSellMonth] = useState<number>(12);
  const [fileName, setFileName] = useState<string>('預設資料 (台積電/聯發科)');

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Compute merged stock map (Static + Dynamic from uploaded file)
  const stockMap = useMemo(() => {
    const staticMap = getStockNameMap();
    const dynamicMap: Record<string, string> = {};
    if (fullDataset.length > 0) {
      for (const d of fullDataset) {
        if (d.stockName && d.stockId && !dynamicMap[d.stockId]) {
          dynamicMap[d.stockId] = d.stockName;
        }
      }
    }
    return { ...staticMap, ...dynamicMap };
  }, [fullDataset]);

  // Load default data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch manifest to get list of parts
        const manifestRes = await fetch(`${import.meta.env.BASE_URL}data_manifest.json`);
        if (!manifestRes.ok) throw new Error('Failed to load manifest');
        const manifest = await manifestRes.json();

        // Fetch all parts in parallel
        const partsPromises = manifest.parts.map((partFile: string) =>
          fetch(`${import.meta.env.BASE_URL}${partFile}`).then(res => res.json())
        );

        const parts = await Promise.all(partsPromises);

        // Combine CSV data
        let fullCsv = '';
        for (const part of parts) {
          if (part.csvData) {
            fullCsv += part.csvData;
          }
        }

        if (fullCsv) {
          const parsed = parseCSV(fullCsv);
          handleNewData(parsed, '預設資料 (台積電/聯發科)');
        }
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };

    loadData();
  }, []);

  const handleNewData = (data: StockData[], name: string) => {
    setFullDataset(data);
    setFileName(name);
    setAiAnalysis(null);

    const uniqueIds = Array.from(new Set(data.map(d => d.stockId)));
    if (uniqueIds.length > 0) {
      setSelectedStockId(uniqueIds[0]);
    } else {
      setSelectedStockId('');
    }
    if (data.length > 0) {
      setStartYear(data[0].date.getFullYear());
    }
  };

  const handleDataUpload = (csvContent: string, name: string) => {
    const data = parseCSV(csvContent);
    handleNewData(data, name);
  };

  const activeStockData = useMemo(() => {
    if (!selectedStockId) return [];
    return fullDataset.filter(d => d.stockId === selectedStockId);
  }, [fullDataset, selectedStockId]);

  const availableYears = useMemo(() => {
    const dataToUse = activeStockData.length > 0 ? activeStockData : fullDataset;
    if (dataToUse.length === 0) return [];
    const years = Array.from(new Set(dataToUse.map((d) => d.date.getFullYear()))).sort((a: number, b: number) => a - b);
    return years;
  }, [activeStockData, fullDataset]);

  const { results, stats } = useMemo(() => {
    return runBacktest(activeStockData, startYear, buyMonth, sellMonth);
  }, [activeStockData, startYear, buyMonth, sellMonth]);

  const uniqueStockIds = useMemo(() => {
    return Array.from(new Set(fullDataset.map(d => d.stockId))).sort();
  }, [fullDataset]);

  const summaryData = useMemo(() => {
    if (viewMode !== 'summary') return [];
    return calculateBatchStats(fullDataset, uniqueStockIds, startYear, buyMonth, sellMonth);
  }, [viewMode, fullDataset, uniqueStockIds, startYear, buyMonth, sellMonth]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const selectedName = stockMap[selectedStockId] || '';
      const displayFileName = `${fileName} (代碼: ${selectedStockId} ${selectedName})`;
      const result = await generateMarketAnalysis(
        displayFileName,
        activeStockData,
        { startYear, buyMonth, sellMonth },
        stats,
        results
      );
      setAiAnalysis(result);
    } catch (error) {
      console.error(error);
      setAiAnalysis("分析失敗。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const currentStockName = stockMap[selectedStockId] || '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <LineChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">股市月效應回測</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <FileText className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400 tracking-wide">目前資料: {fileName}</span>
              </div>
            </div>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setViewMode('single')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'single' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}><LineChart className="w-4 h-4" />單一股票</button>
            <button onClick={() => setViewMode('summary')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'summary' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}><LayoutGrid className="w-4 h-4" />全市場總覽</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <FileUpload onDataLoaded={handleDataUpload} />
            {viewMode === 'single' && uniqueStockIds.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg">
                <div className="flex items-center gap-2 mb-3 text-blue-400"><ListFilter className="w-5 h-5" /><h2 className="text-lg font-semibold text-white">選擇股票</h2></div>
                <div className="relative">
                  <input list="stock-ids-list" type="text" value={selectedStockId} onChange={(e) => setSelectedStockId(e.target.value)} placeholder="輸入或下拉選擇代碼" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-500" />
                  <datalist id="stock-ids-list">{uniqueStockIds.map(id => (<option key={id} value={id}>{stockMap[id] ? `${id} ${stockMap[id]}` : id}</option>))}</datalist>
                  {selectedStockId && (<div className="mt-3 p-2 bg-slate-900/50 rounded-lg text-center border border-slate-700/50">{currentStockName ? (<span className="text-lg font-bold text-emerald-400 tracking-wide">{currentStockName}</span>) : (<span className="text-sm text-slate-500 italic">未知名稱</span>)}</div>)}
                </div>
              </div>
            )}
            <SettingsPanel buyMonth={buyMonth} setBuyMonth={setBuyMonth} sellMonth={sellMonth} setSellMonth={setSellMonth} startYear={startYear} setStartYear={setStartYear} availableYears={availableYears} />
          </div>
          <div className="lg:col-span-9 space-y-6">
            {viewMode === 'single' ? (
              <><AIAnalysisPanel analysis={aiAnalysis} isLoading={isAnalyzing} onAnalyze={handleAnalyze} fileName={`${fileName} (${selectedStockId}${currentStockName ? ' ' + currentStockName : ''})`} hasData={activeStockData.length > 0} /><Dashboard stats={stats} results={results} /><DataTable results={results} /></>
            ) : (
              <StockSummaryTable data={summaryData} strategy={{ buyMonth, sellMonth, startYear }} onSelectStock={(id) => { setSelectedStockId(id); setViewMode('single'); }} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;