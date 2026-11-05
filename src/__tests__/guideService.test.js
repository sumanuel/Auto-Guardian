jest.mock("@react-native-async-storage/async-storage", () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k) => (k in store ? store[k] : null)),
      setItem: jest.fn(async (k, v) => {
        store[k] = v;
      }),
      __reset: () => {
        store = {};
      },
    },
  };
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  computeGuideSteps,
  DEFAULT_GUIDE_PREFS,
  loadGuidePrefs,
  updateGuidePrefs,
} from "../services/guideService";

const empty = {
  vehicles: [],
  maintenances: [],
  expenses: [],
  repairs: [],
  documents: [],
};

const done = (data, prefs = DEFAULT_GUIDE_PREFS) =>
  computeGuideSteps(data, prefs).map((s) => s.done);

describe("computeGuideSteps", () => {
  test("sin datos no hay pasos completados", () => {
    expect(done(empty)).toEqual([false, false, false, false, false, false]);
  });

  test("cada paso se marca según los datos existentes", () => {
    expect(done({ ...empty, vehicles: [{}] })[0]).toBe(true);
    expect(
      done({ ...empty, maintenances: [{ nextServiceDate: "2026-12-01" }] }),
    ).toEqual([false, true, false, false, false, false]);
    expect(done({ ...empty, repairs: [{}] })[3]).toBe(true);
    expect(done({ ...empty, expenses: [{}] })[3]).toBe(true);
    expect(done({ ...empty, documents: [{}] })[4]).toBe(true);
  });

  test("un mantenimiento realizado completa el paso 3", () => {
    const withCompletedAt = { ...empty, maintenances: [{ completedAt: "x" }] };
    expect(done(withCompletedAt)[2]).toBe(true);
    const withoutNext = { ...empty, maintenances: [{}] };
    expect(done(withoutNext)[2]).toBe(true);
  });

  test("revisar la inversión depende de las preferencias", () => {
    expect(done(empty, { ...DEFAULT_GUIDE_PREFS, statsVisited: true })[5]).toBe(
      true,
    );
  });
});

describe("preferencias de la guía", () => {
  beforeEach(() => AsyncStorage.__reset());

  test("por defecto nada está visto ni cerrado", async () => {
    expect(await loadGuidePrefs()).toEqual(DEFAULT_GUIDE_PREFS);
  });

  test("se guardan y se combinan los cambios", async () => {
    await updateGuidePrefs({ seen: true });
    await updateGuidePrefs({ dismissed: true });
    expect(await loadGuidePrefs()).toEqual({
      dismissed: true,
      seen: true,
      statsVisited: false,
    });
  });
});
