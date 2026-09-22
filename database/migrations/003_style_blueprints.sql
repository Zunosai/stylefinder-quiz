-- ============================================================================
-- 003 — StyleFinder ID® Signature Style Blueprints
--
-- WHY (2026-09-22):
-- A Blueprint is a premium written deliverable generated from a taker's three
-- StyleTypes: what her combination means, how it looks in clothing, and how to
-- use it. A coach generates one on demand from the admin dashboard; it is then
-- emailed to the client and offered as a PDF.
--
-- Generation sends her StyleTypes to an AI service (a third party), so the
-- consent copy shown at capture gains a sentence disclosing that, and
-- CONSENT_VERSION moves to 2026-09-22-blueprint-ai. Blueprints are a new
-- feature for new takers — nothing here backfills or reinterprets consent
-- given under earlier wording. See migration 002 for that reasoning.
-- ============================================================================

CREATE TABLE IF NOT EXISTS style_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES quiz_submissions(id) ON DELETE CASCADE,

  -- The Blueprint itself, as Markdown. Stored so it can be re-sent and
  -- re-rendered as a PDF without paying to generate it again — and so the
  -- client and the coach always see the same words.
  markdown text NOT NULL,

  -- The three StyleTypes it was written from, denormalized from the
  -- submission. A Blueprint is a point-in-time artifact: if the scoring ever
  -- changes, these record what THIS document was actually written from.
  primary_style text NOT NULL,
  secondary_style text NOT NULL,
  supporting_style text NOT NULL,
  archetype text,

  -- Provenance, for cost tracking and for reproducing a given Blueprint.
  model text NOT NULL,
  input_tokens integer,
  output_tokens integer,
  cache_read_tokens integer,

  generated_at timestamptz NOT NULL DEFAULT now(),
  generated_by text,

  -- Delivery state. Mirrors the columns on quiz_submissions so the existing
  -- email queue patterns apply unchanged.
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamptz,
  email_error text,

  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE style_blueprints IS
  'Generated StyleFinder ID® Signature Style Blueprints, one or more per quiz '
  'submission. Regenerating adds a row rather than replacing one, so a coach '
  'can compare and so a delivered document is never silently rewritten.';

COMMENT ON COLUMN style_blueprints.markdown IS
  'The Blueprint as Markdown. Source of truth for both the email and the PDF.';

COMMENT ON COLUMN style_blueprints.archetype IS
  'Primary + Secondary archetype name (e.g. The Adventurer). NULL when the '
  'pairing has no archetype, which happens only for same-energy combinations.';

COMMENT ON COLUMN style_blueprints.generated_by IS
  'Who triggered generation — admin identifier or "system". Not a user FK; '
  'the admin surface authenticates with a shared token, not per-user auth.';

-- The dashboard asks "does this submission have a Blueprint, and what is the
-- newest one?" — submission + recency is the access path.
CREATE INDEX IF NOT EXISTS idx_style_blueprints_submission
  ON style_blueprints (submission_id, generated_at DESC);

-- ---------------------------------------------------------------------------
-- Row level security
--
-- Blueprints are reached only through server-side routes holding the service
-- role key, which bypasses RLS. Enabling it with no permissive policy means a
-- leaked anon key cannot read clients' Blueprints.
-- ---------------------------------------------------------------------------
ALTER TABLE style_blueprints ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.style_blueprints TO service_role;
