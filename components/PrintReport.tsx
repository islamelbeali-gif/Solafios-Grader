import React, { useEffect, useRef, useState } from 'react';
import { TestMetadata, StudentResult, getOptions } from '../types';
import { Printer, Download, X, Loader2, School, GraduationCap } from 'lucide-react';

interface PrintReportProps {
  metadata: TestMetadata;
  student: StudentResult | null;
  initialAction: 'print' | 'download' | null;
  onClose: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ metadata, student, initialAction, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialAction === 'print') {
      handlePrint();
    } else if (initialAction === 'download') {
      handleDownloadPdf();
    }
  }, [initialAction]);

  if (!student) return null;

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
      margin: 0.2, 
      filename: `${student.name.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    (window as any).html2pdf().set(opt).from(element).save()
      .then(() => setIsProcessing(false))
      .catch((err: any) => {
        console.error("PDF Error:", err);
        setIsProcessing(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/70 p-4 print:p-0 print:bg-white print:static print:block">
      
      <div className="relative w-full max-w-[210mm] print:max-w-none print:w-full">
        
        <div className="mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-md print:hidden">
          <h3 className="font-bold text-slate-800">Student Report Preview</h3>
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
          className="bg-white text-black shadow-2xl print:shadow-none w-full p-[15mm] print:p-0 print:m-0 mx-auto"
          style={{ minHeight: '290mm' }} 
        >
          <div className="h-2 w-full bg-slate-800 mb-6 print:bg-slate-800"></div>

          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-slate-200">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300 text-slate-500">
                   <School className="w-8 h-8" />
                </div>
                <div>
                   <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">{metadata.schoolName || "School Name"}</h1>
                   <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{metadata.grade}</span>
                      <span>•</span>
                      <span>{metadata.section}</span>
                   </div>
                </div>
             </div>
             <div className="text-right">
                <h2 className="text-lg font-bold text-slate-800">{metadata.testName}</h2>
                <p className="text-sm text-slate-600">Teacher: {metadata.teacherName}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString()}</p>
             </div>
          </div>

          <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 p-6 rounded-xl mb-8 shadow-sm print:shadow-none print:border-slate-300">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <GraduationCap className="w-10 h-10 text-slate-400" />
                  <div>
                    <span className="block text-xs uppercase font-bold text-slate-400 tracking-widest mb-0.5">Student Name</span>
                    <p className="text-3xl font-bold text-slate-900">{student.name}</p>
                  </div>
               </div>
               <div className="text-right">
                  <span className="block text-xs uppercase font-bold text-slate-400 tracking-widest mb-0.5">Total Score</span>
                  <div className="text-5xl font-black text-blue-700 print:text-black">{student.totalScore}</div>
               </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider mb-3 border-l-4 border-blue-600 pl-2">Performance Details</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white print:bg-slate-800 print:text-white">
                  <th className="p-3 text-center w-16 border-r border-slate-600">Q #</th>
                  <th className="p-3 text-center">Answer Selected</th>
                  <th className="p-3 text-center w-24 border-l border-slate-600">Marks</th>
                </tr>
              </thead>
              <tbody className="border border-slate-200">
                {Array.from({ length: metadata.questionCount || 10 }).map((_, idx) => {
                  const qNum = idx + 1;
                  const choice = student.answers[qNum];
                  const score = student.questionScores[qNum];
                  
                  let scoreColorClass = "text-slate-800";
                  let scoreBgClass = "bg-white";
                  
                  if (score >= 3) {
                     scoreColorClass = "text-green-700";
                     scoreBgClass = "bg-green-50";
                  } else if (score > 0) {
                     scoreColorClass = "text-yellow-700";
                     scoreBgClass = "bg-yellow-50";
                  } else {
                     scoreColorClass = "text-red-600";
                     scoreBgClass = "bg-red-50";
                  }

                  return (
                    <tr key={qNum} className="border-b border-slate-200">
                      <td className="p-2 text-center font-bold bg-slate-50 text-slate-500 border-r border-slate-200">{qNum}</td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-3">
                           {getOptions(metadata.choiceCount || 5).map(opt => (
                             <span 
                               key={opt} 
                               className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border-2 transition-all
                                 ${choice === opt 
                                   ? 'bg-slate-800 text-white border-slate-800 print:bg-black print:text-white print:border-black' 
                                   : 'text-slate-300 border-slate-100 bg-white print:text-slate-300 print:border-slate-100'
                                 }`}
                             >
                               {opt}
                             </span>
                           ))}
                        </div>
                      </td>
                      <td className={`p-2 text-center font-bold text-lg border-l border-slate-200 ${scoreColorClass} ${scoreBgClass} print:bg-white print:text-black`}>
                        {score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-auto text-center text-[10px] text-slate-400 pt-6 border-t border-slate-100 uppercase tracking-widest">
            <p>Report generated by Solafios Grade Pro</p>
          </div>
        </div>
      </div>
    </div>
  );
};