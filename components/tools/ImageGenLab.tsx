import React, { useState, useEffect } from 'react';
import { generateImage } from '../../services/geminiService';
import { Loader2, Image as ImageIcon, Wand2, AlertTriangle, Sparkles, BookOpen, Save, Search, X, Tag, Filter, Trash2, Download } from 'lucide-react';

interface PromptEntry {
  id: string;
  title: string;
  prompt: string;
  style: string;
  category: string;
  isCustom?: boolean;
}

interface ImageGenLabProps {
  initialAction?: 'openLibrary';
}

const DEFAULT_LIBRARY: PromptEntry[] = [
  {
    id: '1',
    title: 'Neon Cyberpunk City',
    prompt: 'A futuristic city with flying cars at sunset, neon lights, cyberpunk aesthetic, rain-slicked streets, highly detailed, 8k resolution.',
    style: 'Cyberpunk',
    category: 'Environment'
  },
  {
    id: '2',
    title: 'Minimalist Tech Product',
    prompt: 'Sleek modern gadget on a white background, studio lighting, 4k resolution, product photography, minimalist design, soft shadows.',
    style: 'Minimalist',
    category: 'Marketing'
  },
  {
    id: '3',
    title: 'Corporate Portrait',
    prompt: 'Professional headshot of a diverse team leader, confident smile, blurred office background, cinematic lighting, high quality.',
    style: 'Photorealistic',
    category: 'People'
  },
  {
    id: '4',
    title: 'Abstract Data Flow',
    prompt: 'Swirling streams of glowing data particles, blue and purple gradient, 3d render, abstract visualization of internet speed, motion blur.',
    style: '3D Render',
    category: 'Abstract'
  },
  {
    id: '5',
    title: 'Luxury Perfume Bottle',
    prompt: 'Elegant glass perfume bottle on a marble surface, gold accents, soft floral elements in background, macro photography, bokeh effect.',
    style: 'Cinematic',
    category: 'Marketing'
  },
  {
    id: '6',
    title: 'Oil Painting Landscape',
    prompt: 'Rolling hills of Tuscany at golden hour, cypress trees, textured brushstrokes, vibrant colors, impressionist style, masterpiece.',
    style: 'Oil Painting',
    category: 'Environment'
  }
];

