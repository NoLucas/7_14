# 12단계: Supabase 연동 기반 구축 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Tasks 1-2 touch a live remote Supabase project and are executed directly by the controller (not delegated to a subagent) — see each task's note.

**Goal:** Give the 11단계 라떼아트 요청(현재 localStorage에만 존재)a real, cross-browser-shared home in Supabase, so a later step (13-14) can let the admin upload a video and the customer see it from a different browser. This step only wires up the database/storage foundation and the "save request at checkout" call — it does not yet build the admin upload UI or the customer video view (that's 13/14).

**Architecture:** One new Postgres table (`latte_art_orders`, keyed by the existing localStorage-generated order id) + one new Storage bucket (`latte-art-videos`), both with fully open RLS (`anon` role can insert/select/update everything) — a deliberate, already-approved tradeoff, since this app has no real authentication anywhere yet and cannot distinguish "admin" from "customer" at the database level. The Supabase JS client is loaded via a CDN UMD `<script>` tag (no bundler exists in this project, so npm install would be unusable in the browser as-is) and wrapped in two small vanilla-JS files, following this project's existing pattern of flat `frontend/js/*.js` shared utilities.

**Tech Stack:** Vanilla JS, `@supabase/supabase-js@2` via CDN (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js`, verified reachable — `200 application/javascript`), Supabase Postgres + Storage (project ref `apgzznzonepygfndeyjv`, already created and connected via the `supabase` MCP server — confirmed via `mcp__supabase__list_tables` returning `{"tables":[]}`, i.e. empty but reachable).

## Global Constraints

- This project has no automated test suite and no browser-automation tool exists in this environment. Verification is a mix of: (a) real Supabase MCP tool calls for the DB/storage tasks (these directly hit the real project — their result IS the evidence, no simulation needed), and (b) Node `vm`-sandbox / manual code trace for the JS files, consistent with how 11단계 was verified.
- No build tool, no bundler. All new JS files are plain `<script>`-tag-loaded globals, matching every existing file in `frontend/js/`.
- RLS policy model: **fully open to the `anon` role** (insert/select/update all rows/objects). This was an explicit, already-made decision — do not narrow it or add auth-based restrictions; that would silently break every page since there is no real login.
- Table/column names, function names, and the client accessor name below are fixed — later steps (13, 14) are written against these exact names:
  - Table: `public.latte_art_orders` — columns `order_id text primary key`, `item_name text not null`, `shape text not null`, `note text`, `video_url text`, `video_uploaded_at timestamptz`, `created_at timestamptz not null default now()`
  - Storage bucket: `latte-art-videos` (public)
  - `frontend/js/supabase-client.js` exports a function `getSupabaseClient()` (lazy singleton)
  - `frontend/js/latte-art.js` exports `saveLatteArtRequest(orderId, selection)`, `getLatteArtByOrderId(orderId)`, `uploadLatteArtVideo(orderId, file)` — all `async`, all return `null` on error (logged via `console.error`, never thrown) so callers can `if (!result)` without try/catch, matching this codebase's existing style of not using try/catch at call sites.
  - `selection` is the same object shape 11단계 already produces via `getLatteArtSelection()`: `{ menuId, menuName, shape, note }`.

---

## Task 1: Supabase 스키마 — `latte_art_orders` 테이블 + RLS

**이 태스크는 컨트롤러(나)가 서브에이전트 없이 직접 실행한다.** 실제 프로덕션 Supabase 프로젝트에 스키마를 적용하는 되돌리기 번거로운 작업이라, MCP 도구 호출을 직접 통제하는 편이 안전하다.

**Tool:** `mcp__supabase__apply_migration` (no local Supabase CLI/`supabase/` directory exists in this repo, so this is the migration mechanism — it both applies the SQL and records migration history on the remote project).

- [x] **Step 1: Apply this exact migration** (name: `create_latte_art_orders`)

```sql
create table public.latte_art_orders (
  order_id text primary key,
  item_name text not null,
  shape text not null,
  note text,
  video_url text,
  video_uploaded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.latte_art_orders enable row level security;

create policy "anon can insert latte art requests"
  on public.latte_art_orders for insert
  to anon
  with check (true);

create policy "anon can view latte art requests"
  on public.latte_art_orders for select
  to anon
  using (true);

create policy "anon can update latte art requests"
  on public.latte_art_orders for update
  to anon
  using (true)
  with check (true);

grant select, insert, update on public.latte_art_orders to anon;
```

- [x] **Step 2: Verify** — call `mcp__supabase__list_tables` with `schemas: ["public"]` and confirm `latte_art_orders` appears. Call `mcp__supabase__execute_sql` with `insert into public.latte_art_orders (order_id, item_name, shape, note) values ('TEST-VERIFY-1', '카페라떼', 'heart', null) returning *;` to confirm insert works under the new policy, then `select * from public.latte_art_orders where order_id = 'TEST-VERIFY-1';` to confirm it reads back, then `delete from public.latte_art_orders where order_id = 'TEST-VERIFY-1';` to clean up the test row.

  Done: table appeared with all 7 columns and `rls_enabled: true`; insert/select/delete of `TEST-VERIFY-1` all succeeded and the row was removed afterward.
- [x] **Step 3: Run advisors** — call `mcp__supabase__get_advisors` with `type: "security"` and review findings. The wide-open `anon` policies will likely surface as an advisory finding — that's expected and already an accepted tradeoff (see Global Constraints); note it, don't "fix" it by narrowing access. Fix anything else the advisor flags (e.g. missing index recommendations) only if trivial and non-controversial; otherwise report it for a human decision.

  Done: two `rls_policy_always_true` WARN findings on `latte_art_orders` (INSERT, UPDATE) — both are the accepted wide-open tradeoff, left as-is.

---

## Task 2: Supabase 스키마 — Storage 버킷 + 정책

**이 태스크도 컨트롤러가 직접 실행한다** (Task 1과 동일한 이유).

- [x] **Step 1: Apply this exact migration** (name: `create_latte_art_videos_bucket`)

```sql
insert into storage.buckets (id, name, public)
values ('latte-art-videos', 'latte-art-videos', true);

create policy "anon can upload latte art videos"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'latte-art-videos');

create policy "anon can update latte art videos"
  on storage.objects for update
  to anon
  using (bucket_id = 'latte-art-videos')
  with check (bucket_id = 'latte-art-videos');
```

**Amendment made during execution:** the plan originally also included a broad `anon` SELECT policy on `storage.objects` for this bucket. `mcp__supabase__get_advisors` flagged it as `public_bucket_allows_listing` — since the bucket is `public = true`, object *content* is already servable via its public URL without any `storage.objects` RLS at all; a SELECT policy only adds the ability to *list every file in the bucket*, which nothing in this app's planned code (`getPublicUrl()` only, no `.list()`/`.download()`) needs. The SELECT policy was dropped (`drop policy "anon can view latte art videos" on storage.objects;`) to close that unnecessary exposure. Re-running advisors afterward confirmed the `public_bucket_allows_listing` finding is gone, leaving only the two already-accepted `rls_policy_always_true` warnings on `latte_art_orders` (insert/update — the deliberate wide-open tradeoff).

- [x] **Step 2: Verify** — call `mcp__supabase__execute_sql` with `select id, name, public from storage.buckets where id = 'latte-art-videos';` and confirm one row, `public = true`. There is no MCP tool to actually upload a binary file, so the upload path itself is verified later in Task 4's JS-level check.

  Done: one row, `public: true`.
- [x] **Step 3: Run advisors again** — `mcp__supabase__get_advisors` with `type: "security"`, same expectation as Task 1 Step 3 (open storage policies are the accepted tradeoff).

  Done: surfaced an additional `public_bucket_allows_listing` WARN (see amendment above) — fixed by dropping the unnecessary SELECT policy, not part of the original plan's scope but a genuine improvement, not a scope tradeoff. Re-ran advisors after the fix: only the two pre-accepted `latte_art_orders` warnings remain.

---

## Task 3: `frontend/js/supabase-client.js` — 클라이언트 초기화

**Files:**
- Create: `frontend/js/supabase-client.js`

**Interfaces:**
- Consumes: the global `supabase` object injected by the CDN `<script>` tag (loaded separately in HTML, before this file — this file does not load the CDN script itself)
- Produces: `getSupabaseClient()` — returns a lazily-created singleton client instance

- [ ] **Step 1: Create `frontend/js/supabase-client.js`**

```js
const SUPABASE_URL = "https://apgzznzonepygfndeyjv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_tfwuWe3OXgCn0ZvKvSh0xQ_Ga6H3fqN";

let _supabaseClient = null;

function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return _supabaseClient;
}
```

(The publishable key is meant to be public — it's the browser-safe key, equivalent to the legacy `anon` key, and is what RLS exists to protect against. Do not use a `service_role`/secret key here.)

- [ ] **Step 2: Verify via Node `vm`** — this file references the global `supabase` (from the CDN script) and calls `.createClient(...)`, so it can't run standalone in Node without a stub. Write a throwaway verification script that defines `global.supabase = { createClient: (url, key) => ({ __url: url, __key: key }) }` (a stub, not the real library — this only proves `getSupabaseClient()`'s lazy-singleton wiring is correct, not that the real Supabase client works), load `frontend/js/supabase-client.js` via `vm.runInContext` into a sandbox containing that stub, and confirm: (a) `getSupabaseClient()` returns an object with `__url` equal to the exact `SUPABASE_URL` constant and `__key` equal to the exact `SUPABASE_PUBLISHABLE_KEY` constant, (b) calling `getSupabaseClient()` twice returns the *same* object reference (singleton — `===`, not just deep-equal), confirming the lazy-init guard works.
- [ ] **Step 3: Commit**

```bash
git add frontend/js/supabase-client.js
git commit -m "feat: Supabase 클라이언트 초기화 모듈 추가"
```

---

## Task 4: `frontend/js/latte-art.js` — 라떼아트 요청/영상 CRUD 함수

**Files:**
- Create: `frontend/js/latte-art.js`

**Interfaces:**
- Consumes: `getSupabaseClient()` (Task 3)
- Produces: `saveLatteArtRequest(orderId, selection)`, `getLatteArtByOrderId(orderId)`, `uploadLatteArtVideo(orderId, file)` — see Global Constraints for exact contract (async, return `null` on error, never throw)

- [ ] **Step 1: Create `frontend/js/latte-art.js`**

```js
const LATTE_ART_TABLE = "latte_art_orders";
const LATTE_ART_BUCKET = "latte-art-videos";

async function saveLatteArtRequest(orderId, selection) {
  const { data, error } = await getSupabaseClient()
    .from(LATTE_ART_TABLE)
    .insert({
      order_id: orderId,
      item_name: selection.menuName,
      shape: selection.shape,
      note: selection.note || null,
    })
    .select()
    .single();

  if (error) {
    console.error("saveLatteArtRequest failed:", error);
    return null;
  }
  return data;
}

async function getLatteArtByOrderId(orderId) {
  const { data, error } = await getSupabaseClient()
    .from(LATTE_ART_TABLE)
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    console.error("getLatteArtByOrderId failed:", error);
    return null;
  }
  return data;
}

