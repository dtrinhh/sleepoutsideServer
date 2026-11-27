import mongodb from "../database/index.mts";
import type { Order } from "./types.mts";

export async function createOrderRecord(
  order: Omit<Order, "_id" | "id">,
) {
  const result = await mongodb
    .getDb()
    .collection("orders")
    .insertOne(order);

  return { ...order, id: result.insertedId.toString() };
}
