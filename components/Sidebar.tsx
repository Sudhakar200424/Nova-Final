
import React, { useRef, useState } from 'react';
import { AppView, ConverterToolId, ResumeData } from '../types';
import { generateContent, PROMPTS } from '../services/geminiService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView, toolId?: ConverterToolId) => void;
  onImportResume: (data: ResumeData) => void;
  activeView: AppView;
  activeTool?: ConverterToolId;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, onImportResume, activeView, activeTool }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const tools: { id: ConverterToolId; label: string; icon: string }[] = [
    { id: 'jpg-to-pdf', label: 'JPG to PDF', icon: 'picture_as_pdf' },
    { id: 'pdf-to-jpg', label: 'PDF to JPG', icon: 'collections' },
  ];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    if (!window.pdfjsLib) throw new Error("PDF Library not loaded");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";
    
    // Limit to first 3 pages to avoid token limits and slowness
    const maxPages = Math.min(pdf.numPages, 3);
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `\n${pageText}`;
    }
    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // 1. Extract Text
      const text = await extractTextFromPDF(file);
      
      // 2. Call AI
      const prompt = PROMPTS.parseResume(text);
      const result = await generateContent(prompt);

      if (result.error) {
        throw new Error(result.error);
      }

      // 3. Parse JSON (Handle potential markdown wrapping)
      let jsonString = result.text.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```/, '').replace(/```$/, '');
      }

      const parsedData = JSON.parse(jsonString);

      // 4. Sanitize and ID generation
      const finalData: ResumeData = {
        personalInfo: {
          fullName: parsedData.personalInfo?.fullName || '',
          email: parsedData.personalInfo?.email || '',
          phone: parsedData.personalInfo?.phone || '',
          linkedin: parsedData.personalInfo?.linkedin || '',
          portfolio: parsedData.personalInfo?.portfolio || '',
          role: parsedData.personalInfo?.role || '',
          location: parsedData.personalInfo?.location || '',
          profilePic: '' // Can't extract image easily via text parser
        },
        summary: parsedData.summary || '',
        skills: {
          technical: Array.isArray(parsedData.skills?.technical) ? parsedData.skills.technical : [],
          web: Array.isArray(parsedData.skills?.web) ? parsedData.skills.web : [],
          tools: Array.isArray(parsedData.skills?.tools) ? parsedData.skills.tools : [],
          soft: Array.isArray(parsedData.skills?.soft) ? parsedData.skills.soft : [],
        },
        experience: Array.isArray(parsedData.experience) ? parsedData.experience.map((item: any, idx: number) => ({
          ...item,
          id: Date.now() + idx + 'exp',
          current: !!item.current
        })) : [],
        education: Array.isArray(parsedData.education) ? parsedData.education.map((item: any, idx: number) => ({
          ...item,
          id: Date.now() + idx + 'edu'
        })) : [],
        projects: Array.isArray(parsedData.projects) ? parsedData.projects.map((item: any, idx: number) => ({
          ...item,
          id: Date.now() + idx + 'proj'
        })) : [],
        certificates: Array.isArray(parsedData.certificates) ? parsedData.certificates.map((item: any, idx: number) => ({
          ...item,
          id: Date.now() + idx + 'cert'
        })) : [],
        languages: Array.isArray(parsedData.languages) ? parsedData.languages : []
      };

      onImportResume(finalData);
      onClose(); // Close sidebar
      
    } catch (err: any) {
      console.error(err);
      alert(`Import Failed: ${err.message || "Could not parse resume"}. Please try again or fill manually.`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-[80vw] sm:w-80 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
             {/* Tech SVG Logo Small */}
             <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
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
                     <linearGradient id="sidebarGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                       <stop offset="0%" stopColor="#e11d48" />
                       <stop offset="100%" stopColor="#2563eb" />
                     </linearGradient>
                  </defs>
                  <path d="M100 20 L 170 60 L 170 140 L 100 180 L 30 140 L 30 60 Z" stroke="url(#sidebarGrad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M65 140 L 65 60 L 135 140 L 135 60" stroke="url(#sidebarGrad)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
             </div>
             <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white truncate">NOVA</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0">
            <span className="material-icons-round text-slate-500 dark:text-slate-400">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Main</h3>
            <button 
              onClick={() => onNavigate('landing')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-2 ${activeView === 'landing' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <span className="material-icons-round shrink-0">home</span> 
              <span className="whitespace-nowrap">Home</span>
            </button>
            <button 
              onClick={() => onNavigate('builder')}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'builder' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <span className="material-icons-round shrink-0">edit</span> 
              <span className="whitespace-nowrap truncate">Resume Builder</span>
            </button>
            
            {/* IMPORT SECTION */}
            <div className="px-2 mt-4 mb-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf" 
                className="hidden" 
              />
              <button 
                onClick={handleImportClick}
                disabled={isImporting}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all group"
              >
                 <div className="flex items-center gap-3">
                   {isImporting ? (
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : (
                     <span className="material-icons-round text-rose-400">upload_file</span>
                   )}
                   <div className="text-left">
                     <div className="text-sm font-bold">Import Resume</div>
                     <div className="text-[10px] text-slate-300">Parse PDF with AI</div>
                   </div>
                 </div>
                 {!isImporting && <span className="material-icons-round text-slate-400 group-hover:text-white transition-colors">arrow_forward</span>}
              </button>
            </div>

          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">PDF Tools</h3>
            <div className="space-y-1">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => onNavigate('converter', tool.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'converter' && activeTool === tool.id ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className="material-icons-round text-lg shrink-0">{tool.icon}</span> 
                  <span className="whitespace-nowrap truncate">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <p className="text-xs text-center text-slate-400">© 2025 by Sudhakar</p>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
