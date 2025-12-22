import React, { useState, useMemo } from 'react';
import { StockSummary } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter } from 'lucide-react';
import { generateBatchStockAnalysis } from '../utils/aiService';
import BatchAIAnalysisPanel from './BatchAIAnalysisPanel';

interface StockSummaryTableProps {
  data: StockSummary[];
  onSelectStock: (stockId: string) => void;
  strategy: { buyMonth: number; sellMonth: number; startYear: number };
}

type SortField = 'stockId' | 'stockName' | 'winRate' | 'totalReturn' | 'avgProfit' | 'totalTrades';
type SortDirection = 'asc' | 'desc';

const StockSummaryTable: React.FC<StockSummaryTableProps> = ({ data, onSelectStock, strategy }) => {
  const [sortField, setSortField] = useState<SortField>('winRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [minWinRate, setMinWinRate] = useState<number>(0);
  
  // AI State
  const [batchAnalysis, setBatchAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // New Filters
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedWeight, setSelectedWeight] = useState<string>('all');

  // Derive unique values for dropdowns
  const uniqueMarkets = useMemo(() => {
    const markets = new Set(data.map(item => item.market).filter(Boolean));
    return Array.from(markets).sort() as string[];
  }, [data]);

  const uniqueIndustries = useMemo(() => {
    const industries = new Set(data.map(item => item.industry).filter(Boolean));
    return Array.from(industries).sort() as string[];
  }, [data]);

  const hasWeightedStocks = useMemo(() => {
    return data.some(item => item.weight && item.weight.trim().length > 0);
  }, [data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let processed = [...data];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      processed = processed.filter(item => 
        item.stockId.toLowerCase().includes(lowerTerm) || 
        (item.stockName && item.stockName.toLowerCase().includes(lowerTerm))
      );
    }

    if (minWinRate > 0) {
      processed = processed.filter(item => item.winRate >= minWinRate);
    }

    if (selectedMarket !== 'all') {
      processed = processed.filter(item => item.market === selectedMarket);
    }

    if (selectedIndustry !== 'all') {
      processed = processed.filter(item => item.industry === selectedIndustry);
    }

    if (selectedWeight === 'yes') {
      processed = processed.filter(item => item.weight && item.weight.length > 0);
    }

    return processed.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (sortField === 'stockName') {
        valA = a.stockName || '';
        valB = b.stockName || '';
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB, 'zh-Hant') 
          : valB.localeCompare(valA, 'zh-Hant');
      }
      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [data, sortField, sortDirection, searchTerm, minWinRate, selectedMarket, selectedIndustry, selectedWeight]);

  const handleBatchAnalyze = async () => {
    setIsAiLoading(true);
    try {
      const report = await generateBatchStockAnalysis(filteredAndSortedData, strategy);
      setBatchAnalysis(report);
    } catch (e) {
      setBatchAnalysis("分析失敗。");
    } finally {
      setIsAiLoading(false);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-slate-600 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-400" /> 
      : <ArrowDown className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="space-y-6">
      {/* AI Summary Section */}
      <BatchAIAnalysisPanel 
        analysis={batchAnalysis}
        isLoading={isAiLoading}
        onAnalyze={handleBatchAnalyze}
        count={filteredAndSortedData.length}
      />

      {/* Filters Container */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-300 mb-1">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-semibold">快速篩選條件</span>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="搜尋代碼或名稱..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有市場</option>
            {uniqueMarkets.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有產業</option>
            {uniqueIndustries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>

          <select
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部股票</option>
            <option value="yes">權值股</option>
          </select>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
            <span className="text-slate-400 text-xs whitespace-nowrap">勝率 &ge;</span>
            <input
              type="number"
              min="0"
              max="100"
              value={minWinRate}
              onChange={(e) => setMinWinRate(Number(e.target.value))}
              className="w-full bg-transparent text-white text-sm focus:outline-none"
            />
            <span className="text-slate-400 text-sm">%</span>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 font-medium cursor-pointer" onClick={() => handleSort('stockId')}>
                  <div className="flex items-center gap-1">代碼 <SortIcon field="stockId" /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer" onClick={() => handleSort('stockName')}>
                  <div className="flex items-center gap-1">名稱 <SortIcon field="stockName" /></div>
                </th>
                <th className="px-6 py-4 font-medium">市場/產業</th>
                <th className="px-6 py-4 font-medium cursor-pointer text-right" onClick={() => handleSort('winRate')}>
                  <div className="flex items-center justify-end gap-1">勝率 <SortIcon field="winRate" /></div>
                </th>
                <th className="px-6 py-4 font-medium cursor-pointer text-right" onClick={() => handleSort('avgProfit')}>
                  <div className="flex items-center justify-end gap-1">平均報酬 <SortIcon field="avgProfit" /></div>
                </th>
                <th className="px-6 py-4 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredAndSortedData.map((row) => (
                <tr key={row.stockId} className="hover:bg-slate-700/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-white">
                    {row.stockId}
                    {row.weight && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                           權
                        </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{row.stockName || '-'}</td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col text-[11px]">
                        <span className="text-slate-300">{row.market}</span>
                        <span className="text-slate-500">{row.industry}</span>
                     </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold text-base ${row.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.winRate.toFixed(1)}%
                  </td>
                  <td className={`px-6 py-4 text-right ${row.avgProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.avgProfit > 0 ? '+' : ''}{row.avgProfit.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onSelectStock(row.stockId)}
                      className="text-blue-400 hover:text-blue-300 font-medium text-xs group-hover:underline"
                    >
                      查看詳情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockSummaryTable;