import Common "common";
import Principal "mo:core/Principal";

module {
  public type ServiceId = Common.ServiceId;
  public type Timestamp = Common.Timestamp;
  public type Pesos = Common.Pesos;
  public type Kilometers = Common.Kilometers;
  public type Minutes = Common.Minutes;

  /// Domicilio visitado durante un servicio.
  public type Domicilio = {
    address : Text; // dirección
    arrivalTime : Text; // hora de llegada
    departureTime : Text; // hora de salida
    timeAtDomicile : Minutes; // tiempo en domicilio calculado
  };

  /// Tarifas editables del servicio.
  public type Rates = {
    bajadaDeBandera : Pesos; // por defecto 2400
    porKilometro : Pesos; // por defecto 850
    porMinuto : Pesos; // por defecto 170
    porTag : Pesos; // por defecto 700
  };

  /// Desglose del cálculo de un servicio.
  public type ServiceBreakdown = {
    bajadaDeBandera : Pesos;
    kilometros : Kilometers;
    importeKilometros : Pesos;
    minutos : Minutes;
    importeTiempo : Pesos;
    cantidadTag : Nat;
    importeTag : Pesos;
    total : Pesos;
  };

  /// Datos de entrada para guardar un servicio.
  public type ServiceInput = {
    officialName : Text; // funcionario
    waitMinutes : Minutes; // espera a funcionario (minutos)
    kmStart : Kilometers; // km inicio
    kmEnd : Kilometers; // km fin
    domicilios : [Domicilio];
    tagCount : Nat; // cantidad de TAG (pórticos)
  };

  /// Servicio guardado.
  public type Service = {
    id : ServiceId;
    owner : Principal; // usuario que guardó el servicio
    officialName : Text;
    waitMinutes : Minutes;
    kmStart : Kilometers;
    kmEnd : Kilometers;
    kmTraveled : Kilometers; // km recorridos calculado
    domicilios : [Domicilio];
    tagCount : Nat;
    breakdown : ServiceBreakdown;
    total : Pesos;
    createdAt : Timestamp;
  };

  /// Vista de un servicio en el listado.
  public type ServiceSummary = {
    id : ServiceId;
    createdAt : Timestamp;
    officialName : Text;
    kmTraveled : Kilometers;
    minutes : Minutes;
    total : Pesos;
  };
};
