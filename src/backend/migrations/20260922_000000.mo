import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type MobileId = Nat;
  type RouteId = Nat;
  type ServiceId = Nat;
  type Timestamp = Int;
  type Pesos = Nat;
  type Kilometers = Float;
  type Minutes = Float;

  type MobileStatus = { #online; #offline };

  type Mobile = {
    id : MobileId;
    officialName : Text;
    mobileIdentifier : Text;
    serviceType : Text;
    username : Text;
    password : Text;
    principal : ?Principal;
    status : MobileStatus;
    lastLatitude : ?Float;
    lastLongitude : ?Float;
    lastUpdate : ?Timestamp;
  };

  type Route = {
    id : RouteId;
    mobileId : MobileId;
    officialName : Text;
    serviceType : Text;
    startedAt : Timestamp;
    endedAt : ?Timestamp;
  };

  type Domicilio = {
    address : Text;
    arrivalTime : Text;
    departureTime : Text;
    timeAtDomicile : Minutes;
  };

  type Rates = {
    bajadaDeBandera : Pesos;
    porKilometro : Pesos;
    porMinuto : Pesos;
    porTag : Pesos;
  };

  type ServiceBreakdown = {
    bajadaDeBandera : Pesos;
    kilometros : Kilometers;
    importeKilometros : Pesos;
    minutos : Minutes;
    importeTiempo : Pesos;
    cantidadTag : Nat;
    importeTag : Pesos;
    total : Pesos;
  };

  type Service = {
    id : ServiceId;
    owner : Principal;
    officialName : Text;
    waitMinutes : Minutes;
    kmStart : Kilometers;
    kmEnd : Kilometers;
    kmTraveled : Kilometers;
    domicilios : [Domicilio];
    tagCount : Nat;
    breakdown : ServiceBreakdown;
    total : Pesos;
    createdAt : Timestamp;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    mobiles : Map.Map<MobileId, Mobile>;
    routes : Map.Map<RouteId, Route>;
    services : Map.Map<ServiceId, Service>;
    rates : { var current : Rates };
  };

  public func migration(_old : {}) : NewActor {
    {
      accessControlState = AccessControl.initState();
      mobiles = Map.empty();
      routes = Map.empty();
      services = Map.empty();
      rates = {
        var current = {
          bajadaDeBandera = 2400;
          porKilometro = 850;
          porMinuto = 170;
          porTag = 700;
        };
      };
    };
  };
};
