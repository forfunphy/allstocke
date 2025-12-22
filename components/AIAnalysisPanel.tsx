import React from 'react';
import { Sparkles, Bot, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalysisPanelProps {
  analysis: string | null;
  isLoading: boolean;
  onAnalyze: () => void;
  fileName: string;
  hasData: boolean;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ 
  analysis, 
  isLoading, 
  onAnalyze, 
  fileName,
  hasData 
}) => {
  if (!hasData) return null;

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-8 relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              AI 智能資料診斷
              <span className="text-xs font-normal text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Gemini 3 Pro
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              針對 {fileName} 進行景氣循環與歷史事件影響分析
            </p>
          </div>
        </div>

        {!analysis && !isLoading && (
          <button
            onClick={onAnalyze}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-medium text-sm shadow-lg shadow-indigo-900/20"
          >
            <Bot className="w-4 h-4" />
            開始 AI 分析
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-slate-400 animate-pulse">正在分析歷史數據與市場週期...</p>
          </div>
        ) : analysis ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-indigo-300 mt-6 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-200 mt-4 mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="marker:text-indigo-500" {...props} />,
                strong: ({node, ...props}) => <strong className="text-indigo-200 font-semibold" {...props} />,
                p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed mb-4" {...props} />,
              }}
            >
              {analysis}
            </ReactMarkdown>
            <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">
              <button 
                onClick={onAnalyze}
                className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                重新產生分析
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 bg-slate-900/30 rounded-lg border border-dashed border-slate-700">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>點擊上方按鈕，讓 AI 為您分析這檔股票的週期屬性與歷史重大事件影響。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisPanel;