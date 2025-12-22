import React from 'react';
import { BacktestStats, TradeResult } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Percent, DollarSign, Activity } from 'lucide-react';

interface DashboardProps {
  stats: BacktestStats;
  results: TradeResult[];
}

const StatCard: React.FC<{
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, subValue, icon, trend }) => {
  const trendColor =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400';

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-slate-900 rounded-lg">{icon}</div>
        {subValue && <span className={`text-xs font-medium px-2 py-1 rounded-full bg-slate-900 ${trendColor}`}>{subValue}</span>}
      </div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <p className={`text-2xl font-bold mt-1 text-white`}>{value}</p>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-300 font-medium mb-1">年份: {data.year}</p>
        <p className={`text-sm ${data.profitPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          報酬率: {data.profitPct.toFixed(2)}%
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {data.buyDate} → {data.sellDate}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ stats, results }) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="勝率"
          value={`${stats.winRate.toFixed(1)}%`}
          subValue={`${stats.wins}勝 - ${stats.losses}敗`}
          icon={<Activity className="w-5 h-5 text-blue-400" />}
          trend={stats.winRate > 50 ? 'up' : 'down'}
        />
        <StatCard
          title="平均報酬率"
          value={`${stats.avgProfit.toFixed(2)}%`}
          icon={<Percent className="w-5 h-5 text-purple-400" />}
          trend={stats.avgProfit > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="最佳交易"
          value={`${stats.bestTrade.toFixed(2)}%`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          trend="up"
        />
        <StatCard
          title="最差交易"
          value={`${stats.worstTrade.toFixed(2)}%`}
          icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
          trend="down"
        />
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg h-[400px]">
        <h3 className="text-lg font-semibold text-white mb-6">年度報酬率</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={results} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="year" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip cursor={{fill: '#334155', opacity: 0.4}} content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#64748b" />
            <Bar dataKey="profitPct" radius={[4, 4, 0, 0]}>
              {results.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.profitPct >= 0 ? '#10b981' : '#f43f5e'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;