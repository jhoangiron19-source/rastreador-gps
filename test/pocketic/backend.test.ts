import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

// El primer principal registrado recibe el rol `#admin`; los siguientes, `#user`.
const admin = createIdentity("administrador");
const user = createIdentity("funcionario");

let pic: PocketIc | undefined;
let adminActor: Actor<_SERVICE>;
let userActor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
    sender: admin.getPrincipal(),
  });
  canisterId = installed.canisterId;
  adminActor = installed.actor;
  adminActor.setIdentity(admin);

  // El primer registro (admin) recibe el rol administrador.
  await adminActor._initialize_access_control();

  // El segundo principal registrado recibe el rol usuario.
  userActor = pic.createActor<_SERVICE>(idlFactory, canisterId);
  userActor.setIdentity(user);
  await userActor._initialize_access_control();
});

afterAll(async () => {
  // `?.` porque `beforeAll` puede no haber llegado hasta el final. Un
  // `PocketIc.create` fallido apilaría "Cannot read properties of undefined"
  // sobre el error real y enterraría la línea que explica la corrida.
  await pic?.tearDown();
});

it("responde lecturas de estado vacío sin trap", async () => {
  await expect(adminActor.listMobiles()).resolves.toEqual([]);
  await expect(adminActor.listMobilePositions()).resolves.toEqual([]);
  await expect(adminActor.listRoutes({ from: [], to: [], mobileId: [] })).resolves.toEqual([]);
  await expect(userActor.listServices()).resolves.toEqual([]);
});

it("devuelve las tarifas por defecto del servicio", async () => {
  const rates = await userActor.getRates();
  expect(rates).toEqual({
    bajadaDeBandera: 2400n,
    porKilometro: 850n,
    porMinuto: 170n,
    porTag: 700n,
  });
});

it("calcula el desglose de un servicio con las tarifas vigentes", async () => {
  const breakdown = await userActor.calculateService({
    officialName: "Juan Pérez",
    waitMinutes: 0,
    kmStart: 0,
    kmEnd: 10,
    domicilios: [],
    tagCount: 0n,
  });

  expect(breakdown.kilometros).toBe(10);
  expect(breakdown.importeKilometros).toBe(8500n);
  expect(breakdown.total).toBe(2400n + 8500n);
});

it("guarda un servicio y lo devuelve en el listado con su total", async () => {
  const saved = await userActor.saveService({
    officialName: "Ana Gómez",
    waitMinutes: 0,
    kmStart: 0,
    kmEnd: 10,
    domicilios: [],
    tagCount: 0n,
  });

  expect(saved.total).toBe(10900n);

  const services = await userActor.listServices();
  expect(services).toContainEqual(
    expect.objectContaining({ id: saved.id, officialName: "Ana Gómez", total: 10900n }),
  );
});

it("rechaza el móvil número 51 con un mensaje en español", async () => {
  // El límite es 50; el intento 51 debe rechazarse. Se crean 50 móviles y se
  // verifica que el siguiente falla con un mensaje claro.
  for (let index = 0; index < 50; index += 1) {
    await adminActor.createMobile({
      officialName: `Funcionario ${String(index)}`,
      mobileIdentifier: `M-${String(index)}`,
      serviceType: "Traslado programado",
      username: `usuario.${String(index)}`,
      password: "secreta123",
    });
  }

  await expect(
    adminActor.createMobile({
      officialName: "Funcionario 51",
      mobileIdentifier: "M-51",
      serviceType: "Traslado programado",
      username: "usuario.51",
      password: "secreta123",
    }),
  ).rejects.toThrow(/límite|limite|50/i);
});

it("rechaza a un llamador anónimo en los métodos protegidos", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.listMobiles()).rejects.toThrow();
  await expect(guest.getRates()).rejects.toThrow();
});
