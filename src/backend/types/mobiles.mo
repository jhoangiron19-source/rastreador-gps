import Common "common";
import Principal "mo:core/Principal";

module {
  public type MobileId = Common.MobileId;
  public type Timestamp = Common.Timestamp;

  /// Estado de conexión de un móvil.
  public type MobileStatus = {
    #online;
    #offline;
  };

  /// Móvil / usuario del sistema.
  public type Mobile = {
    id : MobileId;
    officialName : Text; // nombre del funcionario
    mobileIdentifier : Text; // identificador de móvil
    serviceType : Text; // tipo de servicio
    username : Text; // credencial de acceso
    password : Text; // credencial de acceso (contraseña)
    principal : ?Principal; // principal de Internet Identity vinculado
    status : MobileStatus;
    lastLatitude : ?Float;
    lastLongitude : ?Float;
    lastUpdate : ?Timestamp;
  };

  /// Datos de alta de un móvil.
  public type MobileInput = {
    officialName : Text;
    mobileIdentifier : Text;
    serviceType : Text;
    username : Text;
    password : Text;
  };

  /// Datos editables de un móvil.
  public type MobileUpdate = {
    officialName : Text;
    mobileIdentifier : Text;
    serviceType : Text;
    username : Text;
    password : ?Text;
  };

  /// Vista pública de un móvil (sin credenciales).
  public type MobileView = {
    id : MobileId;
    officialName : Text;
    mobileIdentifier : Text;
    serviceType : Text;
    username : Text;
    status : MobileStatus;
    lastLatitude : ?Float;
    lastLongitude : ?Float;
    lastUpdate : ?Timestamp;
  };

  /// Posición GPS registrada por un móvil.
  public type Position = {
    latitude : Float;
    longitude : Float;
    recordedAt : Timestamp;
  };

  /// Última posición conocida de un móvil, para el mapa del administrador.
  public type MobilePositionView = {
    id : MobileId;
    officialName : Text;
    mobileIdentifier : Text;
    status : MobileStatus;
    latitude : ?Float;
    longitude : ?Float;
    lastUpdate : ?Timestamp;
  };
};
