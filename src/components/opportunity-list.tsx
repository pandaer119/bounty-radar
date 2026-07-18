import { ChevronRight, Star } from "lucide-react";
import type { RankedOpportunity } from "@/lib/types";

type Props = {
  opportunities: RankedOpportunity[];
  selectedId?: string;
  shortlist: string[];
  onSelect: (id: string) => void;
  onToggleShortlist: (id: string) => void;
};

const statusLabels: Record<RankedOpportunity["effectiveStatus"], string> = {
  open: "进行中",
  upcoming: "即将开始",
  monitor: "观察",
  excluded: "已排除",
  closed: "已结束",
};

const priorityLabels: Record<RankedOpportunity["priority"], string> = {
  primary: "首选",
  shortlist: "候选",
  monitor: "观察",
  avoid: "不参与",
};

function formatPrize(value: number) {
  return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(new Date(value));
}

export function OpportunityList({ opportunities, selectedId, shortlist, onSelect, onToggleShortlist }: Props) {
  if (!opportunities.length) {
    return (
      <div className="empty-state">
        <span>0</span>
        <strong>没有匹配的机会</strong>
        <p>放宽状态或风险筛选，或者清空搜索词。</p>
      </div>
    );
  }

  return (
    <div className="opportunity-list" role="list" aria-label="赏金机会">
      <div className="list-heading" aria-hidden="true">
        <span>机会 / 匹配度</span>
        <span>奖池</span>
        <span>截止</span>
        <span>状态</span>
        <span />
      </div>
      {opportunities.map((opportunity) => {
        const isSelected = selectedId === opportunity.id;
        const isShortlisted = shortlist.includes(opportunity.id);
        return (
          <article
            className={`opportunity-row ${isSelected ? "is-selected" : ""}`}
            key={opportunity.id}
            role="listitem"
          >
            <button className="row-main" type="button" onClick={() => onSelect(opportunity.id)}>
              <span className={`score-orbit score-${opportunity.priority}`} style={{ "--score": opportunity.score } as React.CSSProperties}>
                <strong>{opportunity.score}</strong>
              </span>
              <span className="opportunity-identity">
                <span className="row-kicker">
                  {opportunity.organizer} · {priorityLabels[opportunity.priority]}
                </span>
                <strong>{opportunity.title}</strong>
                <span className="tag-line">{opportunity.tags.slice(0, 3).join(" · ")}</span>
              </span>
              <span className="table-value prize-value">{formatPrize(opportunity.prizePoolUsd)}</span>
              <span className="table-value">
                <strong>{formatDate(opportunity.deadlineAt)}</strong>
                <small>{opportunity.daysRemaining >= 0 ? `剩 ${opportunity.daysRemaining} 天` : "已截止"}</small>
              </span>
              <span className={`status-pill status-${opportunity.effectiveStatus}`}>
                {statusLabels[opportunity.effectiveStatus]}
              </span>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
            <button
              className={`shortlist-button ${isShortlisted ? "is-active" : ""}`}
              type="button"
              onClick={() => onToggleShortlist(opportunity.id)}
              aria-label={isShortlisted ? `从候选移除 ${opportunity.title}` : `加入候选 ${opportunity.title}`}
            >
              <Star size={16} fill={isShortlisted ? "currentColor" : "none"} />
            </button>
          </article>
        );
      })}
    </div>
  );
}
