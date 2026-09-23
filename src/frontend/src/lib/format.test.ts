import {
  formatKm,
  formatMinutes,
  formatNumber,
  formatPesos,
  minutesBetween,
  parseIntegerInput,
  parseNumberInput,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("formatPesos", () => {
  it("formatea pesos con separador de miles por punto", () => {
    expect(formatPesos(2400n)).toBe("$2.400");
    expect(formatPesos(8500n)).toBe("$8.500");
    expect(formatPesos(0n)).toBe("$0");
  });

  it("acepta números además de bigint", () => {
    expect(formatPesos(1234567)).toBe("$1.234.567");
  });
});

describe("formatNumber", () => {
  it("usa el separador de miles argentino", () => {
    expect(formatNumber(50)).toBe("50");
    expect(formatNumber(1234)).toBe("1.234");
  });

  it("respeta la cantidad de decimales pedida", () => {
    expect(formatNumber(10, 2)).toBe("10,00");
  });
});

describe("formatKm", () => {
  it("muestra kilómetros con dos decimales", () => {
    expect(formatKm(10)).toBe("10,00 km");
    expect(formatKm(0)).toBe("0,00 km");
  });
});

describe("formatMinutes", () => {
  it("formatea minutos y horas en español", () => {
    expect(formatMinutes(0)).toBe("0 min");
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(85)).toBe("1 h 25 min");
  });
});

describe("parseNumberInput", () => {
  it("tolera coma decimal y espacios", () => {
    expect(parseNumberInput("10,5")).toBe(10.5);
    expect(parseNumberInput(" 12 ")).toBe(12);
  });

  it("devuelve 0 para entradas vacías o inválidas", () => {
    expect(parseNumberInput("")).toBe(0);
    expect(parseNumberInput("abc")).toBe(0);
  });
});

describe("parseIntegerInput", () => {
  it("trunca decimales y evita negativos", () => {
    expect(parseIntegerInput("3,9")).toBe(3);
    expect(parseIntegerInput("-5")).toBe(0);
  });
});

describe("minutesBetween", () => {
  it("calcula la diferencia entre dos horas", () => {
    expect(minutesBetween("10:00", "10:30")).toBe(30);
    expect(minutesBetween("09:15", "11:00")).toBe(105);
  });

  it("devuelve null cuando el rango es inválido", () => {
    expect(minutesBetween("11:00", "10:00")).toBeNull();
    expect(minutesBetween("", "10:00")).toBeNull();
    expect(minutesBetween("25:00", "26:00")).toBeNull();
  });
});
