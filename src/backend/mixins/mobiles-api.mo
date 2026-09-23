import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/mobiles";
import MobilesLib "../lib/mobiles";

mixin (
  accessControlState : AccessControl.AccessControlState,
  mobiles : Map.Map<Types.MobileId, Types.Mobile>,
) {
  func requireAdmin(caller : Principal) : () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("No autorizado: solo el administrador puede realizar esta acción");
    };
  };

  /// Lista los móviles (solo administrador).
  public query ({ caller }) func listMobiles() : async [Types.MobileView] {
    requireAdmin(caller);
    MobilesLib.listMobiles(mobiles);
  };

  /// Obtiene un móvil por identificador (solo administrador).
  public query ({ caller }) func getMobile(id : Types.MobileId) : async ?Types.MobileView {
    requireAdmin(caller);
    MobilesLib.getMobile(mobiles, id);
  };

  /// Crea un móvil; rechaza el número 51 con error en español (solo administrador).
  public shared ({ caller }) func createMobile(input : Types.MobileInput) : async Types.MobileView {
    requireAdmin(caller);
    MobilesLib.createMobile(mobiles, input);
  };

  /// Edita un móvil existente (solo administrador).
  public shared ({ caller }) func updateMobile(id : Types.MobileId, input : Types.MobileUpdate) : async Types.MobileView {
    requireAdmin(caller);
    MobilesLib.updateMobile(mobiles, id, input);
  };

  /// Elimina un móvil existente (solo administrador).
  public shared ({ caller }) func deleteMobile(id : Types.MobileId) : async () {
    requireAdmin(caller);
    MobilesLib.deleteMobile(mobiles, id);
  };

  /// Registra la posición GPS del móvil del usuario firmado.
  public shared ({ caller }) func registerPosition(latitude : Float, longitude : Float) : async Types.Position {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado: debe iniciar sesión para registrar su ubicación");
    };
    MobilesLib.registerPosition(mobiles, caller, latitude, longitude);
  };

  /// Vincula el principal del llamador al móvil con las credenciales indicadas (usuario firmado).
  public shared ({ caller }) func linkMobilePrincipal(username : Text, password : Text) : async Types.MobileView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado: debe iniciar sesión para vincular su móvil");
    };
    MobilesLib.linkPrincipal(mobiles, caller, username, password);
  };

  /// Devuelve el móvil vinculado al llamador firmado, o null si no tiene ninguno.
  public query ({ caller }) func getCallerMobile() : async ?Types.MobileView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("No autorizado: debe iniciar sesión para ver su móvil");
    };
    MobilesLib.getCallerMobile(mobiles, caller);
  };

  /// Última posición conocida de cada móvil (solo administrador).
  public query ({ caller }) func listMobilePositions() : async [Types.MobilePositionView] {
    requireAdmin(caller);
    MobilesLib.listPositions(mobiles);
  };

  /// Detalle de la última posición de un móvil (solo administrador).
  public query ({ caller }) func getMobilePosition(id : Types.MobileId) : async ?Types.MobilePositionView {
    requireAdmin(caller);
    MobilesLib.getPosition(mobiles, id);
  };
};
