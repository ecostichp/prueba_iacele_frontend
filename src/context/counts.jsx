import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { normalizeStage } from "@/lib/stage";

const CountsContext = createContext(null);

export function CountsProvider({ children }) {
  const { user } = useAuth();
  const employeeId = Number(user?.empleado_id) || null;
  const assignedUserId = Number(user?.assigned_user_id) || employeeId;
  const helping = Boolean(employeeId && assignedUserId && employeeId !== assignedUserId);
  const [totals, setTotals] = useState({});
  const [lastCounts, setLastCounts] = useState({});
  const [teamId, setTeamId] = useState(null);
  const [selfName, setSelfName] = useState("");
  const [assignedName, setAssignedName] = useState("");
  const [stage, setStage] = useState("individual");

  const refresh = useCallback(async () => {
    if (!assignedUserId) {
      setTotals({});
      setLastCounts({});
      return;
    }

    const response = await axios.get(
      `${API_URL}inventory/individuals/id/${assignedUserId}`
    );
    const nextTotals = {};
    const nextDates = {};
    for (const row of response.data) {
      nextTotals[row.id_products] = row.total_qty;
      nextDates[row.id_products] = row.last_count;
    }
    setTotals(nextTotals);
    setLastCounts(nextDates);
  }, [assignedUserId]);

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
    if (!assignedUserId) {
      setTeamId(null);
      return;
    }

    const controller = new AbortController();

    axios
      .get(`${API_URL}teams/`, { signal: controller.signal })
      .then((response) => {
        const team = response.data.find(
          (item) =>
            Number(item.empleado_id_a) === assignedUserId ||
            Number(item.empleado_id_b) === assignedUserId
        );
        setTeamId(team?.id ?? null);
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED") return;
        setTeamId(null);
      });

    return () => controller.abort();
  }, [assignedUserId]);

  useEffect(() => {
    if (!employeeId) {
      setSelfName("");
      setAssignedName("");
      return undefined;
    }

    const controller = new AbortController();
    const ids = [...new Set([employeeId, assignedUserId].filter(Boolean))];
    Promise.all(
      ids.map((id) => axios.get(`${API_URL}employees/id/${id}`, { signal: controller.signal }))
    )
      .then((responses) => {
        const names = new Map(responses.map((response) => [Number(response.data.id), response.data.name]));
        setSelfName(names.get(employeeId) || "");
        setAssignedName(names.get(assignedUserId) || "");
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED") return;
      });

    return () => controller.abort();
  }, [employeeId, assignedUserId]);

  useEffect(() => {
    let cancelled = false;
    const loadStage = () => {
      axios
        .get(`${API_URL}inventory/stage`)
        .then((response) => {
          const next = response.data?.stage;
          if (!cancelled && next) setStage(normalizeStage(next));
        })
        .catch(() => {});
    };

    loadStage();
    const intervalId = setInterval(loadStage, 4000);
    window.addEventListener("iacele-stage", loadStage);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("iacele-stage", loadStage);
    };
  }, []);

  const value = useMemo(
    () => ({
      totals,
      lastCounts,
      employeeId,
      assignedUserId,
      helping,
      selfName,
      assignedName,
      teamId,
      stage,
      refresh,
    }),
    [totals, lastCounts, employeeId, assignedUserId, helping, selfName, assignedName, teamId, stage, refresh]
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
