-- Corrective Step C.2 — Resolve Prisma generated-column drift (I-019 / I-026)
-- 2026-07-10
--
-- ROOT CAUSE:
-- The init migration (20260707160338_init) created Product.searchVector and
-- BlogPost.searchVector as PostgreSQL GENERATED ALWAYS AS (...) STORED tsvector
-- columns. Prisma 7 cannot natively represent GENERATED ALWAYS AS STORED columns
-- in schema.prisma. When Prisma generates a migration diff (comparing
-- schema.prisma to the shadow database), it proposes:
--
--   ALTER TABLE "Product" ALTER COLUMN "searchVector" DROP DEFAULT;
--
-- PostgreSQL ERROR 42601: this statement is invalid on a GENERATED ALWAYS AS
-- column. Every future `prisma migrate dev` run fails at this point, blocking
-- all new schema migrations.
--
-- RESOLUTION:
-- Drop both generated tsvector columns and their associated GIN indexes.
-- These columns are:
--   (a) Purely derivative caches computed from string fields already indexed
--       via trgm (name, tagline, description, title, body)
--   (b) Not read by any current application code (confirmed by grep; admin
--       product list uses Prisma `contains/mode:'insensitive'` / ILIKE instead)
--   (c) Not required for the trgm-based search strategy in use today
--
-- The trgm-based GIN indexes on individual string columns are PRESERVED and
-- serve the current admin search implementation.
--
-- Full-text search using tsvector will be reconsidered when public-facing search
-- is designed. The preferred future approach is an expression GIN index (not a
-- Prisma-managed generated column) or a dedicated search service.
-- See docs/07_DECISIONS.md D-062.
--
-- DATA SAFETY:
-- searchVector is a GENERATED ALWAYS AS STORED column. Its values are
-- automatically computed by PostgreSQL from other columns (no user-entered data).
-- Dropping the column removes only derived/cached values, not user data.
-- All Product, Category, BlogPost, and MediaAsset rows are unaffected.
-- Existing Product IDs, slugs, SKUs, and all relations are unchanged.

-- Drop Product search-vector GIN index (not a trgm index; safe to drop)
DROP INDEX IF EXISTS "Product_searchVector_idx";

-- Drop Product generated tsvector column
ALTER TABLE "Product" DROP COLUMN IF EXISTS "searchVector";

-- Drop BlogPost search-vector GIN index
DROP INDEX IF EXISTS "BlogPost_searchVector_idx";

-- Drop BlogPost generated tsvector column
ALTER TABLE "BlogPost" DROP COLUMN IF EXISTS "searchVector";
