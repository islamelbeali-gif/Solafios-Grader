import React, { useState } from 'react';
import { ScoringKey, StudentResult, getOptions, Option, TestMetadata } from '../types';
import { PlusCircle, Trash2, Printer, UserPlus, CheckCircle2, Download, FileText } from 'lucide-react';

interface StudentGradingProps {
  metadata: TestMetadata;
  scoringKey: ScoringKey;
  students: StudentResult[];
  onAddStudent: (student: StudentResult) => void;
  onDeleteStudent: (id: string) => void;
  onPrintStudent: (student: StudentResult) => void;
  onDownloadPdf: (student: StudentResult) => void;
  onPrintClassSummary: () => void;
}

export const StudentGrading: React.FC<StudentGradingProps> = ({
  metadata,
  scoringKey,
  students,
  onAddStudent,
  onDeleteStudent,
  onPrintStudent,
  onDownloadPdf,
  onPrintClassSummary,
}) => {
  const [currentName, setCurrentName] = useState('');
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, Option>>({});

  const calculateScore = (answers: Record<number, Option>) => {
    let total = 0;
    const qScores: Record<number, number> = {};
    
    for (let i = 1; i <= (metadata.questionCount || 10); i++) {
      const selectedOption = answers[i];
      const points = selectedOption ? scoringKey[i]?.[selectedOption] ?? 0 : 0;
      qScores[i] = points;
      total += points;
    }
    return { total, qScores };
  };

  const handleOptionSelect = (qIndex: number, option: Option) => {
    setCurrentAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentName.trim()) return;

    const { total, qScores } = calculateScore(currentAnswers);

    const newStudent: StudentResult = {
      id: Date.now().toString(),
      name: currentName,
      answers: currentAnswers,
      totalScore: total,
      questionScores: qScores,
    };

    onAddStudent(newStudent);
    setCurrentName('');
    setCurrentAnswers({});
  };

  const currentScorePreview = calculateScore(currentAnswers).total;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* Entry Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600 sticky top-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            New Student Entry
          </h2>
          
          <form onSubmit={handleSaveStudent}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-1">Student Name</label>
              <input
                autoFocus
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: metadata.questionCount || 10 }).map((_, idx) => {
                const qNum = idx + 1;
                return (
                  <div key={qNum} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 w-8">Q{qNum}</span>
                    <div className="flex gap-1">
                      {getOptions(metadata.choiceCount || 5).map(opt => {
                        const isSelected = currentAnswers[qNum] === opt;
                        const weight = scoringKey[qNum]?.[opt] ?? 0;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleOptionSelect(qNum, opt)}
                            className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                            }`}
                            title={`Worth ${weight} marks`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-500">
                Score Preview: <span className="font-bold text-blue-600 text-lg">{currentScorePreview}</span>
              </div>
              <button
                type="submit"
                disabled={!currentName.trim()}
                className="bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Save Result
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results List */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Graded Students ({students.length})
            </h2>
            {students.length > 0 && (
              <button 
                onClick={onPrintClassSummary}
                className="text-sm flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Print Class Sheet
              </button>
            )}
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border-dashed border-2 border-slate-200">
              <p>No students graded yet.</p>
              <p className="text-sm">Use the form to add student results.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4 text-center">Score</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 group">
                      <td className="p-4 font-medium text-slate-800">{student.name}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {student.totalScore}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onDownloadPdf(student)}
                            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintStudent(student)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Print Report"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};