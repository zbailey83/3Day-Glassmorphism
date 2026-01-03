
import React, { useState } from 'react';
import { auditLogicCode } from '../../services/geminiService';
import { Loader2, ShieldCheck, Target, CheckCircle, Bug, AlertTriangle, ArrowRight } from 'lucide-react';

interface AnalysisResult {
    securityScore: number;
    vulnerabilities: string[];
    edgeCases: string[];
    refactorSuggestions: string[];
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
      const jsonStr = await auditLogicCode(text);
      const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Audit failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full max-w-6xl mx-auto animate-slide-up">
       <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Logic & Security Auditor</h2>
        <p className="text-slate-500 dark:text-[#94A3B8]">Paste code or logic descriptions to identify vulnerabilities and edge cases before you ship.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="glass-panel p-1 rounded-[24px] overflow-hidden transition-all focus-within:border-indigo-500/50 flex-1 flex flex-col">
                <div className="bg-slate-100 dark:bg-[#0F172A]/40 p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider flex items-center">
                        <Bug className="w-4 h-4 mr-2" /> Logic Editor
                    </span>
                    <span className="text-xs text-slate-400 dark:text-[#64748B] font-mono">mode: code_audit</span>
                </div>
                <textarea 
                    className="w-full h-full bg-transparent p-6 text-slate-800 dark:text-[#CBD5F5] placeholder:text-slate-400 focus:outline-none resize-none font-mono text-sm leading-relaxed scrollbar-thin"
                    placeholder="Paste code or describe logic flow... e.g., 'The system calculates the discount by subtracting 10 from the total if the user is a premium member...'"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>
            <button 
                onClick={handleAnalyze}
                disabled={loading || !text}
                className="w-full py-4 rounded-full font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 shadow-xl"
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" size={20} />}
                {loading ? 'Running Security Audit...' : 'Audit Logic Stream'}
            </button>
        </div>

        <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
            {!result ? (
                <div className="glass-panel h-full rounded-[24px] flex flex-col items-center justify-center p-12 text-center border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                        <ShieldCheck className="text-indigo-500 opacity-50" size={40} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">Audit Ready</h3>
                    <p className="text-slate-500 dark:text-[#94A3B8] text-sm leading-relaxed max-w-xs">
                        AI will perform a deep logic scan to find edge cases, security holes, and structural inefficiency.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6 h-full overflow-y-auto pr-1 pb-1 scrollbar-hide">
                    <div className="glass-panel p-8 rounded-[24px] relative overflow-hidden bg-slate-900">
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Fidelity Score</h3>
                                <div className={`text-5xl font-display font-bold ${result.securityScore > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {result.securityScore}%
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase ${result.vulnerabilities.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {result.vulnerabilities.length} Flaws Detected
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${result.securityScore > 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                style={{ width: `${result.securityScore}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-[24px]">
                        <h4 className="flex items-center text-slate-900 dark:text-white font-bold mb-4 text-sm uppercase tracking-widest">
                            <Bug className="w-4 h-4 mr-2 text-red-500" /> Flaws & Vulnerabilities
                        </h4>
                        <div className="space-y-2">
                            {result.vulnerabilities.map((v, i) => (
                                <div key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium">
                                    {v}
                                </div>
                            ))}
                            {result.vulnerabilities.length === 0 && <p className="text-xs text-slate-500 italic">No major vulnerabilities detected.</p>}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-[24px]">
                        <h4 className="flex items-center text-slate-900 dark:text-white font-bold mb-4 text-sm uppercase tracking-widest">
                            <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Edge Cases
                        </h4>
                        <div className="space-y-3">
                            {result.edgeCases.map((ec, i) => (
                                <div key={i} className="flex items-start">
                                    <ArrowRight className="w-3 h-3 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-slate-600 dark:text-[#CBD5F5] leading-relaxed">{ec}</p>
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
