import { z } from "zod";

export const createTaskSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be of type string.",
      required_error: "Name is required.",
    })
    .min(1, "Name must have at least 1 characters.")
    .max(200, "Task can have at most 200 characters."),
});

export const editTaskSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be of type string.",
      required_error: "Name is required.",
    })
    .min(1, "Name must have at least 1 characters.")
    .max(200, "Task can have at most 200 characters."),
});
