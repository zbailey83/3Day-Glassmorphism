import React, { useState } from 'react';
import { analyzeSeoText } from '../../services/geminiService';
import { Loader2, Search, ThumbsUp, ArrowRight, CheckCircle, Target, BarChart2, AlertCircle } from 'lucide-react';

interface AnalysisResult {
    score: number;
    sentiment: string;
    keywords: string[];
    improvements: string[];
}

export const SeoAnalyzer: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    setResult(null);
    try {
      const jsonStr = await analyzeSeoText(text);
      const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      setResult({
        score: data.score || 0,
        sentiment: data.sentiment || 'Neutral',
        keywords: data.keywords_detected || [],
        improvements: data.improvements || []
      });
    } catch (e) {
      console.error(e);
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-emerald-600 dark:text-[#22C55E]'; // Green
      if (score >= 50) return 'text-amber-500 dark:text-[#F59E0B]'; // Orange
      return 'text-red-500 dark:text-[#EF4444]'; // Red
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-[#22C55E] to-[#4ADE80]';
    if (score >= 50) return 'from-[#F59E0B] to-[#FCD34D]';
    return 'from-[#EF4444] to-[#F87171]';
  };

  return (
    <div className="h-full max-w-6xl mx-auto animate-slide-up">
       <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">AI SEO Assistant</h2>
        <p className="text-slate-500 dark:text-[#94A3B8]">Paste your blog post or ad copy to get instant optimization suggestions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
        
        {/* Input Section */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-panel p-1 rounded-[24px] overflow-hidden transition-all focus-within:border-[#22C55E]/50 focus-within:shadow-md dark:focus-within:shadow-[0_0_30px_rgba(34,197,94,0.15)] flex-1 flex flex-col">
                <div className="bg-slate-100 dark:bg-[#0F172A]/40 p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider flex items-center">
                        <FileTextIcon className="w-4 h-4 mr-2" /> Content Editor
                    </span>
                    <span className="text-xs text-slate-400 dark:text-[#64748B]">{text.length} characters</span>
                </div>
                <textarea 
                    className="w-full h-full bg-transparent p-6 text-slate-800 dark:text-[#CBD5F5] placeholder:text-slate-400 dark:placeholder:text-[#475569] focus:outline-none resize-none font-light leading-relaxed scrollbar-thin"
                    placeholder="Paste your content here to begin analysis..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>
            <button 
                onClick={handleAnalyze}
                disabled={loading || !text}
                className="glass-button w-full py-4 rounded-full font-bold text-white shadow-lg dark:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-xl dark:hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center bg-gradient-to-r from-[#22C55E]/80 to-[#10B981]/80 dark:from-[#22C55E]/20 dark:to-[#10B981]/20 border border-[#22C55E]/30"
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" size={20} />}
                {loading ? 'Analyzing Content...' : 'Run SEO Audit'}
            </button>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
            {!result ? (
                <div className="glass-panel h-full rounded-[24px] flex flex-col items-center justify-center p-12 text-center border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                    <div className="w-20 h-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center mb-6 border border-[#22C55E]/20">
                        <BarChart2 className="text-[#22C55E] opacity-50" size={40} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">Ready to Analyze</h3>
                    <p className="text-slate-500 dark:text-[#94A3B8] text-sm leading-relaxed max-w-xs">
                        Our AI will evaluate your content for keyword density, readability, and sentiment to improve search rankings.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6 h-full overflow-y-auto pr-1 pb-1 scrollbar-hide">
                    
                    {/* Score Card */}
                    <div className="glass-panel p-8 rounded-[24px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200 dark:bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <h3 className="text-slate-500 dark:text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-1">SEO Score</h3>
                                <div className={`text-5xl font-display font-bold ${getScoreColor(result.score)} drop-shadow-sm`}>
                                    {result.score}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    result.sentiment === 'Positive' ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30' :
                                    result.sentiment === 'Negative' ? 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20 dark:border-red-500/30' :
                                    'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/20 dark:border-slate-500/30'
                                }`}>
                                    {result.sentiment} Tone
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-[#0F172A] h-2 rounded-full mt-6 overflow-hidden border border-slate-300 dark:border-white/5">
                            <div 
                                className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(result.score)} transition-all duration-1000 ease-out`}
                                style={{ width: `${result.score}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Keywords */}
                    <div className="glass-panel p-6 rounded-[24px]">
                        <h4 className="flex items-center text-slate-900 dark:text-white font-bold mb-4">
                            <Target className="w-4 h-4 mr-2 text-[#22C55E]" /> Detected Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {result.keywords.map((kw, i) => (
                                <span key={i} className="px-3 py-1.5 bg-[#22C55E]/10 text-emerald-600 dark:text-[#4ADE80] border border-[#22C55E]/20 rounded-lg text-xs font-medium shadow-sm dark:shadow-[0_0_10px_rgba(34,197,94,0.05)] hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-shadow cursor-default">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Improvements */}
                    <div className="glass-panel p-6 rounded-[24px] flex-1">
                        <h4 className="flex items-center text-slate-900 dark:text-white font-bold mb-4">
                            <CheckCircle className="w-4 h-4 mr-2 text-[#38BDF8]" /> Suggested Improvements
                        </h4>
                        <div className="space-y-3">
                            {result.improvements.map((item, i) => (
                                <div key={i} className="flex items-start p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                                    <ArrowRight className="w-4 h-4 text-[#38BDF8] mr-3 mt-1 flex-shrink-0" />
                                    <p className="text-sm text-slate-600 dark:text-[#CBD5F5] leading-relaxed font-light">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const FileTextIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" x2="8" y1="13" y2="13"/>
        <line x1="16" x2="8" y1="17" y2="17"/>
        <line x1="10" x2="8" y1="9" y2="9"/>
    </svg>
);