import { z } from "zod";

export const PollListRequestSchema = z.object({}).strict();
export type PollListRequest = z.output<typeof PollListRequestSchema>;

export const PollRowSchema = z
  .object({
    id: z.string(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    creator_id: z.string(),
    group_id: z.string().nullable(),
    name: z.string(),
    description: z.string(),
    opens_at: z.iso.datetime(),
    closes_at: z.iso.datetime(),
    type: z.enum(["single_choice", "multiple_choice", "ranked_choice"]),
    ranked_method: z.enum(["irv", "borda"]).nullable(),
    gender_restriction: z.enum(["m", "f"]).nullable(),
    age_min: z.number().int().nullable(),
    age_max: z.number().int().nullable(),
    gross_income_min: z.number().nonnegative().nullable(),
    gross_income_max: z.number().nonnegative().nullable(),
    cities: z.array(z.string()),
    countries: z.array(z.string()),
    is_live: z.boolean(),
    live_token: z.uuid(),
    closed_at: z.iso.datetime().nullable(),
  })
  .strict();
export type PollRow = z.output<typeof PollRowSchema>;

export const PollOptionRowSchema = z
  .object({
    id: z.string(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    poll_id: z.string(),
    name: z.string(),
    position: z.number().int().positive(),
    is_no_suitable_option: z.boolean(),
  })
  .strict();
export type PollOptionRow = z.output<typeof PollOptionRowSchema>;

export const PollSchema = PollRowSchema.extend({ options: z.array(PollOptionRowSchema) }).strict();
export type Poll = z.output<typeof PollSchema>;

export const PollCreateRequestSchema = PollRowSchema.pick({
  name: true,
  description: true,
  opens_at: true,
  closes_at: true,
  type: true,
  ranked_method: true,
  gender_restriction: true,
  age_min: true,
  age_max: true,
  gross_income_min: true,
  gross_income_max: true,
  cities: true,
  countries: true,
  group_id: true,
  is_live: true,
})
  .extend({ options: z.array(z.string().trim().min(1).max(500)).min(2).max(5) })
  .strict();
export type PollCreateRequest = z.output<typeof PollCreateRequestSchema>;

export const PollVoteRequestSchema = z.object({ option_ids: z.array(z.string()).min(1).max(5) }).strict();
export type PollVoteRequest = z.output<typeof PollVoteRequestSchema>;

export const PollResultOptionSchema = z
  .object({
    option_id: z.string(),
    name: z.string(),
    votes: z.number().int().nonnegative(),
    voter_percentage: z.number().nonnegative(),
    selection_percentage: z.number().nonnegative(),
  })
  .strict();
export const PollResultsSchema = z
  .object({
    poll_id: z.string(),
    eligible_voters: z.number().int().nonnegative(),
    votes_cast: z.number().int().nonnegative(),
    turnout_percentage: z.number().nonnegative(),
    abstention_percentage: z.number().nonnegative(),
    options: z.array(PollResultOptionSchema),
  })
  .strict();
export type PollResults = z.output<typeof PollResultsSchema>;
