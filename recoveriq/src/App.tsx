import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { InvestigationWorkspace } from "./components/InvestigationWorkspace";
import { PerformanceDashboard } from "./components/PerformanceDashboard";
import { CasesList } from "./components/CasesList";
import { SafetyPoliciesView } from "./components/SafetyPoliciesView";
import { PerformanceMetrics, RecoveryCase, RevenueProblemInput } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "investigate" | "performance" | "cases" | "policies"
  >("investigate");

  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [currentCase, setCurrentCase] = useState<RecoveryCase | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalRevenueAtRisk: 0,
    totalExpectedRecovery: 0,
    totalActuallyRecovered: 0,
    recoveryRate: 0,
    casesInvestigated: 0,
    actionsExecuted: 0,
    actionsBlockedByPolicy: 0,
  });

  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [casesRes, metricsRes, healthRes] = await Promise.all([
        fetch("/api/cases"),
        fetch("/api/metrics"),
        fetch("/api/health"),
      ]);

      if (casesRes.ok) {
        const data = await casesRes.json();
        setCases(data.cases || []);
        // Default to the first case if currentCase is null
        if (!currentCase && data.cases && data.cases.length > 0) {
          setCurrentCase(data.cases[0]);
        }
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics);
      }

      if (healthRes.ok) {
        const health = await healthRes.json();
        setHasApiKey(health.hasGeminiKey);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle AI Analysis: FIND -> DIAGNOSE -> DECIDE -> SAFETY CHECK
  const handleAnalyze = async (input: RevenueProblemInput) => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/recovery/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (data.case) {
        setCurrentCase(data.case);
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze revenue recovery case.");
      }

      await fetchData();
    } catch (err: any) {
      console.error("Analysis failure:", err);
      setAnalysisError(err.message || "Failed to connect to AI engine.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Action Execution via PaymentProvider
  const handleExecute = async () => {
    if (!currentCase) return;
    setIsExecuting(true);

    try {
      const res = await fetch("/api/recovery/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: currentCase.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to execute recovery action.");
      }

      setCurrentCase(data.case);
      await fetchData();
    } catch (err) {
      console.error("Execution failure:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle Outcome Simulation: Verified Successful Payment vs Failed Payment
  const handleSimulateOutcome = async (outcome: "SUCCESS" | "FAILURE") => {
    if (!currentCase) return;
    setIsSimulating(true);

    try {
      const res = await fetch("/api/recovery/simulate-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: currentCase.id, outcome }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record payment outcome.");
      }

      setCurrentCase(data.case);
      await fetchData();
    } catch (err) {
      console.error("Outcome simulation failure:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle Policy Override Approval by Merchant
  const handleApprovePolicyException = async (overrideReason: string) => {
    if (!currentCase) return;
    setIsApproving(true);

    try {
      const res = await fetch("/api/recovery/merchant-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: currentCase.id, overrideReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve policy exception.");
      }

      setCurrentCase(data.case);
      await fetchData();
    } catch (err) {
      console.error("Policy override failure:", err);
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Strategy Selection / Evaluation
  const handleSelectStrategy = async (action: any) => {
    if (!currentCase) return;
    try {
      const res = await fetch("/api/recovery/select-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: currentCase.id, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update recovery strategy.");
      }

      setCurrentCase(data.case);
      await fetchData();
    } catch (err) {
      console.error("Strategy selection failure:", err);
    }
  };

  // Reset Session Cases to Benchmark Seeds
  const handleResetDemo = async () => {
    try {
      const res = await fetch("/api/cases/reset-demo", { method: "POST" });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to reset demo cases:", err);
    }
  };

  // Select a past case to inspect in workspace
  const handleSelectCase = (c: RecoveryCase) => {
    setCurrentCase(c);
    setActiveTab("investigate");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        caseCount={cases.length}
        totalRecovered={metrics.totalActuallyRecovered}
        onResetDemo={handleResetDemo}
        hasApiKey={hasApiKey}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {activeTab === "investigate" && (
          <InvestigationWorkspace
            currentCase={currentCase}
            setCurrentCase={setCurrentCase}
            onAnalyze={handleAnalyze}
            onExecute={handleExecute}
            onSimulateOutcome={handleSimulateOutcome}
            onApprovePolicyException={handleApprovePolicyException}
            onSelectStrategy={handleSelectStrategy}
            isAnalyzing={isAnalyzing}
            isExecuting={isExecuting}
            isSimulating={isSimulating}
            isApproving={isApproving}
            analysisError={analysisError}
            hasApiKey={hasApiKey}
          />
        )}

        {activeTab === "performance" && (
          <PerformanceDashboard
            metrics={metrics}
            cases={cases}
            onSelectCase={handleSelectCase}
          />
        )}

        {activeTab === "cases" && (
          <CasesList cases={cases} onSelectCase={handleSelectCase} />
        )}

        {activeTab === "policies" && <SafetyPoliciesView />}
      </main>

      {/* Persistent Bento Grid Footer */}
      <footer className="border-t border-[#27272A] py-4 bg-[#0A0A0B] text-center text-xs text-[#A1A1AA]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>
              Recover<span className="text-[#E52B50] font-bold">IQ</span> Autonomous Revenue Recovery Engine
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#71717A] tracking-wider">
            FIND → DIAGNOSE → DECIDE → SAFETY CHECK → ACT → MEASURE
          </span>
        </div>
      </footer>
    </div>
  );
}
