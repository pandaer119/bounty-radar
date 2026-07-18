"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { AppError, OpportunitiesResponse } from "@/lib/types";

type RequestState = "loading" | "ready" | "refreshing" | "error";

export function useOpportunities() {
  const [payload, setPayload] = useState<OpportunitiesResponse | null>(null);
  const [requestState, setRequestState] = useState<RequestState>("loading");
  const [error, setError] = useState<AppError | null>(null);

  const load = useCallback(async (refresh = false) => {
    setRequestState(refresh ? "refreshing" : "loading");
    setError(null);
    try {
      const response = await apiClient.request<OpportunitiesResponse>("/api/opportunities");
      setPayload(response);
      setRequestState("ready");
    } catch (requestError) {
      setError(requestError as AppError);
      setRequestState("error");
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiClient
      .request<OpportunitiesResponse>("/api/opportunities")
      .then((response) => {
        if (!active) return;
        setPayload(response);
        setRequestState("ready");
      })
      .catch((requestError: AppError) => {
        if (!active) return;
        setError(requestError);
        setRequestState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  return {
    opportunities: payload?.data ?? [],
    meta: payload?.meta ?? null,
    requestState,
    error,
    refresh: () => load(true),
  };
}
