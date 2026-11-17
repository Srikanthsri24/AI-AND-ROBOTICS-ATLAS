// Save alongside publishing-engine.mjs and workshop-brief.json.
import { readFile, writeFile } from 'node:fs/promises';
import { generateDraft, publishHtml } from './publishing-engine.mjs';

const [command, input, output] = process.argv.slice(2);
try {
  if (!['draft', 'publish'].includes(command) || !input || !output) {
    throw new Error('Usage: node publishing_runner.mjs draft|publish input.json output');
  }
  const data = JSON.parse(await readFile(input, 'utf8'));
  const contents = command === 'draft'
    ? JSON.stringify({ draft: generateDraft(data.brief, data.tone, data.practiceClaim), checks: {} }, null, 2) + '\n'
    : publishHtml(data.draft, data.checks);
  await writeFile(output, contents);
  console.log(`Wrote ${output}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