async function uploadLatteArtVideo(orderId, file) {
  const client = getSupabaseClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "mp4";
  const filePath = `${orderId}-${Date.now()}.${extension}`;

  const { error: uploadError } = await client.storage.from(LATTE_ART_BUCKET).upload(filePath, file);

  if (uploadError) {
    console.error("uploadLatteArtVideo upload failed:", uploadError);
    return null;
  }

  const { data: urlData } = client.storage.from(LATTE_ART_BUCKET).getPublicUrl(filePath);

  const { data, error } = await client
    .from(LATTE_ART_TABLE)
    .update({ video_url: urlData.publicUrl, video_uploaded_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .select()
    .single();

  if (error) {
    console.error("uploadLatteArtVideo db update failed:", error);
    return null;
  }
  return data;
}
```

- [ ] **Step 2: Verify against the real remote project** — this is worth doing for real (not just Node-stubbed), since Tasks 1-2 already created a real table/bucket to test against. There is no browser in this environment, but Node CAN run the real `@supabase/supabase-js` npm package (unlike a CDN-only browser global) — run `npm install @supabase/supabase-js --no-save` in a scratch location (or `npx --yes` a one-off script) purely for this verification script, NOT as a project dependency (this project intentionally has none — do not add it to `package.json`). Write a script that:
  1. `require("@supabase/supabase-js").createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)` with the real constants from Task 3
  2. Calls the real logic of `saveLatteArtRequest`, `getLatteArtByOrderId` (copy the function bodies, or better, use Node's `vm` to run the actual `frontend/js/latte-art.js` + `frontend/js/supabase-client.js` source with `global.supabase = require("@supabase/supabase-js")` as the stand-in for the CDN global) against a real test order id, e.g. `TEST-VERIFY-2`
  3. Confirms `saveLatteArtRequest("TEST-VERIFY-2", { menuId: "latte", menuName: "카페라떼", shape: "heart", note: "" })` returns a non-null row
  4. Confirms `getLatteArtByOrderId("TEST-VERIFY-2")` returns that same row
  5. Confirms `getLatteArtByOrderId("NONEXISTENT-ORDER")` returns `null` (not an error — `.maybeSingle()` should make this a clean `null`)
  6. For `uploadLatteArtVideo`: Node has no real `File`/video, so construct a small in-memory `Blob`-like object (Node 18+ has a global `Blob`) with a `.name` property monkey-patched on, or pass a plain `{ name: "test.mp4", ... }` — check what the installed `@supabase/supabase-js` version's `storage.upload()` actually accepts in Node (it accepts `Buffer`/`Blob`/`ArrayBuffer`, not necessarily something with `.name`; if `file.name` access in the function is the blocker, note this as a concern rather than working around it by changing the function — the real caller in Task 5+ will always be a browser `<input type="file">`'s real `File` object, which does have `.name`). Confirm the upload succeeds and `video_url`/`video_uploaded_at` land on the row from step 3.
  7. Clean up: delete the `TEST-VERIFY-2` row via `mcp__supabase__execute_sql` and delete the uploaded test object from the bucket (list objects via `execute_sql` on `storage.objects` if needed, or leave a note if there's no simple deletion path from Node and flag it for the controller to clean up via `execute_sql`).

  If any of this is awkward without a real `File` object, it's fine to verify 1-5 for real and treat 6 as `DONE_WITH_CONCERNS` with a clear note — don't fabricate output for the parts that generalize poorly to Node. Whatever you actually ran, paste the real output in the report.
- [ ] **Step 3: Commit**

```bash
git add frontend/js/latte-art.js
git commit -m "feat: 라떼아트 요청/영상 저장·조회 함수 추가"
```

---

## Task 5: 장바구니 체크아웃에서 라떼아트 요청 저장 연동

**Files:**
- Modify: `frontend/basket/list.html`, `frontend/basket/list.js`

**Interfaces:**
- Consumes: `saveLatteArtRequest(orderId, selection)` (Task 4), `getLatteArtSelection()`/`clearLatteArtSelection()` (11단계, already in `frontend/js/utils.js`), `createOrder(items)` (existing, `frontend/js/data.js`)

- [ ] **Step 1: Add the three new `<script>` tags to `frontend/basket/list.html`**, in this exact order, before the existing `<script src="../js/data.js"></script>` line (Supabase client must exist before `data.js`/`utils.js`/`list.js` run, and `list.js` needs `saveLatteArtRequest` which needs the CDN global):

```html
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
  <script src="../js/supabase-client.js"></script>
  <script src="../js/latte-art.js"></script>
```

- [ ] **Step 2: Update the checkout handler in `frontend/basket/list.js`**

Find the `checkoutBtn.addEventListener("click", () => { ... })` handler (added in 11단계). It's currently synchronous. Make it `async` and call `saveLatteArtRequest` before clearing the local selection, but do not block order creation on it succeeding (the order itself is still purely local/localStorage — a Supabase save failure for the latte-art side-channel should not prevent checkout):

```js
    checkoutBtn.addEventListener("click", async () => {
      const validItems = buildCartViewModels().filter((item) => item.menu);
      if (validItems.length === 0) {
        return;
      }

      const confirmed = window.confirm("장바구니에 담긴 메뉴로 주문할까요?");
      if (!confirmed) {
        return;
      }

      const newOrder = createOrder(validItems);

      const latteArtSelection = getLatteArtSelection();
      if (latteArtSelection) {
        await saveLatteArtRequest(newOrder.id, latteArtSelection);
      }

      clearCart();
      clearLatteArtSelection();
      window.location.href = `../orders/detail.html?id=${encodeURIComponent(newOrder.id)}`;
    });
```

Note: `getLatteArtSelection()` is read *before* `clearLatteArtSelection()` (unchanged order from 11단계) — just now there's a real save in between using the value that was read.

- [ ] **Step 3: Verify against the real remote project** — no browser available, so use the same `vm` + real `@supabase/supabase-js` package approach as Task 4 Step 2, but this time exercise it at a level close to the actual DOM handler: simulate calling `createOrder(...)`-equivalent (or just fabricate an order id string in the same `ORD-YYYYMMDD-NNN` shape `getAllMenus`/`createOrder` already produce, e.g. `ORD-TESTVERIFY-999`), call the real `saveLatteArtRequest` with a real selection object, then query `mcp__supabase__execute_sql` (`select * from public.latte_art_orders where order_id = 'ORD-TESTVERIFY-999';`) to confirm the row landed with the right `item_name`/`shape`/`note`. Clean up the test row afterward via `execute_sql`. Separately, code-trace `frontend/basket/list.js`'s actual diff to confirm: the `async` keyword was added to the listener, `saveLatteArtRequest` is only called when `latteArtSelection` is truthy, and `clearCart()`/`clearLatteArtSelection()`/the redirect all still run unconditionally afterward (a Supabase failure must not strand the user on the basket page — confirm there's no `try/catch` swallowing navigation, i.e. if `saveLatteArtRequest` internally returns `null` on error rather than throwing, the `await` line completes normally and the rest of the handler still runs).
- [ ] **Step 4: Commit**

```bash
git add frontend/basket/list.html frontend/basket/list.js
git commit -m "feat: 체크아웃 시 라떼아트 요청을 Supabase에 저장"
```

---

## Task 6: 청사진 체크 표시

**Files:**
- Modify: `BLUEPRINT.md` (12단계 체크박스)

- [ ] **Step 1: Check off all 5 items under 12단계** in `BLUEPRINT.md`.
- [ ] **Step 2: Commit**

```bash
git add BLUEPRINT.md
git commit -m "docs: 청사진 12단계 체크 표시"
```
