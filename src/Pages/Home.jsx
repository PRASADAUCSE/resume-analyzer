import React from "react";
import { useState } from "react";


// 
const HomePage = () =>{

    const[formData, setFormData] = useState({
        companyName: "",
        applyingAs: "Experienced",
        coverLetterTone: "Casual",
        jobRole: "",
        jobDescription: "",
        currentResume: "",
    })

    const [geminiResponse, setGeminiResponse] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const parseResponse = (text) => {
        const sections = {
            coverLetter: "",
            resumeContent: "",
            atsScore: ""
        };

        const coverLetterMatch = text.match(/1\.\s*Tailored Cover Letter\s*([\s\S]*?)(?=2\.\s*Updated Resume|$)/i);
        const resumeMatch = text.match(/2\.\s*Updated Resume Content\s*([\s\S]*?)(?=3\.\s*Keyword Match|$)/i);
        const atsMatch = text.match(/4\.\s*ATS Score Estimate[^\n]*(([\s\S]*?)$)/i);

        if (coverLetterMatch) sections.coverLetter = coverLetterMatch[1].trim();
        if (resumeMatch) sections.resumeContent = resumeMatch[1].trim();
        if (atsMatch) {
            sections.atsScore = atsMatch[1].trim();
        }
        
        // Fallback: if ATS score is still empty but contains "ATS", try alternative parsing
        if (!sections.atsScore && text.includes("ATS Score")) {
            const altAtsMatch = text.match(/4\.([\s\S]*?)$/i);
            if (altAtsMatch) sections.atsScore = altAtsMatch[1].trim();
        }

        return sections;
    };

    const cleanText = (text) => {
        return text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/^#+\s*/gm, '')
            .replace(/^#+/gm, '')
            .replace(/^\s*[-•]\s*/gm, '• ')
            .trim();
    };

    const renderCleanText = (text) => {
        const cleaned = cleanText(text);
        return cleaned.split('\n').filter(line => line.trim() !== "").map((line, idx) => {
            if (line.match(/^•\s*/)) {
                return <li key={idx} className="ml-6 mb-2 text-gray-700">{line.replace(/^•\s*/, '').trim()}</li>;
            }
            if (line.match(/^\d{1,2}\.\s/) || line.match(/^[A-Z][^:]*:/)) {
                return <p key={idx} className="font-bold text-lg text-gray-900 mt-4 mb-3 pb-2 border-b-2 border-gray-300">{line}</p>;
            }
            return <p key={idx} className="mb-3 text-gray-700 leading-relaxed text-justify">{line}</p>;
        });
    };

    const parseATSScore = (text) => {
        const cleaned = cleanText(text);
        
        // Extract score (looking for patterns like "75/100" or "75 out of 100" or "7/10")
        const scoreMatch = cleaned.match(/(\d+)\s*(?:\/|out of)\s*(\d+)/i);
        let score = null;
        
        if (scoreMatch) {
            let numerator = parseInt(scoreMatch[1]);
            let denominator = parseInt(scoreMatch[2]);
            
            // If score is out of 10, convert to out of 100
            if (denominator === 10) {
                numerator = numerator * 10;
                denominator = 100;
            }
            
            score = `${numerator}/${denominator}`;
        }
        
        // Get reasoning by removing the score line
        let reasoningText = cleaned.replace(/.*?\d+\s*(?:\/|out of)\s*\d+.*?\n?/i, '').trim();
        
        // Extract tips - look for lines that mention suggestion, tip, recommendation, improvement
        let tips = [];
        const lines = reasoningText.split('\n').filter(line => line.trim() !== "");
        
        let inTipsSection = false;
        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('tip') || lowerLine.includes('suggestion') || lowerLine.includes('recommendation') || lowerLine.includes('improve')) {
                inTipsSection = true;
            }
            
            if (inTipsSection && (line.match(/^•\s*/) || line.match(/^-\s*/) || line.match(/^\d+\.\s*/))) {
                tips.push(line.replace(/^[•\-\*]\s*|^\d+\.\s*/, '').trim());
            }
        });
        
        return { score, reasoning: reasoningText, tips };
    };

    const renderParsedResponse = (sections) => {
        return (
            <div className="mt-8 space-y-8">
                {/* Cover Letter Section */}
                {sections.coverLetter && (
                    <div className="rounded-2xl shadow-2xl overflow-hidden" style={{background: 'linear-gradient(to right, #2563eb, #60a5fa)'}}>
                        <div className="bg-blue-50 p-8 rounded-xl m-1">
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <h2 className="text-4xl">📝</h2>
                                </div>
                                <h2 className="text-3xl font-bold text-blue-900">Your Cover Letter</h2>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
                                {renderCleanText(sections.coverLetter)}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Resume Content Section */}
                {sections.resumeContent && (
                    <div className="rounded-2xl shadow-2xl overflow-hidden" style={{background: 'linear-gradient(to right, #16a34a, #4ade80)'}}>
                        <div className="bg-green-50 p-8 rounded-xl m-1">
                            <div className="flex items-center mb-6">
                                <div className="bg-green-100 p-3 rounded-full mr-4">
                                    <h2 className="text-4xl ">📄</h2>
                                </div>
                                <h2 className="text-3xl font-bold text-green-900">Resume Improvements</h2>
                            </div>

                            {/* Updated Resume */}
                            <div>
                                <h3 className="text-xl font-bold text-green-700 mb-4 pb-3 border-b-4 border-green-600">✨ Optimized Resume</h3>
                                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
                                    {renderCleanText(sections.resumeContent)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {/* ATS Score Section */}
                {sections.atsScore ? (
                    <div className="rounded-2xl shadow-2xl overflow-hidden" style={{background: 'linear-gradient(to right, #9333ea, #a855f7)'}}>
                        <div className="bg-purple-50 p-8 rounded-xl m-1">
                            <div className="flex items-center mb-6">
                                <div className="bg-purple-100 p-3 rounded-full mr-4">
                                    <h2 className="text-4xl">📊</h2>
                                </div>
                                <h2 className="text-3xl font-bold text-purple-900">ATS Score Report</h2>
                            </div>
                        
                            {(() => {
                                const { score, reasoning, tips } = parseATSScore(sections.atsScore);
                                
                                return (
                                    <div className="space-y-6">
                                        {/* Score Display */}
                                        {score && (
                                            <div className="p-8 rounded-lg shadow-md border-2 border-purple-300" style={{background: 'linear-gradient(to bottom right, #f3e8ff, #f8f0ff)'}}>
                                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Your ATS Score</h3>
                                                <div className="bg-white p-6 rounded-lg border-4 border-purple-600 text-center">
                                                    <div className="text-6xl font-bold text-purple-600">
                                                        {score}
                                                    </div>
                                                    <p className="text-gray-600 text-sm mt-3 font-semibold">Out of 100 points</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Reasoning Display */}
                                        {reasoning && (
                                            <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-purple-600">
                                                <h3 className="text-lg font-semibold text-purple-700 mb-4 pb-2 border-b-2 border-purple-300">📋 Why is your score at this level?</h3>
                                                <div className="text-gray-800 leading-relaxed space-y-3">
                                                    {renderCleanText(reasoning)}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Tips to Improve Score */}
                                        {tips && tips.length > 0 && (
                                            <div className="p-8 rounded-lg shadow-md border-2 border-blue-300" style={{background: 'linear-gradient(to bottom right, #dbeafe, #f0f9ff)'}}>
                                                <h3 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b-2 border-blue-400">💡 Tips to Increase Your ATS Score</h3>
                                                <ul className="space-y-3">
                                                    {tips.map((tip, idx) => (
                                                        <li key={idx} className="ml-2 text-gray-700 flex">
                                                            <span className="text-blue-600 mr-3 font-bold text-xl">✓</span>
                                                            <span className="text-base">{tip}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                ) : (
                    sections.coverLetter || sections.resumeContent ? (
                        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                            <p className="text-yellow-800 text-lg">⚠️ ATS Score data not found in response. Please try again.</p>
                        </div>
                    ) : null
                )}

                {/* Error Message */}
                {!sections.coverLetter && !sections.resumeContent && !sections.atsScore && (
                    <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                        <p className="text-red-700 text-lg">⚠️ Could not parse response. Please try again.</p>
                    </div>
                )}
            </div>
        );
    };

    async function handleGenerateData() {
        console.log("form data: ", formData);
        setIsLoading(true);
        const prompt = ` You are an expert career coach, professional resume writer, and ATS optimization specialist.

Your task is to generate a highly tailored, structured, and ATS-optimized response based strictly on the inputs provided.

========================
INPUT DATA
========================

Company Name: ${formData.companyName}
Experience Level: ${formData.applyingAs}
Job Role: ${formData.jobRole}
Job Description: ${formData.jobDescription}
Current Resume Content: ${formData.currentResume || "No resume provided"}
Preferred Cover Letter Tone: ${formData.coverLetterTone}

========================
INSTRUCTIONS
========================

Follow ALL formatting rules strictly.

- Do NOT include markdown symbols (no **, ##, or code blocks).
- Do NOT add extra commentary outside the required sections.
- Use clear headings exactly as specified below.
- Keep language professional and realistic.
- Avoid generic fluff.
- Be specific and keyword-focused.

========================
OUTPUT FORMAT (STRICT)
========================

1. Tailored Cover Letter

Write a fully structured cover letter addressed to ${formData.companyName}.
- Use the selected tone: ${formData.coverLetterTone}
- Personalize based on job role and job description
- Highlight measurable achievements where possible
- Keep length between 250–400 words
- Maintain formal business structure (Opening, Body, Closing)

--------------------------------------------------

2. Updated Resume Content

Provide the following subsections clearly:

A. Professional Summary (3–4 lines, achievement-focused)

B. Key Skills (bullet points, ATS keyword optimized)

C. Experience Improvements
- Rewrite or generate 4–6 bullet points
- Use strong action verbs
- Add metrics where possible (%, revenue, impact, scale)

D. Suggested Technical & Soft Skills (bullet list)

--------------------------------------------------

3. Keyword Match Analysis

A. Top 10 Critical Keywords from Job Description  
(List them clearly in bullet format)

B. Missing Keywords in Resume  
(List only keywords not found in provided resume)

C. Optimization Suggestions  
(Explain how to improve keyword alignment in 3–5 concise bullet points)

--------------------------------------------------

4. ATS Score Estimate (0–100)

Provide:

A. Numeric Score (Example format: 78/100)

B. Strengths (bullet points)

C. Weaknesses (bullet points)

D. Clear Improvement Actions (bullet points)

--------------------------------------------------

Ensure the final output is clean, well-structured, and easy to parse programmatically.
`

        const url = "https://resume-analyzer-wkww.onrender.com/generate";

const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "mistralai/Mistral-7B-Instruct-v0.2",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  })
};

try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!data.choices) {
    console.log("API Error:", data);
    return;
  }

  setGeminiResponse(data.choices[0].message.content);

} catch (error) {
  console.error(error);
} finally {
  setIsLoading(false);
}

    }
    return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
    <div className="w-full max-w-4xl bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-10 space-y-8 border border-slate-200">

      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b-2 border-slate-200">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          AI Resume Analyzer
        </h1>
        <p className="text-slate-600 text-sm font-medium">
          Beat ATS systems • Get hired faster
        </p>
      </div>

      <form className="space-y-6">

        {/* Company Name & Job Role - 2 column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Google, Microsoft"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/70"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Job Role
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineer"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/70"
              value={formData.jobRole}
              onChange={(e) =>
                setFormData({ ...formData, jobRole: e.target.value })
              }
            />
          </div>
        </div>

        {/* Experience & Tone - 2 column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Experience Level
            </label>
            <select
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/70 cursor-pointer"
              value={formData.applyingAs}
              onChange={(e) =>
                setFormData({ ...formData, applyingAs: e.target.value })
              }
            >
              <option value="Fresher">Fresher</option>
              <option value="Experienced">Experienced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Cover Letter Tone
            </label>
            <select
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/70 cursor-pointer"
              value={formData.coverLetterTone}
              onChange={(e) =>
                setFormData({ ...formData, coverLetterTone: e.target.value })
              }
            >
              <option value="Formal">Formal</option>
              <option value="Casual">Casual</option>
            </select>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Job Description
          </label>
          <textarea
            rows="5"
            placeholder="Paste the complete job description here..."
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none resize-none transition-all duration-200 bg-white/70"
            value={formData.jobDescription}
            onChange={(e) =>
              setFormData({ ...formData, jobDescription: e.target.value })
            }
          />
        </div>

        {/* Current Resume */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Your Current Resume <span className="text-slate-400 font-normal">(must)</span>
          </label>
          <textarea
            rows="5"
            placeholder="Paste your resume text here for better analysis..."
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none resize-none transition-all duration-200 bg-white/70"
            value={formData.currentResume}
            onChange={(e) =>
              setFormData({ ...formData, currentResume: e.target.value })
            }
          />
        </div>

        {/* Generate Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleGenerateData}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>wait bhai i am analyzing your data...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Analysis</span>
              </>
            )}
            
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
        </div>
      </form>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="mt-10 space-y-6 animate-pulse">
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
          <div className="h-48 bg-slate-200 rounded-xl"></div>
        </div>
      )}

      {/* Output Section */}
      {geminiResponse && !isLoading && (
        <div className="mt-10 animate-fadeIn">
          {renderParsedResponse(parseResponse(geminiResponse))}
        </div>
      )}

    </div>

    {/* Add CSS for fadeIn animation */}
    <style>{`
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }
    `}</style>
  </div>
);

}

export default HomePage;