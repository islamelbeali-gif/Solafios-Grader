import React, { useRef, useState } from 'react';
import { TestMetadata, StudentResult } from '../types';
import { Printer, Download, X, Loader2, School } from 'lucide-react';

interface ClassSummaryReportProps {
  metadata: TestMetadata;
  students: StudentResult[];
  onClose: () => void;
}

export const ClassSummaryReport: React.FC<ClassSummaryReportProps> = ({ metadata, students, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDownloadPdf = () => {
    if (!reportRef.current || !(window as any).html2pdf) return;
    
    setIsProcessing(true);
    const element = reportRef.current;
    
    const opt = {
      margin: 0.3,
      filename: `${metadata.testName.replace(/[^a-z0-9]/gi, '_')}_Class_Summary.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    (window as any).html2pdf().set(opt).from(element).save()
      .then(() => setIsProcessing(false))
      .catch((err: any) => {
        console.error("PDF Error:", err);
        setIsProcessing(false);
      });
  };

  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));
  const averageScore = students.length > 0 
    ? (students.reduce((acc, s) => acc + s.totalScore, 0) / students.length).toFixed(1) 
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/70 p-4 print:p-0 print:bg-white print:static print:block">
      <div className="relative w-full max-w-[210mm] print:max-w-none print:w-full">
        <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-md print:hidden">
          <h3 className="font-bold text-slate-800">Class Summary Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Save PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        <div 
          ref={reportRef}
          className="bg-white text-black shadow-2xl print:shadow-none min-h-[297mm] p-[15mm] print:p-0 print:m-0 mx-auto"
        >
          <div className="border-b-2 border-slate-800 pb-4 mb-6">
             <div className="flex items-center justify-center gap-3 mb-2">
                <School className="w-8 h-8 text-slate-800" />
                <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">{metadata.schoolName}</h1>
             </div>
             <div className="text-center text-sm font-semibold text-slate-600 uppercase tracking-widest mb-6">
                Official Class Grade Sheet
             </div>
             
             <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded border border-slate-200 print:bg-white print:border-slate-800">
                <div>
                   <p className="mb-1"><span className="font-bold w-20 inline-block">Test:</span> {metadata.testName}</p>
                   <p><span className="font-bold w-20 inline-block">Teacher:</span> {metadata.teacherName}</p>
                </div>
                <div className="text-right">
                   <p className="mb-1"><span className="font-bold">Grade/Section:</span> {metadata.grade} - {metadata.section}</p>
                   <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center mb-6 px-2">
             <div className="text-sm">
                Total Students: <span className="font-bold">{students.length}</span>
             </div>
             <div className="text-sm">
                Class Average: <span className="font-bold text-blue-700">{averageScore}</span>
             </div>
          </div>

          <table className="w-full text-sm border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-800 text-white print:bg-slate-800 print:text-white">
                <th className="border border-slate-400 p-2 w-12 text-center">#</th>
                <th className="border border-slate-400 p-2 text-left">Student Name</th>
                <th className="border border-slate-400 p-2 w-24 text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student, idx) => (
                <tr key={student.id} className="even:bg-slate-50 print:even:bg-gray-100">
                  <td className="border border-slate-400 p-2 text-center text-slate-500">{idx + 1}</td>
                  <td className="border border-slate-400 p-2 font-medium">{student.name}</td>
                  <td className="border border-slate-400 p-2 text-center font-bold">{student.totalScore}</td>
                </tr>
              ))}
              {sortedStudents.length === 0 && (
                 <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 italic border border-slate-400">
                       No students graded yet.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>

          <div className="mt-8 pt-4 border-t border-slate-300 text-center text-xs text-slate-500">
            <p>Report generated by Solafios Grade Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
};