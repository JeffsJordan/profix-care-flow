/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { ACCESSORIES_BY_DEVICE, DEVICE_TYPES, accessoriesFor, checklistFor } from "./profix";

describe("Equipamentos na OS", () => {
  test("permite impressora com defeitos específicos", () => {
    expect(DEVICE_TYPES).toContain("Impressora");
    expect(checklistFor("Impressora")).toEqual(expect.arrayContaining(["Papel atolando", "Cabeçote entupido", "Cartucho ou toner não reconhecido", "Scanner não funciona"]));
  });
  test("cada aparelho tem acessórios próprios separados de defeitos", () => {
    expect(Object.keys(ACCESSORIES_BY_DEVICE).sort()).toEqual([...DEVICE_TYPES].sort());
    for (const type of DEVICE_TYPES) {
      expect(accessoriesFor(type).length).toBeGreaterThan(0);
      expect(accessoriesFor(type).filter((item) => checklistFor(type).includes(item))).toEqual([]);
    }
    expect(accessoriesFor("Impressora")).toContain("Toner");
    expect(accessoriesFor("Celular")).toContain("Chip SIM");
    expect(accessoriesFor("Console")).toContain("Controle");
    expect(accessoriesFor("Notebook")).not.toContain("Toner");
    expect(accessoriesFor("")).toEqual([]);
  });
});