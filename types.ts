export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    role: string;
    location: string;
    profilePic?: string; // Base64 image string
  };
  summary: string;
  // Categorized Skills
  skills: {
    technical: string[];
    web: string[];
    tools: string[];
    soft: string[];
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certificates: CertificateItem[];
  languages: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean; // True if currently working here
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  year: string;
  score: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string;
  link: string;
  // Adding specific fields that might be used by certain templates if necessary
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link: string;
}

export type TemplateId = 
  | 'modern' 
  | 'classic' 
  | 'executive' 
  | 'minimal'
  | 'luxury'
  | 'photo_modern'
  | 'creative'
  | 'simple'
  | 'professional';

export type FontId = 
  | 'Inter' 
  | 'Roboto' 
  | 'Lato' 
  | 'Montserrat' 
  | 'Playfair Display' 
  | 'Merriweather'
  | 'Poppins'
  | 'Open Sans'
  | 'Raleway'
  | 'Nunito Sans'
  | 'Source Sans Pro';

export type ColorTheme = 
  | 'black' 
  | 'blue' 
  | 'navy'
  | 'gold'
  | 'rose' 
  | 'green'
  | 'purple'
  | 'teal';

// --- NEW NAVIGATION TYPES ---

export type AppView = 'landing' | 'builder' | 'converter';

export type ConverterToolId = 
  | 'pdf-to-word'
  | 'word-to-pdf'
  | 'ppt-to-pdf'
  | 'pdf-to-ppt'
  | 'jpg-to-pdf'
  | 'pdf-to-jpg';