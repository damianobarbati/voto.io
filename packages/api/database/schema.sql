-- add support for UUID
create extension if not exists "pgcrypto";

-- asu (array sort unique): sort array and remove duplicates
create function asu (anyarray) returns anyarray language sql as $$
  select array(select distinct $1[s.i] from generate_series(array_lower($1,1), array_upper($1,1)) as s(i) order by 1);
$$;

-- set updated_at=now() when updating row
create function set_updated_at() returns trigger language plpgsql as $$
  begin
    new.updated_at = now()::timestamptz(0);
    return new;
  end;
$$;

create or replace function next_id() returns text as $$
declare
  ts_sec bigint;
  seq bigint;
  id_num bigint;
  res text := '';
  chars text := '0123456789abcdefghijklmnopqrstuvwvoto';
  epoch_offset bigint := 1735689600;
begin
  -- 1. generate 45bit id
  ts_sec := (floor(extract(epoch from clock_timestamp())) - epoch_offset)::bigint & 2147483647;
  seq := nextval('id_seq') & 16383;
  id_num := (ts_sec << 14) | seq;

  -- 2. convert to Base36
  while id_num > 0 loop
      res := substr(chars, (id_num % 36)::integer + 1, 1) || res;
      id_num := id_num / 36;
  end loop;

  -- 3. left-pad for fixed length and lexicographic sorting
  return lpad(res, 9, '0');
end;
$$ language plpgsql;

create sequence id_seq;

create table "users" (
  "id" text primary key default next_id() not null,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "updated_at" timestamptz default now()::timestamptz(0) not null,
  "email" text not null unique,
  "password_hash" text not null,
  "name" text not null check (length(name) > 0 and length(name) <= 100),
  "first_name" text check (length(first_name) > 0 and length(first_name) <= 100),
  "last_name" text check (length(last_name) > 0 and length(last_name) <= 100),
  "birth_date" timestamptz default now()::timestamptz(0) not null,
  "gender" text check (gender in ('m', 'f')),
  income numeric(12,2) check (income >= 0),
  "city" text check (length(city) > 0 and length(city) <= 100),
  "country" text check (length(country) = 2),
  "language" text not null default 'en' check (language in ('en', 'es', 'de', 'fr', 'it'))
);
create trigger "users_set_updated_at" before update on "users" for each row execute procedure set_updated_at();

create table "plans" (
  "id" text primary key,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "updated_at" timestamptz default now()::timestamptz(0) not null,
  "name" text not null unique check (length(name) > 0 and length(name) <= 100),
  "monthly_price" numeric(12,2) not null check (monthly_price >= 0),
  "group_member_limit" integer check (group_member_limit >= 0),
  "live_voter_limit" integer check (live_voter_limit > 0)
);
create trigger "plans_set_updated_at" before update on "plans" for each row execute procedure set_updated_at();

insert into "plans" ("id", "name", "monthly_price", "group_member_limit", "live_voter_limit") values
  ('free', 'Free', 0, 0, 100),
  ('small', 'Small', 9, 100, 1000),
  ('big', 'Big', 90, 1000, 10000),
  ('unlimited', 'Unlimited', 900, null, null);

create table "subscriptions" (
  "id" text primary key default next_id() not null,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "updated_at" timestamptz default now()::timestamptz(0) not null,
  "user_id" text not null references "users" ("id") on delete cascade,
  "plan_id" text not null references "plans" ("id"),
  "status" text not null check (status in ('active', 'cancelled', 'expired')),
  "starts_at" timestamptz not null,
  "ends_at" timestamptz,
  check (ends_at is null or ends_at > starts_at)
);
create unique index "subscriptions_active_user_id_idx" on "subscriptions" ("user_id") where "status" = 'active';
create trigger "subscriptions_set_updated_at" before update on "subscriptions" for each row execute procedure set_updated_at();

create table "payments" (
  "id" text primary key default next_id() not null,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "subscription_id" text not null references "subscriptions" ("id"),
  "amount" numeric(12,2) not null check (amount >= 0),
  "currency" text not null default 'USD' check (length(currency) = 3),
  "method" text not null check (method in ('credit_card', 'paypal', 'apple_pay')),
  "status" text not null check (status in ('pending', 'paid', 'failed', 'refunded')),
  "paid_at" timestamptz,
  "invoice_url" text
);
create index "payments_subscription_id_idx" on "payments" ("subscription_id");

create table "groups" (
  "id" text primary key default next_id() not null,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "updated_at" timestamptz default now()::timestamptz(0) not null,
  "owner_id" text not null references "users" ("id"),
  "name" text not null check (length(name) > 0 and length(name) <= 100),
  "description" text not null default '' check (length(description) <= 2000),
  "image_url" text
);
create index "groups_owner_id_idx" on "groups" ("owner_id");
create trigger "groups_set_updated_at" before update on "groups" for each row execute procedure set_updated_at();

create table "group_members" (
  "group_id" text not null references "groups" ("id") on delete cascade,
  "user_id" text not null references "users" ("id") on delete cascade,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "role" text not null default 'member' check (role in ('owner', 'admin', 'member')),
  primary key ("group_id", "user_id")
);
create index "group_members_user_id_idx" on "group_members" ("user_id");

