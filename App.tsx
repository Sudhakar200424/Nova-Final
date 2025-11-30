
import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_RESUME_DATA, TEMPLATES, FONTS, COLORS } from './constants';
import { ResumeData, TemplateId, FontId, ColorTheme, AppView, ConverterToolId } from './types';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Converter from './components/Converter';

declare global {
  interface Window {
    html2canvas: any;
    html2pdf: any;
  }
}

const App = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [activeTool, setActiveTool] = useState<ConverterToolId | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resume State
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>('simple');
  const [activeFont, setActiveFont] = useState<FontId>('Inter');
  const [activeColor, setActiveColor] = useState<ColorTheme>('navy');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [darkMode, setDarkMode] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nova_resume_data_v3');
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) { console.error('Failed to load resume data', e); }
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nova_resume_data_v3', JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Dynamic Scaling Logic for Responsiveness
  useEffect(() => {
    const calculateScale = () => {
      if (!previewContainerRef.current) return;
      
      const containerWidth = previewContainerRef.current.offsetWidth;
      const a4WidthPx = 794; // 210mm at 96dpi roughly
      const padding = 32; // spacing around
      
      // Calculate scale to fit width
      let newScale = (containerWidth - padding) / a4WidthPx;
      
      // Cap the scale logic
      if (newScale > 1) newScale = 1; // Don't zoom in past 100%
      if (newScale < 0.25) newScale = 0.25; // Min readable
      
      setPreviewScale(newScale);
    };

    // Recalculate on resize
    window.addEventListener('resize', calculateScale);
    calculateScale();
    
    // Use ResizeObserver for more robust element tracking
    const observer = new ResizeObserver(calculateScale);
    if (previewContainerRef.current) {
      observer.observe(previewContainerRef.current);
    }

    const timeout = setTimeout(calculateScale, 100);

    return () => {
      window.removeEventListener('resize', calculateScale);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [viewMode, currentView]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    
    if (!window.html2pdf) {
      alert('PDF generation library is loading. Please try again in a moment.');
      return;
    }

    const originalTransform = element.style.transform;
    const originalMargin = element.style.marginBottom;
    const originalMinHeight = element.style.minHeight;
    const originalHeight = element.style.height;
    
    element.style.transform = 'none';
    element.style.marginBottom = '0';
    element.style.minHeight = '0';
    element.style.height = 'auto'; // Shrink to fit content exactly
    
    const opt = {
      margin: 0, 
      filename: `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0, 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await window.html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF. Please try checking your browser settings.');
    } finally {
      element.style.transform = originalTransform;
      element.style.marginBottom = originalMargin;
      element.style.minHeight = originalMinHeight;
      element.style.height = originalHeight;
    }
  };

  const handleDownloadImage = async () => {
    if (!window.html2canvas) return alert('Library loading...');
    const element = document.getElementById('resume-preview');
    if (!element) return;
    
    const originalTransform = element.style.transform;
    const originalMargin = element.style.marginBottom;
    element.style.transform = 'none';
    element.style.marginBottom = '0';
    
    try {
      const canvas = await window.html2canvas(element, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } finally {
      element.style.transform = originalTransform;
      element.style.marginBottom = originalMargin;
    }
  };

  const handleDownloadWord = () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${resumeData.personalInfo.fullName} Resume</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
            mso-page-orientation: portrait;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
          }
          table { width: 100%; border-collapse: collapse; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navigateTo = (view: AppView, tool?: ConverterToolId) => {
    setCurrentView(view);
    if (tool) setActiveTool(tool);
    setSidebarOpen(false);
  };

  const handleImportResume = (data: ResumeData) => {
    setResumeData(data);
    setCurrentView('builder');
    setSidebarOpen(false);
  };

  // --- NEW TECH LOGO (Internal Component) ---
  const NovaLogo = ({ className }: { className?: string }) => {
    // We try to use an img tag for logo.png first, fallback to SVG
    return (
      <div className={`${className} relative flex items-center justify-center`}>
        <img 
          src="logo.png" 
          className="w-full h-full object-contain hidden" 
          alt="NOVA"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
          onLoad={(e) => e.currentTarget.classList.remove('hidden')}
        />
        <svg className="w-full h-full hidden" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
           <defs>
              <linearGradient id="headerGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
           </defs>
           <path d="M100 20 L 170 60 L 170 140 L 100 180 L 30 140 L 30 60 Z" stroke="url(#headerGrad)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
           <path d="M65 140 L 65 60 L 135 140 L 135 60" stroke="url(#headerGrad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  };

  // --- RENDERING VIEWS ---

  if (currentView === 'landing') {
    return (
      <>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onNavigate={navigateTo} 
          onImportResume={handleImportResume}
          activeView="landing" 
        />
        <LandingPage 
          onStart={() => setCurrentView('builder')} 
          onOpenSidebar={() => setSidebarOpen(true)} 
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
        />
      </>
    );
  }

  if (currentView === 'converter') {
    return (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#050505] transition-colors">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onNavigate={navigateTo} 
          onImportResume={handleImportResume}
          activeView="converter"
          activeTool={activeTool}
        />
        
        {/* Converter Header */}
        <header className="bg-white/80 dark:bg-black/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center z-30">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span className="material-icons-round text-slate-800 dark:text-white">menu</span>
             </button>
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
               <NovaLogo className="h-10 w-10" />
               <span className="font-bold text-xl text-slate-800 dark:text-white hidden sm:block">NOVA</span>
             </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white">
             <span className="material-icons-round">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </header>

        {/* Converter Body */}
        <main className="flex-1 overflow-auto custom-scrollbar relative">
           {activeTool && <Converter toolId={activeTool} />}
        </main>
      </div>
    );
  }

  // --- BUILDER VIEW ---

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-black transition-colors font-sans animate-fade-in">
      
      <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onNavigate={navigateTo} 
          onImportResume={handleImportResume}
          activeView="builder"
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between px-4 py-2 lg:px-6 z-40 no-print shrink-0 transition-colors shadow-sm gap-2">
        <div className="flex items-center justify-between w-full md:w-auto">
           <div className="flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-2">
                <span className="material-icons-round text-slate-800 dark:text-white">menu</span>
             </button>
             <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
               {/* TECH LOGO */}
               <NovaLogo className="h-10 w-10 md:h-12 md:w-12" />
               <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white font-sans">NOVA</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest hidden sm:block">AI Resume Builder</span>
               </div>
             </div>
           </div>
           
           <div className="flex items-center gap-3 md:hidden">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
              >
                <span className="material-icons-round">{darkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>
           </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
           <div className="flex lg:hidden bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button onClick={() => setViewMode('edit')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-slate-700 shadow text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>Edit</button>
              <button onClick={() => setViewMode('preview')} className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-slate-700 shadow text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>Preview</button>
           </div>

           <button onClick={() => setDarkMode(!darkMode)} className="hidden md:block p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
             <span className="material-icons-round">{darkMode ? 'light_mode' : 'dark_mode'}</span>
           </button>

           <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

           <div className="flex items-center gap-2">
             <button onClick={handleDownloadWord} className="bg-blue-600 text-white p-2 sm:px-4 sm:py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105" title="Download Word">
                <span className="material-icons-round text-lg">description</span> <span className="hidden sm:inline">DOCX</span>
             </button>
             <button onClick={handleDownloadImage} className="bg-emerald-600 text-white p-2 sm:px-4 sm:py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105" title="Download JPG">
                <span className="material-icons-round text-lg">image</span> <span className="hidden sm:inline">JPG</span>
             </button>
             <button onClick={handleDownloadPDF} className="bg-rose-600 text-white p-2 sm:px-4 sm:py-2 rounded-lg text-sm font-bold hover:bg-rose-700 flex items-center gap-2 shadow-lg shadow-rose-500/30 transition-all transform hover:scale-105" title="Save as PDF">
               <span className="material-icons-round text-lg">picture_as_pdf</span> <span className="hidden sm:inline">PDF</span>
             </button>
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative flex">
        <section className={`absolute inset-0 lg:static lg:w-[45%] xl:w-[40%] p-4 lg:p-6 transition-transform duration-300 z-20 no-print bg-slate-50 dark:bg-black overflow-y-auto custom-scrollbar ${viewMode === 'edit' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <ResumeForm data={resumeData} updateData={setResumeData} />
        </section>

        <section ref={previewContainerRef} className={`absolute inset-0 lg:static lg:w-[55%] xl:w-[60%] bg-slate-200 dark:bg-[#111] overflow-hidden transition-transform duration-300 z-10 flex flex-col items-center ${viewMode === 'preview' ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 border-b border-slate-200 dark:border-slate-800 mb-0 flex overflow-x-auto hide-scrollbar gap-4 justify-center items-center no-print shrink-0 z-30">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase hidden sm:block">Template</span>
              <select className="bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer border-b border-transparent focus:border-rose-500 py-1" value={activeTemplate} onChange={(e) => setActiveTemplate(e.target.value as TemplateId)}>
                {TEMPLATES.map(t => <option key={t.id} value={t.id} className="text-slate-800 bg-white dark:bg-slate-800 dark:text-white">{t.name}</option>)}
              </select>
            </div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 shrink-0"></div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase hidden sm:block">Font</span>
              <select className="bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer border-b border-transparent focus:border-rose-500 py-1" value={activeFont} onChange={(e) => setActiveFont(e.target.value as FontId)}>
                {FONTS.map(f => <option key={f.id} value={f.id} className="text-slate-800 bg-white dark:bg-slate-800 dark:text-white">{f.name}</option>)}
              </select>
            </div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 shrink-0"></div>
            <div className="flex items-center gap-2 shrink-0">
              {COLORS.map(c => (
                <button key={c.id} onClick={() => setActiveColor(c.id)} className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${activeColor === c.id ? 'border-slate-800 dark:border-white scale-110 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:scale-110'}`} style={{ background: c.hex }} title={c.name} />
              ))}
            </div>
          </div>
          <div className="flex-1 w-full overflow-auto custom-scrollbar flex justify-center p-4 lg:p-8">
             <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', marginBottom: `${(previewScale * 297)}mm` }} className="shadow-2xl dark:shadow-black/50 bg-white transition-transform duration-100 ease-out h-fit">
                <ResumePreview data={resumeData} templateId={activeTemplate} fontId={activeFont} colorTheme={activeColor} />
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
