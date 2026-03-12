import React from 'react';
import { Terminal as TerminalIcon, XCircle, ChevronRight, Loader2 } from 'lucide-react';

export default function Terminal({ output, clearOutput, isExecuting }) {
  return (
    <div className="h-full w-full flex flex-col bg-[#020617] font-mono border-t border-white/5">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/40 border-b border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <TerminalIcon size={14} className="text-blue-400" />
          Output Console
        </div>
        <button onClick={clearOutput} className="text-gray-500 hover:text-white transition-colors">
          <XCircle size={14} />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {isExecuting ? (
          <div className="flex items-center gap-2 text-blue-400 animate-pulse text-sm">
            <Loader2 size={14} className="animate-spin" />
            Executing script...
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <ChevronRight size={14} className="text-slate-600 mt-1 flex-shrink-0" />
            <pre className={`whitespace-pre-wrap break-words text-sm leading-relaxed flex-1 ${
              output.toLowerCase().includes('error') ? 'text-red-400' : 'text-green-400'
            }`}>
              {output || "System ready. Click 'Run Code' to execute."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}