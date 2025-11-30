
import React, { useState, useRef } from 'react';
import { ResumeData, ExperienceItem } from '../types';
import { generateContent, PROMPTS } from '../services/geminiService';

interface ResumeFormProps {
  data: ResumeData;
  updateData: (data: ResumeData) => void;
}

// --- AI MODAL COMPONENTS ---

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  loading: boolean;
  onGenerate: () => void;
  children: React.ReactNode;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, title, loading, onGenerate, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-scale-up border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
          <span className="material-icons-round text-rose-500">auto_awesome</span> 
          Generate with Nova: {title}
        </h3>
        
        <div className="space-y-4 mb-6">
          {children}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium">Cancel</button>
          <button 
            onClick={onGenerate} 
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-lg hover:shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 font-bold transition-all"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Thinking...
              </>
            ) : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const ResumeForm: React.FC<ResumeFormProps> = ({ data, updateData }) => {
  const [activeSection, setActiveSection] = useState<string>('personal');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Modal States
  const [aiType, setAiType] = useState<'summary' | 'experience' | 'project' | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Temporary states for AI inputs
  const [summaryInputs, setSummaryInputs] = useState({
    role: data.personalInfo.role,
    skills: '',
    level: 'Entry Level (0-1 years)'
  });
  
  const [expInput, setExpInput] = useState('');
  const [projInput, setProjInput] = useState('');

  // Sync skills to summary input on open
  const openSummaryAI = () => {
    const allSkills = [
      ...data.skills.technical, 
      ...data.skills.web, 
      ...data.skills.tools, 
      ...data.skills.soft
    ].join(', ');
    
    setSummaryInputs({
      role: data.personalInfo.role,
      skills: allSkills,
      level: 'Entry Level (0-1 years)'
    });
    setAiType('summary');
  };

  const handleChange = (section: keyof ResumeData, field: string, value: any) => {
    updateData({ ...data, [section]: { ...data[section as keyof ResumeData] as any, [field]: value } });
  };

  const handleSimpleField = (section: keyof ResumeData, value: any) => {
    updateData({ ...data, [section]: value });
  };

  const handleAddItem = <T extends { id: string }>(section: keyof ResumeData, item: T) => {
    updateData({ ...data, [section]: [...(data[section as keyof ResumeData] as any), item] });
  };

  const handleRemoveItem = (section: keyof ResumeData, id: string) => {
    updateData({ ...data, [section]: (data[section as keyof ResumeData] as any[]).filter((i: any) => i.id !== id) });
  };

  const handleUpdateItem = (section: keyof ResumeData, id: string, field: string, value: any) => {
    updateData({
      ...data,
      [section]: (data[section as keyof ResumeData] as any[]).map((i: any) => 
        i.id === id ? { ...i, [field]: value } : i
      )
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('personalInfo', 'profilePic', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- AI HANDLERS ---

  const executeSummaryAI = async () => {
    setAiLoading(true);
    const prompt = PROMPTS.summary(
      summaryInputs.role || 'Professional', 
      summaryInputs.skills || 'General', 
      summaryInputs.level
    );
    const result = await generateContent(prompt);
    setAiLoading(false);
    
    if (result.error) {
      alert(`AI Generation Failed:\n${result.error}`);
    } else {
      updateData({ ...data, summary: result.text });
      setAiType(null);
    }
  };

  const executeExperienceAI = async () => {
    if (!activeId || !expInput) return;
    const exp = data.experience.find(e => e.id === activeId);
    if (!exp) return;
    
    setAiLoading(true);
    const prompt = PROMPTS.experience(exp.role, exp.company, expInput);
    const result = await generateContent(prompt);
    setAiLoading(false);

    if (result.error) {
      alert(`AI Generation Failed:\n${result.error}`);
    } else {
      handleUpdateItem('experience', activeId, 'description', result.text);
      setAiType(null);
      setExpInput('');
    }
  };

  const executeProjectAI = async () => {
    if (!activeId || !projInput) return;
    const proj = data.projects.find(p => p.id === activeId);
    if (!proj) return;

    setAiLoading(true);
    const prompt = PROMPTS.project(proj.title, proj.technologies, projInput);
    const result = await generateContent(prompt);
    setAiLoading(false);

    if (result.error) {
      alert(`AI Generation Failed:\n${result.error}`);
    } else {
      handleUpdateItem('projects', activeId, 'description', result.text);
      setAiType(null);
      setProjInput('');
    }
  };

  // --- SKILLS HANDLERS ---
  const [skillInputs, setSkillInputs] = useState({ technical: '', web: '', tools: '', soft: '' });
  const [languageInput, setLanguageInput] = useState('');

  const addSkill = (category: keyof typeof data.skills) => {
    const val = skillInputs[category].trim();
    if (val) {
      updateData({
        ...data,
        skills: { ...data.skills, [category]: [...data.skills[category], val] }
      });
      setSkillInputs({ ...skillInputs, [category]: '' });
    }
  };

  const removeSkill = (category: keyof typeof data.skills, idx: number) => {
    updateData({
      ...data,
      skills: { ...data.skills, [category]: data.skills[category].filter((_, i) => i !== idx) }
    });
  };

  const addLanguage = () => {
    const val = languageInput.trim();
    if (val) {
      updateData({
        ...data,
        languages: [...data.languages, val]
      });
      setLanguageInput('');
    }
  };

  const removeLanguage = (idx: number) => {
    updateData({
      ...data,
      languages: data.languages.filter((_, i) => i !== idx)
    });
  };

  const sections = [
    { id: 'personal', label: 'Personal', icon: 'person' },
    { id: 'skills', label: 'Skills', icon: 'psychology' },
    { id: 'summary', label: 'Summary', icon: 'description' },
    { id: 'experience', label: 'Experience', icon: 'work' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'projects', label: 'Projects', icon: 'code' },
    { id: 'certificates', label: 'Certifications', icon: 'verified' },
    { id: 'languages', label: 'Languages', icon: 'translate' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl h-full flex flex-col border border-slate-200 dark:border-slate-800 transition-colors">
      
      {/* Navigation */}
      <div className="flex overflow-x-auto p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 gap-2 hide-scrollbar shrink-0">
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              activeSection === sec.id 
              ? 'bg-rose-500 text-white shadow-md' 
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-icons-round text-lg">{sec.icon}</span>
            {sec.label}
          </button>
        ))}
      </div>

      {/* Form Area */}
      <div className="p-4 lg:p-6 overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Personal Info */}
        {activeSection === 'personal' && (
          <div className="space-y-6 animate-fade-in">
            <SectionTitle title="Personal Information" />
            
            {/* Profile Picture Upload */}
            <div className="flex items-center gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <div 
                className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-300 dark:border-slate-600 cursor-pointer hover:border-rose-500 transition-colors shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {data.personalInfo.profilePic ? (
                  <img src={data.personalInfo.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-icons-round text-slate-400 text-3xl">add_a_photo</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Profile Picture (Optional)</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded transition-colors font-semibold"
                  >
                    Choose Image
                  </button>
                  {data.personalInfo.profilePic && (
                    <button 
                      onClick={() => handleChange('personalInfo', 'profilePic', '')}
                      className="text-xs text-red-500 hover:text-red-600 px-2 py-1.5 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Full Name" value={data.personalInfo.fullName} onChange={(v) => handleChange('personalInfo', 'fullName', v)} placeholder="Name" />
              <Input label="Target Role" value={data.personalInfo.role} onChange={(v) => handleChange('personalInfo', 'role', v)} placeholder="Software Developer" />
              <Input label="Email" value={data.personalInfo.email} onChange={(v) => handleChange('personalInfo', 'email', v)} placeholder="jane@example.com" />
              <Input label="Phone" value={data.personalInfo.phone} onChange={(v) => handleChange('personalInfo', 'phone', v)} placeholder="+91"/>
              <Input label="Location" value={data.personalInfo.location} onChange={(v) => handleChange('personalInfo', 'location', v)} placeholder="Chennai" />
              <Input label="LinkedIn" value={data.personalInfo.linkedin} onChange={(v) => handleChange('personalInfo', 'linkedin', v)} placeholder="linkedin.com/in/janedoe" />
              <div className="col-span-1 md:col-span-2">
                 <Input label="Portfolio / Website" value={data.personalInfo.portfolio} onChange={(v) => handleChange('personalInfo', 'portfolio', v)} placeholder="janedoe.com" />
              </div>
            </div>
          </div>
        )}

        {/* Skills - Categorized */}
        {activeSection === 'skills' && (
          <div className="space-y-6 animate-fade-in">
            <SectionTitle title="Core Competencies" />
            <SkillGroup 
              title="Technical Skills (Hard Skills)" 
              value={skillInputs.technical} 
              onChange={(v) => setSkillInputs({...skillInputs, technical: v})} 
              onAdd={() => addSkill('technical')}
              items={data.skills.technical}
              onRemove={(i) => removeSkill('technical', i)}
              placeholder="Java, Python, C++"
            />
            <SkillGroup 
              title="Web Technologies" 
              value={skillInputs.web} 
              onChange={(v) => setSkillInputs({...skillInputs, web: v})} 
              onAdd={() => addSkill('web')}
              items={data.skills.web}
              onRemove={(i) => removeSkill('web', i)}
              placeholder="React, Tailwind, Node.js"
            />
            <SkillGroup 
              title="Tools & Platforms" 
              value={skillInputs.tools} 
              onChange={(v) => setSkillInputs({...skillInputs, tools: v})} 
              onAdd={() => addSkill('tools')}
              items={data.skills.tools}
              onRemove={(i) => removeSkill('tools', i)}
              placeholder="Git, Docker, AWS, Jira"
            />
             <SkillGroup 
              title="Soft Skills" 
              value={skillInputs.soft} 
              onChange={(v) => setSkillInputs({...skillInputs, soft: v})} 
              onAdd={() => addSkill('soft')}
              items={data.skills.soft}
              onRemove={(i) => removeSkill('soft', i)}
              placeholder="Leadership, Agile, Communication"
            />
          </div>
        )}

        {/* Summary */}
        {activeSection === 'summary' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <SectionTitle title="Professional Summary" />
              <button 
                onClick={openSummaryAI}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors text-xs font-bold border border-rose-100 dark:border-rose-800 uppercase tracking-wide"
              >
                <span className="material-icons-round text-sm">auto_awesome</span> Generate with Nova
              </button>
            </div>
            <textarea
              className="w-full h-48 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-rose-500 outline-none transition-all resize-none text-sm leading-relaxed text-slate-700 dark:text-slate-200 shadow-sm"
              placeholder="Write a compelling summary or use AI to generate one..."
              value={data.summary}
              onChange={(e) => handleSimpleField('summary', e.target.value)}
            />
          </div>
        )}

        {/* Experience */}
        {activeSection === 'experience' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
              <SectionTitle title="Work Experience" />
            </div>
            
            <button 
                onClick={() => handleAddItem('experience', {
                  id: Date.now().toString(),
                  company: '', role: '', startDate: '', endDate: '', description: '', current: false
                })}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 mb-2 border border-dashed border-slate-300 dark:border-slate-600"
              >
                <span className="material-icons-round text-xl">add</span> <span className="uppercase tracking-wide text-xs">Add Experience</span>
            </button>

            {data.experience.length === 0 && (
              <p className="text-sm text-slate-500 italic text-center p-4">No experience added. This section will be hidden on your resume.</p>
            )}

            {data.experience.map((exp) => (
              <div key={exp.id} className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 relative group transition-all">
                <button onClick={() => handleRemoveItem('experience', exp.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1">
                  <span className="material-icons-round">delete</span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input label="Company" value={exp.company} onChange={(v) => handleUpdateItem('experience', exp.id, 'company', v)} />
                  <Input label="Job Title" value={exp.role} onChange={(v) => handleUpdateItem('experience', exp.id, 'role', v)} />
                  <Input label="Start Date" value={exp.startDate} onChange={(v) => handleUpdateItem('experience', exp.id, 'startDate', v)} placeholder="MM/YYYY" />
                  
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                    <div className="flex items-center gap-2 h-[42px]">
                       {!exp.current && (
                         <input 
                           type="text"
                           className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-sm outline-none focus:border-rose-500 dark:text-white"
                           value={exp.endDate}
                           onChange={(e) => handleUpdateItem('experience', exp.id, 'endDate', e.target.value)}
                           placeholder="MM/YYYY"
                         />
                       )}
                       {exp.current && <span className="flex-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 px-2 bg-emerald-50 dark:bg-emerald-900/30 py-2 rounded flex items-center justify-center border border-emerald-100 dark:border-emerald-900">Present</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    id={`curr-${exp.id}`}
                    checked={exp.current}
                    onChange={(e) => handleUpdateItem('experience', exp.id, 'current', e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 accent-rose-500"
                  />
                  <label htmlFor={`curr-${exp.id}`} className="text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer">I currently work here</label>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                    <button 
                      onClick={() => {
                        setAiType('experience');
                        setActiveId(exp.id);
                        setExpInput('');
                      }}
                      className="text-xs flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wide"
                    >
                      <span className="material-icons-round text-sm">auto_awesome</span> Generate with Nova
                    </button>
                  </div>
                  <textarea 
                    className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg text-sm h-32 focus:border-rose-500 outline-none bg-white dark:bg-slate-800 dark:text-slate-200 resize-none" 
                    value={exp.description}
                    onChange={(e) => handleUpdateItem('experience', exp.id, 'description', e.target.value)}
                    placeholder="• Achieved X by doing Y..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {activeSection === 'education' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
              <SectionTitle title="Education" />
            </div>
            
            <button 
                onClick={() => handleAddItem('education', {
                  id: Date.now().toString(),
                  institution: '', degree: '', year: '', score: ''
                })}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 mb-2 border border-dashed border-slate-300 dark:border-slate-600"
              >
                <span className="material-icons-round text-xl">add</span> <span className="uppercase tracking-wide text-xs">Add Education</span>
            </button>

            {data.education.map((edu) => (
              <div key={edu.id} className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 relative group">
                <button onClick={() => handleRemoveItem('education', edu.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1">
                  <span className="material-icons-round">delete</span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="School / University" value={edu.institution} onChange={(v) => handleUpdateItem('education', edu.id, 'institution', v)} />
                  <Input label="Degree / Course" value={edu.degree} onChange={(v) => handleUpdateItem('education', edu.id, 'degree', v)} />
                  <Input label="Graduation Year" value={edu.year} onChange={(v) => handleUpdateItem('education', edu.id, 'year', v)} />
                  <Input label="Grade / GPA (Optional)" value={edu.score} onChange={(v) => handleUpdateItem('education', edu.id, 'score', v)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {activeSection === 'projects' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
              <SectionTitle title="Notable Projects" />
            </div>

            <button 
                onClick={() => handleAddItem('projects', {
                  id: Date.now().toString(),
                  title: '', description: '', technologies: '', link: ''
                })}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 mb-2 border border-dashed border-slate-300 dark:border-slate-600"
              >
                <span className="material-icons-round text-xl">add</span> <span className="uppercase tracking-wide text-xs">Add Project</span>
            </button>

            {data.projects.map((proj) => (
              <div key={proj.id} className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 relative group">
                <button onClick={() => handleRemoveItem('projects', proj.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1">
                  <span className="material-icons-round">delete</span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <Input label="Project Title" value={proj.title} onChange={(v) => handleUpdateItem('projects', proj.id, 'title', v)} />
                  <Input label="Technologies Used" value={proj.technologies} onChange={(v) => handleUpdateItem('projects', proj.id, 'technologies', v)} placeholder="React, Firebase..." />
                  <div className="col-span-1 md:col-span-2">
                    <Input label="Project Link" value={proj.link} onChange={(v) => handleUpdateItem('projects', proj.id, 'link', v)} />
                  </div>
                </div>
                 <div className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                    <button 
                      onClick={() => {
                        setAiType('project');
                        setActiveId(proj.id);
                        setProjInput('');
                      }}
                      className="text-xs flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wide"
                    >
                      <span className="material-icons-round text-sm">auto_awesome</span> Generate with Nova
                    </button>
                  </div>
                  <textarea 
                    className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg text-sm h-24 focus:border-rose-500 outline-none bg-white dark:bg-slate-800 dark:text-slate-200 resize-none" 
                    value={proj.description}
                    onChange={(e) => handleUpdateItem('projects', proj.id, 'description', e.target.value)}
                    placeholder="Briefly describe what you built..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificates */}
        {activeSection === 'certificates' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
              <SectionTitle title="Certifications" />
            </div>

            <button 
                onClick={() => handleAddItem('certificates', {
                  id: Date.now().toString(),
                  title: '', issuer: '', date: '', link: ''
                })}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 mb-2 border border-dashed border-slate-300 dark:border-slate-600"
              >
                <span className="material-icons-round text-xl">add</span> <span className="uppercase tracking-wide text-xs">Add Certificate</span>
            </button>

            {data.certificates.map((cert) => (
              <div key={cert.id} className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 relative group">
                <button onClick={() => handleRemoveItem('certificates', cert.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1">
                  <span className="material-icons-round">delete</span>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Certificate Name" value={cert.title} onChange={(v) => handleUpdateItem('certificates', cert.id, 'title', v)} />
                  <Input label="Issuing Organization" value={cert.issuer} onChange={(v) => handleUpdateItem('certificates', cert.id, 'issuer', v)} />
                  <Input label="Date Earned" value={cert.date} onChange={(v) => handleUpdateItem('certificates', cert.id, 'date', v)} />
                  <Input label="Credential URL" value={cert.link} onChange={(v) => handleUpdateItem('certificates', cert.id, 'link', v)} />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Languages */}
        {activeSection === 'languages' && (
          <div className="space-y-6 animate-fade-in">
            <SectionTitle title="Languages" />
            <SkillGroup 
              title="Languages Known" 
              value={languageInput} 
              onChange={(v: string) => setLanguageInput(v)} 
              onAdd={addLanguage}
              items={data.languages}
              onRemove={(i: number) => removeLanguage(i)}
              placeholder="English, Spanish, French..."
            />
          </div>
        )}

      </div>

      {/* --- AI MODALS --- */}

      {/* SUMMARY MODAL */}
      <AIModal 
        isOpen={aiType === 'summary'}
        onClose={() => setAiType(null)}
        title="Professional Summary"
        loading={aiLoading}
        onGenerate={executeSummaryAI}
      >
        <div className="space-y-4">
           <Input 
             label="Target Role Title" 
             value={summaryInputs.role} 
             onChange={(v) => setSummaryInputs({...summaryInputs, role: v})}
             placeholder="e.g. Senior Product Manager" 
            />
           
           <div className="flex flex-col gap-1.5">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Skills to Highlight</label>
             <textarea 
               className="p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-rose-500 outline-none h-20 resize-none dark:text-white"
               value={summaryInputs.skills}
               onChange={(e) => setSummaryInputs({...summaryInputs, skills: e.target.value})}
               placeholder="React, Leadership, Agile..."
             />
           </div>

           <div className="flex flex-col gap-1.5">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Experience Level</label>
             <select 
               className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-rose-500 outline-none dark:text-white"
               value={summaryInputs.level}
               onChange={(e) => setSummaryInputs({...summaryInputs, level: e.target.value})}
             >
               <option>Entry Level (0-1 years)</option>
               <option>Mid Level (2-5 years)</option>
               <option>Senior Level (5+ years)</option>
               <option>Executive / Director</option>
             </select>
           </div>
        </div>
      </AIModal>

      {/* EXPERIENCE MODAL */}
      <AIModal 
        isOpen={aiType === 'experience'}
        onClose={() => setAiType(null)}
        title="Experience Description"
        loading={aiLoading}
        onGenerate={executeExperienceAI}
      >
        <div className="flex flex-col gap-2">
           <label className="text-sm text-slate-600 dark:text-slate-300 font-medium">What were your main responsibilities or achievements? (Rough notes are fine)</label>
           <textarea 
             className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-rose-500 dark:text-white resize-none"
             placeholder="e.g. Managed a team of 5, increased sales by 20%, used React for the dashboard..."
             value={expInput}
             onChange={(e) => setExpInput(e.target.value)}
           />
        </div>
      </AIModal>

      {/* PROJECT MODAL */}
      <AIModal 
        isOpen={aiType === 'project'}
        onClose={() => setAiType(null)}
        title="Project Description"
        loading={aiLoading}
        onGenerate={executeProjectAI}
      >
        <div className="flex flex-col gap-2">
           <label className="text-sm text-slate-600 dark:text-slate-300 font-medium">What problem did you solve and what features did you build?</label>
           <textarea 
             className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-rose-500 dark:text-white resize-none"
             placeholder="e.g. Built a real-time chat app using Firebase and Socket.io..."
             value={projInput}
             onChange={(e) => setProjInput(e.target.value)}
           />
        </div>
      </AIModal>

    </div>
  );
};

// --- SUB-COMPONENTS ---

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">{title}</h2>
);

const Input = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
    <input 
      type="text" 
      className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all dark:text-white placeholder:text-slate-400"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const SkillGroup = ({ title, value, onChange, onAdd, items, onRemove, placeholder }: any) => (
  <div className="mb-4">
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">{title}</label>
    <div className="flex gap-2 mb-2">
      <input 
        type="text" 
        className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-rose-500 dark:text-white"
        placeholder={placeholder}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        onKeyDown={(e: any) => e.key === 'Enter' && onAdd()}
      />
      <button onClick={onAdd} className="bg-slate-800 dark:bg-slate-700 text-white px-4 rounded-lg hover:opacity-90 text-sm transition-colors font-medium">Add</button>
    </div>
    <div className="flex flex-wrap gap-2">
      {items.map((skill: string, idx: number) => (
        <span key={idx} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 border border-slate-200 dark:border-slate-600">
          {skill}
          <button onClick={() => onRemove(idx)} className="hover:text-red-500 flex items-center">
            <span className="material-icons-round text-sm">close</span>
          </button>
        </span>
      ))}
    </div>
  </div>
);

export default ResumeForm;
