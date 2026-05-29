import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Settings, 
  FolderPlus, 
  Upload, 
  Plus, 
  Trash2, 
  BookOpen, 
  PenTool, 
  Share2, 
  Lightbulb, 
  ImageIcon, 
  Sparkles, 
  Wand2, 
  Loader2, 
  Save, 
  Clock, 
  UserPlus, 
  MessageSquare,
  Link2,
  FileText,
  AlertTriangle,
  Github,
  Globe,
  Database,
  Lock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chapter, ComicPage } from '../data/chapters';
import { AppSettings, saveChapters, saveSettings } from '../services/db';
import { Character, analyzeScene, generateIdeas, generateCoverPrompt, generateSocialContent, continueWriting } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AuthorPanelProps {
  chapters: Chapter[];
  onChaptersUpdate: (updated: Chapter[]) => void;
  settings: AppSettings;
  onSettingsUpdate: (updated: AppSettings) => void;
  onClose: () => void;
}

export default function AuthorPanel({ 
  chapters, 
  onChaptersUpdate, 
  settings, 
  onSettingsUpdate, 
  onClose 
}: AuthorPanelProps) {
  const [activeTab, setActiveTab] = useState<'comic' | 'lisa' | 'settings'>('comic');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || '');
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // LISA Writing Board states (loaded from localStorage on mount)
  const [text, setText] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [lisaOutput, setLisaOutput] = useState('');
  const [isLoadingLisa, setIsLoadingLisa] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCharModal, setShowCharModal] = useState(false);
  const [newChar, setNewChar] = useState({ name: '', description: '' });

  // Settings states
  const [socialInsta, setSocialInsta] = useState(settings.socialInstagram || '');
  const [socialTok, setSocialTok] = useState(settings.socialTiktok || '');
  const [socialFb, setSocialFb] = useState(settings.socialFacebook || '');
  const [canvaLink, setCanvaLink] = useState(settings.canvaPdfLink || '');
  const [adminPass, setAdminPass] = useState(settings.authorModePassword || '');

  useEffect(() => {
    // Load Lisa state
    const savedText = localStorage.getItem('romanzo');
    const savedChars = localStorage.getItem('personaggi');
    if (savedText) setText(savedText);
    if (savedChars) setCharacters(JSON.parse(savedChars));
  }, []);

  // Lisa Autosaver
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('romanzo', text);
      localStorage.setItem('personaggi', JSON.stringify(characters));
      setLastSaved(new Date());
    }, 1500);
    return () => clearTimeout(timer);
  }, [text, characters]);

  // Synchronize initial selection
  useEffect(() => {
    const current = chapters.find(c => c.id === selectedChapterId);
    if (current) {
      setEditingChapter(JSON.parse(JSON.stringify(current))); // Deep clone to edit
    } else {
      setEditingChapter(null);
    }
  }, [selectedChapterId, chapters]);

  // Handle Comic edits
  const handleUpdateChapterField = (field: keyof Chapter, value: any) => {
    if (!editingChapter) return;
    setEditingChapter({
      ...editingChapter,
      [field]: value
    });
  };

  const handleUpdatePageField = (pageId: number, field: keyof ComicPage, value: any) => {
    if (!editingChapter) return;
    const updatedPages = (editingChapter.pages || []).map(p => {
      if (p.id === pageId) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setEditingChapter({
      ...editingChapter,
      pages: updatedPages
    });
  };

  // Convert uploaded image to Base64
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, pageId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdatePageField(pageId, 'image', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdateChapterField('coverImage', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChapterEdits = async () => {
    if (!editingChapter) return;
    const updatedChapters = chapters.map(c => {
      if (c.id === editingChapter.id) {
        return editingChapter;
      }
      return c;
    });
    onChaptersUpdate(updatedChapters);
    await saveChapters(updatedChapters);
    alert('Capitolo salvato con successo nel database locale!');
  };

  const handleAddNewChapter = async () => {
    const newId = `chapter-${Date.now()}`;
    const newChapter: Chapter = {
      id: newId,
      title: `Episodio ${chapters.length + 1}`,
      subtitle: 'Nuovo Episodio',
      description: 'Inserisci qui una descrizione intrigante per i tuoi lettori...',
      status: 'draft',
      pages: Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        title: `Pagina ${i + 1}`,
        description: `Bozza della tavola ${i + 1}`,
        narrativeText: ''
      }))
    };

    const updated = [...chapters, newChapter];
    onChaptersUpdate(updated);
    await saveChapters(updated);
    setSelectedChapterId(newId);
  };

  const handleDeleteChapter = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare interamente questo capitolo?')) {
      const updated = chapters.filter(c => c.id !== id);
      onChaptersUpdate(updated);
      await saveChapters(updated);
      if (selectedChapterId === id && updated.length > 0) {
        setSelectedChapterId(updated[0].id);
      }
    }
  };

  // LISA helper
  const handleLisaAction = async (action: () => Promise<string | undefined>) => {
    setIsLoadingLisa(true);
    setLisaOutput('Analisi quantistica in corso...');
    try {
      const result = await action();
      setLisaOutput(result || 'LISA non ha rilevato fluttuazioni temporali.');
    } catch (err) {
      setLisaOutput('LISA ha rilevato un errore catastale nel flusso temporale.');
      console.error(err);
    } finally {
      setIsLoadingLisa(false);
    }
  };

  const handleContinueWritingInStudio = async () => {
    if (!text || isWriting) return;
    setIsWriting(true);
    try {
      const nextPart = await continueWriting(text, characters);
      if (nextPart) {
        setText(prev => prev + (prev.endsWith(' ') ? '' : ' ') + nextPart);
      }
    } catch (err) {
      console.error('LISA continue error:', err);
    } finally {
      setIsWriting(false);
    }
  };

  const handleSaveSettings = async () => {
    const newSettings: AppSettings = {
      socialInstagram: socialInsta,
      socialTiktok: socialTok,
      socialFacebook: socialFb,
      canvaPdfLink: canvaLink,
      authorModePassword: adminPass
    };
    onSettingsUpdate(newSettings);
    await saveSettings(newSettings);
    alert('Configurazioni salvate con successo!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-lg flex justify-end md:p-4 select-none">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-5xl bg-zinc-950 md:rounded-2xl border-l border-zinc-900 flex flex-col h-full overflow-hidden shadow-2xl relative"
      >
        
        {/* Panel Header */}
        <header className="px-6 py-4 bg-zinc-900/40 border-b border-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-linear-to-tr from-pink-600 to-cyan-500 rounded-lg flex items-center justify-center text-zinc-950 font-display font-black text-xs">
              JD
            </div>
            <div>
              <h2 className="text-sm font-display font-bold tracking-tight text-white flex items-center gap-2">
                Pannello Autore & Creative Studio
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-cyan-400 rounded uppercase">Core Admin Mode</span>
              </h2>
              <p className="text-[10px] font-mono text-zinc-500">
                Gestisci le cartelle dei capitoli, i testi o chiama LISA per completare il romanzo
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Tab Selector Nav */}
        <nav className="flex bg-zinc-950/60 border-b border-zinc-900 px-6 gap-2">
          <button 
            onClick={() => setActiveTab('comic')}
            className={`py-3 px-4 border-b-2 text-xs font-display font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'comic' 
               ? 'border-cyan-500 text-cyan-400' 
               : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Gestione Capitoli & Pagine
          </button>
          
          <button 
            onClick={() => setActiveTab('lisa')}
            className={`py-3 px-4 border-b-2 text-xs font-display font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'lisa' 
               ? 'border-pink-500 text-pink-400' 
               : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            LISA AI Novel Studio
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 text-xs font-display font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'settings' 
               ? 'border-zinc-500 text-white' 
               : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Impostazioni Canali & PDF
          </button>
        </nav>

        {/* Tab Body Box */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          
          {/* TAB 1: COMIC AND PAGE MANAGER */}
          {activeTab === 'comic' && (
            <div className="p-6 flex flex-col md:flex-row gap-6 h-full min-h-0">
              
              {/* Left Sub-sidebar: Chapters List selection */}
              <div className="w-full md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-zinc-900 md:pr-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Cartelle Capitoli</h3>
                  <button 
                    onClick={handleAddNewChapter}
                    className="p-1 h-7 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-md text-xs text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-1 px-1.5"
                    title="Aggiungi nuovo capitolo"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Aggiungi</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {chapters.map((ch) => (
                    <div 
                      key={ch.id}
                      onClick={() => setSelectedChapterId(ch.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        selectedChapterId === ch.id 
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                          : 'bg-zinc-900/30 border-zinc-900 hover:bg-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-display font-bold text-white">{ch.title}</h4>
                        <p className="text-[10px] font-mono text-zinc-500 truncate max-w-[130px]">{ch.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-mono px-1 py-0.5 rounded border ${
                          ch.status === 'published' ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800' : 'bg-zinc-950 text-zinc-600 border-zinc-900'
                        }`}>
                          {ch.status === 'published' ? 'PROD' : 'BOZZA'}
                        </span>
                        
                        {chapters.length > 1 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChapter(ch.id);
                            }}
                            className="p-1 text-zinc-600 hover:text-rose-500 hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right main edit compartment */}
              <div className="flex-1 space-y-6">
                {editingChapter ? (
                  <div className="space-y-6">
                    
                    {/* Chapter Metadata configurator */}
                    <div className="bg-zinc-900/40 border border-zinc-900/80 p-5 rounded-2xl md:grid md:grid-cols-3 gap-5">
                      
                      {/* Left: Cover Image Upload */}
                      <div className="md:col-span-1 space-y-1.5 flex flex-col justify-between">
                        <div>
                          <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                            Copertina Capitolo
                          </label>
                          <p className="text-[9px] font-mono text-zinc-600 mb-2">Grande in testata di capitolo</p>
                        </div>
                        <div className="flex-1 bg-zinc-950 border border-dashed border-zinc-900 rounded-xl overflow-hidden min-h-[140px] relative flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors">
                          {editingChapter.coverImage ? (
                            <div className="w-full h-full relative group/cov">
                              <img 
                                src={editingChapter.coverImage} 
                                alt="Cover view" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover/cov:opacity-100 flex flex-col items-center justify-center text-xs text-white transition-opacity select-none">
                                <Upload className="w-5 h-5 mb-1.5 text-cyan-400 animate-bounce" />
                                Carica nuova copertina
                              </div>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleCoverImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          ) : (
                            <div className="text-center p-4 relative flex flex-col items-center select-none">
                              <ImageIcon className="w-6 h-6 text-zinc-700 mb-1.5" />
                              <span className="text-[10px] font-mono text-zinc-500 font-bold">Trascina o Sfoglia</span>
                              <span className="text-[9px] font-sans text-zinc-650 mt-0.5">JPEG / PNG</span>
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleCoverImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Text Metadata forms */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase">Titolo Capitolo</label>
                            <input 
                              type="text" 
                              value={editingChapter.title}
                              onChange={(e) => handleUpdateChapterField('title', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase">Sottotitolo (Es. "I Gemelli Planck")</label>
                            <input 
                              type="text" 
                              value={editingChapter.subtitle}
                              onChange={(e) => handleUpdateChapterField('subtitle', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">Sinossi Breve (Non-Spoiler)</label>
                          <textarea 
                            value={editingChapter.description}
                            onChange={(e) => handleUpdateChapterField('description', e.target.value)}
                            rows={2}
                            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white resize-none focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-end">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase">Stato Pubblicazione</label>
                            <select
                              value={editingChapter.status}
                              onChange={(e) => handleUpdateChapterField('status', e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            >
                              <option value="published">Pubblicato & Sfogliabile</option>
                              <option value="coming_soon">In Arrivo (Folder Chiuso)</option>
                              <option value="draft">Bozza Temporanea (Solo Autore)</option>
                            </select>
                          </div>
                          <div>
                            <button 
                              onClick={handleSaveChapterEdits}
                              className="w-full p-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-zinc-950 font-display font-semibold transition-all rounded-lg text-xs leading-none uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Save className="w-4 h-4" />
                              Salva Capitolo
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Page upload grids listing */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wide">Pagine & Caricamento Tavole ({editingChapter.pages?.length || 0} pagine)</h4>
                        <button 
                          onClick={() => {
                            const currentPages = editingChapter.pages || [];
                            const newPageNum = currentPages.length + 1;
                            const updatedPages = [...currentPages, {
                              id: newPageNum,
                              title: `Pagina ${newPageNum}`,
                              description: `Descrizione tavola ${newPageNum}`,
                              narrativeText: ''
                            }];
                            handleUpdateChapterField('pages', updatedPages);
                          }}
                          className="p-1 h-8 bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white rounded flex items-center gap-1 px-2.5 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Aggiungi Pagina
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1">
                        {editingChapter.pages?.map((page) => (
                          <div 
                            key={page.id}
                            className="bg-[#0e0e11] border border-zinc-900 p-4 rounded-xl space-y-3 relative group"
                          >
                            <div className="flex items-center justify-between border-b border-zinc-950 pb-2">
                              <span className="text-xs font-mono text-cyan-400 font-bold block">Tavola {page.id}</span>
                              <button 
                                onClick={() => {
                                  if (confirm('Rimuovere questa pagina?')) {
                                    const updated = editingChapter.pages.filter(p => p.id !== page.id).map((p, index) => ({
                                      ...p,
                                      id: index + 1 // Re-index pages
                                    }));
                                    handleUpdateChapterField('pages', updated);
                                  }
                                }}
                                className="p-1 text-zinc-700 hover:text-rose-500 hover:bg-zinc-900 rounded opacity-0 group-hover:opacity-100 transition-all"
                                title="Elimina tavola"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              {/* Visual Uploader Box */}
                              <div className="col-span-1 bg-zinc-950 border border-dashed border-zinc-800 rounded-lg overflow-hidden h-28 relative flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors">
                                {page.image ? (
                                  <div className="w-full h-full relative group/img">
                                    <img 
                                      src={page.image} 
                                      alt="Page view" 
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center text-[10px] text-white transition-opacity">
                                      <Upload className="w-4 h-4 mb-1" />
                                      Sostituisci
                                    </div>
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(e, page.id)}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </div>
                                ) : (
                                  <div className="text-center p-2 relative flex flex-col items-center">
                                    <Upload className="w-5 h-5 text-zinc-600 mb-1" />
                                    <span className="text-[9px] font-mono text-zinc-500">Sfoglia PNG</span>
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(e, page.id)}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Config inputs */}
                              <div className="col-span-2 space-y-2">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-mono text-zinc-600 block">Titolo/Sonda (In-App)</label>
                                  <input 
                                    type="text" 
                                    value={page.title}
                                    onChange={(e) => handleUpdatePageField(page.id, 'title', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-mono text-zinc-600 block">Dettagli Scena (Note Interne)</label>
                                  <input 
                                    type="text" 
                                    value={page.description}
                                    onChange={(e) => handleUpdatePageField(page.id, 'description', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-cyan-500/50"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Caption Text Box */}
                            <div className="space-y-0.5 pt-1">
                              <label className="text-[9px] font-mono text-pink-400 font-bold block">Sceneggiatura Narrazione (Overlay del lettore)</label>
                              <textarea 
                                value={page.narrativeText}
                                onChange={(e) => handleUpdatePageField(page.id, 'narrativeText', e.target.value)}
                                rows={2}
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-[11px] text-zinc-200 resize-none focus:outline-none focus:border-pink-500/30 leading-relaxed font-sans"
                                placeholder="Scrivi qui i testi della tavola..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/10 border border-zinc-900 rounded-2xl h-48 select-none text-zinc-500 font-mono text-xs text-center border-dashed">
                    Nessun capitolo selezionato o disponibile.<br />Usa il bottone in alto per iniziarne uno.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ORIGINAL LISA WRITER STUDIO */}
          {activeTab === 'lisa' && (
            <div className="flex h-full min-h-[500px]">
              
              {/* Sidebar controls for LISA */}
              <div className="w-72 shrink-0 border-r border-zinc-900 p-6 flex flex-col gap-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-pink-500 w-5 h-5 animate-pulse" />
                  <h3 className="text-sm font-display font-bold text-white uppercase">AI Co-Scrittrice Lisa</h3>
                </div>

                {/* Prompts section */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Richieste Narrative</span>
                  
                  <button 
                    onClick={handleContinueWritingInStudio}
                    disabled={isWriting || !text}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-pink-600/10 border border-pink-500/20 hover:bg-pink-600/20 text-xs transition-all text-left font-semibold text-pink-100 disabled:opacity-40"
                  >
                    {isWriting ? (
                      <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 text-pink-400 group-hover:scale-115 transition-all" />
                    )}
                    Continua a Scrivere
                  </button>

                  <button 
                    onClick={() => handleLisaAction(() => analyzeScene(text, characters))}
                    disabled={isLoadingLisa || !text}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs transition-all text-left font-medium text-zinc-300 disabled:opacity-40"
                  >
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    Analizza Scena
                  </button>

                  <button 
                    onClick={() => handleLisaAction(() => generateIdeas(text, characters))}
                    disabled={isLoadingLisa || !text}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs transition-all text-left font-medium text-zinc-300 disabled:opacity-40"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Idee Narrative
                  </button>

                  <button 
                    onClick={() => handleLisaAction(() => generateSocialContent(text, characters))}
                    disabled={isLoadingLisa || !text}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs transition-all text-left font-medium text-zinc-300 disabled:opacity-40"
                  >
                    <Share2 className="w-4 h-4 text-emerald-500" />
                    Contenuti Social
                  </button>

                  <button 
                    onClick={() => handleLisaAction(() => generateCoverPrompt(text, characters))}
                    disabled={isLoadingLisa || !text}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs transition-all text-left font-medium text-zinc-300 disabled:opacity-40"
                  >
                    <ImageIcon className="w-4 h-4 text-rose-500" />
                    Prompt Copertina
                  </button>
                </div>

                {/* Characters List section */}
                <div className="space-y-3 pt-4 border-t border-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Personaggi</span>
                    <button 
                      onClick={() => setShowCharModal(true)}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {characters.map((char, idx) => (
                      <div key={idx} className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl relative group">
                        <h4 className="text-xs font-semibold text-zinc-200">{char.name}</h4>
                        <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">{char.description}</p>
                        <button 
                          onClick={() => setCharacters(characters.filter((_, i) => i !== idx))}
                          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-0.5 text-zinc-700 hover:text-rose-500 hover:bg-zinc-900 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {characters.length === 0 && (
                      <p className="text-[10px] text-zinc-650 italic">Nessun personaggio inserito.</p>
                    )}
                  </div>
                </div>

                {/* Saving marker */}
                <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lastSaved ? lastSaved.toLocaleTimeString() : 'In attesa'}
                  </span>
                  <span>{text.length} caratt.</span>
                </div>
              </div>

              {/* Text Writing Space & Response Output Panel */}
              <div className="flex-1 flex flex-col md:flex-row h-full">
                
                {/* Writing zone */}
                <div className="flex-1 p-6 flex flex-col gap-3 min-h-0 min-w-0">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Taccuino romanzo / Capitolo</span>
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Digita qui i capitoli della tua storia, frammenti quantistici o sceneggiature. Lisa leggerà e lavorerà su questo testo..."
                    className="flex-1 bg-zinc-950 border border-zinc-900/80 p-5 rounded-2xl text-sm leading-relaxed text-zinc-300 resize-none focus:outline-none focus:border-pink-500/30 overflow-y-auto select-text placeholder:text-zinc-700"
                  />
                </div>

                {/* Action feedback console */}
                <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-950/40 flex flex-col min-h-[250px] p-6 gap-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Risultato Lisa</span>
                    {lisaOutput && (
                      <button 
                        onClick={() => setLisaOutput('')}
                        className="text-[10px] font-mono text-zinc-600 hover:text-white transition-all"
                      >
                        Pulisci
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto select-text prose prose-invert prose-xs text-xs text-zinc-455 pr-1 font-mono leading-relaxed p-2 bg-zinc-950/60 rounded-xl border border-zinc-900/60">
                    {isLoadingLisa ? (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3">
                        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                        <p className="text-[10px] font-mono text-zinc-500 lowercase animate-pulse">LISA sta calcolando le probabilità quantistiche...</p>
                      </div>
                    ) : lisaOutput ? (
                      <div className="markdown-body text-zinc-300">
                        <ReactMarkdown>{lisaOutput}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="text-zinc-650 italic">Fai una domanda o chiedi un'analisi a sinistra per stimolare Lisa.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: GLOBAL CONFIGURATIONS */}
          {activeTab === 'settings' && (
            <div className="p-8 max-w-xl mx-auto space-y-6">
              <div className="border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-display font-bold text-white">Canali Social & collegamenti esterni</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Configura gli account che compariranno nel footer e nella testata per permettere ai lettori di seguirti facilmente.
                </p>
              </div>

              <div className="space-y-4">
                
                {/* Canva integration link */}
                <div className="space-y-1.5 p-4 bg-cyan-950/5 border border-cyan-800/15 rounded-xl">
                  <label className="text-[11px] font-mono text-cyan-400 font-bold block uppercase flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" />
                    Collegamento PDF intero (Canva / Google Drive)
                  </label>
                  <input 
                    type="url"
                    value={canvaLink}
                    onChange={(e) => setCanvaLink(e.target.value)}
                    placeholder="https://www.canva.com/design/DAF.../view?utm_content=..."
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[9.5px] font-sans text-zinc-500 leading-snug">
                    I lettori avranno a disposizione pulsanti dedicati "Leggi PDF completo" che indirizzano a questo URL, ideale per sfogliare comodamente da qualsiasi dispositivo!
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Configura canali social</span>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Instagram Link</label>
                    <input 
                      type="url"
                      value={socialInsta}
                      onChange={(e) => setSocialInsta(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">TikTok Link</label>
                    <input 
                      type="url"
                      value={socialTok}
                      onChange={(e) => setSocialTok(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block">Facebook Link</label>
                    <input 
                      type="url"
                      value={socialFb}
                      onChange={(e) => setSocialFb(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                    />
                  </div>

                  <div className="space-y-1 pt-3 border-t border-zinc-900">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block flex items-center gap-1">
                      <Lock className="w-3 h-3 text-rose-500" />
                      Codice Accesso Pannello Autore
                    </label>
                    <input 
                      type="text"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                      placeholder="Usa una chiave semplice per entrare"
                    />
                    <p className="text-[9px] font-mono text-zinc-650">Imposta la parola d'ordine che dovrai inserire quando proverai ad accedere come autore dall'esterno (Default: "warp").</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSaveSettings}
                    className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-display font-semibold transition-all shadow-lg"
                  >
                    Salva Configurazione
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </motion.div>

      {/* Character Creator Modal nested */}
      <AnimatePresence>
        {showCharModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl w-full max-w-md shadow-2xl relative"
            >
              <h2 className="text-base font-display font-bold mb-6 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pink-500" />
                Crea Nuovo Personaggio
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5">Nome Personaggio</label>
                  <input 
                    type="text" 
                    value={newChar.name}
                    onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="Es. Heather Planck"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1.5">Tratti, Profilo & Ruolo Quantistico</label>
                  <textarea 
                    value={newChar.description}
                    onChange={(e) => setNewChar({ ...newChar, description: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 h-28 text-xs text-white resize-none focus:outline-none focus:border-pink-500 transition-colors leading-relaxed"
                    placeholder="Es. Possiede un'instabilità quantica che genera scudi d'energia. È guidata da Thorne..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowCharModal(false)}
                    className="flex-1 p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 transition-colors"
                  >
                    Annulla
                  </button>
                  <button 
                    onClick={() => {
                      if (newChar.name.trim()) {
                        setCharacters([...characters, newChar]);
                        setNewChar({ name: '', description: '' });
                        setShowCharModal(false);
                      }
                    }}
                    className="flex-1 p-2.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-colors"
                  >
                    Salva
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
