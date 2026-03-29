export interface CvData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    location: string;
  };
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string[]; // Bullet points
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link?: string;
}

export interface MindMapNode {
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  children?: MindMapNode[];
  details?: string;
}

export interface AnalysisResult {
  score: number;
  missingInfo: string[];
  keywords: string[];
  mindMap: MindMapNode;
}

export enum AppStep {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  MINDMAP = 'MINDMAP',
  BUILDING = 'BUILDING',
  PREVIEW = 'PREVIEW'
}

export interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: { title: string; uri: string }[];
}