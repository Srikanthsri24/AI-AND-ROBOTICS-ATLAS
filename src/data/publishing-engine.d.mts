export type Brief = {
  activity: string;
  schedule: string;
  location: string;
  audience: string;
  exercise: string;
  instruction: string;
};
export type Tone = 'friendly' | 'formal';
export type Draft = { heading: string; body: string };
export type ReviewId = 'facts' | 'audience' | 'privacy';
export type Checks = Partial<Record<ReviewId, boolean>>;
export const reviewChecks: ReadonlyArray<{ id: ReviewId; label: string }>;
export const unsupportedClaim: string;
export function generateDraft(brief: Brief, tone: Tone, addPracticeClaim?: boolean): Draft;
export function reviewProblems(draft: Draft, checks: Checks): string[];
export function publishHtml(draft: Draft, checks: Checks): string;
