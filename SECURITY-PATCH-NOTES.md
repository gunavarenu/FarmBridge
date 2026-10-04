# FarmBridge privacy patch — read before using

This patch makes the public-facing React code stop requesting farmer phone numbers for public marketplace cards and changes the Farmer Information Panel to read from `public_farmer_profiles`.

## What changed
- `src/components/features/FarmerInfoPanel.tsx` reads public profiles from `public_farmer_profiles` and no longer expects phone or role fields from that view.
- `src/services/productService.ts` selects only the farmer name in the product join and never maps a farmer phone number into public product data.
- `src/components/ProductCard.tsx` no longer renders a `tel:` link; it displays a notice that contact is shared after approval.
- `.gitignore` now ignores `.env` and `.env.*` while allowing `.env.example`.
- `.env.example` contains placeholders, not the original key value.

## Important limitations — do not treat this as fully secured yet
1. This is a frontend patch only. The database still needs a reviewed RLS/privilege migration. The existing public `SELECT` policy on `farmers` may still allow direct API reads of private columns. Do not claim phone numbers are protected until this is fixed and tested.
2. The “Contact after approval” text is a notice, not a working request/approval workflow. A secure workflow needs database tables/RLS (or server-side functions) that only reveal contact details after the farmer approves a specific buyer.
3. The existing demo OTP (`123456`) and frontend phone-based founder/admin check still need to be replaced with real authentication and server/database-enforced authorization before production.
4. Review policies for `buyer_requests`, `b2b_listings`, `orders`, and `user_activities` before launch.

## Setup
1. Extract the ZIP.
2. In the project root (same folder as `package.json`), copy `.env.example` to `.env.local`.
3. Fill in the actual values locally. Use only the Supabase anon/publishable key in `VITE_SUPABASE_ANON_KEY`; never put a service-role/secret key in any `VITE_` variable.
4. Run `npm install`, then `npm run dev`.
5. Test public profiles, marketplace browsing, login, cart, selling, farmer dashboard, and buyer requests before deployment.

## Secret handling
The original `.env` was intentionally excluded from this ZIP. If it was ever committed to a public GitHub repository, remove it from the repository and rotate any exposed credentials/keys in their provider dashboards. Deleting the file alone does not revoke a key.
