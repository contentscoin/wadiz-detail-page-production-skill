#!/usr/bin/env node
import path from 'node:path';
import { buildDeliveryPackage, calculateReviewSnapshot, calculateMediaReviewSnapshots } from './media/delivery.mjs';
import { isMain } from './media/common.mjs';
export { buildDeliveryPackage, calculateReviewSnapshot, calculateMediaReviewSnapshots };

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2), outIndex = args.indexOf('--out'), resultsIndex = args.indexOf('--media-results');
  if (!args[0] || args.includes('--help')) console.log('Usage: node build-delivery-package.mjs <project-dir> [--out <delivery-dir>] [--media-results <results-json>] [--publication] [--review-snapshot] [--review-media-snapshots]\nCreates HTML, GIF/poster assets, plan, QA report, manifest, ZIP. --publication requires current copy/source and media-file review bindings. Snapshot options only print hashes; they approve nothing.');
  else {
    const options = { ...(outIndex >= 0 ? { outDir: path.resolve(args[outIndex + 1]) } : {}), ...(resultsIndex >= 0 ? { mediaResultsFile: path.resolve(args[resultsIndex + 1]) } : {}), publication: args.includes('--publication') };
    const operation = args.includes('--review-snapshot') ? calculateReviewSnapshot(path.resolve(args[0])).then((hash) => ({ snapshot_sha256: hash })) : args.includes('--review-media-snapshots') ? calculateMediaReviewSnapshots(path.resolve(args[0]), options) : buildDeliveryPackage(path.resolve(args[0]), options);
    operation.then((result) => console.log(JSON.stringify(result, null, 2))).catch((e) => { console.error(e.message); process.exitCode = 1; });
  }
}
