// import { chromium } from "playwright";

// /**
//  * Scrape jobs from Indeed for given posts and locations.
//  * @param {string[]|string} desiredPost
//  * @param {string[]|string} desiredLocation
//  * @param {number} limit total results to return (default 10)
//  */
// export const scrapeJobs = async (
//   desiredPost = [],
//   desiredLocation = [],
//   limit = 10
// ) => {
//   // normalize inputs to arrays
//   const posts = Array.isArray(desiredPost)
//     ? desiredPost
//     : String(desiredPost || "")
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);

//   const locs = Array.isArray(desiredLocation)
//     ? desiredLocation
//     : String(desiredLocation || "")
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);

//   // helper auto-scroll to trigger lazy load
//   const autoScroll = async (page) => {
//     await page.evaluate(async () => {
//       await new Promise((resolve) => {
//         let total = 0;
//         const distance = 300;
//         const timer = setInterval(() => {
//           const scrollHeight =
//             document.body.scrollHeight || document.documentElement.scrollHeight;
//           window.scrollBy(0, distance);
//           total += distance;
//           if (total >= scrollHeight - window.innerHeight - 100) {
//             clearInterval(timer);
//             resolve();
//           }
//         }, 300);
//       });
//     });
//   };

//   // attempt run (headless or headful)
//   async function runAttempt(headless = true) {
//     const browser = await chromium.launch({ headless, args: ["--no-sandbox"] });
//     const context = await browser.newContext({
//       viewport: { width: 1280, height: 900 },
//       userAgent:
//         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
//       locale: "en-US",
//       timezoneId: "Asia/Kolkata",
//     });

//     // basic stealth-ish overrides
//     await context.addInitScript(() => {
//       Object.defineProperty(navigator, "webdriver", { get: () => false });
//       Object.defineProperty(navigator, "languages", {
//         get: () => ["en-US", "en"],
//       });
//     });

//     const page = await context.newPage();
//     page.setDefaultNavigationTimeout(60000);
//     page.setDefaultTimeout(30000);

//     const collected = [];

//     try {
//       for (const post of posts) {
//         for (const loc of locs.length ? locs : [""]) {
//           if (collected.length >= limit) break;

//           // build Indeed search URL (works for most Indeed locales)
//           const jobUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(
//             post
//           )}&l=${encodeURIComponent(loc)}`;

//           console.log("🔍 Scraping URL:", jobUrl);

//           try {
//             await page.goto(jobUrl, {
//               waitUntil: "domcontentloaded",
//               timeout: 60000,
//             });

//             // small wait and scroll to let JS render job cards
//             await page.waitForTimeout(1500);
//             await autoScroll(page);
//             await page.waitForTimeout(800);

//             // look for job cards across known selectors; wait if none immediately
//             const cardCount = await page.$$eval(
//               "a.tapItem, div.job_seen_beacon, div.slider_container .result, .result",
//               (els) => els.length
//             );

//             if (!cardCount) {
//               // try a bit more time, sometimes indeed renders slowly
//               await page.waitForTimeout(2000);
//               const recheck = await page.$$eval(
//                 "a.tapItem, div.job_seen_beacon, div.slider_container .result, .result",
//                 (els) => els.length
//               );
//               if (!recheck) {
//                 console.warn(`⚠️ No job cards found for ${post} @ ${loc}`);
//                 continue;
//               }
//             }

