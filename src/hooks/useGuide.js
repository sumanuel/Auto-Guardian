import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { getAllExpenses } from "../services/expenseService";
import {
  computeGuideSteps,
  DEFAULT_GUIDE_PREFS,
  loadGuidePrefs,
  updateGuidePrefs,
} from "../services/guideService";
import { getAllRepairs } from "../services/repairService";
import { getAllVehicleDocuments } from "../services/vehicleDocumentService";

// Progreso de la guía de primeros pasos; se recalcula cada vez que la pantalla gana foco
export const useGuide = () => {
  const { vehicles, getAllMaintenances } = useApp();
  const [prefs, setPrefs] = useState(DEFAULT_GUIDE_PREFS);
  const [loaded, setLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadGuidePrefs().then((saved) => {
        if (!active) return;
        setPrefs(saved);
        setLoaded(true);
        setRefreshKey((k) => k + 1);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const steps = useMemo(
    () =>
      computeGuideSteps(
        {
          vehicles,
          maintenances: getAllMaintenances(),
          expenses: getAllExpenses(),
          repairs: getAllRepairs(),
          documents: getAllVehicleDocuments(),
        },
        prefs,
      ),
    // refreshKey fuerza la lectura de los datos al volver a la pantalla
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vehicles, prefs, refreshKey],
  );

  const update = useCallback(async (patch) => {
    setPrefs(await updateGuidePrefs(patch));
  }, []);

  const doneCount = steps.filter((s) => s.done).length;
  const basicsDone = steps.slice(0, 5).every((s) => s.done);

  return {
    steps,
    doneCount,
    total: steps.length,
    firstPending: steps.find((s) => !s.done) || null,
    // La bienvenida se ofrece una sola vez, y solo a quien aún no domina lo básico
    showWelcome: loaded && !prefs.seen && !basicsDone,
    markSeen: () => update({ seen: true }),
    markStatsVisited: () => update({ statsVisited: true }),
  };
};
