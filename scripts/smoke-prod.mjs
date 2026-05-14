const baseUrl = (process.env.SMOKE_BASE_URL || "https://pro-limo.vercel.app").replace(/\/+$/, "");
const expectedHost = new URL(baseUrl).host;

const checks = [
  ["health", "/api/health", assertHealth],
  ["robots", "/robots.txt", (body) => assertIncludes(body, [`Host: ${baseUrl}`, `${baseUrl}/sitemap.xml`])],
  ["sitemap", "/sitemap.xml", (body) => assertIncludes(body, [
    `${baseUrl}/`,
    `${baseUrl}/services/airport-transfer`,
    `${baseUrl}/cities/portland/airport-transfer`,
  ])],
  ["home", "/", (body) => assertHtml(body, ["Professional Limousine Driver", "Book a ride"])],
  ["airport service", "/services/airport-transfer", (body) => assertHtml(body, ["Airport transfer", "Book a ride"])],
  ["portland airport service", "/cities/portland/airport-transfer", (body) => assertHtml(body, ["Portland", "Airport transfer"])],
];

for (const [name, path, assert] of checks) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, { headers: { "user-agent": "pro-limo-prod-smoke/1.0" } });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${name} failed: ${response.status} ${response.statusText} for ${url}`);
  }

  await assert(body, response);
  console.log(`ok ${name}`);
}

console.log(`ok production smoke ${expectedHost}`);

async function assertHealth(body) {
  const json = JSON.parse(body);
  if (json.ok !== true) throw new Error("health did not return ok:true");
  if (typeof json.ts !== "number") throw new Error("health did not return numeric ts");
  if (typeof json.version !== "string" || json.version.length === 0) {
    throw new Error("health did not return version");
  }
}

function assertHtml(body, needles) {
  assertIncludes(body, ["</html>", ...needles]);
}

function assertIncludes(body, needles) {
  const missing = needles.filter((needle) => !body.includes(needle));
  if (missing.length > 0) {
    throw new Error(`missing expected content: ${missing.join(", ")}`);
  }
}
