import { z } from "zod";

/** Shared client/server contract for the contact form (SPEC Phase 6). */
export const ENQUIRY_TYPES = [
  "Speaking",
  "Collaboration/Research",
  "Media",
  "Institutional/Advisory",
  "Other",
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").max(200),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  enquiryType: z.enum(ENQUIRY_TYPES),
  message: z
    .string()
    .trim()
    .min(10, "Please give a little more detail (at least 10 characters).")
    .max(5000),
  consent: z.boolean().refine((v) => v === true, "Please confirm you agree to be contacted."),
  /** Honeypot: must stay empty. Bots fill it; humans never see it. */
  website: z.string().max(200).optional().or(z.literal("")),
  /** Client mount timestamp (ms) for the minimum-time-to-submit check. */
  startedAt: z.number().int().positive(),
});

export type ContactFormInput = z.infer<typeof contactSchema>;
