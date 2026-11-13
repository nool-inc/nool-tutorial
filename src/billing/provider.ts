/**
 * A stand-in for a real payment provider: it keeps charges in memory.
 * Only src/billing/client.ts talks to it.
 */
export interface Charge {
  id: string;
  customer: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export class PaymentProvider {
  #charges: Charge[] = [];
  #next = 1;

  createCharge(input: Omit<Charge, "id" | "createdAt">): Charge {
    const charge: Charge = { ...input, id: `ch_${this.#next++}`, createdAt: new Date().toISOString() };
    this.#charges.push(charge);
    return charge;
  }

  listCharges(customer?: string): Charge[] {
    return this.#charges.filter((c) => customer === undefined || c.customer === customer);
  }
}
