import React from 'react';
import { Month } from '../types';
import { Settings2, ShieldOff } from 'lucide-react';

interface SettingsPanelProps {
  buyMonth: number;
  setBuyMonth: (m: number) => void;
  sellMonth: number;
  setSellMonth: (m: number) => void;
  startYear: number;
  setStartYear: (y: number) => void;
  availableYears: number[];
  stopLossPct: number;
  setStopLossPct: (p: number) => void;
}

const CHINESE_MONTHS = [
  "一月", "二月", "三月", "四月", "五月", "六月", 
  "七月", "八月", "九月", "十月", "十一月", "十二月"
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  buyMonth,
  setBuyMonth,
  sellMonth,
  setSellMonth,
  startYear,
  setStartYear,
  availableYears,
  stopLossPct,
  setStopLossPct
}) => {
  const months = Object.values(Month).filter((v) => typeof v === 'number') as number[];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
      <div className="flex items-center gap-2 mb-6 text-blue-400">
        <Settings2 className="w-5 h-5" />
        <h2 className="text-lg font-semibold text-white">策略設定</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">開始年份</label>
          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">進場月份 (買進)</label>
          <select
            value={buyMonth}
            onChange={(e) => setBuyMonth(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {months.map((m, idx) => (
              <option key={m} value={m}>
                {CHINESE_MONTHS[idx]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">出場月份 (賣出)</label>
          <select
            value={sellMonth}
            onChange={(e) => setSellMonth(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            {months.map((m, idx) => (
              <option key={m} value={m}>
                {CHINESE_MONTHS[idx]}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-2">
            *若出場月份小於進場月份，系統將於隔年賣出。
          </p>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
             <label className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                <ShieldOff className="w-4 h-4 text-rose-400" />
                強制停損比例 (%)
             </label>
             <span className="text-xs font-mono text-rose-400">{stopLossPct}%</span>
          </div>
          <input 
             type="range"
             min="0"
             max="50"
             step="1"
             value={stopLossPct}
             onChange={(e) => setStopLossPct(Number(e.target.value))}
             className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
             <span>0% (無)</span>
             <span>50%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">
            當持有期間最低價觸及此比例時，即以該價格強制賣出。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;