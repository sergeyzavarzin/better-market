import { z } from "zod";

export const getItemParamsByMessageResult = z.object({
  name: z.string().optional().default(""),
  price: z.number().optional().default(0),
  currency: z.string().optional().default(""),
  valid: z.boolean(),
});
