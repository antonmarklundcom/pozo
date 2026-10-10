<?php
// Copy to domains/pozo.com.py/private/pozo.php  (OUTSIDE public_html). Never commit.
// CRM uses the separate canonical ../private/vendercrm.php file.
return [
    'resend_key' => '', // Resend → API Keys, "Sending access" only, restricted to domain pozo.com.py
    'resend_from' => 'Pozo.com.py <leads@pozo.com.py>',
    'notify_to' => [], // e.g. ['operador@...'] — the mailbox that must get every lead
    'wa_log' => '', // wa.php click log; empty = domains/pozo.com.py/private/wa-clicks.log (must be outside public_html)
    'reply_to_visitor' => false, // Phase 2: send the visitor a copy when they left an email
];
