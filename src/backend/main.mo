import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import OptPrincipalValue "OptPrincipalValue";
import OptFloatValue "OptFloatValue";
import OptIntValue "OptIntValue";
import MobileStatusValue "MobileStatusValue";

import MobileTypes "types/mobiles";
import RouteTypes "types/routes";
import ServiceTypes "types/services";

import MobilesApi "mixins/mobiles-api";
import RoutesApi "mixins/routes-api";
import ServicesApi "mixins/services-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let mobiles : Map.Map<MobileTypes.MobileId, MobileTypes.Mobile>;
  let routes : Map.Map<RouteTypes.RouteId, RouteTypes.Route>;
  let services : Map.Map<ServiceTypes.ServiceId, ServiceTypes.Service>;
  let rates : { var current : ServiceTypes.Rates };

  include MobilesApi(accessControlState, mobiles);
  include RoutesApi(accessControlState, routes);
  include ServicesApi(accessControlState, services, rates);
  include ApiDocMixin();

  include Expose({
    entities = [
      mobiles.toEntity("mobile", "Mobile", "id")
        .sample({
          id = 0;
          officialName = "";
          mobileIdentifier = "";
          serviceType = "";
          username = "";
          password = "";
          principal = null;
          status = #offline;
          lastLatitude = null;
          lastLongitude = null;
          lastUpdate = null;
        })
        .hidden("password")
        .controllerOnly()
        .build(),
      routes.toEntity("route", "Route", "id")
        .sample({
          id = 0;
          mobileId = 0;
          officialName = "";
          serviceType = "";
          startedAt = 0;
          endedAt = null;
        })
        .controllerOnly()
        .build(),
      services.toEntityManual("service", "Service", "id")
        .sample({
          id = 0;
          owner = Principal.fromText("aaaaa-aa");
          officialName = "";
          waitMinutes = 0.0;
          kmStart = 0.0;
          kmEnd = 0.0;
          kmTraveled = 0.0;
          domicilios = [];
          tagCount = 0;
          breakdown = {
            bajadaDeBandera = 0;
            kilometros = 0.0;
            importeKilometros = 0;
            minutos = 0.0;
            importeTiempo = 0;
            cantidadTag = 0;
            importeTag = 0;
            total = 0;
          };
          total = 0;
          createdAt = 0;
        })
        .payload("id", func s = s.id)
        .payload("owner", func s = s.owner)
        .payload("officialName", func s = s.officialName)
        .payload("waitMinutes", func s = s.waitMinutes)
        .payload("kmStart", func s = s.kmStart)
        .payload("kmEnd", func s = s.kmEnd)
        .payload("kmTraveled", func s = s.kmTraveled)
        .payload("tagCount", func s = s.tagCount)
        .payload("total", func s = s.total)
        .payload("createdAt", func s = s.createdAt)
        .flatten(func s = s.breakdown)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<ServiceTypes.Rates>(
        "rates",
        func () = [rates.current].values(),
        "Rates",
        "bajadaDeBandera",
      )
        .sample({
          bajadaDeBandera = 0;
          porKilometro = 0;
          porMinuto = 0;
          porTag = 0;
        })
        .payload("bajadaDeBandera", func r = r.bajadaDeBandera)
        .payload("porKilometro", func r = r.porKilometro)
        .payload("porMinuto", func r = r.porMinuto)
        .payload("porTag", func r = r.porTag)
        .controllerOnly()
        .build(),
    ];
  });
};
