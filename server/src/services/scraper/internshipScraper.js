import { chromium } from "playwright";

export async function scrapeInternships(
  desiredPost = [],
  desiredLocation = []
) {
  const browser = await chromium.launch({ headless: false }); // headless false for testing

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });

  // 🕵️ Stealth measures
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "platform", { get: () => "MacIntel" });
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
  });

  const page = await context.newPage();
  const allInternships = [];

  // ✅ Loop through each desired post + each desired location
  for (const post of desiredPost) {
    for (const loc of desiredLocation) {
      const skillQuery = `${post} internship`;
      const url = `https://internshala.com/internships/keywords-${encodeURIComponent(
        skillQuery
      )}/location-${encodeURIComponent(loc)}`;

      console.log("🔍 Scraping URL:", url);

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(4000);

        const internships = await page.$$eval(".internship_meta", (cards) => {
          return cards
            .map((card) => {
              const title = card.querySelector("h3")?.textContent?.trim() || "";
              const company =
                card.querySelector(".company_name")?.textContent?.trim() || "";
              const location =
                card.querySelector(".location")?.textContent?.trim() || "";
              const summary =
                card
                  .querySelector(".internship_other_details")
                  ?.textContent?.trim() || "";
              const link = card.querySelector("a")?.href || "";
              return title ? { title, company, location, summary, link } : null;
            })
            .filter((intern) => intern);
        });

        // 🧠 Add only 1–2 internships per combination for balance
        allInternships.push(...internships.slice(0, 2));

        console.log(
          `✅ Collected ${
            internships.slice(0, 2).length
          } internships for ${post} @ ${loc}`
        );
      } catch (err) {
        console.error(`❌ Error scraping ${post} @ ${loc}:`, err.message);
      }

      // Stop once we have ~10 internships total
      if (allInternships.length >= 10) break;
    }
    if (allInternships.length >= 10) break;
  }

  await browser.close();
  console.log(`🎯 Total internships collected: ${allInternships.length}`);

  return allInternships.slice(0, 10);
}
