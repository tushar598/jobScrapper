import { chromium } from "playwright";

export const scrapeJobs = async (desiredPost = [], desiredLocation = []) => {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });

  // 🕵️ Stealth mode
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "platform", { get: () => "MacIntel" });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });

  const page = await context.newPage();
  const allJobs = [];

  // ✅ Loop through each post + each location
  for (const post of desiredPost) {
    for (const loc of desiredLocation) {
      const jobUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(
        post
      )}&l=${encodeURIComponent(loc)}`;
      console.log("🔍 Scraping URL:", jobUrl);

      try {
        await page.goto(jobUrl, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page.waitForTimeout(4000);

        const jobs = await page.$$eval(
          "a.tapItem, div.job_seen_beacon",
          (jobCards) => {
            return jobCards
              .map((el) => {
                const title =
                  el.querySelector("h2.jobTitle span:not(.new)")?.innerText ||
                  null;
                const company =
                  el.querySelector(".companyName")?.innerText || null;
                const location =
                  el.querySelector(".companyLocation")?.innerText || null;
                const summary =
                  el.querySelector(".job-snippet")?.innerText || null;
                const link = el.querySelector("a")?.href || el.href || "";
                return title
                  ? { title, company, location, summary, link }
                  : null;
              })
              .filter((job) => job);
          }
        );

        // 🧠 Add only 1–2 jobs per combination to ensure balance
        allJobs.push(...jobs.slice(0, 2));
        console.log(
          `✅ Collected ${jobs.slice(0, 2).length} jobs for ${post} @ ${loc}`
        );
      } catch (err) {
        console.error(`❌ Error scraping ${post} @ ${loc}:`, err.message);
      }

      // Stop once we have ~10 jobs total
      if (allJobs.length >= 10) break;
    }
    if (allJobs.length >= 10) break;
  }

  await browser.close();
  console.log(`🎯 Total jobs collected: ${allJobs.length}`);

  return allJobs.slice(0, 10);
};
