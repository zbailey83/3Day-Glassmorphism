
import React, { useState } from 'react';
import { generateProjectSpec } from '../../services/geminiService';
import { Loader2, Copy, Terminal, Layout, List, FileText, Zap, Download } from 'lucide-react';

export const CampaignGenerator: React.FC = () => {
  const [brainDump, setBrainDump] = useState('');
  const [techStack, setTechStack] = useState('Next.js, Supabase, Tailwind, TypeScript');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const jsonString = await generateProjectSpec(brainDump, techStack);
      const cleanJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      setResult(data);
    } catch (error) {
      console.error("Failed to generate spec", error);
      alert("Spec generation failed. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportFullSpec = () => {
    if (!result) return;

    const fullSpec = `# Project Specification

## Product Requirements Document (PRD)

${result.prd}

## Feature Backlog

${result.featureList.map((f: string, idx: number) => `${idx + 1}. ${f}`).join('\n')}

## AI Instructions (.cursorrules)

${result.ai_instructions}
`;

    downloadAsFile(fullSpec, 'project-spec.md');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-slide-up">
      <div className="glass-panel p-8 rounded-[24px] h-fit">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 rounded-xl mb-4 shadow-sm">
            <Zap className="text-indigo-500 w-6 h-6" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Spec Architect</h2>
          <p className="text-slate-500 dark:text-[#94A3B8]">Transform stream-of-consciousness ideas into technical blueprints for AI agents.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-[#E2E8F0] mb-2">The Brain Dump</label>
            <textarea
              required
              className="glass-input w-full p-4 rounded-2xl focus:bg-white dark:focus:bg-[#0F172A]/80 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all h-48 font-light text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none leading-relaxed"
              placeholder="I want to build a stock dashboard that shows real-time prices and uses AI to predict the next hour's move based on sentiment. It needs auth and a paid tier..."
              value={brainDump}
              onChange={(e) => setBrainDump(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-[#E2E8F0] mb-2">Target Stack</label>
            <input
              type="text"
              className="glass-input w-full p-4 rounded-2xl focus:bg-white dark:focus:bg-[#0F172A]/80 focus:border-indigo-500/50 outline-none transition-all font-medium text-slate-900 dark:text-white"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-full transition-all hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] flex items-center justify-center disabled:opacity-50 relative overflow-hidden"
          >
            {loading ? <><Loader2 className="animate-spin mr-2" /> Architecting...</> : 'Initialize Architecture'}
          </button>
        </form>
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] pr-2 scrollbar-hide">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-[#64748B] border border-dashed border-slate-300 dark:border-white/5 rounded-[24px] p-12 bg-slate-50 dark:bg-white/5">
            <Terminal size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Waiting for input stream...</p>
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-6">
            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={exportFullSpec}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-all hover:shadow-lg text-sm"
              >
                <Download size={16} />
                Export Full Spec
              </button>
            </div>

            <div className="glass-panel p-8 rounded-[24px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center text-xl"><FileText className="mr-3 text-indigo-500" size={20} /> Product Spec (PRD)</h3>
                <button onClick={() => copyToClipboard(result.prd)} className="text-slate-400 hover:text-indigo-500 transition-colors p-2"><Copy size={18} /></button>
              </div>
              <div className="prose prose-sm prose-invert max-w-none text-slate-700 dark:text-[#CBD5F5] font-light leading-relaxed">
                {result.prd.split('\n').map((line: string, i: number) => <p key={i}>{line}</p>)}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[24px]">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center text-xl"><List className="mr-3 text-[#38BDF8]" size={20} /> Feature Backlog</h3>
              <div className="space-y-3">
                {result.featureList.map((f: string, idx: number) => (
                  <div key={idx} className="bg-slate-100 dark:bg-[#0F172A]/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 flex items-start">
                    <div className="w-5 h-5 rounded bg-indigo-500/20 border border-indigo-500/40 mr-3 mt-0.5 flex items-center justify-center text-[10px] text-indigo-500 font-bold">{idx + 1}</div>
                    <p className="text-slate-900 dark:text-[#F9FAFB] font-medium text-sm">{f}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[24px] bg-slate-900 text-emerald-400 border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono font-bold flex items-center text-sm uppercase tracking-widest"><Terminal className="mr-2" size={14} /> .cursorrules Payload</h3>
                <button onClick={() => copyToClipboard(result.ai_instructions)} className="text-emerald-400/60 hover:text-emerald-400 transition-colors"><Copy size={16} /></button>
              </div>
              <div className="bg-black/40 p-5 rounded-xl font-mono text-[11px] whitespace-pre-wrap leading-relaxed border border-white/5">
                {result.ai_instructions}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
