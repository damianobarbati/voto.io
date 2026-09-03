import { z } from "zod";

export const GroupSchema = z
  .object({
    id: z.string(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    owner_id: z.string(),
    name: z.string(),
    description: z.string(),
    image_url: z.string().nullable(),
  })
  .strict();
export type Group = z.output<typeof GroupSchema>;

export const GroupCreateRequestSchema = GroupSchema.pick({ name: true, description: true, image_url: true });
export type GroupCreateRequest = z.output<typeof GroupCreateRequestSchema>;

export const GroupUpdateRequestSchema = GroupCreateRequestSchema.partial();
export type GroupUpdateRequest = z.output<typeof GroupUpdateRequestSchema>;
