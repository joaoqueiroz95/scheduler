import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  username: z
    .string({
      invalid_type_error: "Username must be of type string.",
      required_error: "Username is required.",
    })
    .min(4, "Username must have at least 4 characters.")
    .max(20, "Username can have at most 4 characters."),
  password: z
    .string({
      invalid_type_error: "Password must be of type string.",
      required_error: "Password is required.",
    })
    .min(6, "Password must have at least 6 characters.")
    .max(20, "Password can have at most 20 characters."),
  name: z
    .string({
      invalid_type_error: "Name must be of type string.",
      required_error: "Name is required.",
    })
    .min(2, "Name must have at least 2 characters.")
    .max(40, "Name can have at most 40 characters."),
  role: z.nativeEnum(Role).optional(),
});

export const editUserSchema = z.object({
  username: z
    .string({
      invalid_type_error: "Username must be of type string.",
    })
    .min(4, "Username must have at least 4 characters.")
    .max(20, "Username can have at most 4 characters.")
    .optional(),
  password: z
    .string({
      invalid_type_error: "Password must be of type string.",
    })
    .min(6, "Password must have at least 6 characters.")
    .max(20, "Password can have at most 20 characters.")
    .optional(),
  name: z
    .string({
      invalid_type_error: "Name must be of type string.",
    })
    .min(2, "Name must have at least 2 characters.")
    .max(40, "Name can have at most 40 characters.")
    .optional(),
  role: z.nativeEnum(Role).optional(),
});
