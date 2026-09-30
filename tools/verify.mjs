// One command for the whole verification chain (Windows and Linux):
//
//   node tools/verify.mjs            (PHP_BIN=C:\php\php.exe on Windows if php is not on PATH)
//
// 1. node build.mjs
// 2. php -S 127.0.0.1:8765 tools/router.php  (emulates .htaccess)
// 3. node tools/qa.mjs
// 4. node tools/crawl.mjs -> docs/seo/audit-after.json
// 5. node tools/seo-diff.mjs audit-before.json audit-after.json -> docs/seo/seo-diff.md
// 6. node tools/browser-check.mjs -> qa-screens/ (1366 and 390 wide)
// 7. node tools/form-test.mjs (CRM + Resend stubbed)
// Stops at the first failing step and exits non-zero.
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const PHP = process.env.PHP_BIN || 'php';
const BASE = 'http://127.0.0.1:8765';
const node = (args) => spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' }).status === 0;

const server = spawn(PHP, ['-S', '127.0.0.1:8765', join('tools', 'router.php')], { cwd: root, stdio: 'ignore' });
let ok = false;
try {
  await new Promise((resolve) => setTimeout(resolve, 800));
  ok = node(['build.mjs'])
    && node([join('tools', 'qa.mjs'), BASE])
    && node([join('tools', 'crawl.mjs'), BASE, join('docs', 'seo', 'audit-after.json')])
    && node([join('tools', 'seo-diff.mjs'), join('docs', 'seo', 'audit-before.json'), join('docs', 'seo', 'audit-after.json'), join('docs', 'seo', 'seo-diff.md')])
    && node([join('tools', 'browser-check.mjs'), BASE, 'qa-screens'])
    && node([join('tools', 'form-test.mjs')]);
} finally {
  server.kill();
}
console.log(ok ? '\nverify: all steps passed' : '\nverify: FAILED (see the step output above)');
process.exit(ok ? 0 : 1);
