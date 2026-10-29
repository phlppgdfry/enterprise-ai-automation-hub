// Optional browser verification. npm install --no-save playwright in a disposable
// directory, or set PLAYWRIGHT_MODULE to an existing module's absolute index.mjs.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
const { chromium } = await import(
    process.env.PLAYWRIGHT_MODULE
        ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
        : "playwright"
);
const output = path.resolve(
    process.env.EVIDENCE_DIR || "/tmp/noordwerk-browser-evidence",
);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1512, height: 1050 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
});
const title = "Browser acceptance " + Date.now();
try {
    await page.goto("http://127.0.0.1:5088/");
    await page
        .getByRole("heading", { name: "A clearer path for every request." })
        .waitFor();
    await page.locator("#loading").waitFor({ state: "hidden" });
    assert.match(await page.title(), /Noordwerk/);
    await page.screenshot({
        path: path.join(output, "hub-overview.png"),
        fullPage: true,
    });
    await page
        .getByRole("button", { name: "New request", exact: true })
        .first()
        .click();
    await page.getByLabel("Request title", { exact: true }).fill(title);
    await page.getByLabel("Category", { exact: true }).selectOption("expense");
    await page.getByLabel("Amount (EUR)").fill("320");
    assert.equal(
        await page.locator("#route-label").textContent(),
        "Routes to Finance",
    );
    await page
        .getByLabel("I have reviewed these details and want to submit.")
        .check();
    await page
        .getByRole("button", { name: "Submit request", exact: true })
        .click();
    await page.getByRole("heading", { name: title, exact: true }).waitFor();
    await page.getByRole("button", { name: "Close request details" }).click();
    await page
        .getByLabel("Demo identity", { exact: true })
        .selectOption("demo-manager");
    await page.locator("#loading").waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "Approvals", exact: true }).click();
    await page.getByRole("button", { name: title, exact: true }).click();
    await page
        .getByLabel("Decision reason")
        .fill(
            "Synthetic browser acceptance: checked purpose and available budget.",
        );
    await page
        .getByLabel("I reviewed the information and am making this decision.")
        .check();
    await page.screenshot({
        path: path.join(output, "hub-approval.png"),
        fullPage: true,
    });
    await page
        .getByRole("button", { name: "Approve request", exact: true })
        .click();
    await page.locator("#detail-dialog").waitFor({ state: "hidden" });
    await page.locator("#loading").waitFor({ state: "hidden" });
    assert.match(
        await page.locator("#notice").textContent(),
        /Request approved/,
    );
    await page
        .getByLabel("Demo identity", { exact: true })
        .selectOption("demo-alice");
    await page.locator("#loading").waitFor({ state: "hidden" });
    await page.getByRole("button", { name: /^Requests/ }).click();
    await page.getByLabel("Search requests", { exact: true }).fill(title);
    await page.getByRole("button", { name: title, exact: true }).click();
    await page.locator("#detail-dialog").waitFor({ state: "visible" });
    assert.match(
        await page.locator("#detail-content").textContent(),
        /Approved/,
    );
    assert.match(
        await page.locator("#detail-content").textContent(),
        /checked purpose and available budget/,
    );
    await page.getByRole("button", { name: "Close request details" }).click();
    await page
        .getByLabel("Search requests", { exact: true })
        .fill("no-such-synthetic-request");
    await page.getByRole("heading", { name: "No matching requests" }).waitFor();
    await page
        .getByLabel("Demo identity", { exact: true })
        .selectOption("demo-bob");
    await page.locator("#loading").waitFor({ state: "hidden" });
    await page.getByLabel("Search requests", { exact: true }).fill(title);
    assert.equal(
        await page.getByRole("button", { name: title, exact: true }).count(),
        0,
    );
    await page.getByRole("button", { name: "Overview", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
        path: path.join(output, "hub-mobile.png"),
        fullPage: true,
    });
    assert.equal(
        await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        "Mobile page overflows",
    );
    await page
        .getByRole("button", { name: "New request", exact: true })
        .first()
        .click();
    await page
        .getByLabel("Request title", { exact: true })
        .fill("Mobile synthetic request");
    await page.getByLabel("Category", { exact: true }).selectOption("access");
    assert.equal(await page.getByLabel("Amount (EUR)").inputValue(), "0");
    assert.equal(
        await page.getByLabel("Amount (EUR)").getAttribute("readonly"),
        "",
    );
    await page.keyboard.press("Escape");
    await page.locator("#request-dialog").waitFor({ state: "hidden" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.screenshot({
        path: path.join(output, "hub-mobile-reduced-motion.png"),
        fullPage: true,
    });
    assert.equal(
        await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        "Reduced-motion mobile page overflows",
    );
    await page
        .getByRole("region", { name: "Scrollable request register" })
        .focus();
    assert.equal(
        await page.evaluate(() => document.activeElement.getAttribute("role")),
        "region",
    );
    assert.deepEqual(
        errors,
        [],
        "Unexpected console errors before injected outage",
    );
    // Fault injection: read failure must display recovery guidance, not stale success.
    await page.route("**/requests", (r) => r.abort());
    await page
        .getByLabel("Demo identity", { exact: true })
        .selectOption("demo-alice");
    await page.locator("#error").waitFor({ state: "visible" });
    assert.match(await page.locator("#error").textContent(), /local .NET API/);
    await page.unroute("**/requests");
    const knownErrors = errors.filter(
        (e) => !/ERR_FAILED|Failed to fetch/.test(e),
    );
    assert.deepEqual(knownErrors, []);
    const report = {
        date: new Date().toISOString(),
        environment: "Local .NET 10 / synthetic isolated store / Chromium",
        browserPlugin:
            "Browser plugin not available; existing local Playwright used",
        viewports: ["1512x1050", "390x844"],
        passed: [
            "page identity",
            "meaningful render",
            "no runtime errors before injected outage",
            "employee submission",
            "Finance route at EUR 320",
            "human decision with reason",
            "employee sees saved history",
            "Bob cannot see Alice request",
            "search empty state",
            "mobile no horizontal page overflow",
            "access amount zero",
            "reduced-motion mobile layout",
            "keyboard-focusable mobile table region",
            "outage recovery message",
        ],
        consoleErrors: errors,
        limitations: [
            "Chromium only",
            "No screen reader or full WCAG audit",
            "No tenant authentication",
            "No external Microsoft integration",
        ],
    };
    await fs.writeFile(
        path.join(output, "browser-report.json"),
        JSON.stringify(report, null, 2) + "\n",
    );
    console.log(JSON.stringify(report, null, 2));
} finally {
    await browser.close();
}
