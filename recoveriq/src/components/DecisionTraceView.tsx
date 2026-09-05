import React from "react";
import { Clock, CheckCircle2, AlertTriangle, XCircle, Info, FileText } from "lucide-react";
import { DecisionTraceEntry } from "../types";

interface DecisionTraceViewProps {
  trace: DecisionTraceEntry[];
  caseId: string;
}

export const DecisionTraceView: React.FC<DecisionTraceViewProps> = ({ trace, caseId }) => {
  const getStatusIcon = (status: DecisionTraceEntry["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />;
      case "warning":
        return <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case "error":
        return <XCircle className="w-3.5 h-3.5 text-[#FA7298]" />;
      case "info":
      default:
        return <span className="w-2 h-2 rounded-full bg-[#E52B50]" />;
    }
  };

  return (
    <div className="bg-[#161618] border border-[#27272A] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">
            06. Trace Log
          </span>
          <span className="w-1 h-1 rounded-full bg-[#71717A]" />
          <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
            Autonomous Decision Audit
          </h3>
        </div>
        <div className="text-[11px] font-mono text-[#A1A1AA]">
          Case Reference: <span className="text-white font-semibold">{caseId}</span>
        </div>
      </div>

      <div className="relative pl-4 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-[#27272A]">
        {trace.map((entry, index) => (
          <div key={entry.id || index} className="relative flex items-start gap-3 group">
            {/* Timeline node */}
            <div className="absolute -left-4 top-1 w-4 h-4 rounded-full bg-[#121214] border border-[#27272A] flex items-center justify-center shrink-0">
              {getStatusIcon(entry.status)}
            </div>

            <div className="flex-1 bg-[#121214] hover:bg-[#161618] border border-[#27272A] hover:border-[#3F3F46] rounded-xl p-3.5 text-xs transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-white tracking-tight">
                  {entry.title}
                </span>
                <span className="font-mono text-[11px] text-[#A1A1AA]">
                  {entry.timestamp}
                </span>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed text-[11.5px]">
                {entry.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
