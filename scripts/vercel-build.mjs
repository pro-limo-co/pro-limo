import { spawnSync } from "node:child_process";

const convexEnvKeys = [
  "SITE_URL",
  "NEXT_PUBLIC_SITE_URL",
  "BETTER_AUTH_SECRET",
  "DISPATCH_ADMIN_EMAILS",
];

const hasConvexCloudDeploy = Boolean(process.env.CONVEX_DEPLOY_KEY);
const hasConvexSelfHostedDeploy = Boolean(
  process.env.CONVEX_SELF_HOSTED_URL && process.env.CONVEX_SELF_HOSTED_ADMIN_KEY,
);

if (hasConvexCloudDeploy || hasConvexSelfHostedDeploy) {
  for (const key of convexEnvKeys) {
    const value = process.env[key];
    if (value) run("npx", ["convex", "env", "set", key, value]);
  }

  run("npx", ["convex", "deploy", "--cmd", "npm run build"]);
} else {
  console.log("No Convex deploy configuration found. Running Next.js build only.");
  run("npm", ["run", "build"]);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
