import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  BookOpen, 
  Info,
  Layers,
  ArrowDownLeft,
  ChevronsLeft,
  ChevronsRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chapter, ComicPage } from '../data/chapters';

interface ComicReaderProps {
  chapter: Chapter;
  onClose: () => void;
}

export default function ComicReader({ chapter, onClose }: ComicReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showMetadata, setShowMetadata] = useState(true);
  const [isVerticalMode, setIsVerticalMode] = useState(false);

  const pages = chapter.pages || [];
  const currentPage = pages[currentPageIndex];

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      setZoomLevel(1); // Reset zoom on page change
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      setZoomLevel(1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(zoomLevel === 1 ? 1.75 : 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040405] flex flex-col overflow-hidden text-zinc-100">
      
      {/* Top Controller Bar */}
      <header className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-900/60 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-display font-medium tracking-tight text-white flex items-center gap-2">
              {chapter.title} 
              <span className="text-zinc-600">|</span> 
              <span className="text-zinc-400 font-normal">{chapter.subtitle}</span>
            </h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
              Pagina {currentPageIndex + 1} di {pages.length}
            </p>
          </div>
        </div>

        {/* Configurations Hub */}
        <div className="flex items-center gap-2">
          {/* Reader type toggle */}
          <button 
            onClick={() => setIsVerticalMode(!isVerticalMode)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
              isVerticalMode 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Cambia modalità di lettura"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isVerticalMode ? 'Scorrimento Verticale' : 'Sfoglia Orizzontale'}</span>
          </button>

          {/* Zoom controls (hidden in vertical scroll mode) */}
          {!isVerticalMode && (
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900/40 border border-zinc-800 rounded-lg p-0.5">
              <button 
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={handleResetZoom}
                className="text-[10px] font-mono px-1.5 py-0.5 text-zinc-400 hover:text-white"
              >
                {zoomLevel.toFixed(2)}x
              </button>
              <button 
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.5}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Narratives visibility toggle */}
          <button 
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded-lg border transition-all ${
              showMetadata
                ? 'bg-[#ec4899]/10 border-[#ec4899]/30 text-[#ec4899]' 
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Didascalia / Sceneggiatura"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Close Reader */}
          <button 
            onClick={onClose}
            className="p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors hover:border-zinc-700 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Board */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        
        {/* Comic Container */}
        <div className="flex-1 bg-[#09090b] flex items-center justify-center relative select-none overflow-y-auto">
          
          <AnimatePresence mode="wait">
            {!isVerticalMode ? (
              // HORIZONTAL CAROUSEL READER
              <motion.div 
                key={currentPageIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full flex items-center justify-center p-4 relative"
              >
                {/* Visual Canvas containing page image or cinematic placeholder */}
                <div 
                  className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  {currentPage?.image ? (
                    <img 
                      src={currentPage.image} 
                      alt={currentPage.title}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-[80vh] md:max-h-[85vh] rounded-lg object-contain comic-page-shadow border border-zinc-800"
                    />
                  ) : (
                    // Stunning Atmospheric Sci-Fi Placeholder Panel fallback
                    <div className="w-[380px] sm:w-[480px] h-[550px] md:h-[650px] rounded-2xl bg-gradient-to-b from-zinc-900 to-[#0e0e13] border border-zinc-800/80 flex flex-col justify-between p-6 relative overflow-hidden comic-page-shadow">
                      
                      {/* Technical Grid background decoration */}
                      <div className="absolute inset-0 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>
                      
                      {/* Laser beam glows */}
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none"></div>
                      <div className="absolute bottom-1/4 left-1/4 w-[150px] h-[150px] rounded-full bg-pink-500/5 blur-[60px] pointer-events-none"></div>

                      <div className="flex items-center justify-between z-10">
                        <div className="text-[10px] font-mono bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800 text-zinc-500 tracking-widest uppercase">
                          QUANTUM_FRAME_{currentPage.id}
                        </div>
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                          <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
                        </div>
                      </div>

                      {/* Main Atmospheric Graphic Illustration Box */}
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 relative z-10 m-4 border border-zinc-800/50 bg-[#050507] rounded-xl overflow-hidden shadow-inner">
                        
                        {/* Futuristic scanline overlay */}
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-zinc-900/10 to-zinc-950/20 pointer-events-none"></div>
                        
                        <div className="p-4 rounded-full bg-cyan-500/5 border border-cyan-500/15 text-cyan-400 group-hover:scale-105 transition-transform duration-300">
                          <Sparkles className="w-8 h-8 opacity-70" />
                        </div>
                        
                        <div>
                          <p className="text-xs font-display font-semibold tracking-wider text-zinc-400 uppercase">
                            {currentPage.title}
                          </p>
                          <h3 className="text-lg font-display font-bold text-white tracking-tight mt-1 px-2 leading-snug">
                            {currentPage.id === 1 ? 'I Gemelli Planck' : currentPage.id === 3 ? 'La Forza di Heather' : currentPage.id === 4 ? 'La Fortezza di Daker' : 'In attesa dell\'illustrazione'}
                          </h3>
                        </div>

                        <p className="text-[11px] font-sans text-zinc-500 max-w-[280px] leading-relaxed">
                          {currentPage.description}
                        </p>
                      </div>

                      {/* Bottom author coordinate overlays */}
                      <div className="flex items-end justify-between z-10">
                        <p className="text-[9px] font-mono text-zinc-600">
                          GRID // COORD // {44.332 * currentPage.id}
                        </p>
                        <p className="text-[9px] font-mono text-zinc-500">
                          THE TIME WARP / SPIN-OFF
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Left-right click areas for immediate click mapping */}
                  <div 
                    onClick={handlePrevPage} 
                    className="absolute left-0 top-0 bottom-0 w-1/12 cursor-left-arrow pointer-events-auto"
                    title="Pagina precedente"
                  ></div>
                  <div 
                    onClick={handleNextPage} 
                    className="absolute right-0 top-0 bottom-0 w-1/12 cursor-right-arrow pointer-events-auto"
                    title="Pagina successiva"
                  ></div>
                </div>

                {/* Left/Right Floating arrow triggers */}
                {currentPageIndex > 0 && (
                  <button 
                    onClick={handlePrevPage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/80 border border-zinc-800 rounded-full hover:bg-zinc-800 hover:text-white text-zinc-400 hover:border-zinc-700 transition-all shadow-xl backdrop-blur-sm z-10"
                    title="Precedente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {currentPageIndex < pages.length - 1 && (
                  <button 
                    onClick={handleNextPage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-zinc-900/80 border border-zinc-800 rounded-full hover:bg-zinc-800 hover:text-white text-zinc-400 hover:border-zinc-700 transition-all shadow-xl backdrop-blur-sm z-10"
                    title="Successiva"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            ) : (
              // VERTICAL SCROLL STRIP READER (webtoon like continuous)
              <div className="w-full h-full overflow-y-auto px-4 py-8 flex flex-col items-center gap-8 scroll-smooth">
                <div className="text-center max-w-md pb-4 border-b border-zinc-900/80">
                  <p className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">Modo Striscia Continua</p>
                  <h3 className="text-xl font-display font-bold mt-1">Nastro Scorrevole</h3>
                  <p className="text-xs text-zinc-500 mt-1">Scorri verso il basso per svelare l'intero capitolo</p>
                </div>

                {pages.map((page, index) => (
                  <div 
                    key={page.id} 
                    id={`page-anchor-${page.id}`}
                    className={`flex flex-col items-center gap-4 py-4 w-full ${currentPageIndex === index ? 'ring-2 ring-cyan-500/20 bg-cyan-950/5' : ''} rounded-2xl transition-all duration-300`}
                  >
                    {page.image ? (
                      <img 
                        src={page.image} 
                        alt={page.title}
                        referrerPolicy="no-referrer"
                        className="max-w-full max-h-[85vh] rounded-xl object-contain comic-page-shadow border border-zinc-800"
                      />
                    ) : (
                      // Fallback panel card
                      <div className="w-[360px] sm:w-[440px] h-[480px] rounded-2xl bg-gradient-to-b from-zinc-900 to-[#0e0e13] border border-zinc-800/80 flex flex-col justify-between p-5 relative overflow-hidden comic-page-shadow">
                        <div className="absolute inset-0 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-500">PAGINA {page.id}</span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">{chapter.title}</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10">
                          <p className="text-xs font-mono text-zinc-500 uppercase">{page.title}</p>
                          <h4 className="text-sm font-display font-bold mt-1 text-zinc-300">{page.description}</h4>
                          {page.narrativeText && (
                            <p className="text-[11px] text-zinc-500 italic mt-3 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 max-w-[280px]">
                              {page.narrativeText}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between text-[8px] font-mono text-zinc-600">
                          <span>SYS: FRAME_DEFS</span>
                          <span>THE TIME WARP</span>
                        </div>
                      </div>
                    )}
                    <div className="text-center max-w-md px-4 mt-2">
                      <span className="text-[10px] font-mono text-zinc-600">-- PAGINA {page.id} --</span>
                      {page.narrativeText && (
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
                          {page.narrativeText}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Narrative & Script Console Sidebar / Bottom overlay depending on view */}
        <AnimatePresence>
          {showMetadata && (
            <motion.aside 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 340 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950 h-[220px] md:h-auto flex flex-col z-20 shrink-0 select-text"
            >
              <div className="p-4 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#ec4899] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  Dati Sceneggiatura
                </span>
                <div className="text-[10px] font-mono text-zinc-500">
                  Ep. 1 // Pag. {currentPageIndex + 1}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Descrizione della scena</h4>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed bg-zinc-900/20 p-3 rounded-lg border border-zinc-900">
                    {currentPage ? currentPage.description : 'Caricamento...'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-pink-400 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block"></span>
                    Testo di Narrazione
                  </h4>
                  <div className="text-sm text-zinc-200 mt-2 font-serif italic border-l-2 border-pink-500/50 pl-3 py-1 bg-zinc-900/10 leading-relaxed">
                    {currentPage && currentPage.narrativeText ? (
                      `"${currentPage.narrativeText}"`
                    ) : (
                      <span className="text-zinc-600 text-xs font-sans">Nessun testo configurato per questa tavola.</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900/40">
                  <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50">
                    <p className="text-[10px] font-mono text-zinc-500 leading-snug">
                      💡 Questa didascalia corrisponde al testo pubblicato sul carosello di Instagram e sul video di TikTok!
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips block for desktop reader orientation */}
              <div className="p-4 border-t border-zinc-900 bg-zinc-950 font-mono text-[9px] text-zinc-600 hidden md:block">
                <span>Premere ← o → sulla tastiera per sfogliare il fumetto</span>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

      </div>

      {/* Quick Navigation Footer Track */}
      <footer className="bg-zinc-950 p-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 z-40">
        
        {/* Rapid Jump Bubbles */}
        <div className="flex items-center gap-1.5 max-w-full overflow-x-auto py-1 scrollbar-none">
          <button 
            onClick={() => setCurrentPageIndex(0)}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 transition-colors"
            title="Inizio"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          
          {pages.map((page, idx) => (
            <button 
              key={page.id}
              onClick={() => {
                setCurrentPageIndex(idx);
                setZoomLevel(1);
                if (isVerticalMode) {
                  const el = document.getElementById(`page-anchor-${page.id}`);
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`w-7 h-7 rounded-md font-mono text-xs font-semibold flex items-center justify-center transition-all shrink-0 ${
                currentPageIndex === idx
                  ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20 scale-110 font-bold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800/80'
              }`}
            >
              {page.id}
            </button>
          ))}

          <button 
            onClick={() => setCurrentPageIndex(pages.length - 1)}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 transition-colors"
            title="Fine"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {chapter.pdfLink && (
            <a 
              href={chapter.pdfLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-zinc-950 text-xs font-display font-bold rounded-lg hover:from-cyan-500 hover:to-cyan-400 transition-all shadow-md shadow-cyan-500/15 uppercase tracking-wide flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Leggi PDF Completo
            </a>
          )}
        </div>

      </footer>

    </div>
  );
}
