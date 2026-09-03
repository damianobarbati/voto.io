import type { Knex } from "knex";

export async function seed(database: Knex): Promise<void> {
  await database("subscriptions").insert([
    { id: "subscription-jane", user_id: "user-jane", plan_id: "small", status: "active", starts_at: database.raw("now() - interval '15 days'"), ends_at: null },
    { id: "subscription-john", user_id: "user-john", plan_id: "free", status: "active", starts_at: database.raw("now() - interval '30 days'"), ends_at: null },
  ]);
  await database("payments").insert({
    id: "payment-jane",
    subscription_id: "subscription-jane",
    amount: 9,
    currency: "USD",
    method: "credit_card",
    status: "paid",
    paid_at: database.raw("now() - interval '15 days'"),
    invoice_url: "https://example.com/invoices/payment-jane",
  });
  await database("group_invitations").insert([
    {
      id: "invitation-luca",
      group_id: "libertarians",
      invited_by_id: "user-jane",
      email: "luca.bianchi@example.com",
      status: "pending",
      expires_at: database.raw("now() + interval '14 days'"),
    },
    {
      id: "invitation-unknown",
      group_id: "libertarians",
      invited_by_id: "user-jane",
      email: "marco.verdi@example.com",
      status: "rejected",
      responded_at: database.raw("now() - interval '2 days'"),
    },
  ]);
  await database("live_poll_attendees").insert({
    id: "attendee-1",
    poll_id: "poll-1",
    user_id: "user-ana",
    birth_date: "1998-01-21",
    gender: "f",
    gross_income: 32_000,
    city: "Milan",
    country: "IT",
  });
  await database("poll_votes").insert([
    { id: "vote-ana", poll_id: "poll-1", user_id: "user-ana" },
    { id: "vote-luca", poll_id: "poll-2", user_id: "user-luca" },
    { id: "vote-live", poll_id: "poll-1", live_poll_attendee_id: "attendee-1" },
  ]);
  await database("poll_vote_options").insert([
    { vote_id: "vote-ana", poll_id: "poll-1", option_id: "poll-1-option-1", rank: 1 },
    { vote_id: "vote-luca", poll_id: "poll-2", option_id: "poll-2-option-1", rank: null },
    { vote_id: "vote-luca", poll_id: "poll-2", option_id: "poll-2-option-2", rank: null },
    { vote_id: "vote-live", poll_id: "poll-1", option_id: "poll-1-option-2", rank: 1 },
  ]);
}
