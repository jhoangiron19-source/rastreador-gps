import { computeBreakdown } from "@/components/calculator/ServiceForm";
import { DEFAULT_RATES, type ServiceDraft, emptyServiceDraft } from "@/types";
import { describe, expect, it } from "vitest";

function draft(overrides: Partial<ServiceDraft> = {}): ServiceDraft {
  return { ...emptyServiceDraft(), ...overrides };
}

describe("computeBreakdown", () => {
  it("con espera 0, km 0 y 0 TAG el total es solo la bajada de bandera", () => {
    const result = computeBreakdown(draft(), DEFAULT_RATES);

    expect(result.total).toBe(2400n);
    expect(result.kilometros).toBe(0);
    expect(result.importeKilometros).toBe(0n);
    expect(result.minutos).toBe(0);
    expect(result.importeTiempo).toBe(0n);
    expect(result.importeTag).toBe(0n);
  });

  it("con km inicio 0 y km fin 10 calcula 10 km y $8.500 de kilometraje", () => {
    const result = computeBreakdown(
      draft({ kmStart: "0", kmEnd: "10" }),
      DEFAULT_RATES,
    );

    expect(result.kilometros).toBe(10);
    expect(result.importeKilometros).toBe(8500n);
    expect(result.total).toBe(2400n + 8500n);
  });

  it("suma el tiempo de espera y el tiempo en cada domicilio", () => {
    const result = computeBreakdown(
      draft({
        waitMinutes: "10",
        domicilios: [
          { address: "A", arrivalTime: "10:00", departureTime: "10:20" },
          { address: "B", arrivalTime: "11:00", departureTime: "11:05" },
        ],
      }),
      DEFAULT_RATES,
    );

    // 10 de espera + 20 + 5 en domicilios = 35 minutos.
    expect(result.minutos).toBe(35);
    expect(result.importeTiempo).toBe(35n * 170n);
  });

  it("multiplica la cantidad de TAG por la tarifa", () => {
    const result = computeBreakdown(draft({ tagCount: "3" }), DEFAULT_RATES);

    expect(result.cantidadTag).toBe(3n);
    expect(result.importeTag).toBe(2100n);
    expect(result.total).toBe(2400n + 2100n);
  });

  it("nunca resta kilómetros cuando km fin es menor que km inicio", () => {
    const result = computeBreakdown(
      draft({ kmStart: "20", kmEnd: "5" }),
      DEFAULT_RATES,
    );

    expect(result.kilometros).toBe(0);
    expect(result.importeKilometros).toBe(0n);
  });

  it("aplica las tarifas recibidas, no las de por defecto", () => {
    const customRates = {
      bajadaDeBandera: 3000n,
      porKilometro: 1000n,
      porMinuto: 200n,
      porTag: 500n,
    };

    const result = computeBreakdown(
      draft({ kmStart: "0", kmEnd: "10", waitMinutes: "5", tagCount: "2" }),
      customRates,
    );

    expect(result.importeKilometros).toBe(10000n);
    expect(result.importeTiempo).toBe(1000n);
    expect(result.importeTag).toBe(1000n);
    expect(result.total).toBe(3000n + 10000n + 1000n + 1000n);
  });
});
