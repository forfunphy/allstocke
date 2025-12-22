import React from 'react';
import { TradeResult } from '../types';

interface DataTableProps {
  results: TradeResult[];
}

const DataTable: React.FC<DataTableProps> = ({ results }) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">交易歷史</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 font-medium">年份</th>
              <th className="px-6 py-4 font-medium">買進日期</th>
              <th className="px-6 py-4 font-medium text-right">買進價格</th>
              <th className="px-6 py-4 font-medium">賣出日期</th>
              <th className="px-6 py-4 font-medium text-right">賣出價格</th>
              <th className="px-6 py-4 font-medium text-right">持有天數</th>
              <th className="px-6 py-4 font-medium text-right">報酬率 %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {results.map((row) => (
              <tr key={row.year} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{row.year}</td>
                <td className="px-6 py-4">{row.buyDate}</td>
                <td className="px-6 py-4 text-right font-mono">{row.buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4">{row.sellDate}</td>
                <td className="px-6 py-4 text-right font-mono">{row.sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-right text-slate-500">{row.durationDays} 天</td>
                <td className={`px-6 py-4 text-right font-bold ${row.isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {row.profitPct > 0 ? '+' : ''}{row.profitPct.toFixed(2)}%
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  此期間無符合條件的交易。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;