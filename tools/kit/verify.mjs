// One command for the whole verification chain (Windows and Linux):
//
//   node tools/verify.mjs            (PHP_BIN=C:\php\php.exe on Windows if php is not on PATH)
//
// 1. node build.mjs                                  (kit.verify.build)
// 2. php -S 127.0.0.1:<port> tools/router.php        (emulates .htaccess)
// 3. node tools/qa.mjs                                (site QA on top of tools/kit/qa-core.mjs)
// 4. crawl -> docs/seo/audit-after.json
// 5. link graph -> docs/seo/link-graph.md (orphans, depth, contextual links)
// 6. SEO diff audit-before.json vs audit-after.json -> docs/seo/seo-diff.md
// 7. browser check -> qa-screens/ (1366 and 390 wide, axe, critical CSS)
// 8. form test (CRM + Resend stubbed)
// Stops at the first failing step and exits non-zero. kit.verify.env adds env
// vars for the server and the steps; "{tmp}" and "{pid}" are replaced, and
// files under {tmp} are removed afterwards.
import { spawn, spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { kit, root } from './config.mjs';

const PHP = process.env.PHP_BIN || 'php';
const BASE = kit.localBase;
const temporary = [];
const extraEnv = Object.fromEntries(Object.entries(kit.verify.env || {}).map(([name, value]) => {
  const resolved = String(value).replace('{tmp}', tmpdir()).replace('{pid}', String(process.pid));
  if (String(value).includes('{tmp}')) temporary.push(resolved);
  return [name, resolved];
}));
const env = { ...process.env, ...extraEnv };
const node = (args) => spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit', env }).status === 0;
const kitTool = (name) => join('tools', 'kit', name);
const seo = (name) => join('docs', 'seo', name);

const server = spawn(PHP, ['-S', `127.0.0.1:${kit.port}`, join('tools', 'router.php')], { cwd: root, stdio: 'ignore', env });
let ok = false;
try {
  await new Promise((resolve) => setTimeout(resolve, 800));
  ok = node(kit.verify.build || ['build.mjs'])
    && node([kit.verify.qa || join('tools', 'qa.mjs'), BASE])
    && node([kitTool('crawl.mjs'), BASE, seo('audit-after.json')])
    && node([kitTool('link-graph.mjs'), BASE, seo('audit-after.json'), seo('link-graph.md')])
    && node([kitTool('seo-diff.mjs'), seo('audit-before.json'), seo('audit-after.json'), seo('seo-diff.md')])
    && node([kitTool('browser-check.mjs'), BASE, 'qa-screens'])
    && (!kit.formTest || node([kitTool('form-test.mjs')]));
} finally {
  server.kill();
  for (const file of temporary) rmSync(file, { force: true });
}
console.log(ok ? '\nverify: all steps passed' : '\nverify: FAILED (see the step output above)');
process.exit(ok ? 0 : 1);
