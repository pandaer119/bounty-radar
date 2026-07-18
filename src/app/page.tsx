import { RadarDashboard } from "@/components/radar-dashboard";
import type { Filters } from "@/components/filter-toolbar";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const allowedStatus = new Set<Filters["status"]>(["active", "all", "open", "upcoming", "excluded"]);
const allowedRisk = new Set<Filters["risk"]>(["all", "low", "medium", "high"]);
const allowedSort = new Set<Filters["sort"]>(["score", "deadline", "prize"]);

function scalar(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = scalar(params.status) as Filters["status"] | undefined;
  const risk = scalar(params.risk) as Filters["risk"] | undefined;
  const sort = scalar(params.sort) as Filters["sort"] | undefined;
  const initialFilters: Filters = {
    query: scalar(params.q) ?? "",
    status: status && allowedStatus.has(status) ? status : "active",
    risk: risk && allowedRisk.has(risk) ? risk : "all",
    sort: sort && allowedSort.has(sort) ? sort : "score",
  };

  return <RadarDashboard initialFilters={initialFilters} />;
}
