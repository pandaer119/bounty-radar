import { expect, test } from "@playwright/test";
import path from "node:path";

const screenshotDir = path.join(process.cwd(), "docs", "evidence", "screenshots");

test("Bounty Radar completes the safe decision and proof-preview flow", async ({ page, request }) => {
  const browserProblems: string[] = [];
  const apiFailures: string[] = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      browserProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.url().includes("/api/") && response.status() >= 400) {
      apiFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  const opportunitiesResponse = page.waitForResponse(
    (response) => response.url().endsWith("/api/opportunities") && response.status() === 200,
  );
  const keeperHubStatusResponse = page.waitForResponse(
    (response) => response.url().endsWith("/api/integrations/keeperhub/status") && response.status() === 200,
  );
  await page.goto("/");
  await opportunitiesResponse;
  await keeperHubStatusResponse;

  await expect(page.getByRole("heading", { level: 1, name: "今晚该投哪一个？" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("官方证据已核验");
  await expect(page.getByRole("heading", { level: 2, name: "隐私赏金策略金库" })).toBeVisible();
  await expect(page.getByRole("button", { name: "等待合约部署" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "部署已审核合约（0 ETH）" })).toBeEnabled();
  await expect(page.getByRole("list", { name: "赏金机会" }).getByRole("listitem")).toHaveCount(3);
  await expect(page.locator("button.row-main").filter({ hasText: "KeeperHub · Agents Onchain" })).toBeVisible();
  await expect(page.getByText("KeeperHub · Agents Onchain", { exact: true }).last()).toBeVisible();

  const proofResponse = page.waitForResponse(
    (response) => response.url().endsWith("/api/proofs/preview") && response.status() === 200,
  );
  await page.getByRole("button", { name: "生成链上证明草案" }).click();
  await proofResponse;
  await expect(page.getByText("Opportunity key")).toBeVisible();
  await expect(page.getByText(/等待部署测试网合约/)).toBeVisible();
  await expect(page.getByText("广播关闭")).toBeVisible();
  await expect(page.getByRole("button", { name: "等待 KeeperHub 配置" })).toBeDisabled();

  const statusResponse = await request.get("/api/integrations/keeperhub/status");
  expect(statusResponse.status()).toBe(200);
  const statusPayload = await statusResponse.json();
  expect(statusPayload).toMatchObject({
    status: "configuration_required",
    configured: false,
    simulationEnabled: false,
    simulationOnly: true,
    broadcastEnabled: false,
  });
  expect(JSON.stringify(statusPayload)).not.toContain("0x");
  expect(JSON.stringify(statusPayload)).not.toContain("kh_");

  const noxArtifactResponse = await request.get("/api/contracts/nox-strategy-vault");
  expect(noxArtifactResponse.status()).toBe(200);
  const noxArtifact = await noxArtifactResponse.json();
  expect(noxArtifact.bytecode).toMatch(/^0x[0-9a-f]+$/i);
  expect(JSON.stringify(noxArtifact)).not.toMatch(/private|mnemonic|secret/i);

  const blockedSimulation = await request.post("/api/proofs/simulate", {
    data: { opportunityId: "keeperhub-agents-onchain-2026" },
  });
  expect(blockedSimulation.status()).toBe(403);
  await expect(blockedSimulation.json()).resolves.toMatchObject({
    code: "KEEPERHUB_SIMULATION_APPROVAL_REQUIRED",
  });

  const accessibilityProblems = await page.locator("button, input, select, a").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const name = element.getAttribute("aria-label") ?? element.textContent ?? "";
        return !name.trim();
      })
      .map((element) => element.outerHTML),
  );
  expect(accessibilityProblems).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await page.screenshot({
    path: path.join(screenshotDir, "bounty-radar-desktop.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 1024, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({
    path: path.join(screenshotDir, "bounty-radar-tablet.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "bounty-radar-mobile.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("combobox", { name: "状态" }).selectOption("all");
  await page.getByRole("combobox", { name: "风险" }).selectOption("high");
  await expect(page.getByText("1 / 4 条符合当前筛选")).toBeVisible();
  await page.locator("button.row-main").filter({ hasText: "WEEX AI Wars II" }).click();
  await expect(page.getByRole("button", { name: "风险门禁已阻断" })).toBeDisabled();
  await expect(page.getByText("已阻断资金风险")).toBeVisible();

  const navigation = await page.evaluate(() => {
    const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return entry ? { domInteractive: entry.domInteractive, loadEventEnd: entry.loadEventEnd } : null;
  });
  expect(navigation).not.toBeNull();
  expect(apiFailures).toEqual([]);
  expect(browserProblems).toEqual([]);
});
