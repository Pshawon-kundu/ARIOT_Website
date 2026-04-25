# DATABASE_SCHEMA_PLAN.md

The shape of the ARIOT data model. **This is a sketch, not Prisma code yet.** It informs the eventual `prisma/schema.prisma` and any migration plan. Keep it stable across phases — the entities below are designed so each subsequent phase only *adds* fields and tables, never refactors core types.

Conventions:

- Postgres + Prisma. IDs are `cuid2` strings.
- Timestamps: `createdAt`, `updatedAt` on every model; `deletedAt` (soft delete) on user-facing entities.
- Money: `priceMinor` (BigInt, smallest unit) + `currency` (`BDT` | `USD`). Never floats.
- Audit: `createdBy?`, `updatedBy?` referencing `User.id` where applicable.
- Indices on every FK and on every column used in hot `where` filters.
- Enums are uppercase singular.

---

## 1. Identity & Access

### `User`
The unified identity for both customers and admins (admins are users with one or more roles).

| Field | Type | Notes |
|---|---|---|
| id | string (cuid2) | PK |
| email | citext | unique, not null |
| emailVerifiedAt | datetime? | |
| phone | string? | E.164 |
| phoneVerifiedAt | datetime? | |
| name | string? | |
| avatarUrl | string? | |
| passwordHash | string? | argon2id; nullable for OAuth-only |
| locale | string | default `'en'`; reserved for `'bn'` later |
| preferredCurrency | enum | `BDT` \| `USD`, default `BDT` |
| status | enum | `ACTIVE` \| `SUSPENDED` \| `DELETED` |
| lastLoginAt | datetime? | |
| createdAt, updatedAt, deletedAt | | standard |

Indices: `email` (unique), `phone`.

### `Session`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| userId | string | FK `User` |
| tokenHash | string | unique, hashed session token |
| ip | string? | hashed for privacy |
| userAgent | string? | truncated |
| expiresAt | datetime | |
| createdAt | | |

### `Role`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| key | enum | `SUPER_ADMIN` \| `CONTENT_ADMIN` \| `SUPPORT_ADMIN` \| `SALES_ADMIN` |
| name | string | display |
| permissions | json | array of permission keys |

### `UserRole`
Join: `userId` × `roleId`.

### `Customer`
A view/extension of `User` for ecommerce-specific fields. Created lazily on first cart/order.

| Field | Type | Notes |
|---|---|---|
| id | string | PK = `User.id` |
| companyName | string? | for B2B contacts |
| taxId | string? | BIN/VAT for invoices |
| segment | enum | `B2C` \| `B2B` \| `EDU` |
| accountManagerId | string? | FK `User` (sales role) |
| lifetimeValueMinor | bigint | denormalized; rebuilt nightly |
| createdAt, updatedAt | | |

### `Address`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| userId | string | FK `User` |
| label | string? | "Home", "Office" |
| recipientName | string | |
| line1, line2 | string | |
| city, district | string | |
| division | string? | BD division / SA equivalent |
| postcode | string? | |
| country | string | ISO-3166-1 alpha-2; default `BD` |
| phone | string | |
| isDefaultShipping, isDefaultBilling | boolean | |
| createdAt, updatedAt | | |

---

## 2. Catalog

### `Category`
Tree structure (parent/child).

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| slug | string | unique |
| name | string | |
| description | string? | |
| parentId | string? | FK `Category` |
| order | int | within siblings |
| heroImageId | string? | FK `MediaAsset` |
| seoTitle, seoDescription | string? | |
| isPublished | boolean | |
| createdAt, updatedAt, deletedAt | | |

Indices: `slug` unique, `parentId`.

### `Product`
The flagship entity. Variants live in `ProductVariant`.

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| slug | string | unique |
| name | string | |
| tagline | string? | ≤ 140 chars |
| description | mdx | long-form |
| categoryId | string | FK `Category` |
| sku | string | unique base SKU |
| brand | string | default `'ARIOT'` |
| salesType | enum | `B2C` \| `B2B` \| `HYBRID` |
| priceMinor | bigint? | base price; nullable for B2B-only quote items |
| currency | enum | `BDT` \| `USD` |
| stock | int | base stock if no variants |
| stockPolicy | enum | `IN_STOCK` \| `BACKORDER` \| `MADE_TO_ORDER` |
| weightGrams | int? | |
| dimensions | json? | `{ l, w, h, unit }` |
| status | enum | `DRAFT` \| `PUBLISHED` \| `ARCHIVED` |
| publishedAt | datetime? | |
| seoTitle, seoDescription | string? | |
| heroImageId | string? | FK `MediaAsset` |
| heroVideoId | string? | FK `MediaAsset` |
| specs | json | grouped spec table |
| highlights | json | array of bullet strings |
| inTheBox | json | array of strings |
| createdAt, updatedAt, deletedAt | | |
| createdBy, updatedBy | string? | FK `User` |

