# 14 · Let agents ask instead of collide

Same file as Module 16, `src/billing/client.ts`. Keep the two terminals: `NOOL_SESSION_ID=agent-a` in one, `NOOL_SESSION_ID=agent-b` in the other, so each has its own inbox. Let agent A claim the file again first.

The holder's name is the one `nool announce status` prints, `session:agent-a`. Send to that:

```bash
NOOL_SESSION_ID=agent-b nool msg send --to session:agent-a \
  "I need src/billing/client.ts for the jitter change. Are you close to landing?"
```

What you should see:

- B: `✓ Sent dm to <agent id> (event <id>, offset 9)`
- A, `nool msg inbox`: the landing notices from Module 16 (`[5] [info] landing.landed from <agent id>: landed <knot id>`), then `[9] dm from <agent id>: I need src/billing/client.ts ...` and `Acknowledge with nool msg ack <offset> once handled.`
- A, `nool msg ack 9`: `✓ Acknowledged offset 9 (inbox frontier 1)`. The notices stay until you ack them too. Once all are acked: `Inbox empty.`

The sender shows as a short hex id, not as `agent-b`.

**Agent A's change while B waits.** Start B's `nool announce wait src/billing/client.ts --timeout-ms 300000`, then land something in A. A 429 means "slow down", so retrying it fits:

```ts
/** A 4xx will not change on a retry, except 429: the subscriber asks us to slow down. */
function isPermanent(status: number | null): boolean {
  return status !== null && status >= 400 && status < 500 && status !== 429;
}
```

```bash
NOOL_SESSION_ID=agent-a nool propose --path src/billing/client.ts --intent "Retry a 429" \
  --why "A 429 asks us to slow down, not to stop" --solidify
```

A prints `✓ Landed knot <id>`. B's wait prints `✓ file:src/billing/client.ts is free.` and B's announce succeeds.

**`nool inbox`** belongs to the machine's key, not the session: both agents see `Nool Inbox for <key>`.

**The handoff.** `nool thread list` shows your thread (`main` unless you started another). In `nool thread handoff`, `-s` is short for `--next`, so write `--solidify` in full. You get `✓ Handoff solidified: <knot id>`.

`nool thread show main --full` lists the handoff as `Handoff to <key>`. On 7.28.0 the `--summary` text did not show there, in `nool why` or in `nool evidence knot`. To leave words the next session can read, add a thread note too:

```bash
nool thread chat main -m "Retries done; jitter and tests left. Next: add jitter."
nool solidify              # the note is staged until you seal it
nool thread chat main      # shows the note
```

`thread chat -m` prints `Message anchored to thread 'main'. Run 'solidify'.` Until you do, the note shows as `(on the bus, not yet solidified)`.

`nool findings src/billing/client.ts` lists each landed change with its `Why:` line.

Run against this project on 7.28.0 Enterprise, 2026-11-14.
