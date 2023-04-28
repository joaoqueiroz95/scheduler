import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { AnyZodObject, ZodError } from "zod";

export const validateForm =
  (handler: NextApiHandler, schema: AnyZodObject) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await schema.parseAsync(req.body);
      handler(req, res);
    } catch (error) {
      if (!(error instanceof ZodError)) {
        throw error;
      }

      return res.status(422).json({ message: error.errors[0].message });
    }
  };
