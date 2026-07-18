import { Clock3, CircleDollarSign, Crosshair, ShieldCheck } from "lucide-react";
import type { RankedOpportunity } from "@/lib/types";

function usd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function MetricsStrip({ opportunities }: { opportunities: RankedOpportunity[] }) {
  const eligible = opportunities.filter((item) => !["excluded", "closed"].includes(item.effectiveStatus));
  const prizePool = eligible.reduce((sum, item) => sum + item.prizePoolUsd, 0);
  const top = eligible[0];
  const urgent = eligible.filter((item) => item.daysRemaining >= 0 && item.daysRemaining <= 14).length;

  const metrics = [
    { label: "可行动机会", value: String(eligible.length).padStart(2, "0"), detail: "官方来源已核验", icon: Crosshair },
    { label: "可见奖池", value: usd(prizePool), detail: "不含高风险交易赛", icon: CircleDollarSign },
    { label: "首选匹配度", value: top ? `${top.score}/100` : "—", detail: top?.title ?? "等待数据", icon: ShieldCheck },
    { label: "14 日内截止", value: String(urgent).padStart(2, "0"), detail: urgent ? "需要优先决策" : "暂无紧急项", icon: Clock3 },
  ];

  return (
    <section className="metrics-strip" aria-label="机会概览">
      {metrics.map(({ label, value, detail, icon: Icon }) => (
        <article className="metric" key={label}>
          <Icon size={18} aria-hidden="true" />
          <div>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </div>
        </article>
      ))}
    </section>
  );
}
