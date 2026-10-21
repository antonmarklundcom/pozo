# Reliable enquiry delivery — pozo.com.py

21 October 2026. This document describes source in codex/form-delivery-20261021. Source checks do not establish deployment or a real CRM receipt. No database migration is added.

Replace the phone/hour identity bucket with a per-form identity, including dynamically rendered forms. Refresh generated script-cache references. Retain the full message before sending. Long WhatsApp redirect URLs now open the existing confirmation page instead of exceeding HTTP header limits; the complete CRM message is unchanged.

## Private configuration and storage

Use the existing domain-specific VENDERCRM_URL=https://crm.clientes.com.py and VENDERCRM_API_KEY through this site's current private loader. Reuse a working installed key; never share a key across domains or revoke one automatically. No key belongs in Git, HTML, browser JavaScript, reports or queue records. The existing downloadable config templates remain compatible.

Delivery storage defaults to the sibling .vendercrm-outbox outside the actual public root. Optional absolute process environment VENDERCRM_OUTBOX_DIR selects another persistent private directory. Verify the HTTP handler and CLI resolve the same actual queue, especially with symlinks/release directories. The directory must be outside the public root and survive code uploads. New directories/files use 0700/0600 permissions where supported. Preserve existing config, logs/CSV, private state and pending records during every release.

Each accepted enquiry is retained before network delivery. The same payload and idempotency_key survive retries and process restarts. Only a valid 200/201 JSON body with contactId and submissionId marks delivery; receipt IDs are retained privately. An HTML/login page is not a receipt. Confirmed replays do not send another CRM request. New enquiries from the same person use separate identities; the contact may still be shared by the CRM's normal identity rules.

Transient failures use bounded backoff. Authentication/validation failures 401/403/422 and malformed receipts remain pending for reviewed recovery; ordinary replay cannot bypass this hold. Queue corruption is counted/preserved, not deleted. A validated CRM receipt is the only alternative when a normal handler's new queue cannot retain data. Existing mandatory intake/local-storage gates remain authoritative.

## Deployment and operator commands

The 20 October live contacto.php exactly matches this repair base. Two historical source repos exist; this branch is antonmarklundcom/pozo. Confirm the serving release/static layout before deploying all changed generated files.

Deploy the changed handler and all new lib/ files together. Ship changed generated HTML/JS for static builds; keep actual credentials/private data outside archives. The guarded lib/lead-delivery-cli.php is included with runtime libraries and refuses HTTP execution. The tests and documentation are not public runtime files.

Use the actual hosting PHP binary and absolute source root (not assumed ~/public_html):

```text
php /absolute/source-root/lib/lead-delivery-cli.php status
php /absolute/source-root/lib/lead-delivery-cli.php check
php /absolute/source-root/lib/lead-delivery-cli.php retry 20
php /absolute/source-root/lib/lead-delivery-cli.php heartbeat
```

status/check are metadata-only; configuration checking is not a delivery test. After an owner-authorized real form receipt and redeploy-persistence acceptance, schedule retry 20 and heartbeat every five minutes. Inspect unreadable/needs_review counts and oldest pending age. Cron output never contains message bodies or keys.

export-review /private/path/review.json 10 exports only new pending outbox entries for protected operator review. Do not place that export in Git, reports or public hosting. retry-reviewed /private/path/manifest.json accepts the existing recent site-bound fingerprint/action review format. It verifies every selected payload before retrying. Never replay historical leads.log/CSV/review records blindly; this new queue does not import them. Apply the site's existing retention/privacy procedure through deliberate operator review; this repair does not delete historical data or enable customer messaging.

## Verification and release state

PASS: 28 durable-outbox assertions; 15 real-handler HTTP checks; 31 HTML/30 HTTP route QA with 35 previously published URLs covered; 30-page build; existing form/CRM/Resend/urgency/calculator/WhatsApp tests (16 stubbed provider calls).

All new tests use isolated fictional data and fake provider receipts. The HTTP fixture runs PHP without native cURL and implements a test-only transport, so it cannot send to a CRM or mail provider. The existing Pozo integration fixture uses loopback-only stubs. No dependency installation or GitHub Actions run is part of this repair. Commit messages use [skip ci].

Live acceptance still needs the actual hosting layout/config and public form: correct business/site, full accepted message/answers, source/time/attribution, saved receipt and retained failure/retry. Business phone/WhatsApp provisioning stays deferred. No private hosting setting, cron, credential, customer record or live submission was changed by source preparation.

Rollback restores compatible code while retaining config, old records and pending queue files. Use the same original identities to resume delivery. Do not reset the CRM database, drop data, delete queue entries or restore an old customer snapshot as a code rollback.
