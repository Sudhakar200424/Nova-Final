
import React from 'react';
import { ResumeData, TemplateId, FontId, ColorTheme } from '../types';
import { COLORS } from '../constants';

interface ResumePreviewProps {
  data: ResumeData;
  templateId: TemplateId;
  fontId: FontId;
  colorTheme: ColorTheme;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, templateId, fontId, colorTheme }) => {
  const themeColor = COLORS.find(c => c.id === colorTheme);
  const hexColor = themeColor?.hex || '#0f172a';

  // Strict print styles and A4 dimensions
  const containerStyle = {
    fontFamily: `"${fontId}", sans-serif`,
    color: '#000000', // FORCE BLACK TEXT BY DEFAULT
  };

  const hasExperience = data.experience && data.experience.length > 0;
  
  const allSkills = [
    ...data.skills.technical,
    ...data.skills.web,
    ...data.skills.tools,
    ...data.skills.soft
  ];

  // --- SUB-COMPONENTS ---
  
  const ContactLine = ({ centered = false, vertical = false, separator = '•', light = false }) => (
    <div className={`text-sm mt-2 flex flex-wrap ${vertical ? 'flex-col gap-1' : 'gap-x-3 gap-y-1'} ${centered ? 'justify-center' : ''} ${light ? 'text-gray-100' : 'text-gray-700'}`}>
      {data.personalInfo.phone && <span className="flex items-center gap-1"><span>{data.personalInfo.phone}</span></span>}
      {data.personalInfo.phone && data.personalInfo.email && !vertical && <span className={`${light ? 'text-gray-400' : 'text-gray-400'}`}>{separator}</span>}
      {data.personalInfo.email && <span className="flex items-center gap-1"><span>{data.personalInfo.email}</span></span>}
      {data.personalInfo.email && data.personalInfo.location && !vertical && <span className={`${light ? 'text-gray-400' : 'text-gray-400'}`}>{separator}</span>}
      {data.personalInfo.location && <span className="flex items-center gap-1"><span>{data.personalInfo.location}</span></span>}
      {data.personalInfo.linkedin && !vertical && <span className={`${light ? 'text-gray-400' : 'text-gray-400'}`}>{separator}</span>}
      {data.personalInfo.linkedin && <span className="flex items-center gap-1"><span className="underline decoration-gray-400 underline-offset-2">{data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'in/')}</span></span>}
      {data.personalInfo.portfolio && !vertical && <span className={`${light ? 'text-gray-400' : 'text-gray-400'}`}>{separator}</span>}
      {data.personalInfo.portfolio && <span className="flex items-center gap-1"><span className="underline decoration-gray-400 underline-offset-2">{data.personalInfo.portfolio.replace(/^https?:\/\//, '')}</span></span>}
    </div>
  );

  const SkillsSection = ({ simple = false }) => {
    if (simple) {
      if (allSkills.length === 0) return null;
      return (
         <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-300 pb-1" style={{ color: hexColor }}>Skills</h3>
            <p className="text-sm text-gray-800 leading-7">{allSkills.join(' • ')}</p>
         </div>
      );
    }
    return (
       <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-gray-300 pb-1" style={{ color: hexColor }}>Technical Skills</h3>
          <div className="grid grid-cols-1 gap-y-2 text-sm">
             {data.skills.technical.length > 0 && (
               <div className="flex flex-col sm:flex-row"><span className="font-bold w-40 shrink-0 text-gray-900">Languages:</span> <span className="text-gray-700">{data.skills.technical.join(', ')}</span></div>
             )}
             {data.skills.web.length > 0 && (
               <div className="flex flex-col sm:flex-row"><span className="font-bold w-40 shrink-0 text-gray-900">Web Technologies:</span> <span className="text-gray-700">{data.skills.web.join(', ')}</span></div>
             )}
             {data.skills.tools.length > 0 && (
               <div className="flex flex-col sm:flex-row"><span className="font-bold w-40 shrink-0 text-gray-900">Tools & Platforms:</span> <span className="text-gray-700">{data.skills.tools.join(', ')}</span></div>
             )}
             {data.skills.soft.length > 0 && (
               <div className="flex flex-col sm:flex-row"><span className="font-bold w-40 shrink-0 text-gray-900">Soft Skills:</span> <span className="text-gray-700">{data.skills.soft.join(', ')}</span></div>
             )}
          </div>
       </div>
    );
  };
  
  const LanguagesSection = ({ simple = false, vertical = false, title = 'Languages' }) => {
    if (!data.languages || data.languages.length === 0) return null;
    
    if (vertical) {
       return (
          <div className="mb-6">
             <h3 className="font-bold uppercase opacity-80 mb-3 border-b border-white/30 pb-1">{title}</h3>
             <div className="flex flex-wrap gap-2">
                {data.languages.map((lang, i) => (
                  <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">{lang}</span>
                ))}
             </div>
          </div>
       );
    }
    
    return (
       <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-300 pb-1" style={{ color: hexColor }}>{title}</h3>
          {simple ? (
             <p className="text-sm text-gray-800 leading-7">{data.languages.join(' • ')}</p>
          ) : (
             <div className="flex flex-wrap gap-2">
                {data.languages.map((lang, i) => (
                   <span key={i} className="text-sm text-gray-700 bg-gray-50 px-2 py-1 border border-gray-200 rounded">{lang}</span>
                ))}
             </div>
          )}
       </div>
    );
  };

  const ProfileImage = ({ size = 'w-32 h-32', border = true }) => {
    if (!data.personalInfo.profilePic) return null;
    return (
      <img src={data.personalInfo.profilePic} alt="Profile" className={`${size} rounded-full object-cover ${border ? 'border-2 border-gray-100' : ''} shadow-sm mb-4`} />
    );
  };

  // ----------------------------------------------------------------------
  // TEMPLATES
  // ----------------------------------------------------------------------

  // 1. SIMPLE ATS
  const RenderSimple = () => (
    <div className="p-12 h-full flex flex-col text-gray-900 bg-white">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold uppercase text-gray-900 mb-2 tracking-wide" style={{ color: hexColor }}>{data.personalInfo.fullName}</h1>
        <p className="text-lg font-medium text-gray-700">{data.personalInfo.role}</p>
        <ContactLine centered={true} separator="|" />
      </header>

      {data.summary && (
        <section className="mb-6">
          <h3 className="text-sm font-bold uppercase border-b border-gray-900 pb-1 mb-3" style={{ borderColor: hexColor }}>Professional Summary</h3>
          <p className="text-sm leading-7 text-gray-800">{data.summary}</p>
        </section>
      )}

      <SkillsSection simple={true} />
      
      <LanguagesSection simple={true} />

      {hasExperience && (
        <section className="mb-6">
          <h3 className="text-sm font-bold uppercase border-b border-gray-900 pb-1 mb-4" style={{ borderColor: hexColor }}>Work Experience</h3>
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-5 last:mb-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-base text-gray-900">{exp.company}</span>
                <span className="text-sm text-gray-800 font-medium">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div className="text-sm italic text-gray-700 mb-2">{exp.role}</div>
              <p className="text-sm whitespace-pre-line leading-7 text-gray-700 pl-0">{exp.description}</p>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mb-6">
           <h3 className="text-sm font-bold uppercase border-b border-gray-900 pb-1 mb-4" style={{ borderColor: hexColor }}>Education</h3>
           {data.education.map(edu => (
             <div key={edu.id} className="mb-3">
                <div className="flex justify-between font-bold text-sm text-gray-900">
                   <span>{edu.institution}</span>
                   <span>{edu.year}</span>
                </div>
                <div className="text-sm text-gray-800">{edu.degree} {edu.score && `— ${edu.score}`}</div>
             </div>
           ))}
        </section>
      )}
      
      {data.certificates && data.certificates.length > 0 && (
        <section className="mb-6">
           <h3 className="text-sm font-bold uppercase border-b border-gray-900 pb-1 mb-4" style={{ borderColor: hexColor }}>Certifications</h3>
           {data.certificates.map(cert => (
             <div key={cert.id} className="mb-3">
                <div className="flex justify-between font-bold text-sm text-gray-900">
                   <span>{cert.title}</span>
                   <span>{cert.date}</span>
                </div>
                <div className="text-sm text-gray-800">{cert.issuer}</div>
             </div>
           ))}
        </section>
      )}
    </div>
  );

  // 2. PROFESSIONAL
  const RenderProfessional = () => (
    <div className="p-12 h-full flex flex-col text-gray-800 bg-white">
      <header className="flex items-center gap-6 border-b-2 border-gray-800 pb-6 mb-8" style={{ borderColor: hexColor }}>
        {data.personalInfo.profilePic && <div className="shrink-0"><ProfileImage size="w-24 h-24" /></div>}
        <div className="flex-1">
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-1" style={{ color: hexColor }}>{data.personalInfo.fullName}</h1>
          <div className="text-xl font-medium text-gray-600">{data.personalInfo.role}</div>
        </div>
        <div className="text-right">
          <ContactLine vertical={true} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {data.summary && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: hexColor }}>Profile</h3>
            <p className="text-sm text-gray-700 leading-7 border-l-4 border-gray-100 pl-4">{data.summary}</p>
          </section>
        )}

        <SkillsSection simple={false} />

        {hasExperience && (
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 bg-gray-50 p-2 border-l-4" style={{ borderColor: hexColor, color: hexColor }}>Experience</h3>
            {data.experience.map(exp => (
              <div key={exp.id} className="mb-6 pl-2">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-lg text-gray-900">{exp.role}</h4>
                  <span className="text-sm font-medium text-gray-500 font-mono">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-sm font-semibold mb-2" style={{ color: hexColor }}>{exp.company}</div>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-7">{exp.description}</p>
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-2 gap-10">
          <div>
            {data.education.length > 0 && (
              <section>
                 <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b pb-1" style={{ color: hexColor }}>Education</h3>
                 {data.education.map(edu => (
                   <div key={edu.id} className="mb-3">
                      <div className="font-bold text-sm text-gray-900">{edu.institution}</div>
                      <div className="text-sm text-gray-700">{edu.degree}</div>
                      <div className="text-xs text-gray-500 mt-1">{edu.year}</div>
                   </div>
                 ))}
              </section>
            )}
            
            {data.certificates && data.certificates.length > 0 && (
              <section className="mt-6">
                 <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b pb-1" style={{ color: hexColor }}>Certifications</h3>
                 {data.certificates.map(cert => (
                   <div key={cert.id} className="mb-3">
                      <div className="font-bold text-sm text-gray-900">{cert.title}</div>
                      <div className="text-sm text-gray-700">{cert.issuer} - {cert.date}</div>
                   </div>
                 ))}
              </section>
            )}
          </div>
          <div>
             <LanguagesSection title="Languages" />
          </div>
        </div>
      </div>
    </div>
  );

  // 3. CLASSIC
  const RenderClassic = () => (
    <div className="p-12 h-full flex flex-col text-gray-900 bg-white">
      <header className="border-b-2 border-gray-900 pb-5 mb-8 flex justify-between items-end" style={{ borderColor: hexColor }}>
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide mb-2" style={{ color: hexColor }}>{data.personalInfo.fullName}</h1>
          <div className="text-lg font-medium text-gray-700">{data.personalInfo.role}</div>
        </div>
        <div className="text-right text-sm text-gray-600">
           {data.personalInfo.email && <div className="mb-0.5">{data.personalInfo.email}</div>}
           {data.personalInfo.phone && <div className="mb-0.5">{data.personalInfo.phone}</div>}
           {data.personalInfo.linkedin && <div>in/ {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</div>}
        </div>
      </header>

      {data.summary && (
        <section className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-900 border-b border-gray-200">Professional Summary</h3>
          <p className="text-sm text-gray-800 leading-7">{data.summary}</p>
        </section>
      )}

      <SkillsSection simple={false} />

      {hasExperience && (
        <section className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-900 border-b border-gray-200">Experience</h3>
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-6 last:mb-0">
              <div className="flex justify-between items-baseline">
                <h4 className="font-bold text-base text-gray-900">{exp.company}</h4>
                <span className="text-sm font-medium text-gray-900">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <div className="text-sm italic text-gray-700 mb-2">{exp.role}</div>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-7">{exp.description}</p>
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="mb-8">
           <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-900 border-b border-gray-200">Education</h3>
           {data.education.map(edu => (
             <div key={edu.id} className="mb-3">
                <div className="flex justify-between font-bold text-sm text-gray-900">
                   <span>{edu.institution}</span>
                   <span>{edu.year}</span>
                </div>
                <div className="text-sm text-gray-800">{edu.degree} {edu.score && `— ${edu.score}`}</div>
             </div>
           ))}
        </section>
      )}
      
      <div className="grid grid-cols-2 gap-8">
         <LanguagesSection title="Languages" />
         {data.certificates && data.certificates.length > 0 && (
            <section className="mb-8">
               <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-900 border-b border-gray-200">Certifications</h3>
               {data.certificates.map(cert => (
                 <div key={cert.id} className="mb-1">
                    <div className="font-bold text-sm text-gray-900">{cert.title}</div>
                    <div className="text-sm text-gray-800">{cert.issuer}</div>
                 </div>
               ))}
            </section>
         )}
      </div>
    </div>
  );

  // 4. MODERN (Sidebar)
  const RenderModern = () => (
    <div className="h-full flex bg-white text-gray-900">
       {/* Sidebar */}
       <div className="w-[32%] p-8 text-white h-full flex flex-col" style={{ backgroundColor: hexColor }}>
          <div className="mb-8 text-center">
             {data.personalInfo.profilePic && <div className="flex justify-center mb-4"><ProfileImage size="w-28 h-28" border={false} /></div>}
             <h1 className="text-2xl font-bold uppercase leading-tight mb-2 text-white">{data.personalInfo.fullName}</h1>
             <p className="text-sm opacity-90 font-medium">{data.personalInfo.role}</p>
          </div>
          
          <div className="space-y-6 text-sm">
             <div>
                <h3 className="font-bold uppercase opacity-80 mb-3 border-b border-white/30 pb-1">Contact</h3>
                <ContactLine vertical={true} light={true} />
             </div>

             {allSkills.length > 0 && (
               <div>
                  <h3 className="font-bold uppercase opacity-80 mb-3 border-b border-white/30 pb-1">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                     {allSkills.map((skill, i) => (
                       <span key={i} className="bg-white/20 px-2 py-1 rounded text-xs">{skill}</span>
                     ))}
                  </div>
               </div>
             )}
             
             {/* LANGUAGES IN SIDEBAR */}
             <LanguagesSection vertical={true} />

             {data.education.length > 0 && (
                <div>
                   <h3 className="font-bold uppercase opacity-80 mb-3 border-b border-white/30 pb-1">Education</h3>
                   {data.education.map(edu => (
                     <div key={edu.id} className="mb-3 last:mb-0">
                        <div className="font-bold">{edu.institution}</div>
                        <div className="opacity-90 text-xs">{edu.degree}</div>
                        <div className="opacity-70 text-xs">{edu.year}</div>
                     </div>
                   ))}
                </div>
             )}
             
             {data.certificates && data.certificates.length > 0 && (
                <div>
                   <h3 className="font-bold uppercase opacity-80 mb-3 border-b border-white/30 pb-1">Certifications</h3>
                   {data.certificates.map(cert => (
                     <div key={cert.id} className="mb-3 last:mb-0">
                        <div className="font-bold">{cert.title}</div>
                        <div className="opacity-90 text-xs">{cert.issuer}</div>
                     </div>
                   ))}
                </div>
             )}
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 p-8">
          {data.summary && (
             <section className="mb-8">
                <h3 className="text-lg font-bold uppercase mb-4 flex items-center gap-2" style={{ color: hexColor }}>
                   <span className="material-icons-round text-lg">person</span> Professional Profile
                </h3>
                <p className="text-sm leading-7 text-gray-700">{data.summary}</p>
             </section>
          )}

          {hasExperience && (
             <section className="mb-8">
                <h3 className="text-lg font-bold uppercase mb-4 flex items-center gap-2" style={{ color: hexColor }}>
                   <span className="material-icons-round text-lg">work</span> Experience
                </h3>
                {data.experience.map(exp => (
                   <div key={exp.id} className="mb-6 relative pl-4 border-l-2 border-gray-200">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ background: hexColor }}></div>
                      <div className="flex justify-between items-baseline mb-1">
                         <h4 className="font-bold text-base text-gray-900">{exp.role}</h4>
                         <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div className="text-sm font-semibold mb-2" style={{ color: hexColor }}>{exp.company}</div>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-7">{exp.description}</p>
                   </div>
                ))}
             </section>
          )}

          {data.projects.length > 0 && (
             <section>
                <h3 className="text-lg font-bold uppercase mb-4 flex items-center gap-2" style={{ color: hexColor }}>
                   <span className="material-icons-round text-lg">code</span> Projects
                </h3>
                {data.projects.map(proj => (
                   <div key={proj.id} className="mb-4">
                      <div className="font-bold text-sm text-gray-900">{proj.title}</div>
                      <p className="text-sm text-gray-700 leading-relaxed">{proj.description}</p>
                   </div>
                ))}
             </section>
          )}
       </div>
    </div>
  );

  // 5. EXECUTIVE
  const RenderExecutive = () => (
    <div className="h-full flex flex-col bg-white text-gray-900">
       <div className="bg-gray-100 p-10 text-center border-b-4" style={{ borderColor: hexColor }}>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2 tracking-wide">{data.personalInfo.fullName}</h1>
          <p className="text-lg font-medium tracking-widest uppercase text-gray-600">{data.personalInfo.role}</p>
          <div className="mt-4 flex justify-center">
             <ContactLine centered={true} separator="|" />
          </div>
       </div>

       <div className="p-10">
          {data.summary && (
             <div className="mb-8 text-center px-8">
                <p className="text-sm leading-8 text-gray-700 italic font-serif">"{data.summary}"</p>
             </div>
          )}

          <div className="grid grid-cols-1 gap-8">
             <section>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-center" style={{ color: hexColor }}>— Professional Experience —</h3>
                {data.experience.map(exp => (
                   <div key={exp.id} className="mb-8">
                      <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-3">
                         <div>
                            <span className="text-lg font-bold text-gray-900">{exp.company}</span>
                            <span className="mx-2 text-gray-400">/</span>
                            <span className="text-base font-medium text-gray-700">{exp.role}</span>
                         </div>
                         <span className="text-sm font-bold text-gray-500">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-7">{exp.description}</p>
                   </div>
                ))}
             </section>

             <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1">
                   <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-gray-300 pb-2" style={{ color: hexColor }}>Core Skills</h3>
                   <div className="flex flex-wrap gap-2 mb-4">
                      {allSkills.map((s, i) => (
                         <span key={i} className="text-sm text-gray-700 bg-gray-50 px-2 py-1 border border-gray-200 rounded">{s}</span>
                      ))}
                   </div>
                   <LanguagesSection />
                </div>
                <div className="col-span-1">
                   <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-gray-300 pb-2" style={{ color: hexColor }}>Education</h3>
                   {data.education.map(edu => (
                      <div key={edu.id} className="mb-2">
                         <div className="font-bold text-sm">{edu.institution}</div>
                         <div className="text-sm text-gray-600">{edu.degree}</div>
                      </div>
                   ))}
                </div>
                <div className="col-span-1">
                  {data.certificates && data.certificates.length > 0 && (
                    <>
                       <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-gray-300 pb-2" style={{ color: hexColor }}>Certifications</h3>
                       {data.certificates.map(cert => (
                          <div key={cert.id} className="mb-2">
                             <div className="font-bold text-sm">{cert.title}</div>
                             <div className="text-sm text-gray-600">{cert.issuer}</div>
                          </div>
                       ))}
                    </>
                  )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  // 6. MINIMAL
  const RenderMinimal = () => (
     <div className="p-14 h-full flex flex-col bg-white text-gray-900 font-light">
        <header className="mb-10">
           <h1 className="text-4xl font-light text-gray-900 mb-1">{data.personalInfo.fullName}</h1>
           <p className="text-lg text-gray-500 mb-4">{data.personalInfo.role}</p>
           <div className="text-sm text-gray-600 flex gap-4">
              {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
              {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
              {data.personalInfo.linkedin && <span>linkedin.com</span>}
           </div>
        </header>

        <div className="grid grid-cols-[1fr_2.5fr] gap-12">
           <div>
              <section className="mb-8">
                 <h4 className="font-medium text-gray-900 uppercase tracking-widest text-xs mb-4">Education</h4>
                 {data.education.map(edu => (
                    <div key={edu.id} className="mb-4">
                       <div className="text-sm font-medium">{edu.institution}</div>
                       <div className="text-sm text-gray-500">{edu.degree}</div>
                       <div className="text-xs text-gray-400 mt-1">{edu.year}</div>
                    </div>
                 ))}
              </section>

              <section className="mb-8">
                 <h4 className="font-medium text-gray-900 uppercase tracking-widest text-xs mb-4">Expertise</h4>
                 <ul className="text-sm text-gray-600 space-y-1 mb-6">
                    {allSkills.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
                 
                 <LanguagesSection vertical={true} />
              </section>
              
              {data.certificates && data.certificates.length > 0 && (
                <section>
                   <h4 className="font-medium text-gray-900 uppercase tracking-widest text-xs mb-4">Certifications</h4>
                   {data.certificates.map(cert => (
                      <div key={cert.id} className="mb-2">
                         <div className="text-sm font-medium">{cert.title}</div>
                      </div>
                   ))}
                </section>
              )}
           </div>

           <div>
              {data.summary && (
                 <section className="mb-10">
                    <p className="text-sm leading-7 text-gray-600">{data.summary}</p>
                 </section>
              )}

              <section>
                 <h4 className="font-medium text-gray-900 uppercase tracking-widest text-xs mb-6">Experience</h4>
                 {data.experience.map(exp => (
                    <div key={exp.id} className="mb-8 relative">
                       <div className="flex justify-between items-baseline mb-2">
                          <h3 className="font-medium text-gray-900">{exp.role}</h3>
                          <span className="text-xs text-gray-400">{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</span>
                       </div>
                       <div className="text-sm text-gray-500 mb-2 italic">{exp.company}</div>
                       <p className="text-sm text-gray-600 leading-7">{exp.description}</p>
                    </div>
                 ))}
              </section>
           </div>
        </div>
     </div>
  );

  const renderTemplate = () => {
    switch (templateId) {
      case 'simple': return <RenderSimple />;
      case 'professional': return <RenderProfessional />;
      case 'modern': return <RenderModern />;
      case 'executive': return <RenderExecutive />;
      case 'minimal': return <RenderMinimal />;
      case 'classic': 
      default: return <RenderClassic />;
    }
  };

  return (
    <div id="resume-preview" className="a4-preview-container bg-white text-slate-900 relative overflow-hidden" style={containerStyle}>
      {renderTemplate()}
    </div>
  );
};

export default ResumePreview;
