
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onOpenSidebar: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onOpenSidebar, darkMode, toggleDarkMode }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex flex-col items-center relative overflow-x-hidden transition-colors duration-500 text-center px-4">
      
      {/* Hamburger Menu (Top Left) */}
      <button 
        onClick={onOpenSidebar}
        className="absolute top-6 left-6 z-30 p-3 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-white/20 transition-all shadow-lg group"
      >
        <span className="material-icons-round text-3xl text-slate-800 dark:text-white group-hover:scale-110 transition-transform">menu</span>
      </button>

      {/* Dark Mode Toggle (Top Right) */}
      <button 
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 z-30 p-3 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl hover:bg-white dark:hover:bg-white/20 transition-all shadow-lg group"
      >
        <span className="material-icons-round text-3xl text-slate-800 dark:text-white group-hover:rotate-12 transition-transform">
          {darkMode ? 'light_mode' : 'dark_mode'}
        </span>
      </button>

      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto relative z-10 py-20 animate-fade-in">
        
        {/* NEW LOGO: Abstract Tech Neural Network */}
        <div className="mb-8 relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-blue-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
           
           {/* Attempt to load 'logo.png', fallback to SVG if missing */}
           <div className="w-48 h-48 relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
             <img 
               src="logo.png" 
               alt="NOVA Logo" 
               className="w-full h-full object-contain hidden" 
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
               }}
               onLoad={(e) => e.currentTarget.classList.remove('hidden')}
             />
             
             {/* FALLBACK SVG LOGO */}
             <svg className="w-full h-full hidden" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                   <linearGradient id="mainLogoGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                     <stop offset="0%" stopColor="#e11d48" /> {/* Rose */}
                     <stop offset="100%" stopColor="#2563eb" /> {/* Blue */}
                   </linearGradient>
                </defs>
                
                {/* Hexagon Border */}
                <path d="M100 20 L 170 60 L 170 140 L 100 180 L 30 140 L 30 60 Z" stroke="url(#mainLogoGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" className="animate-[pulse_4s_ease-in-out_infinite]" />
                
                {/* Circuit Lines forming an abstract 'N' */}
                <path d="M65 140 L 65 60 L 135 140 L 135 60" stroke="url(#mainLogoGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Tech Nodes */}
                <circle cx="65" cy="60" r="6" fill="#e11d48" />
                <circle cx="135" cy="140" r="6" fill="#2563eb" />
                <circle cx="65" cy="140" r="4" fill="#e11d48" opacity="0.6" />
                <circle cx="135" cy="60" r="4" fill="#2563eb" opacity="0.6" />

                {/* Connecting Data Lines */}
                <path d="M65 100 L 100 100 L 135 100" stroke="url(#mainLogoGrad)" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
                <circle cx="100" cy="100" r="4" fill="white" className="animate-ping dark:fill-white" />
             </svg>
           </div>
        </div>

        {/* Headlines */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight uppercase">
          Build your resume with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-500">NOVA</span> <br/>

          <span className="text-4xl md:text-6xl lg:text-7xl font-sans font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight uppercase">in minutes</span>

        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium text-slate-600 dark:text-slate-300 mb-8 max-w-3xl">
          <span className="bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-300 px-3 py-1 rounded-full text-sm font-bold tracking-wider mb-4 inline-block border border-lime-200 dark:border-lime-800


">
             100% ATS FRIENDLY
          </span>
          <br />
          "The ultimate AI architect for your professional future, blending precision with luxury."
        </h2>

        {/* CTA Button */}
        <button 
          onClick={onStart}
          className="group relative px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-xl tracking-wide shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span className="flex items-center gap-3">
            INITIALIZE NOVA 
            <span className="material-icons-round group-hover:translate-x-1 transition-transform">rocket_launch</span>
          </span>
        </button>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full max-w-3xl">
           <FeatureCard icon="psychology" title="Human & AI" desc="Perfect balance of organic flow and structured data." />
           <FeatureCard icon="hub" title="Smart Analysis" desc="NOVA analyzes your skills to suggest the best roles." />
           <FeatureCard icon="download_for_offline" title="Instant Deploy" desc="Export to PDF, Word, or JPG instantly." />
        </div>

      </div>
      
      {/* Footer - Static Position with top margin to avoid overlap */}
      <footer className="w-full text-center py-6 mt-16 text-slate-400 text-xs uppercase tracking-widest border-t border-transparent relative z-10">
        © 2025 by Sudhakar
      </footer>

    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="p-6 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
    <span className="material-icons-round text-3xl mb-3 text-rose-500">{icon}</span>
    <h3 className="font-bold text-slate-800 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
