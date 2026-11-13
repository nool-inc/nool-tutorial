# 06 · Read one function, not the whole file

Nothing to change. `src/billing/client.ts` is the file to read.

**What you should see**

```
$ nool outline src/billing/client.ts
src/billing/client.ts (80 lines, 10 symbols)
 4-13  fn     deliver
15-19  interface WebhookEvent
...
78-80  class  BillingError
```

Line numbers move once you have changed the file in Module 08; the symbols stay. `nool show src/billing/client.ts::deliver` prints just that function.

Try the practice on `tests/billing/retries.test.ts`, the longest file here.
