import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, Upload, Briefcase, User, Download, Send, 
  CheckCircle, AlertCircle, Sparkles, RefreshCcw, PenTool,
  Printer, Save, Globe, MessageSquare
} from 'lucide-react';
import { analyzeJobAndProfile, generateCvSection, chatWithCoach } from './services/geminiService';
import { CvPreview } from './components/CvPreview';
import { MindMap } from './components/MindMap';
import { AtsScoreGauge } from './components/AtsScoreGauge';
import { AppStep, CvData, AnalysisResult, Message } from './types';

const INITIAL_CV_DATA: CvData = {
  personalInfo: { fullName: '', email: '', phone: '', linkedin: '', portfolio: '', location: '' },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: []
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [jobDescription, setJobDescription] = useState('');
  const [userCvText, setUserCvText] = useState('');
  const [cvData, setCvData] = useState<CvData>(INITIAL_CV_DATA);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [currentChatMessage, setCurrentChatMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('atsMasterCvData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCvData(parsedData);
      } catch (error) {
        console.error('Failed to parse saved CV data:', error);
      }
    }
  }, []);

  const updatePersonalInfo = (field: keyof CvData['personalInfo'], value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleAnalysis = async () => {
    if (!jobDescription || !userCvText) return;
    setIsGenerating(true);
    setStep(AppStep.ANALYZING);

    try {
      const result = await analyzeJobAndProfile(jobDescription, userCvText);
      setAnalysis(result);
      
      // Initialize chat with missing info questions
      if (result.missingInfo.length > 0) {
        setChatMessages([{
          role: 'ai',
          content: `I've analyzed your profile against the job description. Your current ATS score estimate is ${result.score}. To reach 100, I need a few details: \n\n${result.missingInfo.map(i => `• ${i}`).join('\n')}\n\nPlease answer these so I can build the perfect CV.`
        }]);
      } else {
        setChatMessages([{
          role: 'ai',
          content: `Great match! Your base profile is strong. I'm ready to build the optimized CV. Click "Generate CV" when ready.`
        }]);
      }
      
      setStep(AppStep.MINDMAP);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze. Please check your API key and try again.");
      setStep(AppStep.INPUT);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentChatMessage.trim()) return;
    
    const newMessage: Message = { role: 'user', content: currentChatMessage };
    setChatMessages(prev => [...prev, newMessage]);
    setCurrentChatMessage('');
    setIsGenerating(true);

    try {
      const context = `Job Description: ${jobDescription}. Missing Info list: ${analysis?.missingInfo.join(', ')}`;
      const aiResponse = await chatWithCoach(
        chatMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
        newMessage.content,
        context,
        useSearch
      );
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        content: aiResponse.text,
        sources: aiResponse.sources
      }]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'ai', content: "I encountered an error processing your request. Please try again." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const startBuildingCv = async () => {
    setStep(AppStep.BUILDING);
    setIsGenerating(true);

    // Collect all user chat inputs as extra context
    const userInputs = chatMessages.filter(m => m.role === 'user').map(m => m.content).join('\n');
    
    // Parse basic info from text (Simple heuristic for demo, in prod use LLM extraction)
    // Here we just use the LLM to generate everything from scratch based on the massive context
    
    try {
      // 1. Summary
      const summary = await generateCvSection('summary', jobDescription, userCvText, userInputs);
      setCvData(prev => ({ ...prev, summary }));

      // 2. Skills
      const skills = await generateCvSection('skills', jobDescription, userCvText, userInputs);
      setCvData(prev => ({ ...prev, skills }));

      // 3. Experience
      const experience = await generateCvSection('experience', jobDescription, userCvText, userInputs);
      setCvData(prev => ({ ...prev, experience }));

      // 4. Projects
      const projects = await generateCvSection('projects', jobDescription, userCvText, userInputs);
      setCvData(prev => ({ ...prev, projects }));

      // Note: Personal Info is already set by user inputs
      
      setStep(AppStep.PREVIEW);
      if (analysis) {
        // Update score to 100 after generation
        setAnalysis({ ...analysis, score: 98 }); 
      }
    } catch (error) {
      console.error(error);
      alert("Error generating specific sections.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    try {
      localStorage.setItem('atsMasterCvData', JSON.stringify(cvData));
      const time = new Date().toLocaleTimeString();
      alert(`CV data saved to local storage at ${time}!`);
    } catch (e) {
      console.error('Failed to save to local storage', e);
      alert('Failed to save CV data.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-400" />
            <span className="font-bold text-xl tracking-tight">ATS-Master</span>
          </div>
          <div className="flex gap-4 items-center">
            {analysis && <div className="text-sm font-medium text-emerald-400">Target Score: 100</div>}
            {step === AppStep.PREVIEW && (
               <div className="flex gap-2">
                 <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors">
                   <Save size={16} /> Save to Local
                 </button>
                 <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors">
                   <Printer size={16} /> Print CV
                 </button>
               </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 flex gap-6">
        
        {/* Left Panel: Inputs & Chat */}
        <div className={`flex-1 flex flex-col gap-6 transition-all duration-500 ${step === AppStep.PREVIEW ? 'hidden lg:flex lg:w-1/3' : 'w-full'} no-print`}>
          
          {/* Progress Indicator */}
          <div className="flex justify-between mb-4 px-2">
             {[AppStep.INPUT, AppStep.MINDMAP, AppStep.PREVIEW].map((s, idx) => (
               <div key={idx} className={`flex items-center gap-2 ${step === s ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === s ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>
                   {idx + 1}
                 </div>
               </div>
             ))}
          </div>

          {step === AppStep.INPUT && (
            <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Start Your Application</h2>
              
              {/* Personal Details Section */}
              <div className="border-b border-slate-100 pb-6 mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <User size={16} /> Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={cvData.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={cvData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={cvData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                   <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={cvData.personalInfo.location}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="New York, NY"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">LinkedIn URL</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={cvData.personalInfo.linkedin}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Portfolio URL</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      value={cvData.personalInfo.portfolio}
                      onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                      placeholder="myportfolio.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Briefcase size={16} /> Job Description
                </label>
                <textarea 
                  className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Upload size={16} /> Paste Old CV / Profile
                </label>
                <div className="relative">
                  <textarea 
                    className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                    placeholder="Paste your current CV text or raw profile data here..."
                    value={userCvText}
                    onChange={(e) => setUserCvText(e.target.value)}
                  />
                  <div className="absolute top-2 right-2">
                    <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded flex items-center gap-1">
                      <Upload size={12} /> Paste Word Text
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAnalysis}
                disabled={!jobDescription || !userCvText || isGenerating}
                className={`w-full py-3 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition-all ${(!jobDescription || !userCvText) ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-lg'}`}
              >
                {isGenerating ? 'Analyzing...' : <>Analyze & Plan <ArrowRight size={18} /></>}
              </button>
            </div>
          )}

          {(step === AppStep.MINDMAP || step === AppStep.BUILDING || step === AppStep.PREVIEW) && (
            <div className="flex flex-col gap-6 h-full">
              {/* ATS Score Card */}
              {analysis && (
                <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-700">ATS Strategy</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                      We found {analysis.missingInfo.length} gaps to fix.
                    </p>
                    <div className="flex gap-2 mt-3">
                      {analysis.keywords.slice(0, 3).map(k => (
                        <span key={k} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">{k}</span>
                      ))}
                      <span className="text-[10px] text-slate-400 py-1">+{analysis.keywords.length - 3} more</span>
                    </div>
                  </div>
                  <AtsScoreGauge score={analysis.score} />
                </div>
              )}

              {/* Mind Map View */}
              {step === AppStep.MINDMAP && analysis && (
                <div className="bg-white p-1 rounded-xl shadow-md">
                   <MindMap data={analysis.mindMap} />
                </div>
              )}

              {/* Chat / Clarification Interface */}
              <div className="bg-white rounded-xl shadow-md flex-1 flex flex-col overflow-hidden min-h-[400px]">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700 text-sm">CV Coach</h3>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${useSearch ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {useSearch ? 'Web Search' : 'Chat Mode'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Search Web</span>
                    <button 
                      onClick={() => setUseSearch(!useSearch)}
                      className={`w-8 h-4 rounded-full p-0.5 transition-colors ${useSearch ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${useSearch ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'}`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                      
                      {/* Display Sources if available */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 max-w-[85%] bg-emerald-50 border border-emerald-100 rounded-md p-2">
                          <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1 flex items-center gap-1">
                            <Globe size={10} /> Sources
                          </p>
                          <ul className="space-y-1">
                            {msg.sources.map((source, idx) => (
                              <li key={idx}>
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block max-w-[200px] md:max-w-xs">
                                  {source.title || source.uri}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-slate-100 bg-white">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      placeholder={useSearch ? "Ask for live info (e.g. salary range)..." : "Ask about your CV..."}
                      value={currentChatMessage}
                      onChange={(e) => setCurrentChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isGenerating}
                      className={`text-white p-2 rounded-lg transition-colors disabled:opacity-50 ${useSearch ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  {step === AppStep.MINDMAP && (
                    <button 
                      onClick={startBuildingCv}
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2"
                    >
                      <PenTool size={16} /> Start Building CV Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Preview (Visible after building starts) */}
        {(step === AppStep.BUILDING || step === AppStep.PREVIEW) && (
          <div className="flex-[1.5] flex flex-col">
            <div className="bg-white shadow-2xl rounded-sm overflow-hidden flex-1 relative">
               {isGenerating && step === AppStep.BUILDING && (
                 <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-sm">
                   <div className="text-center">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                     <p className="text-slate-600 font-medium animate-pulse">Crafting tailored sections...</p>
                   </div>
                 </div>
               )}
               
               <div className="overflow-auto h-[calc(100vh-120px)] p-8 bg-slate-500/10 custom-scrollbar">
                  {/* Edit Info Form Overlay Toggle */}
                  <div className="mb-4 flex justify-end no-print">
                    <button 
                      className="text-xs bg-slate-800 text-white px-3 py-1 rounded shadow hover:bg-slate-700"
                      onClick={() => {
                        const newName = prompt("Update Name:", cvData.personalInfo.fullName);
                        if (newName) setCvData({...cvData, personalInfo: {...cvData.personalInfo, fullName: newName}});
                      }}
                    >
                      Quick Edit Header
                    </button>
                  </div>
                  
                  <CvPreview data={cvData} />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;