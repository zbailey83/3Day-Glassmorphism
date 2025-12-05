import React, { useState } from 'react';
import { generateCampaignContent } from '../../services/geminiService';
import { GeneratedCampaign } from '../../types';
import { Loader2, Copy, Share2, Layout, Video, Hash, Sparkles } from 'lucide-react';

export const CampaignGenerator: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedCampaign | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const jsonString = await generateCampaignContent(brandName, productDesc, audience);
      const cleanJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      setResult({
        script: data.script,
        socialPosts: data.social_posts || [],
        seoKeywords: data.seo_keywords || []
      });
    } catch (error) {
      console.error("Failed to generate campaign", error);
      alert("Failed to generate campaign. Please ensure your API Key is set and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-slide-up">
      {/* Input Section */}
      <div className="glass-panel p-8 rounded-[24px] h-fit">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-[#A855F7]/10 dark:bg-[#A855F7]/20 border border-[#A855F7]/30 rounded-xl mb-4 shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles className="text-[#A855F7] w-6 h-6" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Campaign Generator</h2>
          <p className="text-slate-500 dark:text-[#94A3B8]">Instantly generate scripts, social copy, and SEO keywords for your brand.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-[#E2E8F0] mb-2">Brand Name</label>
            <input 
              type="text" 
              required
              className="glass-input w-full p-4 rounded-2xl focus:bg-white dark:focus:bg-[#0F172A]/80 focus:border-[#38BDF8]/50 focus:ring-4 focus:ring-[#38BDF8]/10 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="e.g., EcoStride"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-[#E2E8F0] mb-2">Product Description</label>
            <textarea 
              required
              className="glass-input w-full p-4 rounded-2xl focus:bg-white dark:focus:bg-[#0F172A]/80 focus:border-[#38BDF8]/50 focus:ring-4 focus:ring-[#38BDF8]/10 outline-none transition-all h-32 font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
              placeholder="Describe the features and benefits..."
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-[#E2E8F0] mb-2">Target Audience</label>
            <input 
              type="text" 
              required
              className="glass-input w-full p-4 rounded-2xl focus:bg-white dark:focus:bg-[#0F172A]/80 focus:border-[#38BDF8]/50 focus:ring-4 focus:ring-[#38BDF8]/10 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="e.g., Urban professionals, 25-35"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="glass-button w-full text-white font-bold py-4 rounded-full transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] flex items-center justify-center disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100 relative overflow-hidden"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Creating Magic...
              </>
            ) : (
              'Generate Campaign Assets'
            )}
          </button>
        </form>
      </div>

      {/* Output Section */}
      <div className="space-y-6">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-[#64748B] border border-dashed border-slate-300 dark:border-white/5 rounded-[24px] p-12 bg-slate-50 dark:bg-white/5 backdrop-blur-sm">
            <Layout size={48} className="mb-4 opacity-50 dark:opacity-20" />
            <p className="font-medium">Campaign assets will appear here</p>
          </div>
        )}

        {result && (
          <div className="animate-fade-in space-y-6">
            {/* Script Card */}
            <div className="glass-panel p-8 rounded-[24px] group hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center text-xl"><Video className="mr-3 text-[#38BDF8]" size={20}/> Video Script</h3>
                <button className="text-slate-400 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"><Copy size={18} /></button>
              </div>
              <div className="bg-slate-100 dark:bg-[#0F172A]/50 p-6 rounded-2xl text-sm font-mono whitespace-pre-wrap text-slate-700 dark:text-[#CBD5F5] border border-slate-200 dark:border-white/5 group-hover:border-[#38BDF8]/20 transition-colors leading-relaxed shadow-inner">
                {result.script}
              </div>
            </div>

            {/* Social Posts */}
            <div className="glass-panel p-8 rounded-[24px]">
               <h3 className="font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center text-xl"><Share2 className="mr-3 text-[#A855F7]" size={20}/> Social Copy</h3>
               <div className="space-y-4">
                 {result.socialPosts.map((post, idx) => (
                   <div key={idx} className="bg-slate-100 dark:bg-[#0F172A]/40 p-5 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-[#A855F7]/30 transition-all hover:bg-slate-200 dark:hover:bg-[#0F172A]/60">
                     <span className="text-[10px] font-bold text-slate-500 dark:text-[#CBD5F5] uppercase tracking-widest bg-white dark:bg-white/10 px-2 py-1 rounded-md shadow-sm mb-3 inline-block border border-slate-200 dark:border-white/5">{post.platform}</span>
                     <p className="mt-1 text-slate-900 dark:text-[#F9FAFB] font-medium leading-relaxed">{post.content}</p>
                   </div>
                 ))}
               </div>
            </div>

            {/* SEO Keywords */}
            <div className="glass-panel p-8 rounded-[24px]">
               <h3 className="font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center text-xl"><Hash className="mr-3 text-[#22C55E]" size={20}/> SEO Targets</h3>
               <div className="flex flex-wrap gap-3">
                 {result.seoKeywords.map((kw, idx) => (
                   <span key={idx} className="px-4 py-2 bg-[#22C55E]/10 text-emerald-600 dark:text-[#4ADE80] rounded-full text-sm font-bold border border-[#22C55E]/20 hover:scale-105 transition-transform cursor-default shadow-sm dark:shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                     #{kw}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};