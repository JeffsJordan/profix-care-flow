import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { ACCESSORIES_BY_DEVICE, DEVICE_TYPES, accessoriesFor, checklistFor } from "./profix";

describe("Equipamentos na OS", () => {
  test("permite impressora com defeitos específicos", () => {
    assert.ok(DEVICE_TYPES.includes("Impressora"));
    for (const defect of ["Papel atolando", "Cabeçote entupido", "Cartucho ou toner não reconhecido", "Scanner não funciona"]) assert.ok(checklistFor("Impressora").includes(defect));
  });
  test("cada aparelho tem acessórios próprios separados de defeitos", () => {
    assert.deepEqual(Object.keys(ACCESSORIES_BY_DEVICE).sort(), [...DEVICE_TYPES].sort());
    for (const type of DEVICE_TYPES) {
      assert.ok(accessoriesFor(type).length > 0);
      assert.deepEqual(accessoriesFor(type).filter((item) => checklistFor(type).includes(item)), []);
    }
    assert.ok(accessoriesFor("Impressora").includes("Toner"));
    assert.ok(accessoriesFor("Celular").includes("Chip SIM"));
    assert.ok(accessoriesFor("Console").includes("Controle"));
    assert.ok(!accessoriesFor("Notebook").includes("Toner"));
    assert.deepEqual(accessoriesFor(""), []);
  });
});