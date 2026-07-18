import { ListFilter, RefreshCw, Search } from "lucide-react";

export type Filters = {
  query: string;
  status: "active" | "all" | "open" | "upcoming" | "excluded";
  risk: "all" | "low" | "medium" | "high";
  sort: "score" | "deadline" | "prize";
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onRefresh: () => void;
  refreshing: boolean;
};

export function FilterToolbar({ filters, onChange, onRefresh, refreshing }: Props) {
  return (
    <div className="toolbar" aria-label="机会筛选">
      <label className="search-field">
        <Search size={17} aria-hidden="true" />
        <span className="sr-only">搜索机会</span>
        <input
          aria-label="搜索机会"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="搜索赛事、赛道或技术…"
        />
      </label>

      <div className="filter-group">
        <ListFilter size={16} aria-hidden="true" />
        <select
          aria-label="状态"
          value={filters.status}
          onChange={(event) => onChange({ ...filters, status: event.target.value as Filters["status"] })}
        >
          <option value="active">可行动</option>
          <option value="open">进行中</option>
          <option value="upcoming">即将开始</option>
          <option value="excluded">已排除</option>
          <option value="all">全部状态</option>
        </select>
        <select
          aria-label="风险"
          value={filters.risk}
          onChange={(event) => onChange({ ...filters, risk: event.target.value as Filters["risk"] })}
        >
          <option value="all">全部风险</option>
          <option value="low">低风险</option>
          <option value="medium">中风险</option>
          <option value="high">高风险</option>
        </select>
        <select
          aria-label="排序"
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value as Filters["sort"] })}
        >
          <option value="score">按机会分</option>
          <option value="deadline">按截止日</option>
          <option value="prize">按奖池</option>
        </select>
      </div>

      <button className="sync-button" type="button" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw size={16} className={refreshing ? "is-spinning" : ""} />
        {refreshing ? "同步中" : "重新评分"}
      </button>
    </div>
  );
}
