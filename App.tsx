import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { TestSetup } from './components/TestSetup';
import { StudentGrading } from './components/StudentGrading';
import { PrintReport } from './components/PrintReport';
import { ClassSummaryReport } from './components/ClassSummaryReport';
import { TestMetadata, ScoringKey, StudentResult } from './types';
import { Beaker, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [metadata, setMetadata] = useState<TestMetadata>({
    testName: '',
    teacherName: '',
    schoolName: '',
    grade: '',
    section: '',
    questionCount: 10,
    choiceCount: 5,
  });
  const [scoringKey, setScoringKey] = useState<ScoringKey>({});
  const [students, setStudents] = useState<StudentResult[]>([]);
  
  const [studentToProcess, setStudentToProcess] = useState<StudentResult | null>(null);
  const [actionType, setActionType] = useState<'print' | 'download' | null>(null);
  const [showClassSummary, setShowClassSummary] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('scienceGradePro_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMetadata(parsed.metadata);
        setScoringKey(parsed.scoringKey);
        setStudents(parsed.students);
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
  }, []);

  useEffect(() => {
    const data = { metadata, scoringKey, students };
    localStorage.setItem('scienceGradePro_v1', JSON.stringify(data));
  }, [metadata, scoringKey, students]);

  const handleAddStudent = (student: StudentResult) => {
    setStudents([student, ...students]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handlePrintStudent = (student: StudentResult) => {
    setStudentToProcess(student);
    setActionType('print');
  };

  const handleDownloadPdf = (student: StudentResult) => {
    setStudentToProcess(student);
    setActionType('download');
  };

  const handleCloseReport = () => {
    setStudentToProcess(null);
    setActionType(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Beaker className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Solafios Grade Pro</h1>
              <p className="text-xs text-slate-500">Professional Grading Tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium">
             <div className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}>
                1. Setup
             </div>
             <ChevronRight className="w-4 h-4 text-slate-300" />
             <div className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}>
                2. Grading
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:hidden">
        {step === 1 ? (
          <TestSetup 
            metadata={metadata}
            scoringKey={scoringKey}
            onMetadataChange={setMetadata}
            onScoringKeyChange={setScoringKey}
            onNext={() => setStep(2)}
          />
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <button 
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-800 text-sm font-medium hover:underline"
              >
                ← Back to Setup
              </button>
              <div className="text-right">
                <h2 className="font-bold text-slate-800">{metadata.testName || 'Untitled Test'}</h2>
                <p className="text-sm text-slate-500">{students.length} students graded</p>
              </div>
            </div>
            
            <StudentGrading 
              metadata={metadata}
              scoringKey={scoringKey}
              students={students}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onPrintStudent={handlePrintStudent}
              onDownloadPdf={handleDownloadPdf}
              onPrintClassSummary={() => setShowClassSummary(true)}
            />
          </div>
        )}
      </main>

      {studentToProcess && (
        <PrintReport 
          metadata={metadata} 
          student={studentToProcess} 
          initialAction={actionType}
          onClose={handleCloseReport}
        />
      )}

      {showClassSummary && (
        <ClassSummaryReport 
          metadata={metadata}
          students={students}
          onClose={() => setShowClassSummary(false)}
        />
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);