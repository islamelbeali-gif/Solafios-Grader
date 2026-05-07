import React, { useEffect, useRef } from 'react';
import { TestMetadata, ScoringKey, getOptions, Option, StudentResult } from '../types';
import { ClipboardList, ArrowRight, Wand2, Download, Upload } from 'lucide-react';

interface TestSetupProps {
  metadata: TestMetadata;
  scoringKey: ScoringKey;
  onMetadataChange: (meta: TestMetadata) => void;
  onScoringKeyChange: (key: ScoringKey) => void;
  onNext: () => void;
}

export const TestSetup: React.FC<TestSetupProps> = ({
  metadata,
  scoringKey,
  onMetadataChange,
  onScoringKeyChange,
  onNext,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize scoring key
  useEffect(() => {
    let hasChanges = false;
    const newKey = { ...scoringKey };
    const options = getOptions(metadata.choiceCount || 5);
    
    for (let i = 1; i <= (metadata.questionCount || 10); i++) {
      if (!newKey[i]) {
        newKey[i] = {} as any;
        options.forEach(opt => {
          newKey[i][opt] = 0;
        });
        hasChanges = true;
      } else {
        // Ensure all choices exist for existing questions
        options.forEach(opt => {
          if (newKey[i][opt] === undefined) {
             newKey[i][opt] = 0;
             hasChanges = true;
          }
        });
      }
    }
    
    if (hasChanges) {
      onScoringKeyChange(newKey);
    }
  }, [metadata.questionCount, metadata.choiceCount, scoringKey]);

  const handleMetaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const isNumField = e.target.name === 'questionCount' || e.target.name === 'choiceCount';
    onMetadataChange({ ...metadata, [e.target.name]: isNumField ? parseInt(e.target.value) || 0 : e.target.value });
  };

  const handleScoreChange = (qIndex: number, option: Option, value: string) => {
    const numVal = parseInt(value) || 0;
    onScoringKeyChange({
      ...scoringKey,
      [qIndex]: {
        ...scoringKey[qIndex],
        [option]: numVal,
      },
    });
  };

  const applyDefaultPattern = () => {
    // Pattern example: A=4, B=3, C=2, D=1, E=0, F=0...
    const newKey: ScoringKey = {};
    const options = getOptions(metadata.choiceCount || 5);
    for (let i = 1; i <= (metadata.questionCount || 10); i++) {
      newKey[i] = {} as any;
      options.forEach((opt, idx) => {
         // descending score pattern matching A=4, B=3... etc for choiceCount=5
         newKey[i][opt] = Math.max(0, (metadata.choiceCount || 5) - 1 - idx);
      });
    }
    onScoringKeyChange(newKey);
  };

  const handleExportData = () => {
    // Get full state from local storage to include students
    const saved = localStorage.getItem('scienceGradePro_v1');
    if (!saved) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(saved);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${metadata.testName || 'test_data'}_backup.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Update local storage and reload to apply state
        localStorage.setItem('scienceGradePro_v1', JSON.stringify(parsed));
        window.location.reload();
      } catch (error) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Import/Export Tools */}
      <div className="flex justify-end gap-3 mb-2">
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="text-sm flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
         >
           <Upload className="w-4 h-4" /> Import Data
         </button>
         <button 
           onClick={handleExportData}
           className="text-sm flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
         >
           <Download className="w-4 h-4" /> Export/Save Data
         </button>
         <input 
           type="file" 
           ref={fileInputRef} 
           onChange={handleImportData} 
           className="hidden" 
           accept=".json"
         />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">1. Test Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Test Name</label>
            <input
              name="testName"
              value={metadata.testName}
              onChange={handleMetaChange}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Science Midterm 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Teacher Name</label>
            <input
              name="teacherName"
              value={metadata.teacherName}
              onChange={handleMetaChange}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Mr. Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">School Name</label>
            <input
              name="schoolName"
              value={metadata.schoolName}
              onChange={handleMetaChange}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Lincoln High"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Grade / Class</label>
            <input
              name="grade"
              value={metadata.grade}
              onChange={handleMetaChange}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. 10th Grade"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Section</label>
            <input
              name="section"
              value={metadata.section}
              onChange={handleMetaChange}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Boys Section A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Number of Questions</label>
            <input
              type="number"
              name="questionCount"
              min="1"
              max="100"
              value={metadata.questionCount}
              onChange={handleMetaChange}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Number of Choices</label>
            <select
              name="choiceCount"
              value={metadata.choiceCount}
              onChange={handleMetaChange}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n} ({getOptions(n).join('-')})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">2. Scoring Model (Model Answer)</h2>
          </div>
          <button
            onClick={applyDefaultPattern}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            Auto-fill (A=4, B=3...)
          </button>
        </div>
        
        <p className="text-slate-500 text-sm mb-4">
          Enter the marks awarded for each choice for each question.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="p-3 border-b border-slate-200 text-left">Question</th>
                {getOptions(metadata.choiceCount || 5).map(opt => (
                  <th key={opt} className="p-3 border-b border-slate-200 font-semibold text-blue-800">Choice {opt}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: metadata.questionCount || 10 }).map((_, idx) => {
                const qNum = idx + 1;
                return (
                  <tr key={qNum} className="hover:bg-slate-50">
                    <td className="p-2 border-b border-slate-100 font-medium text-slate-600 text-left pl-4">Q{qNum}</td>
                    {getOptions(metadata.choiceCount || 5).map(opt => (
                      <td key={opt} className="p-2 border-b border-slate-100">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={scoringKey[qNum]?.[opt] ?? 0}
                          onChange={(e) => handleScoreChange(qNum, opt, e.target.value)}
                          className="w-16 text-center border border-slate-200 rounded p-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          Start Grading <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};