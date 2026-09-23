/// Instancia implícita: `?Float -> Value`. `null` se representa como `0.0`.

import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Float) : Types.Value =
    switch (self) {
      case (?v) { #float(v) };
      case null { #float(0.0) };
    };
};
