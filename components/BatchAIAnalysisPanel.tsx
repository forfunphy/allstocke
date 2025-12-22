import React from 'react';
import { Sparkles, Bot, Loader2, ClipboardList } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BatchAIAnalysisPanelProps {
  analysis: string | null;
  isLoading: boolean;
  onAnalyze: () => void;
  count: number;
}

const BatchAIAnalysisPanel: React.FC<BatchAIAnalysisPanelProps> = ({ 
  analysis, 
  isLoading, 
  onAnalyze,
  count
}) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-6">
      <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 to-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              全市場篩選股：AI 深度診斷
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              針對目前篩選出的 {count} 檔個股進行景氣循環與事件歸因分析
            </p>
          </div>
        </div>

        {!isLoading && (
          <button
            onClick={onAnalyze}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-medium text-sm shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            分析這批績優股
          </button>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-slate-400">正在分析選中個股的產業屬性與歷史黑天鵝影響...</p>
          </div>
        ) : analysis ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-blue-300 mt-6 mb-3 border-l-4 border-blue-500 pl-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-200 mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 mb-4" {...props} />,
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 bg-slate-900/30 rounded-lg border border-dashed border-slate-700">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">設定篩選條件後，點擊按鈕分析這些股票的勝率是否具有規律性。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchAIAnalysisPanel;