import { test } from "node:test";
import assert from "node:assert/strict";
import { BillingError, charge, listInvoices } from "../../src/billing/client.ts";
import { PaymentProvider } from "../../src/billing/provider.ts";

test("charges a customer in usd by default", () => {
  const provider = new PaymentProvider();
  const created = charge(provider, { customer: "cus_1", amount: 1200 });
  assert.equal(created.currency, "usd");
  assert.equal(created.amount, 1200);
});

test("refuses an amount that is not a positive whole number of cents", () => {
  const provider = new PaymentProvider();
  assert.throws(() => charge(provider, { customer: "cus_1", amount: 12.5 }), BillingError);
  assert.throws(() => charge(provider, { customer: "cus_1", amount: 0 }), BillingError);
});

test("lists one customer's invoices, newest first", () => {
  const provider = new PaymentProvider();
  charge(provider, { customer: "cus_1", amount: 100 });
  charge(provider, { customer: "cus_2", amount: 200 });
  charge(provider, { customer: "cus_1", amount: 300 });
  assert.deepEqual(listInvoices(provider, "cus_1").map((c) => c.amount), [300, 100]);
});
