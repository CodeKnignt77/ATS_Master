import React from 'react';
import { CvData } from '../types';
import { Mail, Phone, MapPin, Linkedin, Link as LinkIcon } from 'lucide-react';

interface CvPreviewProps {
  data: CvData;
}

export const CvPreview: React.FC<CvPreviewProps> = ({ data }) => {
  return (
    <div className="bg-white text-slate-800 shadow-xl mx-auto print:shadow-none print:w-full w-[210mm] min-h-[297mm] p-10 box-border text-sm leading-relaxed" id="cv-preview">
      {/* Header */}
      <header className="border-b-2 border-slate-800 pb-6 mb-6">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2 text-slate-900">{data.personalInfo.fullName || "Your Name"}</h1>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600 font-medium mt-3">
          {data.personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail size={12} /> <span>{data.personalInfo.email}</span>
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone size={12} /> <span>{data.personalInfo.phone}</span>
            </div>
          )}
          {data.personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin size={12} /> <span>{data.personalInfo.location}</span>
            </div>
          )}
          {data.personalInfo.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin size={12} /> <a href={data.personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:underline">{data.personalInfo.linkedin.replace(/^https?:\/\//, '')}</a>
            </div>
          )}
          {data.personalInfo.portfolio && (
            <div className="flex items-center gap-1">
              <LinkIcon size={12} /> <a href={data.personalInfo.portfolio} target="_blank" rel="noreferrer" className="hover:underline">{data.personalInfo.portfolio.replace(/^https?:\/\//, '')}</a>
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-2 border-b border-slate-200 pb-1">Professional Summary</h2>
          <p className="text-slate-800 text-justify">{data.summary}</p>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-2 border-b border-slate-200 pb-1">Skills & Tools</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs font-semibold print:border print:border-slate-300">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 border-b border-slate-200 pb-1">Work Experience</h2>
          <div className="space-y-5">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base text-slate-900">{exp.role}</h3>
                  <span className="text-xs font-mono text-slate-500 whitespace-nowrap">{exp.duration}</span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-2">{exp.company}</div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 marker:text-slate-400">
                  {exp.description.map((desc, dIdx) => (
                    <li key={dIdx} className="pl-1">{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 border-b border-slate-200 pb-1">Key Projects</h2>
          <div className="space-y-4">
            {data.projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-slate-900">
                    {proj.name} 
                    {proj.link && <a href={proj.link} className="ml-2 text-blue-600 text-xs font-normal hover:underline no-print" target="_blank" rel="noreferrer">View Project ↗</a>}
                  </h3>
                </div>
                <p className="text-slate-700 mt-1">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4 border-b border-slate-200 pb-1">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                  <div className="text-slate-700">{edu.degree}</div>
                </div>
                <div className="text-xs font-mono text-slate-500 text-right">{edu.year}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