create table "group_invitations" (
  "id" text primary key default next_id() not null,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "updated_at" timestamptz default now()::timestamptz(0) not null,
  "group_id" text not null references "groups" ("id") on delete cascade,
  "invited_by_id" text not null references "users" ("id"),
  "email" text not null,
  "token" uuid not null default gen_random_uuid() unique,
  "status" text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  "expires_at" timestamptz,
  "responded_at" timestamptz,
  unique ("group_id", "email")
);
create index "group_invitations_email_status_idx" on "group_invitations" ("email", "status");
create trigger "group_invitations_set_updated_at" before update on "group_invitations" for each row execute procedure set_updated_at();

create table "polls" (
  "id" text primary key default next_id() not null,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "updated_at" timestamptz default now()::timestamptz(0) not null,
  "creator_id" text not null references "users" ("id"),
  "group_id" text references "groups" ("id") on delete set null,
  "name" text not null check (length(name) > 0 and length(name) <= 200),
  "description" text not null default '' check (length(description) <= 5000),
  "opens_at" timestamptz not null,
  "closes_at" timestamptz not null,
  "type" text not null check (type in ('single_choice', 'multiple_choice', 'ranked_choice')),
  "ranked_method" text check (ranked_method in ('irv', 'borda')),
  "gender_restriction" text check (gender_restriction in ('m', 'f')),
  "age_min" smallint check (age_min between 0 and 150),
  "age_max" smallint check (age_max between 0 and 150),
  "gross_income_min" numeric(12,2) check (gross_income_min >= 0),
  "gross_income_max" numeric(12,2) check (gross_income_max >= 0),
  "cities" text[] not null default '{}',
  "countries" text[] not null default '{}',
  "is_live" boolean not null default false,
  "live_token" uuid not null default gen_random_uuid() unique,
  "closed_at" timestamptz,
  check (closes_at > opens_at),
  check (age_max is null or age_min is null or age_max >= age_min),
  check (gross_income_max is null or gross_income_min is null or gross_income_max >= gross_income_min),
  check ((type = 'ranked_choice') = (ranked_method is not null)),
  check (closed_at is null or closed_at >= opens_at)
);
create index "polls_creator_id_idx" on "polls" ("creator_id");
create index "polls_group_id_idx" on "polls" ("group_id");
create index "polls_open_close_idx" on "polls" ("opens_at", "closes_at");
create trigger "polls_set_updated_at" before update on "polls" for each row execute procedure set_updated_at();

create table "poll_options" (
  "id" text primary key default next_id() not null,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "updated_at" timestamptz default now()::timestamptz(0) not null,
  "poll_id" text not null references "polls" ("id") on delete cascade,
  "name" text not null check (length(name) > 0 and length(name) <= 500),
  "position" smallint not null check (position > 0),
  "is_no_suitable_option" boolean not null default false,
  unique ("id", "poll_id"),
  unique ("poll_id", "position")
);
create unique index "poll_options_no_suitable_option_idx" on "poll_options" ("poll_id") where "is_no_suitable_option";
create trigger "poll_options_set_updated_at" before update on "poll_options" for each row execute procedure set_updated_at();

create table "live_poll_attendees" (
  "id" text primary key default next_id() not null,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "updated_at" timestamptz default now()::timestamptz(0) not null,
  "poll_id" text not null references "polls" ("id") on delete cascade,
  "user_id" text references "users" ("id") on delete set null,
  "token" uuid not null default gen_random_uuid() unique,
  "birth_date" date,
  "gender" text check (gender in ('m', 'f')),
  "gross_income" numeric(12,2) check (gross_income >= 0),
  "city" text check (length(city) > 0 and length(city) <= 100),
  "country" text check (length(country) = 2),
  "opened_at" timestamptz not null default now()::timestamptz(0),
  "last_seen_at" timestamptz not null default now()::timestamptz(0),
  unique ("id", "poll_id")
);
create index "live_poll_attendees_poll_id_idx" on "live_poll_attendees" ("poll_id");
create trigger "live_poll_attendees_set_updated_at" before update on "live_poll_attendees" for each row execute procedure set_updated_at();

create table "poll_votes" (
  "id" text primary key default next_id() not null,
  "created_at" timestamptz default now()::timestamptz(0) not null,
  "poll_id" text not null references "polls" ("id") on delete cascade,
  "user_id" text references "users" ("id") on delete cascade,
  "live_poll_attendee_id" text,
  "submitted_at" timestamptz not null default now()::timestamptz(0),
  check (num_nonnulls("user_id", "live_poll_attendee_id") = 1),
  unique ("id", "poll_id"),
  foreign key ("live_poll_attendee_id", "poll_id") references "live_poll_attendees" ("id", "poll_id") on delete cascade
);
create unique index "poll_votes_user_id_idx" on "poll_votes" ("poll_id", "user_id") where "user_id" is not null;
create unique index "poll_votes_live_poll_attendee_id_idx" on "poll_votes" ("poll_id", "live_poll_attendee_id") where "live_poll_attendee_id" is not null;
create index "poll_votes_poll_id_idx" on "poll_votes" ("poll_id");

create table "poll_vote_options" (
  "vote_id" text not null,
  "poll_id" text not null,
  "option_id" text not null,
  "rank" smallint check (rank > 0),
  primary key ("vote_id", "option_id"),
  unique ("vote_id", "rank"),
  foreign key ("vote_id", "poll_id") references "poll_votes" ("id", "poll_id") on delete cascade,
  foreign key ("option_id", "poll_id") references "poll_options" ("id", "poll_id") on delete cascade
);
create index "poll_vote_options_option_id_idx" on "poll_vote_options" ("option_id");
