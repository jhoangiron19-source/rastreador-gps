import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/services";
import ServicesLib "../lib/services";

mixin (
  accessControlState : AccessControl.AccessControlState,
  services : Map.Map<Types.ServiceId, Types.Service>,
  rates : { var current : Types.Rates },
) {
  func requireUser(caller : Principal) : () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado: debe iniciar sesión para realizar esta acción");
    };
  };

  /// Obtiene las tarifas vigentes (usuario firmado).
  public query ({ caller }) func getRates() : async Types.Rates {
    requireUser(caller);
    ServicesLib.getRates(rates);
  };

  /// Actualiza las tarifas aplicadas a los cálculos siguientes (solo administrador).
  public shared ({ caller }) func updateRates(input : Types.Rates) : async Types.Rates {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("No autorizado: solo el administrador puede editar las tarifas");
    };
    ServicesLib.updateRates(rates, input);
  };

  /// Calcula el desglose de un servicio sin guardarlo (usuario firmado).
  public query ({ caller }) func calculateService(input : Types.ServiceInput) : async Types.ServiceBreakdown {
    requireUser(caller);
    ServicesLib.computeBreakdown(rates.current, input);
  };

  /// Guarda un servicio calculado (usuario firmado).
  public shared ({ caller }) func saveService(input : Types.ServiceInput) : async Types.Service {
    requireUser(caller);
    ServicesLib.saveService(services, caller, rates.current, input);
  };

  /// Lista los servicios guardados del usuario (usuario firmado).
  public query ({ caller }) func listServices() : async [Types.ServiceSummary] {
    requireUser(caller);
    ServicesLib.listServices(services, caller);
  };

  /// Detalle de un servicio guardado (usuario firmado).
  public query ({ caller }) func getService(id : Types.ServiceId) : async ?Types.Service {
    requireUser(caller);
    ServicesLib.getService(services, caller, id);
  };

  /// Edita un servicio guardado (usuario firmado).
  public shared ({ caller }) func updateService(id : Types.ServiceId, input : Types.ServiceInput) : async Types.Service {
    requireUser(caller);
    ServicesLib.updateService(services, caller, rates.current, id, input);
  };

  /// Elimina un servicio guardado (usuario firmado).
  public shared ({ caller }) func deleteService(id : Types.ServiceId) : async () {
    requireUser(caller);
    ServicesLib.deleteService(services, caller, id);
  };
};
