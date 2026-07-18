"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, ExternalLink, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type {
  KeeperHubReadinessResponse,
  KeeperHubSimulationResponse,
  ProofPreviewResponse,
} from "@/lib/proof-types";
import type { RankedOpportunity, ScoreBreakdown } from "@/lib/types";

const statusLabels: Record<RankedOpportunity["effectiveStatus"], string> = {
  open: "正在开放",
  upcoming: "即将开始",
  monitor: "观察中",
  excluded: "安全排除",
  closed: "已经结束",
};

const dimensionLabels: Record<keyof Omit<ScoreBreakdown, "riskPenalty">, string> = {
  thematicFit: "赛道匹配",
  payoutCertainty: "奖金可信",
  runway: "时间窗口",
  winSurface: "获奖覆盖",
  executionReadiness: "交付把握",
  rulesCompleteness: "规则完整",
};

export function OpportunityInspector({ opportunity }: { opportunity?: RankedOpportunity }) {
  const [proofs, setProofs] = useState<Record<string, ProofPreviewResponse>>({});
  const [simulations, setSimulations] = useState<Record<string, KeeperHubSimulationResponse>>({});
  const [readiness, setReadiness] = useState<KeeperHubReadinessResponse>();
  const [readinessUnavailable, setReadinessUnavailable] = useState(false);
  const [pendingId, setPendingId] = useState<string>();
  const [simulationPendingId, setSimulationPendingId] = useState<string>();
  const [proofError, setProofError] = useState<string>();
  const [simulationError, setSimulationError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    apiClient.request<KeeperHubReadinessResponse>("/api/integrations/keeperhub/status")
      .then((response) => {
        if (!cancelled) setReadiness(response);
      })
      .catch(() => {
        if (!cancelled) setReadinessUnavailable(true);
      });
    return () => { cancelled = true; };
  }, []);

  if (!opportunity) {
    return (
      <aside className="inspector inspector-empty">
        <Sparkles size={22} />
        <strong>选择一个机会</strong>
        <p>这里会显示评分依据、官方证据、提交物和必须人工确认的动作。</p>
      </aside>
    );
  }

  const preview = proofs[opportunity.id];
  const simulation = simulations[opportunity.id];
  const simulationData = readSimulationData(simulation?.simulation.data);

  async function createPreview() {
    if (!opportunity) return;
    setPendingId(opportunity.id);
    setProofError(undefined);
    try {
      const response = await apiClient.request<ProofPreviewResponse>("/api/proofs/preview", {
        method: "POST",
        body: JSON.stringify({ opportunityId: opportunity.id }),
        headers: { "content-type": "application/json" },
      });
      setProofs((current) => ({ ...current, [opportunity.id]: response }));
    } catch {
      setProofError("证明草案生成失败，请稍后重试。");
    } finally {
      setPendingId(undefined);
    }
  }

  async function simulateProof() {
    if (!opportunity || !readiness?.configured || !readiness.simulationEnabled) return;
    setSimulationPendingId(opportunity.id);
    setSimulationError(undefined);
    try {
      const response = await apiClient.request<KeeperHubSimulationResponse>("/api/proofs/simulate", {
        method: "POST",
        body: JSON.stringify({ opportunityId: opportunity.id }),
        headers: { "content-type": "application/json" },
      });
      setSimulations((current) => ({ ...current, [opportunity.id]: response }));
    } catch {
      setSimulationError("KeeperHub 安全模拟未完成；没有广播交易，可以检查配置后重试。");
    } finally {
      setSimulationPendingId(undefined);
    }
  }

  return (
    <aside className="inspector" id="shortlist" aria-label={`${opportunity.title} 详情`}>
      <header className="inspector-header">
        <div>
          <span className="eyebrow">{opportunity.platform} · {statusLabels[opportunity.effectiveStatus]}</span>
          <h2>{opportunity.title}</h2>
          <p>{opportunity.summary}</p>
        </div>
        <div className={`hero-score score-${opportunity.priority}`}>
          <strong>{opportunity.score}</strong>
          <span>机会分</span>
        </div>
      </header>

      <a className="official-link" href={opportunity.evidence[0].url} target="_blank" rel="noreferrer">
        查看官方规则
        <ExternalLink size={15} />
      </a>

      <section className="proof-console" aria-label="BountyProof 链上证明">
        <div className="section-title">
          <span>BountyProof / execution rail</span>
          <small>Sepolia · simulate only</small>
        </div>
        <div className="keeperhub-readiness" aria-label="KeeperHub 安全状态">
          <span className={readiness?.registryConfigured ? "is-ready" : "is-waiting"}>
            <i /> 合约 {readiness?.registryConfigured ? "已配置" : "待部署"}
          </span>
          <span className={readiness?.apiKeyConfigured ? "is-ready" : "is-waiting"}>
            <i /> 执行凭据 {readiness?.apiKeyConfigured ? "已配置" : "未配置"}
          </span>
          <span className="is-safe"><i /> 广播关闭</span>
        </div>
        {readinessUnavailable && <p className="readiness-error">KeeperHub 本地状态暂时不可读取。</p>}
        {preview ? (
          <div className="proof-result">
            <div>
              <span>Opportunity key</span>
              <code>{preview.proof.opportunityKey.slice(0, 12)}…{preview.proof.opportunityKey.slice(-8)}</code>
            </div>
            <div>
              <span>Evidence hash</span>
              <code>{preview.proof.sourceHash.slice(0, 12)}…{preview.proof.sourceHash.slice(-8)}</code>
            </div>
            <p>
              {preview.keeperHubDraft.status === "needs_contract_deployment"
                ? "证明载荷已生成；等待部署测试网合约后进入 KeeperHub 人工批准。"
                : "合约调用数据已就绪；仍需人工批准后才能交给 KeeperHub 执行。"}
            </p>
          </div>
        ) : (
          <p className="proof-intro">把官方来源、评分和证据摘要生成确定性 bytes32 载荷；此步骤不会连接钱包或发送交易。</p>
        )}
        {proofError && <p className="proof-error" role="alert">{proofError}</p>}
        <button
          className="proof-button"
          type="button"
          onClick={() => void createPreview()}
          disabled={opportunity.priority === "avoid" || pendingId === opportunity.id}
        >
          <Sparkles size={15} />
          {opportunity.priority === "avoid"
            ? "风险门禁已阻断"
            : pendingId === opportunity.id
              ? "正在生成载荷"
              : preview
                ? "重新生成证明草案"
                : "生成链上证明草案"}
        </button>

        {preview && (
          <div className="simulation-stage">
            {simulation ? (
              <div className="simulation-result" role="status">
                <ShieldCheck size={16} />
                <div>
                  <strong>KeeperHub 已完成安全模拟</strong>
                  <span>
                    {simulationData.gasEstimate ? `Gas estimate ${simulationData.gasEstimate}` : "链上调用已通过预检"}
                    {simulationData.wouldRevert === false ? " · 不会回滚" : ""}
                  </span>
                </div>
              </div>
            ) : (
              <p>下一步仅调用 KeeperHub `simulate: true`；不会签名、广播或生成交易哈希。</p>
            )}
            {simulationError && <p className="proof-error" role="alert">{simulationError}</p>}
            <button
              className="simulation-button"
              type="button"
              onClick={() => void simulateProof()}
              disabled={
                !readiness?.configured ||
                !readiness.simulationEnabled ||
                simulationPendingId === opportunity.id
              }
            >
              <Activity size={14} />
              {!readiness?.configured
                ? "等待 KeeperHub 配置"
                : !readiness.simulationEnabled
                  ? "等待人工开启安全模拟"
                  : simulationPendingId === opportunity.id
                    ? "正在运行安全模拟"
                    : simulation
                      ? "重新运行安全模拟"
                      : "运行 KeeperHub 安全模拟"}
            </button>
          </div>
        )}
      </section>

      <section className="inspector-section">
        <div className="section-title">
          <span>评分剖面</span>
          <small>风险扣分 {opportunity.scoreBreakdown.riskPenalty}</small>
        </div>
        <div className="score-bars">
          {(Object.entries(dimensionLabels) as [keyof typeof dimensionLabels, string][]).map(([key, label]) => (
            <div className="score-bar" key={key}>
              <span>{label}</span>
              <div><i style={{ width: `${opportunity.scoreBreakdown[key]}%` }} /></div>
              <strong>{opportunity.scoreBreakdown[key]}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="inspector-section">
        <div className="section-title"><span>下一步动作</span><Sparkles size={14} /></div>
        <ol className="action-list">
          {opportunity.nextActions.map((action, index) => (
            <li key={action}><span>{index + 1}</span>{action}</li>
          ))}
        </ol>
      </section>

      <details className="details-block" open>
        <summary><CheckCircle2 size={15} /> 提交要求</summary>
        <ul>{opportunity.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
      </details>

      <details className="details-block human-gates" id="safety" open>
        <summary><LockKeyhole size={15} /> 人工门禁</summary>
        <ul>{opportunity.humanGates.map((gate) => <li key={gate}>{gate}</li>)}</ul>
      </details>

      {opportunity.financialRisk === "high" && (
        <div className="risk-callout">
          <AlertTriangle size={18} />
          <div><strong>已阻断资金风险</strong><span>该活动需要真实资金或交易权限，不进入自动执行。</span></div>
        </div>
      )}

      <footer className="evidence-note">
        <span>证据核验于 {opportunity.evidence[0].verifiedAt}</span>
        <p>{opportunity.evidence[0].note}</p>
      </footer>
    </aside>
  );
}

function readSimulationData(value: unknown): { gasEstimate?: string; wouldRevert?: boolean } {
  if (!value || typeof value !== "object") return {};
  const payload = value as Record<string, unknown>;
  return {
    ...(typeof payload.gasEstimate === "string" ? { gasEstimate: payload.gasEstimate } : {}),
    ...(typeof payload.wouldRevert === "boolean" ? { wouldRevert: payload.wouldRevert } : {}),
  };
}
