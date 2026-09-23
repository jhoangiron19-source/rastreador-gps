module {
  /// Identificador numérico de un móvil (1..50).
  public type MobileId = Nat;

  /// Identificador numérico de un servicio guardado.
  public type ServiceId = Nat;

  /// Identificador numérico de una ruta asignada.
  public type RouteId = Nat;

  /// Marca temporal en nanosegundos (Time.now()).
  public type Timestamp = Int;

  /// Pesos argentinos enteros.
  public type Pesos = Nat;

  /// Kilómetros (pueden ser decimales).
  public type Kilometers = Float;

  /// Minutos (pueden ser decimales).
  public type Minutes = Float;

  /// Error de negocio visible para el usuario, siempre en español.
  public type AppError = {
    #notFound : Text;
    #invalid : Text;
    #limitReached : Text;
    #unauthorized : Text;
  };
};
