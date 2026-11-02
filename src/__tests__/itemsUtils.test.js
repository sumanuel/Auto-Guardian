import {
  fromStoredItems,
  itemsToDb,
  itemsTotal,
  newDraftItem,
  parseNumber,
  serializeItems,
} from "../utils/itemsUtils";

const item = (name, quantity, unitCost) => ({
  ...newDraftItem(name),
  quantity,
  unitCost,
});

describe("itemsUtils", () => {
  test("parseNumber acepta coma decimal y valores inválidos", () => {
    expect(parseNumber("12,5")).toBe(12.5);
    expect(parseNumber("abc")).toBe(0);
    expect(parseNumber("")).toBe(0);
    expect(parseNumber(null)).toBe(0);
  });

  test("el total es la suma de cantidad × costo unitario", () => {
    expect(itemsTotal([item("Aceite", "4", "10.5"), item("Filtro", "1", "7")])).toBe(49);
    expect(itemsTotal([])).toBe(0);
  });

  test("evita errores de punto flotante", () => {
    expect(itemsTotal([item("A", "3", "0.1")])).toBe(0.3);
  });

  test("serializa y recupera los ítems", () => {
    const json = serializeItems([item("Aceite", "2", "5")]);
    const back = fromStoredItems(json);
    expect(back).toHaveLength(1);
    expect(back[0]).toMatchObject({ name: "Aceite", quantity: "2", unitCost: "5" });
    expect(serializeItems([])).toBeNull();
  });

  test("fromStoredItems tolera datos corruptos", () => {
    expect(fromStoredItems("no es json")).toEqual([]);
    expect(fromStoredItems(null)).toEqual([]);
  });

  test("itemsToDb conserva JSON, serializa arreglos y vacía lo demás", () => {
    expect(itemsToDb("[]")).toBe("[]");
    expect(itemsToDb([])).toBeNull();
    expect(itemsToDb(undefined)).toBeNull();
    expect(itemsToDb([{ id: "1" }])).toBe('[{"id":"1"}]');
  });
});
