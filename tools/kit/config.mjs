// Loads the project's kit.config.mjs (repo root) and fills in defaults.
// Every kit tool imports { kit, root } from here; nothing in tools/kit/ names
// a specific site. See docs/SITE-KIT.md for the fields.
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const loaded = (await import(pathToFileURL(join(root, 'kit.config.mjs')).href)).default;
const siteUrl = loaded.siteUrl.replace(/\/$/, '');
const port = loaded.port || 8765;

export const kit = {
  port,
  localBase: `http://127.0.0.1:${port}`,
  userAgent: `${new URL(siteUrl).host}-site-kit/1`,
  hostAliases: [],
  legacySitemaps: [],
  thirdParty: null,
  siblings: null,
  notSite: ['docs', 'tools', 'config', 'assets', 'source-images', '.preview', 'qa-screens'],
  noindexFiles: ['404.html'],
  deniedPaths: [],
  perfPaths: ['/'],
  fullCss: null,
  minJs: null,
  minified: [],
  maxImageBytes: 450_000,
  axeTags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
  linkGraph: { maxDepth: 3, minContextualIn: [], hubs: [] },
  hooks: {},
  verify: { env: {} },
  ...loaded,
  siteUrl,
};

// Optional site hook module (path relative to the repo root), or {} if unset.
export async function hook(name) {
  const file = kit.hooks?.[name];
  return file ? import(pathToFileURL(join(root, file)).href) : {};
}

// Paths listed in the build's sitemap.xml, whatever the canonical origin.
export function sitemapPaths(xml) {
  const origin = siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...xml.matchAll(new RegExp(`<loc>${origin}([^<]*)</loc>`, 'g'))].map(([, path]) => path || '/');
}
