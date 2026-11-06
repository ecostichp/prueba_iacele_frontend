import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

import BACKEND_URL from "@/constants/values";
import { CurrentUserContext } from "@/context/Context";

const MyCountsContext = createContext({
    totals: {},
    employeeId: null,
    teamId: null,
    refresh: async () => {},
});

export function MyCountsProvider({ children }) {
    const user = useContext(CurrentUserContext);
    const employeeId = Number(user?.empleado_id) || null;
    const [totals, setTotals] = useState({});
    const [teamId, setTeamId] = useState(null);

    const refresh = useCallback(async () => {
        if (!employeeId) {
            setTotals({});
            return;
        }

        const response = await axios.get(
            `${BACKEND_URL}inventory/individuals/id/${employeeId}`
        );
        const next = {};
        for (const row of response.data) {
            next[row.id_products] = row.total_qty;
        }
        setTotals(next);
    }, [employeeId]);

    useEffect(() => {
        refresh().catch(() => setTotals({}));
    }, [refresh]);

    useEffect(() => {
        if (!employeeId) {
            setTeamId(null);
            return;
        }

        let cancelled = false;

        axios.get(`${BACKEND_URL}teams/`).then((response) => {
            if (cancelled) return;
            const team = response.data.find(
                (item) =>
                    item.empleado_id_a === employeeId ||
                    item.empleado_id_b === employeeId
            );
            setTeamId(team?.id ?? null);
        }).catch(() => {
            if (!cancelled) setTeamId(null);
        });

        return () => {
            cancelled = true;
        };
    }, [employeeId]);

    return (
        <MyCountsContext.Provider value={{ totals, employeeId, teamId, refresh }}>
            {children}
        </MyCountsContext.Provider>
    );
}

export function useMyCounts() {
    return useContext(MyCountsContext);
}
