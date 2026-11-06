import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";

const CountsContext = createContext(null);

export function CountsProvider({ children }) {
  const { user } = useAuth();
  const employeeId = Number(user?.empleado_id) || null;
  const [totals, setTotals] = useState({});
  const [lastCounts, setLastCounts] = useState({});
  const [teamId, setTeamId] = useState(null);

  const refresh = useCallback(async () => {
    if (!employeeId) {
      setTotals({});
      setLastCounts({});
      return;
    }

    const response = await axios.get(
      `${API_URL}inventory/individuals/id/${employeeId}`
    );
    const nextTotals = {};
    const nextDates = {};
    for (const row of response.data) {
      nextTotals[row.id_products] = row.total_qty;
      nextDates[row.id_products] = row.last_count;
    }
    setTotals(nextTotals);
    setLastCounts(nextDates);
  }, [employeeId]);

  useEffect(() => {
    let cancelled = false;

    refresh().catch(() => {
      if (cancelled) return;
      setTotals({});
      setLastCounts({});
    });

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (!employeeId) {
      setTeamId(null);
      return;
    }

    const controller = new AbortController();

    axios
      .get(`${API_URL}teams/`, { signal: controller.signal })
      .then((response) => {
        const team = response.data.find(
          (item) =>
            item.empleado_id_a === employeeId ||
            item.empleado_id_b === employeeId
        );
        setTeamId(team?.id ?? null);
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED") return;
        setTeamId(null);
      });

    return () => controller.abort();
  }, [employeeId]);

  const value = useMemo(
    () => ({ totals, lastCounts, employeeId, teamId, refresh }),
    [totals, lastCounts, employeeId, teamId, refresh]
  );

  return <CountsContext.Provider value={value}>{children}</CountsContext.Provider>;
}

export function useCounts() {
  const context = useContext(CountsContext);
  if (!context) {
    throw new Error("useCounts debe usarse dentro de CountsProvider.");
  }
  return context;
}
