import { chromium } from '/home/wolf/workspace/wolf-portfolio/node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core/index.mjs';

const routes = [
  ['home', '/'],
  ['products', '/products'],
  ['pulse', '/products/pulse'],
  ['carcaran', '/products/carcaran'],
  ['system', '/system'],
  ['lab', '/lab'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [name, path] of routes) {
  await page.goto(`http://localhost:5183${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `/tmp/claude-1000/-home-wolf-workspace-portfolio/cb0b360b-15d5-4626-af73-4be99491ecff/scratchpad/shots/${name}.png` });
}
await browser.close();
