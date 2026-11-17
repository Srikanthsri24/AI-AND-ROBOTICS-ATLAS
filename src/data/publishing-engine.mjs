// A deterministic stand-in for AI so the workflow runs completely offline.
export const reviewChecks = [
  { id: 'facts', label: 'Checked the draft against the brief' },
  { id: 'audience', label: 'Checked wording and audience' },
  { id: 'privacy', label: 'Checked that no personal data is included' },
];

export const unsupportedClaim = 'Everyone will master robotics in just one session.';

export function generateDraft(brief, tone, addPracticeClaim = true) {
  const heading = tone === 'friendly' ? `Come try ${brief.activity}` : `${brief.activity} workshop notice`;
  const intro = tone === 'friendly'
    ? `Curious about ${brief.activity}? Join us on ${brief.schedule} in ${brief.location}.`
    : `The ${brief.activity} workshop is scheduled for ${brief.schedule} in ${brief.location}.`;
  const body = `${intro}\n\n${brief.audience} will ${brief.exercise}. ${brief.instruction}`;
  return { heading, body: addPracticeClaim ? `${body}\n\n${unsupportedClaim}` : body };
}

export function reviewProblems(draft, checks) {
  const problems = [];
  if (!draft.heading.trim() || !draft.body.trim()) problems.push('Add a headline and body.');
  if (draft.body.toLowerCase().includes(unsupportedClaim.toLowerCase())) {
    problems.push('Remove the unsupported promise about mastering robotics in one session.');
  }
  if (reviewChecks.some(({id}) => checks[id] !== true)) problems.push('Finish all three review checks.');
  return problems;
}

export function publishHtml(draft, checks) {
  const problems = reviewProblems(draft, checks);
  if (problems.length) throw new Error(problems.join(' '));
  const escape = text => text.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
  const paragraphs = draft.body.trim().split(/\n\s*\n/).map(text => `  <p>${escape(text)}</p>`).join('\n');
  const heading = escape(draft.heading.trim());
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${heading}</title>
<style>body{margin:4rem auto;padding:0 1.5rem;max-width:42rem;font:1rem/1.6 system-ui;color:#1f2f46;background:#f8f9fc}h1{line-height:1.15}p{white-space:pre-line}</style>
</head>
<body>
<main>
  <h1>${heading}</h1>
${paragraphs}
</main>
</body>
</html>
`;
}
