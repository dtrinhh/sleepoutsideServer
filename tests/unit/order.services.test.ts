import { describe, expect, it } from "vitest";
import { calculateOrderTotals } from "../../src/services/order.services.mts";

describe("calculateOrderTotals", () => {
  it("calculates 6% tax and $10 plus $2 per additional item for shipping", () => {
    expect(
      calculateOrderTotals([{ finalPrice: 69.99 }, { finalPrice: 24.99 }]),
    ).toEqual({
      subtotal: 94.98,
      shippingCost: 12,
      taxAmount: 5.7,
      totalPrice: 112.68,
    });
  });

  it("does not charge shipping for an empty cart", () => {
    expect(calculateOrderTotals([])).toEqual({
      subtotal: 0,
      shippingCost: 0,
      taxAmount: 0,
      totalPrice: 0,
    });
  });
});
