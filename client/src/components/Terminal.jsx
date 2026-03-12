import { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Trash2, ChevronRight } from 'lucide-react';

export default function Terminal({ output, clearOutput, isExecuting }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom whenever output changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="flex flex-col h-full bg-[#020617] font-mono border-t border-white/5">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-6 py-2 bg-slate-900/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
            isExecuting ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isExecuting ? 'bg-blue-400 animate-pulse' : 'bg-emerald-500'}`} />
            {isExecuting ? 'Executing' : 'Terminal Ready'}
          </div>
        </div>

        <button 
          onClick={clearOutput} 
          className="text-slate-500 hover:text-red-400 transition-all flex items-center gap-1.5 text-[10px] font-bold"
        >
          <Trash2 size={12} />
          CLEAR CONSOLE
        </button>
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto custom-scrollbar text-sm font-['Fira_Code'] leading-relaxed"
      >
        {output ? (
          <div className="space-y-1">
            <div className="flex gap-2 text-slate-600 mb-2">
              <ChevronRight size={14} className="mt-1" />
              <span className="text-[10px] font-bold uppercase opacity-50">Output Log</span>
            </div>
            <pre className={`whitespace-pre-wrap break-all ${
              output.toLowerCase().includes('error') ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {output}
              {isExecuting && <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse" />}
            </pre>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-30 select-none">
            <TerminalIcon size={32} strokeWidth={1} className="mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No output to display</p>
          </div>
        )}
      </div>
    </div>
  );
}