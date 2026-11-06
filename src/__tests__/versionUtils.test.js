import {
  compareVersions,
  dayKey,
  evaluateStoreUpdate,
  shouldShowUpdatePrompt,
} from "../utils/versionUtils";

describe("compareVersions", () => {
  test("compara versiones de varios segmentos", () => {
    expect(compareVersions("0.1.1.261105", "0.1.1.261102")).toBe(1);
    expect(compareVersions("0.1.1.261102", "0.1.1.261105")).toBe(-1);
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.2.3-beta", "1.2.3")).toBe(0);
  });
});

describe("evaluateStoreUpdate", () => {
  const current = "0.1.1.261105";

  test("sin versión nueva ni mínima no hay aviso", () => {
    expect(
      evaluateStoreUpdate({ latestVersion: "0.1.1.261105" }, current),
    ).toMatchObject({ updateAvailable: false, forceUpdate: false });
  });

  test("una versión más nueva ofrece actualizar sin obligar", () => {
    expect(
      evaluateStoreUpdate({ latestVersion: "0.1.2.261201" }, current),
    ).toMatchObject({
      latestVersion: "0.1.2.261201",
      updateAvailable: true,
      forceUpdate: false,
    });
  });

  test("minimumVersion mayor a la instalada obliga a actualizar", () => {
    expect(
      evaluateStoreUpdate(
        { latestVersion: "0.1.2.261201", minimumVersion: "0.1.2.261201" },
        current,
      ),
    ).toMatchObject({ updateAvailable: true, forceUpdate: true });
  });

  test("minimumVersion igual o menor no obliga", () => {
    expect(
      evaluateStoreUpdate({ minimumVersion: "0.1.1.261105" }, current)
        .forceUpdate,
    ).toBe(false);
    expect(
      evaluateStoreUpdate({ minimumVersion: "0.1.0.1" }, current).forceUpdate,
    ).toBe(false);
  });

  test("datos vacíos o inválidos no provocan avisos", () => {
    expect(evaluateStoreUpdate(null, current)).toEqual({
      latestVersion: null,
      url: null,
      updateAvailable: false,
      forceUpdate: false,
    });
  });
});

describe("shouldShowUpdatePrompt", () => {
  const today = new Date(2026, 10, 6, 10, 0);

  test("se muestra si nunca se mostró o es otra versión", () => {
    expect(shouldShowUpdatePrompt(null, "2.0", today)).toBe(true);
    expect(
      shouldShowUpdatePrompt(
        { version: "1.9", day: dayKey(today) },
        "2.0",
        today,
      ),
    ).toBe(true);
  });

  test("una vez al día por versión", () => {
    const last = { version: "2.0", day: dayKey(today) };
    expect(shouldShowUpdatePrompt(last, "2.0", today)).toBe(false);
    expect(
      shouldShowUpdatePrompt(last, "2.0", new Date(2026, 10, 7, 9, 0)),
    ).toBe(true);
  });
});
