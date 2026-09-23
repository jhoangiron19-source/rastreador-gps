import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/routes";
import RoutesLib "../lib/routes";

mixin (
  accessControlState : AccessControl.AccessControlState,
  routes : Map.Map<Types.RouteId, Types.Route>,
) {
  func requireAdminRoutes(caller : Principal) : () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("No autorizado: solo el administrador puede realizar esta acción");
    };
  };

  /// Asigna una ruta a un móvil (solo administrador).
  public shared ({ caller }) func assignRoute(input : Types.RouteInput) : async Types.RouteView {
    requireAdminRoutes(caller);
    RoutesLib.assignRoute(routes, input);
  };

  /// Consulta recorridos filtrados por móvil y rango de fechas (solo administrador).
  public query ({ caller }) func listRoutes(filter : Types.RouteFilter) : async [Types.RouteView] {
    requireAdminRoutes(caller);
    RoutesLib.listRoutes(routes, filter);
  };

  /// Detalle de una ruta (solo administrador).
  public query ({ caller }) func getRoute(id : Types.RouteId) : async ?Types.RouteView {
    requireAdminRoutes(caller);
    RoutesLib.getRoute(routes, id);
  };
};
