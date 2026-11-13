# 09 · See what was checked, and by whom

Nothing to change. Use the knot that landed your retries in Module 08 wherever the module says `<knot-id>`.

**What you should see**

- `nool verify --all`: `✓ All 4 controls satisfied.`
- `nool attest show <knot-id>`: `compile pass by integrity-driver`, and a `unit-tests` line.
- `nool attest record … --assertion human-approval`: `self-approval refused: a human-approval on a knot your own key sealed never counts; another reviewer has to record it`.
- `nool policy stats`: a row per gate, including `policy:POL-WS-001` from Module 05.
