import { checkKmUpdate, kmErrorMessage } from "../utils/kmUtils";

describe("checkKmUpdate", () => {
  test("vacío o igual al actual no cambia nada", () => {
    expect(checkKmUpdate("", 1000).status).toBe("unchanged");
    expect(checkKmUpdate("  ", 1000).status).toBe("unchanged");
    expect(checkKmUpdate(null, 1000).status).toBe("unchanged");
    expect(checkKmUpdate("1000", 1000).status).toBe("unchanged");
  });

  test("un kilometraje mayor actualiza", () => {
    expect(checkKmUpdate("1500", 1000)).toEqual({ status: "update", km: 1500 });
  });

  test("sin kilometraje previo actualiza", () => {
    expect(checkKmUpdate("0", null)).toEqual({ status: "update", km: 0 });
  });

  test("menor al actual se rechaza", () => {
    expect(checkKmUpdate("900", 1000).status).toBe("lower");
  });

  test("texto no numérico es inválido", () => {
    expect(checkKmUpdate("12a", 1000).status).toBe("invalid");
    expect(checkKmUpdate("-5", 1000).status).toBe("invalid");
    expect(checkKmUpdate("1.5", 1000).status).toBe("invalid");
  });
});

describe("kmErrorMessage", () => {
  test("solo hay mensaje para los casos rechazados", () => {
    expect(kmErrorMessage(checkKmUpdate("1500", 1000), 1000)).toBeNull();
    expect(kmErrorMessage(checkKmUpdate("", 1000), 1000)).toBeNull();
    expect(kmErrorMessage(checkKmUpdate("x", 1000), 1000)).toMatch(/válido/);
    expect(kmErrorMessage(checkKmUpdate("900", 1000), 1000)).toMatch(/menor/);
  });
});
