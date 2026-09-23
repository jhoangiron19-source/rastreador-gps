/// Instancia implícita: `?Principal -> Value`. `Value` no tiene `#principal`,
/// así que se representa como `Text` (o cadena vacía cuando es `null`).

import Principal "mo:core/Principal";
import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Principal) : Types.Value =
    switch (self) {
      case (?p) { #text(p.toText()) };
      case null { #text("") };
    };
};
