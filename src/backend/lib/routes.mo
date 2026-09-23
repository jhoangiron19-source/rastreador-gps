import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/routes";

module {
  /// Convierte una ruta interna en su vista consultable.
  public func toView(route : Types.Route) : Types.RouteView {
    let duration : ?Types.Minutes = switch (route.endedAt) {
      case (?ended) { ?((ended - route.startedAt).toFloat() / 60_000_000_000.0) };
      case null { null };
    };
    {
      id = route.id;
      mobileId = route.mobileId;
      officialName = route.officialName;
      serviceType = route.serviceType;
      startedAt = route.startedAt;
      endedAt = route.endedAt;
      durationMinutes = duration;
      totalKilometers = 0.0;
    };
  };

  /// Asigna una ruta a un móvil.
  public func assignRoute(routes : Map.Map<Types.RouteId, Types.Route>, input : Types.RouteInput) : Types.RouteView {
    if (input.officialName == "") {
      Runtime.trap("Datos incompletos: el nombre del funcionario es obligatorio");
    };
    var nextId = 1;
    while (routes.get(nextId) != null) {
      nextId += 1;
    };
    let route : Types.Route = {
      id = nextId;
      mobileId = input.mobileId;
      officialName = input.officialName;
      serviceType = input.serviceType;
      startedAt = Time.now();
      endedAt = null;
    };
    routes.add(nextId, route);
    toView(route);
  };

  /// Consulta recorridos filtrados por móvil y rango de fechas.
  public func listRoutes(routes : Map.Map<Types.RouteId, Types.Route>, filter : Types.RouteFilter) : [Types.RouteView] {
    let matched = routes.values().filter(func r = matchesFilter(r, filter)).toArray();
    let views = matched.map(func r = toView(r));
    views.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  func matchesFilter(route : Types.Route, filter : Types.RouteFilter) : Bool {
    let byMobile = switch (filter.mobileId) {
      case (?id) { route.mobileId == id };
      case null { true };
    };
    let byFrom = switch (filter.from) {
      case (?from) { route.startedAt >= from };
      case null { true };
    };
    let byTo = switch (filter.to) {
      case (?to) { route.startedAt <= to };
      case null { true };
    };
    byMobile and byFrom and byTo;
  };

  /// Detalle de una ruta.
  public func getRoute(routes : Map.Map<Types.RouteId, Types.Route>, id : Types.RouteId) : ?Types.RouteView {
    switch (routes.get(id)) {
      case (?route) { ?toView(route) };
      case null { null };
    };
  };
};
