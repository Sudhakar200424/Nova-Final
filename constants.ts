
import { ResumeData, TemplateId, FontId, ColorTheme } from './types';

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    role: '',
    location: '',
    profilePic: ''
  },
  summary: '',
  skills: {
    technical: [],
    web: [],
    tools: [],
    soft: []
  },
  experience: [],
  education: [],
  projects: [],
  certificates: [],
  languages: []
};

export const TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: 'simple', name: 'Simple ATS (Standard)' },
  { id: 'classic', name: 'Classic ATS (Elegant)' },
  { id: 'professional', name: 'Professional ATS (Modern)' },
  { id: 'modern', name: 'Modern (Sidebar)' },
  { id: 'executive', name: 'Executive (Bold)' },
  { id: 'minimal', name: 'Minimal (Clean)' },
];

export const FONTS: { id: FontId; name: string }[] = [
  { id: 'Inter', name: 'Inter (Modern)' },
  { id: 'Roboto', name: 'Roboto (Standard)' },
  { id: 'Open Sans', name: 'Open Sans (Clean)' },
  { id: 'Lato', name: 'Lato (Friendly)' },
  { id: 'Source Sans Pro', name: 'Source Sans (Readable)' },
  { id: 'Merriweather', name: 'Merriweather (Serif)' },
  { id: 'Playfair Display', name: 'Playfair (Luxury)' },
];

export const COLORS: { id: ColorTheme; name: string; class: string; hex: string }[] = [
  { id: 'navy', name: 'Classic Navy', class: 'text-slate-800', hex: '#1e293b' },
  { id: 'black', name: 'Pure Black', class: 'text-black', hex: '#000000' },
  { id: 'blue', name: 'Corporate Blue', class: 'text-blue-800', hex: '#1e40af' },
  { id: 'green', name: 'Emerald', class: 'text-emerald-800', hex: '#065f46' },
  { id: 'rose', name: 'Professional Rose', class: 'text-rose-800', hex: '#9f1239' },
  { id: 'purple', name: 'Royal Purple', class: 'text-purple-800', hex: '#6b21a8' },
  { id: 'teal', name: 'Teal', class: 'text-teal-800', hex: '#115e59' },
];
