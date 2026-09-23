/// Instancia implícita: `?Int -> Value`. `null` se representa como `0`.

import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Int) : Types.Value =
    switch (self) {
      case (?v) { #int(v) };
      case null { #int(0) };
    };
};
