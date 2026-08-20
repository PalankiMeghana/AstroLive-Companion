// Smart Match: transparent, deterministic prototype classifier.
// It scores multiple specialties, normalizes the result, and exposes the
// signals that explain the recommendation. Production can swap the scorer
// for embeddings without changing the UI contract.

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function runSmartMatch(rawText) {
  const text = normalizeText(rawText);
  if (!text) return null;

  const scored = SPECIALTIES.map(spec => {
    let score = 0;
    const hits = [];
    spec.keywords.forEach(({word, weight}) => {
      const pattern = new RegExp("\\b" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:s|ed|ing)?\\b", "i");
      if (pattern.test(text)) {
        score += weight;
        hits.push(word);
      }
    });
    return {spec, score, hits};
  }).sort((a,b) => b.score - a.score);

  const top = scored[0];
  const runner = scored[1];

  if (!top || top.score === 0) {
    const fallback = SPECIALTIES.find(s => s.id === "purpose");
    return {
      specialty: fallback,
      confidencePct: 48,
      hits: [],
      reason: "We couldn't confidently classify the concern, so we chose a broad life-direction specialist instead of pretending certainty.",
      signals: ["generalist fallback", "low-signal input"]
    };
  }

  const second = runner && runner.score > 0 ? runner.score : 0;
  const separation = top.score - second;
  const rawConfidence = 62 + Math.min(28, separation * 7) + Math.min(7, top.hits.length * 2);
  const confidencePct = Math.min(97, Math.round(rawConfidence));

  return {
    specialty: top.spec,
    confidencePct,
    hits: top.hits,
    reason: `Your concern maps most strongly to ${top.spec.label.toLowerCase()}. We detected ${top.hits.slice(0,3).join(", ")} as the strongest signals.`,
    signals: top.hits.slice(0,4).map(h => `"${h}"`)
  };
}
