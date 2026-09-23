import Common "common";

module {
  public type MobileId = Common.MobileId;
  public type RouteId = Common.RouteId;
  public type Timestamp = Common.Timestamp;
  public type Kilometers = Common.Kilometers;
  public type Minutes = Common.Minutes;

  /// Ruta asignada a un móvil.
  public type Route = {
    id : RouteId;
    mobileId : MobileId;
    officialName : Text; // nombre del funcionario
    serviceType : Text; // tipo de servicio
    startedAt : Timestamp;
    endedAt : ?Timestamp;
  };

  /// Datos de asignación de una ruta.
  public type RouteInput = {
    mobileId : MobileId;
    officialName : Text;
    serviceType : Text;
  };

  /// Recorrido consultable de un móvil.
  public type RouteView = {
    id : RouteId;
    mobileId : MobileId;
    officialName : Text;
    serviceType : Text;
    startedAt : Timestamp;
    endedAt : ?Timestamp;
    durationMinutes : ?Common.Minutes;
    totalKilometers : Kilometers;
  };

  /// Filtro de consulta de recorridos.
  public type RouteFilter = {
    mobileId : ?MobileId;
    from : ?Timestamp;
    to : ?Timestamp;
  };
};
