/// Instancia implícita: `MobileStatus -> Value`. El variante se representa
/// como `Text` con la etiqueta.

import Types "mo:caffeineai-oql/Types";
import MobileTypes "types/mobiles";

module {
  public func _toRow(self : MobileTypes.MobileStatus) : Types.Value =
    switch (self) {
      case (#online) { #text("online") };
      case (#offline) { #text("offline") };
    };
};
