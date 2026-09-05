import React from "react";
import { Activity, BarChart3, History, Shield, RotateCcw, AlertCircle } from "lucide-react";

interface HeaderProps {
  activeTab: "investigate" | "performance" | "cases" | "policies";
  setActiveTab: (tab: "investigate" | "performance" | "cases" | "policies") => void;
  caseCount: number;
  totalRecovered: number;
  onResetDemo: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  caseCount,
  totalRecovered,
  onResetDemo,
  hasApiKey,
}) => {
  return (
    <header className="border-b border-[#27272A] bg-[#0A0A0B]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("investigate")}
              className="flex items-center gap-3 text-left group transition-all"
              id="brand-logo-btn"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E52B50] to-[#B53389] flex items-center justify-center shadow-lg shadow-[#E52B50]/20 border border-[#E52B50]/40 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-[#FA7298] transition-colors">
                    Recover<span className="text-[#E52B50]">IQ</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-[#161618] text-[#A1A1AA] border border-[#27272A]">
                    Bento Engine
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] tracking-wide">
                  Autonomous Merchant Revenue Recovery
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#161618] p-1 rounded-xl border border-[#27272A]">
            <button
              id="tab-investigate"
              onClick={() => setActiveTab("investigate")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "investigate"
                  ? "bg-gradient-to-r from-[#E52B50] to-[#B53389] text-white shadow-md shadow-[#E52B50]/20"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#27272A]/60"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Investigation</span>
            </button>

            <button
              id="tab-performance"
              onClick={() => setActiveTab("performance")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "performance"
                  ? "bg-gradient-to-r from-[#E52B50] to-[#B53389] text-white shadow-md shadow-[#E52B50]/20"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#27272A]/60"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Performance</span>
            </button>

            <button
              id="tab-cases"
              onClick={() => setActiveTab("cases")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "cases"
                  ? "bg-gradient-to-r from-[#E52B50] to-[#B53389] text-white shadow-md shadow-[#E52B50]/20"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#27272A]/60"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Cases & Traces</span>
              {caseCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-white">
                  {caseCount}
                </span>
              )}
            </button>

            <button
              id="tab-policies"
              onClick={() => setActiveTab("policies")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "policies"
                  ? "bg-gradient-to-r from-[#E52B50] to-[#B53389] text-white shadow-md shadow-[#E52B50]/20"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#27272A]/60"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Safety Policies</span>
            </button>
          </nav>

          {/* Right Status / Actions */}
          <div className="flex items-center gap-3">
            {/* Live Recovered ticker in Bento Tile */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#161618] border border-[#27272A]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider font-semibold">
                Recovered:
              </span>
              <span className="text-xs font-mono font-bold text-[#10B981]">
                ₹{totalRecovered.toLocaleString("en-IN")}
              </span>
            </div>

            {/* API Status indicator */}
            {!hasApiKey && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E52B50]/15 text-[#FA7298] border border-[#E52B50]/30 text-xs"
                title="GEMINI_API_KEY is not detected in environment"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden lg:inline">API Key Required</span>
              </div>
            )}

            {/* Reset Demo Cases */}
            <button
              id="btn-reset-demo"
              onClick={onResetDemo}
              title="Reset to benchmark session cases"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161618] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-medium transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Cases</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
