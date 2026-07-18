"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, RadioTower } from "lucide-react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { FilterToolbar, type Filters } from "./filter-toolbar";
import { MetricsStrip } from "./metrics-strip";
import { OpportunityInspector } from "./opportunity-inspector";
import { OpportunityList } from "./opportunity-list";
import { Sidebar } from "./sidebar";
import { ConfidentialStrategyVault } from "./confidential-strategy-vault";

export function RadarDashboard({ initialFilters }: { initialFilters: Filters }) {
  const { opportunities, meta, requestState, error, refresh } = useOpportunities();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [selectedId, setSelectedId] = useState<string>();
  const [shortlist, setShortlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const savedShortlist = window.localStorage.getItem("bounty-radar:shortlist");
    if (savedShortlist) {
      try {
        return JSON.parse(savedShortlist) as string[];
      } catch {
        window.localStorage.removeItem("bounty-radar:shortlist");
      }
    }
    return [];
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.status !== "active") params.set("status", filters.status);
    if (filters.risk !== "all") params.set("risk", filters.risk);
    if (filters.sort !== "score") params.set("sort", filters.sort);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [filters]);

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLocaleLowerCase();
    const items = opportunities.filter((opportunity) => {
      const searchable = [opportunity.title, opportunity.organizer, opportunity.platform, ...opportunity.tags]
        .join(" ")
        .toLocaleLowerCase();
      const matchesQuery = !query || searchable.includes(query);
      const matchesRisk = filters.risk === "all" || opportunity.riskLevel === filters.risk;
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active"
          ? !["excluded", "closed"].includes(opportunity.effectiveStatus)
          : opportunity.effectiveStatus === filters.status);
      return matchesQuery && matchesRisk && matchesStatus;
    });

    return items.sort((a, b) => {
      if (filters.sort === "deadline") return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
      if (filters.sort === "prize") return b.prizePoolUsd - a.prizePoolUsd;
      return b.score - a.score;
    });
  }, [filters, opportunities]);

  const effectiveSelectedId = selectedId ?? filtered[0]?.id;
  const selected = filtered.find((opportunity) => opportunity.id === effectiveSelectedId) ?? filtered[0];

  function toggleShortlist(id: string) {
    setShortlist((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem("bounty-radar:shortlist", JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="app-shell" id="radar">
      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Decision workspace / 001</span>
            <h1>今晚该投哪一个？</h1>
            <p>只看官方规则、真实交付和风险调整后的胜率。</p>
          </div>
          <div className="sync-status" role="status">
            {meta?.stale ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            <div>
              <strong>{meta?.stale ? "证据需要复核" : "官方证据已核验"}</strong>
              <span>{meta ? `数据日期 ${meta.verifiedAt}` : "正在读取机会库"}</span>
            </div>
            <RadioTower size={17} className={requestState === "refreshing" ? "is-pulsing" : ""} />
          </div>
        </header>

        {requestState === "loading" ? (
          <DashboardSkeleton />
        ) : requestState === "error" ? (
          <div className="error-state" role="alert">
            <AlertCircle size={24} />
            <div><strong>{error?.message ?? "机会库暂时不可用"}</strong><p>本地草稿没有丢失，可以重新读取。</p></div>
            <button type="button" onClick={() => void refresh()}>重试</button>
          </div>
        ) : (
          <>
            <MetricsStrip opportunities={opportunities} />
            <ConfidentialStrategyVault />
            <section className="workspace-panel">
              <div className="workspace-heading">
                <div>
                  <span className="eyebrow">Opportunity queue</span>
                  <h2>机会队列</h2>
                </div>
                <p><strong>{filtered.length}</strong> / {opportunities.length} 条符合当前筛选</p>
              </div>
              <FilterToolbar
                filters={filters}
                onChange={setFilters}
                onRefresh={() => void refresh()}
                refreshing={requestState === "refreshing"}
              />
              <div className="workspace-grid">
                <OpportunityList
                  opportunities={filtered}
                  selectedId={selected?.id}
                  shortlist={shortlist}
                  onSelect={setSelectedId}
                  onToggleShortlist={toggleShortlist}
                />
                <OpportunityInspector opportunity={selected} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-label="正在加载机会数据">
      <div className="skeleton-metrics">
        {[0, 1, 2, 3].map((item) => <span key={item} />)}
      </div>
      <div className="skeleton-workspace"><span /><span /><span /><span /></div>
    </div>
  );
}