//             // extract job data with robust fallbacks
//             const jobs = await page.$$eval(
//               "a.tapItem, div.job_seen_beacon, div.slider_container .result, .result",
//               (cards) =>
//                 cards
//                   .map((el) => {
//                     // helper inside browser
//                     const txt = (sel) =>
//                       el.querySelector(sel)?.innerText?.trim() || "";
//                     const attr = (sel, a) =>
//                       el.querySelector(sel)?.getAttribute(a) || "";
//                     const title =
//                       txt("h2.jobTitle span:not(.new)") ||
//                       txt("h2.jobTitle") ||
//                       txt(".jobTitle") ||
//                       txt(".title");
//                     const company =
//                       txt(".companyName") ||
//                       txt(".company") ||
//                       txt(".companyName a") ||
//                       txt(".company span");
//                     const location =
//                       txt(".companyLocation") ||
//                       txt(".location") ||
//                       txt(".jobLocation") ||
//                       txt(".result-location");
//                     const summary =
//                       txt(".job-snippet") ||
//                       txt(".summary") ||
//                       txt(".jobCardShelf");
//                     // salary often in .salary-snippet or .salary-snippet-container
//                     const salary =
//                       txt(".salary-snippet") ||
//                       txt(".salary-snippet-container") ||
//                       txt(".attribute_snippet");
//                     // posted age e.g. "30+ days ago"
//                     const posted =
//                       txt(".date") ||
//                       txt(".result-link-bar__listdate") ||
//                       txt(".datePosted");
//                     // link extraction: prefer data-jk attribute or anchor href
//                     const dataJk =
//                       el.getAttribute("data-jk") ||
//                       el.getAttribute("data-jk") ||
//                       "";
//                     let link = "";
//                     if (dataJk) {
//                       link = `https://www.indeed.com/viewjob?jk=${dataJk}`;
//                     } else {
//                       // try anchor
//                       const anchor = el.querySelector(
//                         "a[href*='/rc/clk'], a[href*='/viewjob'], a"
//                       );
//                       if (anchor) {
//                         link = anchor.href || anchor.getAttribute("href") || "";
//                         // normalize relative
//                         if (link && link.startsWith("/"))
//                           link = `https://www.indeed.com${link}`;
//                       }
//                     }

//                     return title
//                       ? {
//                           title,
//                           company,
//                           location,
//                           summary,
//                           salary,
//                           postedAt: posted,
//                           link,
//                         }
//                       : null;
//                   })
//                   .filter(Boolean)
//             );

//             // push limited number per search to keep balanced
//             for (const job of jobs.slice(0, 3)) {
//               if (collected.length >= limit) break;

//               // normalize and default empty fields
//               job.title = (job.title || "").replace(/\s+/g, " ").trim();
//               job.company = (job.company || "Not specified")
//                 .replace(/\s+/g, " ")
//                 .trim();
//               job.location = (job.location || loc || "Not specified")
//                 .replace(/\s+/g, " ")
//                 .trim();
//               job.summary = job.summary || "Not available";
//               job.salary = job.salary || "Not specified";
//               job.postedAt = job.postedAt || null;
//               job.link =
//                 job.link || job.link === ""
//                   ? job.link
//                   : `https://www.indeed.com/jobs?q=${encodeURIComponent(post)}`;

//               // final push
//               collected.push({
//                 ...job,
//                 platform: "Indeed",
//                 scrapedAt: new Date(),
//               });
//             }

//             console.log(
//               `✅ Collected ${
//                 jobs.slice(0, 3).length
//               } jobs for ${post} @ ${loc}`
//             );
//           } catch (innerErr) {
//             console.error(
//               `❌ Error scraping ${post} @ ${loc}:`,
//               innerErr.message || innerErr
//             );
//           }

//           // small throttle between searches to be polite
//           await page.waitForTimeout(700);

//           if (collected.length >= limit) break;
//         }
//         if (collected.length >= limit) break;
//       }
//     } finally {
//       try {
//         await page.close();
//       } catch (e) {}
//       try {
//         await context.close();
//       } catch (e) {}
//       try {
//         await browser.close();
//       } catch (e) {}
//     }

//     return collected;
//   } // runAttempt

//   // run headless attempt first
//   let results = await runAttempt(true);

//   // if zero results, retry once in headful mode (can bypass blocking)
//   if ((!results || results.length === 0) && posts.length) {
//     console.warn(
//       "⚠️ No results in headless attempt — retrying with headful mode..."
//     );
//     results = await runAttempt(false);
//   }

//   // dedupe by title|company|location and limit
//   const uniq = [];
//   const seen = new Set();
//   for (const r of results || []) {
//     const key = `${r.title}|${r.company}|${r.location}`;
//     if (!seen.has(key)) {
//       uniq.push(r);
//       seen.add(key);
//     }
//     if (uniq.length >= limit) break;
//   }

//   console.log(`🎯 Total jobs returned: ${uniq.length}`);
//   return uniq;
// };

import { chromium } from "playwright";

/**
 * Multi-platform job scraper (Indeed, Naukri, Internshala)
 *
 * Usage:
 *   const jobs = await scrapeJobs(["frontend developer","react"], ["Bengaluru","Remote"], 20);
 *
 * Notes:
 * - Prioritizes desiredPost matches (title match).
 * - Tries to parse postedAt strings to determine recency and boost fresh jobs.
 * - Add more platforms by extending `PLATFORMS` with url builder and selectors.
 */

