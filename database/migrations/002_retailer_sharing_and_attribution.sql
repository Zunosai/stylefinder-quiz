-- ============================================================================
-- 002 — Retailer sharing consent + store attribution
--
-- WHY (2026-08-04):
-- StyleFinder ID® is moving from "results go to a style coach" to "her SFID can
-- also power personalized recommendations from boutiques she already shops at"
-- (BHOS customer-style outreach).
--
-- The consent copy in force until this migration promised takers:
--   "Your information is used solely for this assessment and will be shared
--    with your assigned style coach... We do NOT share your data with third
--    parties."
--
-- A boutique IS a third party. Every row created before this migration was
-- captured under that promise and therefore CANNOT be used for retailer
-- outreach. `share_with_retailers` defaults to NULL precisely so those rows
-- read as "never asked" rather than silently inheriting a `true` they never
-- gave. Only rows with share_with_retailers = true are eligible.
--
-- DO NOT backfill this column to true. Re-consent is the only lawful path for
-- pre-existing rows.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Consent to share the SFID with retailers she shops with.
--    NULL = never asked (pre-consent-change rows). true/false = her answer.
-- ---------------------------------------------------------------------------
ALTER TABLE quiz_submissions
  ADD COLUMN IF NOT EXISTS share_with_retailers boolean DEFAULT NULL;

COMMENT ON COLUMN quiz_submissions.share_with_retailers IS
  'Consent to share this SFID with boutiques the taker shops with. '
  'NULL = never asked (captured before the 2026-08-04 consent change, NOT '
  'eligible for retailer outreach). Never backfill to true.';

-- Version the consent text she actually agreed to, so a future wording change
-- does not retroactively redefine what past takers consented to.
ALTER TABLE quiz_submissions
  ADD COLUMN IF NOT EXISTS consent_version text DEFAULT NULL;

COMMENT ON COLUMN quiz_submissions.consent_version IS
  'Identifier of the consent copy shown at capture (e.g. 2026-08-04-retailer-sharing). '
  'NULL = pre-versioning. Lets us prove what a given row agreed to.';

-- ---------------------------------------------------------------------------
-- 2) Store attribution — which boutique drove this take.
--    SFID stays TBH-branded; stores USE it, they don't OWN it. So this is a
--    referral credit, NOT multi-tenancy: there is no per-store data partition
--    and no store-scoped ownership of the row.
-- ---------------------------------------------------------------------------
ALTER TABLE quiz_submissions
  ADD COLUMN IF NOT EXISTS referral_store_id text DEFAULT NULL;

COMMENT ON COLUMN quiz_submissions.referral_store_id IS
  'BHOS shops.id of the boutique that drove this quiz take, from the ?store= '
  'param. ATTRIBUTION ONLY — it does not grant that store ownership of, or '
  'exclusive access to, this row. Cross-store visibility is governed by the '
  'own-customer-list rule, not by this column.';

ALTER TABLE quiz_submissions
  ADD COLUMN IF NOT EXISTS referral_source text DEFAULT NULL;

COMMENT ON COLUMN quiz_submissions.referral_source IS
  'Free-form campaign/source tag from the ?src= param (e.g. instagram, in-store-qr).';

-- ---------------------------------------------------------------------------
-- 3) Indexes
-- ---------------------------------------------------------------------------

-- The outreach lookup is: "given these emails from a store's own customer list,
-- which have a consented SFID?" — email + consent is the access path.
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_email_consented
  ON quiz_submissions (lower(user_email))
  WHERE share_with_retailers IS TRUE;

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_referral_store
  ON quiz_submissions (referral_store_id)
  WHERE referral_store_id IS NOT NULL;
