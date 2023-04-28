import { z } from "zod";
import { TIMEZONES } from "../timezone";
import { arrayToEnum } from "@/libs/general";

export const createAgendaSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be of type string.",
      required_error: "Name is required.",
    })
    .min(1, "Name must have at least 1 characters.")
    .max(100, "Name can have at most 100 characters."),
  timezone: z.nativeEnum(arrayToEnum(TIMEZONES.map((tz) => tz.id))).optional(),
  ownerId: z
    .string({
      invalid_type_error: "ownerId must be of type string.",
    })
    .optional(),
});

export const editAgendaSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be of type string.",
    })
    .min(1, "Name must have at least 1 characters.")
    .max(100, "Name can have at most 100 characters.")
    .optional(),
  timezone: z.nativeEnum(arrayToEnum(TIMEZONES.map((tz) => tz.id))).optional(),
  ownerId: z
    .string({
      invalid_type_error: "ownerId must be of type string.",
    })
    .optional(),
});
