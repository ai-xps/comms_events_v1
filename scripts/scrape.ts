import { runScraper } from "../src/lib/scraper/run";

async function main() {
  const result = await runScraper({ trigger: "SCHEDULED" });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