/* ----------------------------- Helpers ----------------------------- */

const toArray = (x) =>
  Array.isArray(x)
    ? x
    : String(x || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Try to interpret relative posted strings into Date object.
 * Supports patterns like:
 *  - "Just posted", "Just now", "Posted today" => today
 *  - "2 days ago", "30+ days ago", "Active 3 days ago", "5 hours ago", "30 days ago"
 *  - "on MMM DD, YYYY" or "Posted on 12 Aug"
 */
function parsePostedAtToDate(text) {
  if (!text) return null;
  const t = String(text).trim().toLowerCase();

  if (!t) return null;
  const now = new Date();

  if (/(just posted|just now|posted today|today|posted few)/i.test(t)) {
    return now;
  }
  // hours ago
  let m = t.match(/(\d+)\s*hour/);
  if (m) {
    const hours = parseInt(m[1], 10);
    return new Date(now.getTime() - hours * 3600 * 1000);
  }
  // minutes ago
  m = t.match(/(\d+)\s*min/);
  if (m) {
    const mins = parseInt(m[1], 10);
    return new Date(now.getTime() - mins * 60 * 1000);
  }
  // days ago
  m = t.match(/(\d+)\s*day/);
  if (m) {
    const days = parseInt(m[1], 10);
    return new Date(now.getTime() - days * 24 * 3600 * 1000);
  }
  // months ago
  m = t.match(/(\d+)\s*month/);
  if (m) {
    const months = parseInt(m[1], 10);
    const d = new Date(now);
    d.setMonth(d.getMonth() - months);
    return d;
  }
  // "30+ days" => treat as 30 days
  m = t.match(/(\d+)\+/);
  if (m) {
    const days = parseInt(m[1], 10);
    return new Date(now.getTime() - days * 24 * 3600 * 1000);
  }

  // try to parse explicit dates (common formats)
  const maybe = Date.parse(text);
  if (!Number.isNaN(maybe)) return new Date(maybe);

  return null;
}

/**
 * Compute a score for prioritization:
 * - title match weight large
 * - location match smaller
 * - recency small boost
 */
function computeScore(job, postKeywords = [], locKeywords = []) {
  const title = (job.title || "").toLowerCase();
  const location = (job.location || "").toLowerCase();
  const summary = (job.summary || "").toLowerCase();

  let score = 0;
  // Title matches (primary)
  for (const kw of postKeywords) {
    if (!kw) continue;
    if (title.includes(kw)) score += 50;
    else if (summary.includes(kw)) score += 20;
  }

  // Location matches (secondary)
  for (const lk of locKeywords) {
    if (!lk) continue;
    if (location.includes(lk)) score += 10;
  }

  // Recency: newer => + up to 20 points
  if (job.postedAtDate instanceof Date && !isNaN(job.postedAtDate)) {
    const ageMs = Date.now() - job.postedAtDate.getTime();
    const ageDays = Math.floor(ageMs / (24 * 3600 * 1000));
    // prefer <=7 days
    if (ageDays <= 1) score += 20;
    else if (ageDays <= 3) score += 12;
    else if (ageDays <= 7) score += 6;
    else if (ageDays <= 30) score += 2;
  }

  // Slight boost if company or summary mentions primary post keyword
  return score;
}

const PLATFORMS = {
  indeed: {
    name: "Indeed",
    buildSearchUrl: (post, loc) =>
      `https://www.indeed.com/jobs?q=${encodeURIComponent(
        post
      )}&l=${encodeURIComponent(loc || "")}`,
    // card selector list and per-card extraction logic executed inside page.$$eval
    cardSelectors: [
      "a.tapItem",
      "div.job_seen_beacon",
      "div.slider_container .result",
      ".result",
    ],
    extractFn: (el) => {
      // inside page context - return data or null
      const txt = (sel) => el.querySelector(sel)?.innerText?.trim() || "";
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
        txt(".job-snippet") || txt(".summary") || txt(".jobCardShelf");
      const salary =
        txt(".salary-snippet") ||
        txt(".salary-snippet-container") ||
        txt(".attribute_snippet") ||
        "";
      const posted =
        txt(".date") ||
        txt(".result-link-bar__listdate") ||
        txt(".datePosted") ||
        "";
      const dataJk = el.getAttribute("data-jk") || "";
      let link = "";
      if (dataJk) {
        link = `https://www.indeed.com/viewjob?jk=${dataJk}`;
      } else {
        const anchor = el.querySelector(
          "a[href*='/rc/clk'], a[href*='/viewjob'], a"
        );
        if (anchor) {
          link = anchor.href || anchor.getAttribute("href") || "";
          if (link && link.startsWith("/"))
            link = `https://www.indeed.com${link}`;
        }
      }
      if (!title) return null;
      return { title, company, location, summary, salary, posted, link };
    },
  },

  // Naukri platform
  naukri: {
    name: "Naukri",
    buildSearchUrl: (post, loc) => {
      // Naukri query format uses 'k' and 'l'
      return `https://www.naukri.com/${encodeURIComponent(
        post
      )}-jobs-in-${encodeURIComponent(loc || "")}`;
    },
    cardSelectors: ["article.jobTuple", ".jobTuple", ".listItem"],
    extractFn: (el) => {
      const txt = (sel) => el.querySelector(sel)?.innerText?.trim() || "";
      const title = txt("a.title") || txt(".jobTitle a") || txt(".title");
      const company =
        txt(".subTitle") || txt(".companyName") || txt(".company");
      const location =
        txt(".location") || txt(".jobTupleHeader .location") || txt(".loc");
      const summary = txt(".job-description") || txt(".jobTuple .detail");
      // Naukri sometimes shows "salary" in span.title-salary
      const salary = txt(".salary") || txt(".salary span") || "";
      const posted = txt(".date") || txt(".jobTuple .type") || "";
      // link prefer anchor with class title or href
      let link = "";
      const anchor = el.querySelector("a.title, a.jobTitle, a");
      if (anchor) link = anchor.href || anchor.getAttribute("href") || "";
      return title
        ? { title, company, location, summary, salary, posted, link }
        : null;
    },
  },

  // Internshala (internships)
  internshala: {
    name: "Internshala",
    buildSearchUrl: (post, loc) => {
      // Internshala search URL pattern: https://internshala.com/internships/{keyword}-internship-in-{location}
      const p = (post || "").toLowerCase().replace(/\s+/g, "-");
      const l = (loc || "").toLowerCase().replace(/\s+/g, "-");
      // fallback to general internships page if empty
      return l
        ? `https://internshala.com/internships/${encodeURIComponent(
            p
          )}-internship-in-${encodeURIComponent(l)}`
        : `https://internshala.com/internships/${encodeURIComponent(
            p
          )}-internship`;
    },
    cardSelectors: [
      ".training_card, .internship_meta, .individual_internship, .internship_container",
    ],
    extractFn: (el) => {
      const txt = (sel) => el.querySelector(sel)?.innerText?.trim() || "";
      const title =
        txt(".profile") ||
        txt(".heading_4_5") ||
        txt(".heading_4_5 a") ||
        txt(".heading_4_5");
      const company =
        txt(".company_name") || txt(".company a") || txt(".company");
      const location =
        txt(".location_link") || txt(".location") || txt(".meta .location");
      const summary =
        txt(".short_description") || txt(".internship_meta .info");
      const salary = txt(".stipend") || txt(".stipend") || "Not specified";
      const posted = txt(".start-date, .date") || txt(".posted") || "";
      let link = "";
      const anchor = el.querySelector("a[href*='/internship/'], a");
      if (anchor) {
        link = anchor.href || anchor.getAttribute("href") || "";
        if (link && link.startsWith("/"))
          link = `https://internshala.com${link}`;
      }
      return title
        ? { title, company, location, summary, salary, posted, link }
        : null;
    },
  },
};

/* ------------------------ Auto-scroll helper ------------------------ */
async function autoScroll(page) {
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
}

/* ----------------------------- Main ----------------------------- */

export const scrapeJobs = async (
  desiredPost = [],
  desiredLocation = [],
  limit = 10,
  options = { platforms: ["indeed", "naukri", "internshala"], maxAgeDays: 60 }
) => {
  const posts = toArray(desiredPost);
  const locs = toArray(desiredLocation);

  // lowercase keyword tokens for scoring
  const postKeywords = posts.map((p) => p.toLowerCase());
  const locKeywords = locs.map((l) => l.toLowerCase());

  // normalize platforms
  const platforms = (options.platforms || Object.keys(PLATFORMS)).filter((p) =>
    Object.prototype.hasOwnProperty.call(PLATFORMS, p)
  );

  async function runAttempt(headless = true) {
    const browser = await chromium.launch({ headless, args: ["--no-sandbox"] });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-US",
      timezoneId: "Asia/Kolkata",
    });

    // stealth-ish
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
      // For each desired post (primary), iterate platforms and locations (secondary)
      for (const post of posts.length ? posts : [""]) {
        for (const platformKey of platforms) {
          const platform = PLATFORMS[platformKey];

          // If no locations provided, use empty string once
          for (const loc of locs.length ? locs : [""]) {
            if (collected.length >= limit) break;

            const url = platform.buildSearchUrl(post, loc);
            console.log(`🔍 [${platform.name}] Scraping:`, url);

            try {
              await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 60000,
              });

              // allow JS render
              await page.waitForTimeout(1200);
              // attempt scroll for lazy load
              await autoScroll(page);
              await page.waitForTimeout(700);

              // check cards exist
              const selectors = platform.cardSelectors.join(",");
              let cardCount = await page
                .$$eval(selectors, (els) => els.length)
                .catch(() => 0);

              if (!cardCount) {
                // wait a little more for slow pages
                await page.waitForTimeout(2000);
                cardCount = await page
                  .$$eval(selectors, (els) => els.length)
                  .catch(() => 0);
                if (!cardCount) {
                  console.warn(
                    `⚠️ No cards found for ${platform.name} ${post} @ ${loc}`
                  );
                  continue;
                }
              }

              const jobs = await page.$$eval(
                selectors,
                (cards, extractFnString) => {
                  // Recreate extractor function from string (safer to embed a small extractor inline).
                  // But Playwright doesn't pass functions easily across, so we will attempt a generic extraction inside
                  const results = [];
                  for (const el of cards) {
                    // Basic generic extraction with many fallbacks
                    const qText = (s) => {
                      try {
                        return el.querySelector(s)?.innerText?.trim() || "";
                      } catch (e) {
                        return "";
                      }
                    };

                    const title =
                      qText("h2.jobTitle span:not(.new)") ||
                      qText("h2.jobTitle") ||
                      qText("a.title") ||
                      qText(".heading_4_5") ||
                      qText(".profile") ||
                      qText(".title") ||
                      qText(".jobTitle") ||
                      qText("a");
                    const company =
                      qText(".companyName") ||
                      qText(".subTitle") ||
                      qText(".company") ||
                      qText(".company_name") ||
                      qText(".sub_title") ||
                      "";
                    const location =
                      qText(".companyLocation") ||
                      qText(".location") ||
                      qText(".jobLocation") ||
                      qText(".loc") ||
                      qText(".location_link") ||
                      "";
                    const summary =
                      qText(".job-snippet") ||
                      qText(".job-description") ||
                      qText(".short_description") ||
                      qText(".summary") ||
                      "";
                    const salary =
                      qText(".salary-snippet") ||
                      qText(".salary") ||
                      qText(".stipend") ||
                      "";
                    const posted =
                      qText(".date") ||
                      qText(".result-link-bar__listdate") ||
                      qText(".datePosted") ||
                      qText(".type") ||
                      qText(".posted") ||
                      qText(".start-date") ||
                      "";

                    // link attempts
                    let link = "";
                    try {
                      const anchors = el.querySelectorAll("a");
                      for (const a of anchors) {
                        const href = a.getAttribute("href") || a.href || "";
                        if (!href) continue;
                        // prefer job view links that usually have '/viewjob' '/rc/clk' '/internship/' or contain 'job' or '/company/'
                        if (
                          href.includes("/viewjob") ||
                          href.includes("/rc/clk") ||
                          href.includes("/internship/") ||
                          href.includes("/job-detail") ||
                          href.includes("/job/")
                        ) {
                          link = href;
                          break;
                        }
                        if (!link && href.startsWith("http")) link = href;
                      }
                    } catch (e) {
                      link = "";
                    }

                    // Normalize relative
                    if (link && link.startsWith("/")) {
                      try {
                        const base = location.hostname
                          ? `${location.protocol}//${location.hostname}`
                          : "";
                        // we cannot reconstruct domain generically here; leave as-is
                      } catch {}
                    }

                    if (title) {
                      results.push({
                        title,
                        company,
                        location,
                        summary,
                        salary,
                        posted,
                        link,
                      });
                    }
                  }
                  return results;
                },
                "" // placeholder
              );

              // push a limited chunk per search to keep balanced (configurable)
              for (const job of jobs.slice(0, 6)) {
                if (collected.length >= limit) break;

                // normalize strings
                job.title = (job.title || "").replace(/\s+/g, " ").trim();
                job.company = (job.company || "Not specified")
                  .replace(/\s+/g, " ")
                  .trim();
                job.location = (job.location || loc || "Not specified")
                  .replace(/\s+/g, " ")
                  .trim();
                job.summary = job.summary || "Not available";
                job.salary = job.salary || "Not specified";
                job.postedAt = job.posted || null; // raw posted string
                job.link = job.link || "";

                // attempt to normalize absolute links for known platforms
                if (
                  platformKey === "indeed" &&
                  job.link &&
                  job.link.startsWith("/")
                ) {
                  job.link = `https://www.indeed.com${job.link}`;
                } else if (
                  platformKey === "internshala" &&
                  job.link &&
                  job.link.startsWith("/")
                ) {
                  job.link = `https://internshala.com${job.link}`;
                } else if (
                  platformKey === "naukri" &&
                  job.link &&
                  job.link.startsWith("/")
                ) {
                  job.link = `https://www.naukri.com${job.link}`;
                }

                // parse postedAt into Date if possible
                job.postedAtDate = parsePostedAtToDate(job.postedAt);

                // attach platform metadata
                job.platform = platform.name;
                job.scrapedAt = new Date();

                collected.push(job);
              }

              console.log(
                `✅ [${platform.name}] Collected ${Math.min(
                  jobs.length,
                  6
                )} jobs for "${post}" @ "${loc}"`
              );
            } catch (innerErr) {
              console.error(
                `❌ [${platform.name}] Error scraping ${post} @ ${loc}:`,
                innerErr?.message || innerErr
              );
            }

            // polite throttle between searches
            await delay(600);

            if (collected.length >= limit) break;
          } // locs
          if (collected.length >= limit) break;
        } // platforms
        if (collected.length >= limit) break;
      } // posts
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

  // run headless first
  let results = await runAttempt(true);

  // if zero results, try headful once
  if ((!results || results.length === 0) && posts.length) {
    console.warn("⚠️ No results from headless attempt — retrying headful...");
    results = await runAttempt(false);
  }

  // Dedupe by title|company|location
  const uniq = [];
  const seen = new Set();
  for (const r of results || []) {
    const key = `${(r.title || "").toLowerCase()}|${(
      r.company || ""
    ).toLowerCase()}|${(r.location || "").toLowerCase()}`;
    if (!seen.has(key)) {
      uniq.push(r);
      seen.add(key);
    }
  }

  // Filter by max age if option present
  const maxAgeDays =
    typeof options.maxAgeDays === "number" ? options.maxAgeDays : 365;
  const recentFiltered = uniq.filter((job) => {
    if (!job.postedAtDate) return true; // keep unknown dates
    const ageDays = Math.floor(
      (Date.now() - job.postedAtDate.getTime()) / (24 * 3600 * 1000)
    );
    return ageDays <= maxAgeDays;
  });

  // Score and sort
  for (const j of recentFiltered) {
    j._score = computeScore(j, postKeywords, locKeywords);
    // ensure postedAtDate fallback (older) for sorting if missing
    if (!j.postedAtDate) j.postedAtDate = new Date(0);
  }
  recentFiltered.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score;
    // then recency
    return b.postedAtDate.getTime() - a.postedAtDate.getTime();
  });

  // final limit
  const final = recentFiltered.slice(0, limit).map((j) => {
    // clean helper keys
    const { _score, scrapedAt, postedAtDate, ...rest } = j;
    return {
      ...rest,
      score: _score,
      scrapedAt: j.scrapedAt || new Date(),
      postedAtDate: j.postedAtDate,
    };
  });

  console.log(`🎯 Total jobs returned: ${final.length}`);
  return final;
};
