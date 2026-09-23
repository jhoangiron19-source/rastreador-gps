import Float "mo:core/Float";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/services";

module {
  /// Tarifas por defecto: bajada de bandera $2.400, km $850, tiempo $170/min, TAG $700.
  public let defaultRates : Types.Rates = {
    bajadaDeBandera = 2400;
    porKilometro = 850;
    porMinuto = 170;
    porTag = 700;
  };

  /// Obtiene las tarifas vigentes.
  public func getRates(rates : { var current : Types.Rates }) : Types.Rates {
    rates.current;
  };

  /// Actualiza las tarifas aplicadas a los cálculos siguientes.
  public func updateRates(rates : { var current : Types.Rates }, input : Types.Rates) : Types.Rates {
    rates.current := input;
    rates.current;
  };

  /// Calcula el desglose de un servicio con las tarifas vigentes.
  public func computeBreakdown(rates : Types.Rates, input : Types.ServiceInput) : Types.ServiceBreakdown {
    let km = if (input.kmEnd > input.kmStart) { input.kmEnd - input.kmStart } else { 0.0 };
    let domicilioMinutes = input.domicilios.foldLeft(
      0.0,
      func(acc, d) = acc + d.timeAtDomicile,
    );
    let minutos = input.waitMinutes + domicilioMinutes;
    let importeKilometros = Float.nearest(km * rates.porKilometro.toFloat()).toInt().toNat();
    let importeTiempo = Float.nearest(minutos * rates.porMinuto.toFloat()).toInt().toNat();
    let importeTag = input.tagCount * rates.porTag;
    let total = rates.bajadaDeBandera + importeKilometros + importeTiempo + importeTag;
    {
      bajadaDeBandera = rates.bajadaDeBandera;
      kilometros = km;
      importeKilometros;
      minutos;
      importeTiempo;
      cantidadTag = input.tagCount;
      importeTag;
      total;
    };
  };

  /// Convierte un servicio interno en su resumen de listado.
  public func toSummary(service : Types.Service) : Types.ServiceSummary {
    {
      id = service.id;
      createdAt = service.createdAt;
      officialName = service.officialName;
      kmTraveled = service.kmTraveled;
      minutes = service.breakdown.minutos;
      total = service.total;
    };
  };

  /// Guarda un servicio calculado.
  public func saveService(services : Map.Map<Types.ServiceId, Types.Service>, owner : Principal, rates : Types.Rates, input : Types.ServiceInput) : Types.Service {
    var nextId = 1;
    while (services.get(nextId) != null) {
      nextId += 1;
    };
    let breakdown = computeBreakdown(rates, input);
    let service : Types.Service = {
      id = nextId;
      owner;
      officialName = input.officialName;
      waitMinutes = input.waitMinutes;
      kmStart = input.kmStart;
      kmEnd = input.kmEnd;
      kmTraveled = breakdown.kilometros;
      domicilios = input.domicilios;
      tagCount = input.tagCount;
      breakdown;
      total = breakdown.total;
      createdAt = Time.now();
    };
    services.add(nextId, service);
    service;
  };

  /// Lista los servicios guardados del usuario, ordenados por fecha descendente.
  public func listServices(services : Map.Map<Types.ServiceId, Types.Service>, owner : Principal) : [Types.ServiceSummary] {
    let summaries = services.values().filter(func s = s.owner == owner).map(func s = toSummary(s)).toArray();
    summaries.sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
  };

  /// Detalle de un servicio guardado del usuario.
  public func getService(services : Map.Map<Types.ServiceId, Types.Service>, owner : Principal, id : Types.ServiceId) : ?Types.Service {
    switch (services.get(id)) {
      case (?service) {
        if (service.owner != owner) {
          Runtime.trap("No autorizado: el servicio pertenece a otro usuario");
        };
        ?service;
      };
      case null { null };
    };
  };

  /// Edita un servicio guardado del usuario.
  public func updateService(services : Map.Map<Types.ServiceId, Types.Service>, owner : Principal, rates : Types.Rates, id : Types.ServiceId, input : Types.ServiceInput) : Types.Service {
    let existing = services.get(id) ?? Runtime.trap("Servicio no encontrado");
    if (existing.owner != owner) {
      Runtime.trap("No autorizado: el servicio pertenece a otro usuario");
    };
    let breakdown = computeBreakdown(rates, input);
    let updated : Types.Service = {
      id = existing.id;
      owner = existing.owner;
      officialName = input.officialName;
      waitMinutes = input.waitMinutes;
      kmStart = input.kmStart;
      kmEnd = input.kmEnd;
      kmTraveled = breakdown.kilometros;
      domicilios = input.domicilios;
      tagCount = input.tagCount;
      breakdown;
      total = breakdown.total;
      createdAt = existing.createdAt;
    };
    services.add(id, updated);
    updated;
  };

  /// Elimina un servicio guardado del usuario.
  public func deleteService(services : Map.Map<Types.ServiceId, Types.Service>, owner : Principal, id : Types.ServiceId) : () {
    let existing = services.get(id) ?? Runtime.trap("Servicio no encontrado");
    if (existing.owner != owner) {
      Runtime.trap("No autorizado: el servicio pertenece a otro usuario");
    };
    services.remove(id);
  };
};