Indices: `slug` unique, `sku` unique, `categoryId`, `status`, `publishedAt`. FTS index on `name`, `tagline`, `description` via `pg_trgm` + tsvector.

### `ProductVariant`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| productId | string | FK `Product` |
| sku | string | unique |
| name | string | "Black, 12V" |
| optionValues | json | `{ color: 'black', voltage: '12V' }` |
| priceMinor | bigint? | overrides product price if set |
| currency | enum | inherits product if null |
| stock | int | |
| barcode | string? | EAN/UPC |
| isDefault | boolean | |
| createdAt, updatedAt, deletedAt | | |

### `ProductImage`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| productId | string | FK `Product` |
| variantId | string? | FK `ProductVariant` (variant-specific) |
| mediaId | string | FK `MediaAsset` |
| order | int | |
| altText | string | |
| isPrimary | boolean | |
| createdAt, updatedAt | | |

### `ProductVideo`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| productId | string | FK `Product` |
| variantId | string? | FK `ProductVariant` |
| mediaId | string | FK `MediaAsset` (video file) |
| posterMediaId | string? | FK `MediaAsset` (poster image) |
| order | int | |
| caption | string? | |
| autoplayLoop | boolean | default `true` |
| createdAt, updatedAt | | |

### `ProductDownload`
Datasheets, manuals, CAD files, firmware.

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| productId | string | FK `Product` |
| kind | enum | `DATASHEET` \| `MANUAL` \| `QUICKSTART` \| `CAD` \| `FIRMWARE` \| `OTHER` |
| version | string? | for firmware |
| fileMediaId | string | FK `MediaAsset` |
| sizeBytes | bigint | |
| isPublic | boolean | true = public, false = customer-only |
| createdAt, updatedAt | | |

### `ProductRelation`
Self-join: related / cross-sell / accessory.

| Field | Type | Notes |
|---|---|---|
| productId | string | FK |
| relatedProductId | string | FK |
| kind | enum | `RELATED` \| `CROSS_SELL` \| `ACCESSORY` \| `ALTERNATIVE` |
| order | int | |
PK: composite (`productId`, `relatedProductId`, `kind`).

---

## 3. Cart, Checkout, Orders

### `Cart`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| token | string? | unique, signed; for guest carts |
| userId | string? | FK `User`; null for guests |
| currency | enum | `BDT` \| `USD` |
| voucherCode | string? | applied promo |
| voucherDiscountMinor | bigint? | resolved discount |
| expiresAt | datetime? | guest carts expire after 30 days |
| createdAt, updatedAt | | |

### `CartItem`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| cartId | string | FK `Cart` |
| productId | string | FK `Product` |
| variantId | string? | FK `ProductVariant` |
| quantity | int | ≥ 1 |
| unitPriceMinor | bigint | snapshot at add-to-cart |
| currency | enum | inherited |
| createdAt, updatedAt | | |

### `Order`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| number | string | unique, human-friendly (`ARI-202504-00021`) |
| userId | string? | nullable for guest checkout |
| email | string | snapshot |
| status | enum | `CREATED` \| `AWAITING_PAYMENT` \| `PAID` \| `PACKED` \| `SHIPPED` \| `DELIVERED` \| `COMPLETED` \| `CANCELLED` \| `REFUNDED` \| `FAILED` |
| currency | enum | `BDT` \| `USD` |
| subtotalMinor | bigint | |
| shippingMinor | bigint | |
| taxMinor | bigint | |
| discountMinor | bigint | |
| totalMinor | bigint | server-authoritative |
| shippingAddress | json | snapshot |
| billingAddress | json | snapshot |
| shippingMethod | string | label |
| voucherCode | string? | |
| notes | string? | customer notes |
| placedAt | datetime? | |
| paidAt | datetime? | |
| shippedAt, deliveredAt, cancelledAt, refundedAt | datetime? | |
| createdAt, updatedAt | | |

Indices: `number` unique, `userId`, `status`, `placedAt`.

### `OrderItem`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| orderId | string | FK `Order` |
| productId | string | FK `Product` |
| variantId | string? | |
| nameSnapshot | string | snapshot at purchase |
| skuSnapshot | string | snapshot |
| unitPriceMinor | bigint | snapshot |
| quantity | int | |
| lineTotalMinor | bigint | |

