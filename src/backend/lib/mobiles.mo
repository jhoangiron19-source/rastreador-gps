import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/mobiles";

module {
  /// Límite máximo de móviles.
  public let maxMobiles : Nat = 50;

  /// Convierte un móvil interno en su vista pública (sin credenciales).
  public func toView(mobile : Types.Mobile) : Types.MobileView {
    {
      id = mobile.id;
      officialName = mobile.officialName;
      mobileIdentifier = mobile.mobileIdentifier;
      serviceType = mobile.serviceType;
      username = mobile.username;
      status = mobile.status;
      lastLatitude = mobile.lastLatitude;
      lastLongitude = mobile.lastLongitude;
      lastUpdate = mobile.lastUpdate;
    };
  };

  /// Convierte un móvil interno en su vista de posición.
  public func toPositionView(mobile : Types.Mobile) : Types.MobilePositionView {
    {
      id = mobile.id;
      officialName = mobile.officialName;
      mobileIdentifier = mobile.mobileIdentifier;
      status = mobile.status;
      latitude = mobile.lastLatitude;
      longitude = mobile.lastLongitude;
      lastUpdate = mobile.lastUpdate;
    };
  };

  /// Lista todos los móviles como vistas públicas, ordenados por identificador.
  public func listMobiles(mobiles : Map.Map<Types.MobileId, Types.Mobile>) : [Types.MobileView] {
    let views = mobiles.values().map(func m = toView(m)).toArray();
    views.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  /// Obtiene un móvil por su identificador.
  public func getMobile(mobiles : Map.Map<Types.MobileId, Types.Mobile>, id : Types.MobileId) : ?Types.MobileView {
    switch (mobiles.get(id)) {
      case (?mobile) { ?toView(mobile) };
      case null { null };
    };
  };

  /// Crea un móvil; rechaza el número 51 con un error en español.
  public func createMobile(mobiles : Map.Map<Types.MobileId, Types.Mobile>, input : Types.MobileInput) : Types.MobileView {
    if (mobiles.size() >= maxMobiles) {
      Runtime.trap("Límite alcanzado: no se pueden registrar más de 50 móviles");
    };
    if (input.officialName == "" or input.mobileIdentifier == "" or input.username == "") {
      Runtime.trap("Datos incompletos: nombre del funcionario, identificador de móvil y usuario son obligatorios");
    };
    var nextId = 1;
    while (mobiles.get(nextId) != null) {
      nextId += 1;
    };
    let mobile : Types.Mobile = {
      id = nextId;
      officialName = input.officialName;
      mobileIdentifier = input.mobileIdentifier;
      serviceType = input.serviceType;
      username = input.username;
      password = input.password;
      principal = null;
      status = #offline;
      lastLatitude = null;
      lastLongitude = null;
      lastUpdate = null;
    };
    mobiles.add(nextId, mobile);
    toView(mobile);
  };

  /// Edita un móvil existente.
  public func updateMobile(mobiles : Map.Map<Types.MobileId, Types.Mobile>, id : Types.MobileId, input : Types.MobileUpdate) : Types.MobileView {
    let existing = mobiles.get(id) ?? Runtime.trap("Móvil no encontrado");
    let updated : Types.Mobile = {
      id = existing.id;
      officialName = input.officialName;
      mobileIdentifier = input.mobileIdentifier;
      serviceType = input.serviceType;
      username = input.username;
      password = input.password ?? existing.password;
      principal = existing.principal;
      status = existing.status;
      lastLatitude = existing.lastLatitude;
      lastLongitude = existing.lastLongitude;
      lastUpdate = existing.lastUpdate;
    };
    mobiles.add(id, updated);
    toView(updated);
  };

  /// Elimina un móvil existente.
  public func deleteMobile(mobiles : Map.Map<Types.MobileId, Types.Mobile>, id : Types.MobileId) : () {
    if (mobiles.get(id) == null) {
      Runtime.trap("Móvil no encontrado");
    };
    mobiles.remove(id);
  };

  /// Registra la posición GPS del móvil del llamador.
  public func registerPosition(mobiles : Map.Map<Types.MobileId, Types.Mobile>, caller : Principal, latitude : Float, longitude : Float) : Types.Position {
    let found = mobiles.values().find(func m = m.principal == ?caller);
    let mobile = found ?? Runtime.trap("No hay un móvil asociado a este usuario");
    let now = Time.now();
    let updated : Types.Mobile = {
      id = mobile.id;
      officialName = mobile.officialName;
      mobileIdentifier = mobile.mobileIdentifier;
      serviceType = mobile.serviceType;
      username = mobile.username;
      password = mobile.password;
      principal = mobile.principal;
      status = #online;
      lastLatitude = ?latitude;
      lastLongitude = ?longitude;
      lastUpdate = ?now;
    };
    mobiles.add(mobile.id, updated);
    { latitude; longitude; recordedAt = now };
  };

  /// Vincula el principal del llamador al móvil cuyas credenciales coinciden.
  public func linkPrincipal(mobiles : Map.Map<Types.MobileId, Types.Mobile>, caller : Principal, username : Text, password : Text) : Types.MobileView {
    let found = mobiles.values().find(func m = m.username == username and m.password == password);
    let mobile = found ?? Runtime.trap("Credenciales inválidas: usuario o contraseña incorrectos");
    let updated : Types.Mobile = {
      id = mobile.id;
      officialName = mobile.officialName;
      mobileIdentifier = mobile.mobileIdentifier;
      serviceType = mobile.serviceType;
      username = mobile.username;
      password = mobile.password;
      principal = ?caller;
      status = mobile.status;
      lastLatitude = mobile.lastLatitude;
      lastLongitude = mobile.lastLongitude;
      lastUpdate = mobile.lastUpdate;
    };
    mobiles.add(mobile.id, updated);
    toView(updated);
  };

  /// Obtiene el móvil vinculado al principal del llamador, si existe.
  public func getCallerMobile(mobiles : Map.Map<Types.MobileId, Types.Mobile>, caller : Principal) : ?Types.MobileView {
    switch (mobiles.values().find(func m = m.principal == ?caller)) {
      case (?mobile) { ?toView(mobile) };
      case null { null };
    };
  };

  /// Última posición conocida de cada móvil, ordenada por identificador.
  public func listPositions(mobiles : Map.Map<Types.MobileId, Types.Mobile>) : [Types.MobilePositionView] {
    let views = mobiles.values().map(func m = toPositionView(m)).toArray();
    views.sort(func(a, b) = Nat.compare(a.id, b.id));
  };

  /// Detalle de la última posición de un móvil.
  public func getPosition(mobiles : Map.Map<Types.MobileId, Types.Mobile>, id : Types.MobileId) : ?Types.MobilePositionView {
    switch (mobiles.get(id)) {
      case (?mobile) { ?toPositionView(mobile) };
      case null { null };
    };
  };
};
