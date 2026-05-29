import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Instagram, 
  Facebook, 
  Music, 
  Lock, 
  ChevronRight, 
  Share2, 
  FileText, 
  Sparkles, 
  HelpCircle,
  Eye,
  KeyRound,
  Download,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chapter, defaultChapters } from './data/chapters';
import { AppSettings, getChapters, getSettings } from './services/db';
import ComicReader from './components/ComicReader';
import AuthorPanel from './components/AuthorPanel';

export default function App() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    socialInstagram: 'https://instagram.com/thetimewarp_isaltimancanti',
    socialTiktok: 'https://tiktok.com',
    socialFacebook: 'https://facebook.com',
    canvaPdfLink: '',
    authorModePassword: 'warp'
  });

  const [selectedReaderChapter, setSelectedReaderChapter] = useState<Chapter | null>(null);
  const [showAuthorPanel, setShowAuthorPanel] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Loaded database instances
  useEffect(() => {
    async function loadData() {
      try {
        const dbChapters = await getChapters();
        const dbSettings = await getSettings();
        setChapters(dbChapters && dbChapters.length > 0 ? dbChapters : defaultChapters);
        setSettings(dbSettings);
      } catch (err) {
        console.warn("Could not load state inside App, using defaults:", err);
        setChapters(defaultChapters);
      }
    }
    loadData();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === (settings.authorModePassword || 'warp')) {
      setShowLoginModal(false);
      setPasswordInput('');
      setLoginError('');
      setShowAuthorPanel(true);
    } else {
      setLoginError('Codice quantistico non valido. Riprova.');
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Background stars / dust effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1917_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
      
      {/* Technical ambient lighting */}
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[450px] h-[450px] bg-[#ec4899]/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header Bar */}
      <header className="px-6 py-4 border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-[#ec4899] to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <span className="font-display font-black text-xs text-zinc-950">TW</span>
            </div>
            <div>
              <h1 className="text-sm font-display font-extrabold tracking-widest text-white uppercase neon-glow-cyan">THE TIME WARP</h1>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-none">I Salti Mancanti</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Social Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-[#ec4899] bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-700/60 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.socialTiktok && (
                <a href={settings.socialTiktok} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-cyan-400 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-700/60 transition-all">
                  <Music className="w-4 h-4" />
                </a>
              )}
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-400 hover:text-blue-500 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-zinc-700/60 transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Author Area Login Lock toggle */}
            <button 
              onClick={() => setShowLoginModal(true)}
              className="px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/40 text-xs font-mono text-zinc-400 hover:text-white rounded-lg transition-all flex items-center gap-1.5 shadow-md"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Studio Autore</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-12">
        
        {/* Welcome Block (The Hero Card) */}
        <section className="text-center space-y-6 pt-4 relative">
          
          <span className="px-3 py-1 bg-cyan-950/40 border border-cyan-800/40 text-[10px] font-mono text-cyan-400 rounded-full uppercase tracking-wider">
            Portal di Lettura Ufficiale
          </span>
          
          <h2 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight">
            THE TIME WARP <br />
            <span className="bg-gradient-to-r from-cyan-400 via-[#ec4899] to-pink-500 bg-clip-text text-transparent capitalize">
              I Salti Mancanti
            </span>
          </h2>
          
          <p className="text-sm text-zinc-450 max-w-xl mx-auto leading-relaxed">
            Il varco temporale si è spalancato. Scopri l'avventura sci-fi quantistica di <strong>Giuseppe Di Prima</strong> direttamente dal tuo browser: tavole mozzafiato, paradossi e risposte mai svelate!
          </p>

          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto"></div>
        </section>

        {/* CLARIFYING NOVEL/SPINOFF DISCLAIMER (Your requested exact caption adaptation) */}
        <section className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900 to-[#0e0e12] border border-zinc-800 relative overflow-hidden shadow-lg">
          
          {/* Neon side accent line */}
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#ec4899]"></div>
          
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-[#ec4899]/10 rounded-xl text-[#ec4899] shrink-0 border border-[#ec4899]/15">
              <Sparkles className="w-5 h-5" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Guida alla lettura</span>
              <h3 className="text-base font-display font-bold text-white">Né un remake, né un semplice copia-incolla</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Questo fumetto è uno <strong>SPIN-OFF originale</strong>. Racconta ciò che nel romanzo ufficiale è rimasto nell'ombra: i paradossi nascosti, le linee temporali fratturate e i segreti più oscuri del Multiverso prima del ritorno di JD.
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  NON è necessario aver letto il romanzo!
                </div>
                <span className="hidden sm:inline text-zinc-700">|</span>
                <p className="text-[11px] text-zinc-500">
                  È il punto di partenza ideale per chi è nuovo all'universo di "The Time Warp"!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTERS FOLDER GRID (Your request to stack chapters like folders) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-display font-medium tracking-tight uppercase text-zinc-300">Folders / Volumi Pubblicati</h3>
            </div>
            <span className="text-[10.5px] font-mono text-zinc-650">Aggiornato in tempo reale</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <div 
                key={chapter.id}
                className={`group bg-zinc-900/30 border p-5 rounded-2xl flex flex-col justify-between transition-all relative overflow-hidden min-h-[220px] ${
                  chapter.status === 'published' 
                    ? 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50' 
                    : 'border-zinc-900/80 opacity-60'
                }`}
              >
                {/* Background Chapter Cover image with elegant gradient overlay */}
                {chapter.coverImage && (
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={chapter.coverImage} 
                      alt="" 
                      className="w-full h-full object-cover opacity-25 group-hover:opacity-45 transition-all duration-500 filter brightness-75 contrast-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/40" />
                  </div>
                )}

                {/* Background decorative corner tab like a folder tab */}
                <div className="absolute top-0 right-0 w-16 h-[20px] bg-zinc-950 rounded-bl-xl border-l border-b border-zinc-900/60 flex items-center justify-center z-10">
                  <span className={`text-[8px] font-mono uppercase font-bold tracking-widest ${
                    chapter.status === 'published' ? 'text-cyan-400' : 'text-zinc-600'
                  }`}>
                    {chapter.status === 'published' ? 'Attivo' : '🔒 In arrivo'}
                  </span>
                </div>

                <div className="space-y-3 pt-2 relative z-10">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                    <span>{chapter.title}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-display font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {chapter.subtitle}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-3 mt-1.5 leading-relaxed">
                      {chapter.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-auto relative z-10">
                  {chapter.status === 'published' ? (
                    <button 
                      onClick={() => setSelectedReaderChapter(chapter)}
                      className="w-full py-2.5 bg-zinc-900/90 hover:bg-cyan-500 hover:text-zinc-950 border border-zinc-800 hover:border-cyan-400 text-xs font-display font-semibold transition-all rounded-lg flex items-center justify-center gap-1.5 backdrop-blur-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Sfoglia Episodio
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-zinc-950/90 border border-zinc-900/80 text-xs font-mono text-zinc-650 rounded-lg text-center font-semibold backdrop-blur-xs">
                      Disponibile prossimamente
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Canva Direct PDF Box integration */}
        {settings.canvaPdfLink && (
          <section className="p-5 rounded-2xl bg-[#09090c] border border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-inner">
            <div className="flex items-center gap-3.5 text-left">
              <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-800/10 text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-display font-bold uppercase text-zinc-400 tracking-wide">Preferisci il layout originale?</h4>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Ho raccolto tutte le pagine in un file PDF ad altissima risoluzione per lasciarti sfogliare comodamente.
                </p>
              </div>
            </div>
            
            <a 
              href={settings.canvaPdfLink} 
              target="_blank" 
              rel="noopener"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-zinc-950 rounded-lg text-xs font-display font-bold text-center tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 shrink-0 uppercase w-full sm:w-auto"
            >
              <Download className="w-3.5 h-3.5" />
              Leggi PDF in Canva
            </a>
          </section>
        )}

      </main>

      {/* Footer Area with credit lines & socials */}
      <footer className="bg-zinc-950 py-8 border-t border-zinc-900/60 mt-auto">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1">
              THE TIME WARP — I SALTI MANCANTI
            </p>
            <p className="text-[10px] text-zinc-600 mt-1 leading-normal">
              © {new Date().getFullYear()} Giuseppe Di Prima. Un'avventura fanta-scientifica cyberpunk-noir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {settings.socialInstagram && (
              <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="p-2.5 text-xs font-mono text-zinc-500 hover:text-white flex items-center gap-1 bg-zinc-900/30 rounded border border-zinc-900/50 hover:border-zinc-800 transition-all">
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            )}
            {settings.socialTiktok && (
              <a href={settings.socialTiktok} target="_blank" rel="noopener noreferrer" className="p-2.5 text-xs font-mono text-zinc-500 hover:text-white flex items-center gap-1 bg-zinc-900/30 rounded border border-zinc-900/50 hover:border-zinc-800 transition-all">
                <Music className="w-3.5 h-3.5" />
                <span>TikTok</span>
              </a>
            )}
            {settings.socialFacebook && (
              <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="p-2.5 text-xs font-mono text-zinc-500 hover:text-white flex items-center gap-1 bg-zinc-900/30 rounded border border-zinc-900/50 hover:border-zinc-800 transition-all">
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* MODAL 1: STUNNING INTERACTIVE COMIC READER VIEWPORT */}
      <AnimatePresence>
        {selectedReaderChapter && (
          <ComicReader 
            chapter={selectedReaderChapter}
            onClose={() => setSelectedReaderChapter(null)}
          />
        )}
      </AnimatePresence>

      {/* MODAL 2: AUTHOR CONTROL PANEL WRAPPER */}
      <AnimatePresence>
        {showAuthorPanel && (
          <AuthorPanel 
            chapters={chapters}
            onChaptersUpdate={(updated) => setChapters(updated)}
            settings={settings}
            onSettingsUpdate={(updated) => setSettings(updated)}
            onClose={() => setShowAuthorPanel(false)}
          />
        )}
      </AnimatePresence>

      {/* MODAL 3: PASSCODE ACCESS ENTRY (LISA Security protocol) */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-8 rounded-3xl shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  setPasswordInput('');
                  setLoginError('');
                }}
                className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-all text-sm"
              >
                Chiedi dopo
              </button>

              <div className="flex flex-col items-center gap-3 text-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-display font-bold text-white uppercase tracking-tight">Accesso Autore</h3>
                <p className="text-xs text-zinc-500">Incolla o digita il codice di accesso quantistico per gestire il portale.</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <input 
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Es. warp"
                    className="w-full p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center text-sm font-semibold tracking-wider text-white focus:outline-none focus:border-cyan-500 transition-all"
                    autoFocus
                  />
                  {loginError && (
                    <p className="text-[10px] font-mono text-rose-500 text-center">{loginError}</p>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-zinc-950 font-display font-semibold transition-all rounded-xl text-xs uppercase tracking-wider"
                >
                  Valida coordinata
                </button>

                <p className="text-[9px] font-mono text-zinc-600 text-center">
                  💡 Il codice predefinito di accesso iniziale è <strong className="text-zinc-500 font-semibold">warp</strong>.<br />Lo puoi modificare nelle impostazioni del pannello.
                </p>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