### `Payment`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| orderId | string | FK `Order` |
| provider | enum | `BKASH` \| `NAGAD` \| `SSLCOMMERZ` \| `STRIPE` \| `MANUAL` |
| providerIntentId | string | unique per provider |
| amountMinor | bigint | |
| currency | enum | |
| status | enum | `PENDING` \| `AUTHORIZED` \| `CAPTURED` \| `FAILED` \| `REFUNDED` \| `PARTIALLY_REFUNDED` |
| rawPayload | json | server-only; PII-scrubbed before persist |
| capturedAt, refundedAt | datetime? | |
| createdAt, updatedAt | | |

### `Shipment`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| orderId | string | FK `Order` |
| carrier | string | |
| trackingNumber | string? | |
| status | enum | `LABEL_CREATED` \| `IN_TRANSIT` \| `DELIVERED` \| `RETURNED` |
| shippedAt, deliveredAt | datetime? | |

### `Voucher`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| code | string | unique, citext |
| kind | enum | `PERCENTAGE` \| `FIXED` |
| amount | bigint | percent (×100) or minor |
| currency | enum? | for FIXED |
| minSubtotalMinor | bigint? | |
| usageLimit | int? | total |
| perCustomerLimit | int? | |
| validFrom, validUntil | datetime? | |
| isActive | boolean | |

---

## 4. Quotes (B2B)

### `QuoteRequest`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| number | string | unique (`Q-202504-00012`) |
| userId | string? | nullable for anonymous |
| email | string | |
| name | string | |
| company | string? | |
| role | string? | |
| phone | string? | |
| country | string | ISO-3166-1 |
| industry | string? | |
| useCase | string? | |
| timeline | string? | |
| scaleHint | string? | "10-50 units", "1 site" |
| message | string | |
| attachments | json | array of media ids |
| status | enum | `RECEIVED` \| `IN_REVIEW` \| `RESPONDED` \| `WON` \| `LOST` \| `CLOSED` |
| assignedToId | string? | FK `User` |
| convertedOrderId | string? | FK `Order` |
| internalNotes | string? | |
| createdAt, updatedAt | | |

### `QuoteRequestProduct`
Multi-select interest.

| Field | Type | Notes |
|---|---|---|
| quoteId | string | FK |
| productId | string? | nullable if category-only |
| categoryId | string? | |
| quantityHint | int? | |
PK: composite.

---

## 5. Support

### `SupportCategory`
Tree.

| Field | Type | Notes |
|---|---|---|
| id, slug, name, parentId, order, isPublished, seo* | | |
| heroImageId | string? | FK `MediaAsset` |

### `SupportArticle`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| slug | string | unique |
| title | string | |
| summary | string? | |
| body | mdx | rich content |
| categoryId | string | FK |
| productIds | json | denormalized array of related product ids |
| status | enum | `DRAFT` \| `PUBLISHED` \| `ARCHIVED` |
| publishedAt | datetime? | |
| helpfulYes, helpfulNo | int | denormalized counters |
| seoTitle, seoDescription | string? | |
| createdAt, updatedAt, deletedAt | | |
| createdBy, updatedBy | string? | |

Indices: `slug` unique, `categoryId`, `status`. FTS on title + body.

### `SupportFeedback`
Anonymous helpful-vote events for analytics.

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| articleId | string | FK |
| vote | enum | `YES` \| `NO` |
| comment | string? | |
| sessionHash | string | for spam control |
| createdAt | | |

### `SupportTicket`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| number | string | unique (`T-202504-00045`) |
| userId | string? | nullable for guest tickets (rare) |
| email | string | snapshot |
| subject | string | |
| relatedProductId | string? | FK |
| relatedOrderId | string? | FK |
| priority | enum | `LOW` \| `NORMAL` \| `HIGH` \| `URGENT` |
| status | enum | `NEW` \| `OPEN` \| `PENDING_CUSTOMER` \| `RESOLVED` \| `CLOSED` \| `REOPENED` |
| assignedToId | string? | FK `User` (support_admin) |
| slaDeadlineAt | datetime? | computed |
| firstResponseAt | datetime? | |
| resolvedAt, closedAt | datetime? | |
| createdAt, updatedAt | | |

### `TicketMessage`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| ticketId | string | FK |
| authorId | string? | FK `User` (null = system) |
| authorRole | enum | `CUSTOMER` \| `AGENT` \| `SYSTEM` |
| body | mdx | |
| internal | boolean | true = agent-only |
| attachments | json | array of media ids |
| createdAt | | |

### `TicketEvent`
Status changes, assignments, SLA breaches.

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| ticketId | string | FK |
| kind | enum | `STATUS_CHANGED` \| `ASSIGNED` \| `PRIORITY_CHANGED` \| `SLA_BREACHED` \| `ESCALATED` |
| metadata | json | |
| actorId | string? | FK `User` |
| createdAt | | |

---

