
import { chromium } from "playwright";

/**
 * Scrape jobs from Indeed for given posts and locations.
 * @param {string[]|string} desiredPost
 * @param {string[]|string} desiredLocation
 * @param {number} limit total results to return (default 10)
 */
export const scrapeJobs = async (
  desiredPost = [],
  desiredLocation = [],
  limit = 10
) => {
  // normalize inputs to arrays
  const posts = Array.isArray(desiredPost)
    ? desiredPost
    : String(desiredPost || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const locs = Array.isArray(desiredLocation)
    ? desiredLocation
    : String(desiredLocation || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  // helper auto-scroll to trigger lazy load
  const autoScroll = async (page) => {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let total = 0;
        const distance = 300;
        const timer = setInterval(() => {
          const scrollHeight =
            document.body.scrollHeight || document.documentElement.scrollHeight;
          window.scrollBy(0, distance);
          total += distance;
          if (total >= scrollHeight - window.innerHeight - 100) {
            clearInterval(timer);
            resolve();
          }
        }, 300);
      });
    });
  };

  // attempt run (headless or headful)
  async function runAttempt(headless = true) {
    const browser = await chromium.launch({ headless, args: ["--no-sandbox"] });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "Asia/Kolkata",
    });

    // basic stealth-ish overrides
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });
    });

    const page = await context.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);

    const collected = [];

    try {
      for (const post of posts) {
        for (const loc of locs.length ? locs : [""]) {
          if (collected.length >= limit) break;

          // build Indeed search URL (works for most Indeed locales)
          const jobUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(
            post
          )}&l=${encodeURIComponent(loc)}`;

          console.log("🔍 Scraping URL:", jobUrl);

          try {
            await page.goto(jobUrl, {
              waitUntil: "domcontentloaded",
              timeout: 60000,
            });

            // small wait and scroll to let JS render job cards
            await page.waitForTimeout(1500);
            await autoScroll(page);
            await page.waitForTimeout(800);

            // look for job cards across known selectors; wait if none immediately
            const cardCount = await page.$$eval(
              "a.tapItem, div.job_seen_beacon, div.slider_container .result, .result",
              (els) => els.length
            );

            if (!cardCount) {
              // try a bit more time, sometimes indeed renders slowly
              await page.waitForTimeout(2000);
              const recheck = await page.$$eval(
                "a.tapItem, div.job_seen_beacon, div.slider_container .result, .result",
                (els) => els.length
              );
              if (!recheck) {
                console.warn(`⚠️ No job cards found for ${post} @ ${loc}`);
                continue;
              }
            }

            // extract job data with robust fallbacks
            const jobs = await page.$$eval(
              "a.tapItem, div.job_seen_beacon, div.slider_container .result, .result",
              (cards) =>
                cards
                  .map((el) => {
                    // helper inside browser
                    const txt = (sel) =>
                      el.querySelector(sel)?.innerText?.trim() || "";
                    const attr = (sel, a) =>
                      el.querySelector(sel)?.getAttribute(a) || "";
                    const title =
                      txt("h2.jobTitle span:not(.new)") ||
                      txt("h2.jobTitle") ||
                      txt(".jobTitle") ||
                      txt(".title");
                    const company =
                      txt(".companyName") ||
                      txt(".company") ||
                      txt(".companyName a") ||
                      txt(".company span");
                    const location =
                      txt(".companyLocation") ||
                      txt(".location") ||
                      txt(".jobLocation") ||
                      txt(".result-location");
                    const summary =
                      txt(".job-snippet") ||
                      txt(".summary") ||
                      txt(".jobCardShelf");
                    // salary often in .salary-snippet or .salary-snippet-container
                    const salary =
                      txt(".salary-snippet") ||
                      txt(".salary-snippet-container") ||
                      txt(".attribute_snippet");
                    // posted age e.g. "30+ days ago"
                    const posted =
                      txt(".date") ||
                      txt(".result-link-bar__listdate") ||
                      txt(".datePosted");
                    // link extraction: prefer data-jk attribute or anchor href
                    const dataJk =
                      el.getAttribute("data-jk") ||
                      el.getAttribute("data-jk") ||
                      "";
                    let link = "";
                    if (dataJk) {
                      link = `https://www.indeed.com/viewjob?jk=${dataJk}`;
                    } else {
                      // try anchor
                      const anchor = el.querySelector(
                        "a[href*='/rc/clk'], a[href*='/viewjob'], a"
                      );
                      if (anchor) {
                        link = anchor.href || anchor.getAttribute("href") || "";
                        // normalize relative
                        if (link && link.startsWith("/"))
                          link = `https://www.indeed.com${link}`;
                      }
                    }

                    return title
                      ? {
                          title,
                          company,
                          location,
                          summary,
                          salary,
                          postedAt: posted,
                          link,
                        }
                      : null;
                  })
                  .filter(Boolean)
            );

            // push limited number per search to keep balanced
            for (const job of jobs.slice(0, 3)) {
              if (collected.length >= limit) break;

              // normalize and default empty fields
              job.title = (job.title || "").replace(/\s+/g, " ").trim();
              job.company = (job.company || "Not specified")
                .replace(/\s+/g, " ")
                .trim();
              job.location = (job.location || loc || "Not specified")
                .replace(/\s+/g, " ")
                .trim();
              job.summary = job.summary || "Not available";
              job.salary = job.salary || "Not specified";
              job.postedAt = job.postedAt || null;
              job.link =
                job.link || job.link === ""
                  ? job.link
                  : `https://www.indeed.com/jobs?q=${encodeURIComponent(post)}`;

              // final push
              collected.push({
                ...job,
                platform: "Indeed",
                scrapedAt: new Date(),
              });
            }

            console.log(
              `✅ Collected ${
                jobs.slice(0, 3).length
              } jobs for ${post} @ ${loc}`
            );
          } catch (innerErr) {
            console.error(
              `❌ Error scraping ${post} @ ${loc}:`,
              innerErr.message || innerErr
            );
          }

          // small throttle between searches to be polite
          await page.waitForTimeout(700);

          if (collected.length >= limit) break;
        }
        if (collected.length >= limit) break;
      }
    } finally {
      try {
        await page.close();
      } catch (e) {}
      try {
        await context.close();
      } catch (e) {}
      try {
        await browser.close();
      } catch (e) {}
    }

    return collected;
  } // runAttempt

  // run headless attempt first
  let results = await runAttempt(true);

  // if zero results, retry once in headful mode (can bypass blocking)
  if ((!results || results.length === 0) && posts.length) {
    console.warn(
      "⚠️ No results in headless attempt — retrying with headful mode..."
    );
    results = await runAttempt(false);
  }

  // dedupe by title|company|location and limit
  const uniq = [];
  const seen = new Set();
  for (const r of results || []) {
    const key = `${r.title}|${r.company}|${r.location}`;
    if (!seen.has(key)) {
      uniq.push(r);
      seen.add(key);
    }
    if (uniq.length >= limit) break;
  }

  console.log(`🎯 Total jobs returned: ${uniq.length}`);
  return uniq;
};

