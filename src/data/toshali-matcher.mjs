export const minimumSimilarity = 0.5;
export const minimumLead = 0.2;

const commonWords = new Set(['a', 'an', 'the', 'show', 'me', 'please', 'about', 'tell', 'or', 'and', 'ଦେଖାନ୍ତୁ']);
const tokenize = phrase => new Set(
  (phrase.normalize('NFKC').toLowerCase().replace(/\p{Script=Latin}\p{M}*/gu, letter => letter.normalize('NFD').replace(/\p{M}/gu, ''))
    .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).filter(word => !commonWords.has(word))
);

function similarity(a, b) {
  const shared = [...a].filter(token => b.has(token)).length;
  return a.size && b.size ? (2 * shared) / (a.size + b.size) : 0;
}

export function classifyPhrase(phrase, crafts) {
  const input = tokenize(phrase);
  const ranks = crafts.map(craft => {
    let score = 0;
    let example = '';
    for (const candidate of craft.examples) {
      const match = similarity(input, tokenize(candidate));
      if (match > score) {
        score = match;
        example = candidate;
      }
    }
    return { id: craft.id, score, example };
  }).sort((a, b) => b.score - a.score);

  const [first, second] = ranks;
  const matches = first && first.score >= minimumSimilarity;
  const clearLead = matches && first.score - (second?.score ?? 0) >= minimumLead;
  return {
    craftId: clearLead ? first.id : null,
    reason: clearLead ? 'match' : matches ? 'ambiguous' : 'unfamiliar',
    ranks,
  };
}
