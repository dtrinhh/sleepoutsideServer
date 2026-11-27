import EntityNotFoundError from "../errors/EntityNotFoundError.mts";
import { OrderSchema } from "../database/json-schema.ts";
import type { Address, CartItem, Order } from "../models/types.mts";
import { createOrderRecord } from "../models/order.model.mts";
import { validator } from "./utils.mts";

const validStates = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
  "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
  "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
  "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
  "WV", "WI", "WY",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalidOrder(message: string, statusCode = 400) {
  return new EntityNotFoundError({
    message,
    code: "ERR_VALID",
    statusCode,
  });
}

function isAddress(value: unknown): value is Address {
  if (!isRecord(value)) return false;

  return (
    typeof value.street === "string" &&
    typeof value.city === "string" &&
    typeof value.state === "string" &&
    validStates.has(value.state) &&
    typeof value.zipCode === "string" &&
    typeof value.country === "string"
  );
}

function isCartItem(value: unknown): value is CartItem {
  if (!isRecord(value)) return false;
  if (
    typeof value.productId !== "string" ||
    typeof value.productName !== "string" ||
    typeof value.price !== "number" ||
    !Number.isFinite(value.price) ||
    value.price < 0 ||
    typeof value.finalPrice !== "number" ||
    !Number.isFinite(value.finalPrice) ||
    value.finalPrice < 0 ||
    typeof value.productImageSrc !== "string" ||
    typeof value.productUrl !== "string" ||
    typeof value.productCategory !== "string"
  ) {
    return false;
  }

  return (
    value.productColor === undefined ||
    (isRecord(value.productColor) &&
      typeof value.productColor.colorCode === "string")
  );
}

function roundCurrency(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function isValidCardExpiration(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;

  const expirationMonth = Number(match[1]);
  const expirationYear = 2000 + Number(match[2]);
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  return (
    expirationYear > currentYear ||
    (expirationYear === currentYear && expirationMonth >= currentMonth)
  );
}

export function calculateOrderTotals(
  orderItems: readonly Pick<CartItem, "finalPrice">[],
) {
  const subtotal = roundCurrency(
    orderItems.reduce((sum, item) => sum + item.finalPrice, 0),
  );
  const shippingCost = orderItems.length
    ? roundCurrency(10 + 2 * (orderItems.length - 1))
    : 0;
  const taxAmount = roundCurrency(subtotal * 0.06);

  return {
    subtotal,
    shippingCost,
    taxAmount,
    totalPrice: roundCurrency(subtotal + shippingCost + taxAmount),
  };
}

export async function createOrder(rawBody: unknown, authenticatedUserId: unknown) {
  if (typeof authenticatedUserId !== "string" || !authenticatedUserId) {
    throw invalidOrder("Sign in before placing an order.", 401);
  }
  if (!isRecord(rawBody)) {
    throw invalidOrder("Order details are required.");
  }
  if (rawBody.userId !== authenticatedUserId) {
    throw invalidOrder("The order user does not match the signed-in user.", 403);
  }
  if (
    typeof rawBody.name !== "string" ||
    rawBody.name.trim().length < 2 ||
    rawBody.name.trim().length > 50
  ) {
    throw invalidOrder("Enter a name between 2 and 50 characters.");
  }
  if (
    typeof rawBody.cardNumber !== "string" ||
    !/^\d{16}$/.test(rawBody.cardNumber)
  ) {
    throw invalidOrder("Enter a valid 16-digit demo card number.");
  }
  if (
    typeof rawBody.cardExpiration !== "string" ||
    !isValidCardExpiration(rawBody.cardExpiration)
  ) {
    throw invalidOrder("Enter a valid, unexpired card expiration date in MM/YY format.");
  }
  if (typeof rawBody.cardCode !== "string" || !/^\d{3}$/.test(rawBody.cardCode)) {
    throw invalidOrder("Enter a valid 3-digit demo security code.");
  }
  if (!isAddress(rawBody.shippingAddress)) {
    throw invalidOrder("Enter a valid shipping address.");
  }
  if (
    !Array.isArray(rawBody.orderItems) ||
    rawBody.orderItems.length === 0 ||
    !rawBody.orderItems.every(isCartItem)
  ) {
    throw invalidOrder("Your order must include valid cart items.");
  }

  const orderItems = rawBody.orderItems;
  const totals = calculateOrderTotals(orderItems);
  const timestamp = new Date();
  const order: Omit<Order, "_id" | "id"> = {
    userId: authenticatedUserId,
    name: rawBody.name.trim(),
    status: "pending",
    shippingAddress: rawBody.shippingAddress,
    orderItems,
    createdAt: timestamp,
    modifiedAt: timestamp,
    totalPrice: totals.totalPrice,
    shippingCost: totals.shippingCost,
    taxAmount: totals.taxAmount,
  };

  validator(OrderSchema, order);
  return createOrderRecord(order);
}
