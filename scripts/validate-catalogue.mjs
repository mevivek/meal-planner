// Offline validation of a generated catalogue (no API key needed) — suitable
// for a CI gate. Usage: node scripts/validate-catalogue.mjs [path]
import fs from "node:fs";
import { CatalogueSchema, domainErrors } from "./catalogue-schema.mjs";

const path = process.argv[2] || "public/catalogue.json";
if (!fs.existsSync(path)) {
  console.error(`No catalogue at ${path}. Run scripts/generate-catalogue.mjs first.`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path, "utf8"));
const parsed = CatalogueSchema.safeParse(data);
if (!parsed.success) {
  console.error("Schema errors:\n", JSON.stringify(parsed.error.issues, null, 2));
  process.exit(1);
}
const errs = domainErrors(parsed.data);
if (errs.length) {
  console.error("Domain errors:\n" + errs.join("\n"));
  process.exit(1);
}
console.log(`OK — ${parsed.data.length} meals pass schema + domain validation.`);
