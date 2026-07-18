import { Activity, CircleDollarSign, Radar, ShieldCheck, Target } from "lucide-react";

const workflow = [
  { label: "机会核验", state: "运行中", done: true },
  { label: "赛道锁定", state: "待确认", done: false },
  { label: "MVP 构建", state: "未开始", done: false },
  { label: "提交验收", state: "人工门禁", done: false },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><Radar size={19} strokeWidth={2.2} /></span>
        <div>
          <strong>Bounty Radar</strong>
          <small>Agent × Web3</small>
        </div>
      </div>

      <nav className="primary-nav" aria-label="主导航">
        <a className="nav-item nav-item-active" href="#radar" aria-current="page">
          <Activity size={17} />
          机会雷达
        </a>
        <a className="nav-item" href="#shortlist">
          <Target size={17} />
          首期目标
        </a>
        <a className="nav-item" href="#safety">
          <ShieldCheck size={17} />
          风险门禁
        </a>
      </nav>

      <section className="workflow-card" aria-labelledby="workflow-title">
        <div className="eyebrow" id="workflow-title">首期流水线</div>
        <ol>
          {workflow.map((item, index) => (
            <li key={item.label} className={item.done ? "is-done" : ""}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{item.label}</strong>
                <small>{item.state}</small>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="sidebar-footer">
        <CircleDollarSign size={17} />
        <div>
          <strong>零资金自动化</strong>
          <span>实盘与钱包始终人工确认</span>
        </div>
      </div>
    </aside>
  );
}
