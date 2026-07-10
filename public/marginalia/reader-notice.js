export function buildReaderDocumentNotice({
  docId = '',
  projectionWarnings = [],
  unresolvedCount = 0
} = {}) {
  const blockedResources = [...new Set(
    (Array.isArray(projectionWarnings) ? projectionWarnings : [])
      .map((value) => String(value || '').trim())
      .filter(Boolean)
  )].slice(0, 20);
  const unresolvedTargets = Number.isFinite(Number(unresolvedCount))
    ? Math.max(0, Math.trunc(Number(unresolvedCount)))
    : 0;
  const details = [];
  if (blockedResources.length) {
    const examples = blockedResources.slice(0, 2).map((value) => `“${value}”`).join(', ');
    details.push(`${blockedResources.length} source resource${blockedResources.length === 1 ? ' is' : 's are'} blocked or missing in static reading mode${examples ? `: ${examples}` : ''}. Reimport a bundle containing local assets if needed.`);
  }
  if (unresolvedTargets) {
    details.push(`${unresolvedTargets} annotation target${unresolvedTargets === 1 ? ' is' : 's are'} unresolved.`);
  }
  if (!details.length) return null;
  const body = details.join('\n');
  return {
    key: `document:${docId}:${body}`,
    kind: 'warning',
    title: unresolvedTargets ? 'Some annotations need attention' : 'Some source resources need attention',
    body,
    retry: false
  };
}
