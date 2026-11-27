import { Router } from "express";
import authorize from "../middleware/authorize.mts";
import { createOrder } from "../services/order.services.mts";
import { sanitize } from "../services/utils.mts";

const router: Router = Router();

router.post("/", authorize, async (req, res, next) => {
  try {
    const cleanBody = sanitize(req.body);
    const order = await createOrder(cleanBody, res.locals.user?.id);

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