export const ImageGenLab: React.FC<ImageGenLabProps> = ({ initialAction }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Library State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryPrompts, setLibraryPrompts] = useState<PromptEntry[]>(DEFAULT_LIBRARY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Handle Initial Action (Deep Linking)
  useEffect(() => {
    if (initialAction === 'openLibrary') {
      setIsLibraryOpen(true);
    }
  }, [initialAction]);

  // Derived Library Data
  const categories = ['All', 'Custom', ...Array.from(new Set(DEFAULT_LIBRARY.map(p => p.category)))];

  const filteredPrompts = libraryPrompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All'
      ? true
      : selectedCategory === 'Custom'
        ? p.isCustom
        : p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    const fullPrompt = `${style} style. ${prompt}`;

    try {
      const imgData = await generateImage(fullPrompt);
      setGeneratedImage(imgData);
    } catch (e) {
      setError("Failed to generate image. Note: Image generation might require a specific paid tier or model access.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!prompt) return;
    const newEntry: PromptEntry = {
      id: Date.now().toString(),
      title: `Saved Prompt ${libraryPrompts.filter(p => p.isCustom).length + 1}`,
      prompt: prompt,
      style: style,
      category: 'Marketing', // Default to marketing
      isCustom: true
    };
    setLibraryPrompts([newEntry, ...libraryPrompts]);
  };

  const handleSelectFromLibrary = (entry: PromptEntry) => {
    setPrompt(entry.prompt);
    setStyle(entry.style);
    setIsLibraryOpen(false);
  };

  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLibraryPrompts(prev => prev.filter(p => p.id !== id));
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;

    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto relative animate-slide-up">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Visual Prompt Lab</h2>
        <p className="text-slate-500 dark:text-[#94A3B8]">Experiment with styles and adjectives to master the text-to-image pipeline.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Controls */}
        <div className="w-full lg:w-[400px] space-y-6 flex-shrink-0">
          <div className="glass-panel p-8 rounded-[24px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-[#38BDF8]/10 dark:bg-[#38BDF8]/20 rounded-lg mr-3 shadow-sm dark:shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                  <Sparkles className="text-[#38BDF8] w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white">Configuration</h3>
              </div>
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="flex items-center text-xs font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-3 py-2 rounded-full hover:bg-[#38BDF8]/20 transition-colors"
              >
                <BookOpen size={14} className="mr-1.5" /> Library
              </button>
            </div>

            <label className="block text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-2">Visual Description</label>
            <textarea
              className="glass-input w-full p-4 rounded-2xl focus:bg-white dark:focus:bg-[#0F172A]/80 focus:border-[#38BDF8]/50 focus:ring-4 focus:ring-[#38BDF8]/10 outline-none transition-all h-40 resize-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 mb-2"
              placeholder="A futuristic city with flying cars at sunset, neon lights, cyberpunk aesthetic..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-xs text-slate-400 dark:text-[#64748B] mb-6">Tip: Be specific about lighting, camera angle, and mood.</p>

            <label className="block text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-2">Art Style</label>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {['Cinematic', 'Photorealistic', '3D Render', 'Oil Painting', 'Cyberpunk', 'Minimalist'].map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-3 rounded-xl text-sm font-semibold transition-all border ${style === s
                    ? 'bg-slate-900 dark:bg-[#0F172A] text-white border-[#38BDF8]/50 shadow-[0_0_15px_rgba(56,189,248,0.3)] transform scale-[1.02]'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-[#94A3B8] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className="glass-button flex-1 text-white font-bold py-4 rounded-full transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] flex items-center justify-center disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Wand2 className="mr-2" size={18} /> Generate</>}
              </button>
              <button
                onClick={handleSaveToLibrary}
                disabled={!prompt}
                className="p-4 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 border border-slate-200 dark:border-white/10 hover:border-[#38BDF8]/30 transition-all disabled:opacity-50"
                title="Save to Library"
              >
                <Save size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 glass-panel rounded-[24px] flex items-center justify-center overflow-hidden relative min-h-[500px] p-4">
          <div className="absolute top-0 left-0 w-full h-full bg-slate-100/50 dark:bg-[#0F172A]/40 opacity-50 z-0"></div>

          {loading && (
            <div className="absolute inset-0 bg-white/60 dark:bg-[#0F172A]/60 backdrop-blur-md z-20 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-white/10 border-t-[#38BDF8] animate-spin shadow-[0_0_20px_rgba(56,189,248,0.2)]"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#38BDF8]" size={24} />
              </div>
              <p className="mt-6 text-lg font-display font-bold text-slate-800 dark:text-white animate-[pulse-soft_2s_infinite]">Dreaming up your image...</p>
            </div>
          )}

          {generatedImage ? (
            <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl animate-fade-in group border border-slate-200 dark:border-white/10">
              <img
                src={generatedImage}
                alt="Generated Result"
                className="w-full h-full object-contain bg-white dark:bg-black/50"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end backdrop-blur-sm">
                <p className="text-white/90 text-sm font-medium line-clamp-2 w-3/4 font-light tracking-wide">{prompt}</p>
                <button
                  onClick={handleDownloadImage}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-white hover:text-black transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-8 max-w-md z-10 animate-fade-in">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-2">Generation Failed</h3>
              <p className="text-slate-500 dark:text-[#94A3B8] leading-relaxed">{error}</p>
            </div>
          ) : (
            <div className="text-center text-slate-400 dark:text-[#64748B] z-10">
              <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-white/5 shadow-inner">
                <ImageIcon className="opacity-40" size={40} />
              </div>
              <h3 className="font-display font-bold text-slate-400 dark:text-[#94A3B8] text-xl mb-2">Preview Canvas</h3>
              <p className="text-sm font-medium opacity-60">Your AI-generated artwork will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-xl transition-opacity" onClick={() => setIsLibraryOpen(false)} />
          <div className="glass-panel w-full max-w-4xl max-h-[85vh] flex flex-col relative animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)] shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[24px]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Prompt Library</h2>
                <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Discover effective prompts or access your saved favorites.</p>
              </div>
              <button onClick={() => setIsLibraryOpen(false)} className="p-2 text-slate-400 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 bg-slate-50/80 dark:bg-[#0F172A]/50 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/20 focus:border-[#38BDF8]/50 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-[#020617] shadow-lg'
                      : 'bg-white dark:bg-white/5 text-slate-500 dark:text-[#94A3B8] border border-slate-200 dark:border-white/10 hover:border-[#38BDF8] hover:text-[#38BDF8]'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 dark:bg-[#020617]/50">
              {filteredPrompts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-[#64748B]">
                  <Filter size={32} className="mb-3 opacity-50" />
                  <p className="font-medium">No prompts found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPrompts.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectFromLibrary(item)}
                      className="text-left bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] hover:border-[#38BDF8]/30 hover:bg-slate-50 dark:hover:bg-[#0F172A]/80 hover:-translate-y-0.5 transition-all group relative backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white font-display">{item.title}</h4>
                        <div className="flex gap-2">
                          {item.isCustom && (
                            <div
                              onClick={(e) => handleDeletePrompt(item.id, e)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors z-10"
                            >
                              <Trash2 size={14} />
                            </div>
                          )}
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-[#CBD5F5] px-2 py-1 rounded-md uppercase tracking-wider border border-slate-200 dark:border-white/10">
                            {item.style}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-[#94A3B8] line-clamp-3 leading-relaxed mb-3 font-light">
                        {item.prompt}
                      </p>
                      <div className="flex items-center text-xs font-bold text-[#38BDF8] opacity-0 group-hover:opacity-100 transition-opacity">
                        Use this prompt <Wand2 size={12} className="ml-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};