## 6. Blog / Innovation Lab

### `BlogCategory`
| Field | Type | Notes |
|---|---|---|
| id, slug, name, description, order, isPublished, seo* | | |

### `BlogPost`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| slug | string | unique |
| title | string | |
| excerpt | string? | |
| body | mdx | |
| categoryId | string | FK |
| tags | json | array of strings |
| coverImageId | string? | FK `MediaAsset` |
| authorId | string | FK `User` |
| readingTimeMinutes | int | computed at publish |
| status | enum | `DRAFT` \| `SCHEDULED` \| `PUBLISHED` \| `ARCHIVED` |
| publishedAt | datetime? | |
| isLab | boolean | true = innovation-lab style |
| seoTitle, seoDescription | string? | |
| ogImageId | string? | FK |
| createdAt, updatedAt, deletedAt | | |

Indices: `slug` unique, `categoryId`, `status`, `publishedAt`. FTS on title + body.

### `Newsletter`
| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| email | citext | unique |
| status | enum | `PENDING` \| `CONFIRMED` \| `UNSUBSCRIBED` |
| confirmedAt, unsubscribedAt | datetime? | |
| source | string? | "footer", "blog-cta", etc. |
| createdAt, updatedAt | | |

---

## 7. Media

### `MediaAsset`
The single registry for every uploaded file. Public-bucket assets carry a `cdnUrl`; private assets serve via signed URL.

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| kind | enum | `IMAGE` \| `VIDEO` \| `DOCUMENT` \| `FIRMWARE` \| `MODEL_3D` \| `OTHER` |
| mime | string | |
| sizeBytes | bigint | |
| width, height | int? | for image/video |
| durationSeconds | int? | for video |
| storageKey | string | bucket key |
| cdnUrl | string? | when public |
| variants | json | `[{ width, height, url, format }]` |
| altText | string? | for images, default for `<img alt>` |
| caption | string? | |
| sourcePromptId | string? | FK `AiPrompt` (for Seedream/Seedance assets) |
| folder | string? | logical folder |
| tags | json | |
| isPublic | boolean | |
| uploadedBy | string? | FK `User` |
| createdAt, updatedAt, deletedAt | | |

Indices: `kind`, `folder`, `uploadedBy`.

### `AiPrompt`
Reproducibility for Seedream / Seedance assets.

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| tool | enum | `SEEDREAM` \| `SEEDANCE` \| `OTHER` |
| prompt | string | |
| negativePrompt | string? | |
| seed | string? | |
| params | json | model, sampler, steps, etc. |
| outputMediaId | string? | FK `MediaAsset` |
| createdBy | string? | |
| createdAt | | |

---

## 8. Operations

### `AuditLog`
Append-only.

| Field | Type | Notes |
|---|---|---|
| id | string | PK |
| actorId | string? | FK `User` |
| actorRole | enum? | snapshot |
| action | string | e.g., `product.update`, `order.refund` |
| entityType | string | |
| entityId | string | |
| before | json? | |
| after | json? | |
| ipHash | string? | |
| userAgent | string? | |
| createdAt | | |

Indices: `entityType + entityId`, `actorId`, `createdAt`.

### `SystemSetting`
Single-row store for site-level configuration that is admin-editable (currencies enabled, taxes by zone, payment provider toggles, email templates customizations, default SEO).

| Field | Type | Notes |
|---|---|---|
| key | string | PK |
| value | json | |
| updatedAt, updatedBy | | |

---

## 9. IoT (Phase 5, sketch)

Reserved tables; not built in Phase 1–4. Documented now to lock relationships.

### `Device`
`id`, `serialNumber` (unique), `productId` FK, `customerId` FK, `firmwareVersion`, `lastSeenAt`, `status`, audit fields.

### `DeviceTelemetry`
Time-series. `id`, `deviceId` FK, `recordedAt`, `metrics` (json), partitioned monthly.

### `FirmwareRelease`
`id`, `productId` FK, `version`, `releaseNotes` (mdx), `mediaId` FK, `isStable`, `publishedAt`.

---

## 10. Conventions checklist

- All FK relationships have `onDelete` policy explicitly set (`Restrict` for finance-related, `Cascade` for child rows under parent — e.g., `OrderItem` under `Order` only when the order is hard-deleted, never via soft delete).
- Soft delete entities default-scope to `deletedAt: null` everywhere.
- Money displayed via the formatter in `lib/format/currency.ts` (BDT primary, USD secondary). DB stores canonical only.
- `slug` columns are immutable after publish; renaming generates a 301 redirect entry (table TBD with the SEO subsystem).
- All `json` columns have a TS type alongside the schema (`type ProductSpecs = ...`) and are validated with Zod on write.
