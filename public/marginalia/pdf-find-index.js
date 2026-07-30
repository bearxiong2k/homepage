export function pdfSearchTextFromContent(textContent) {
  const items = Array.isArray(textContent?.items) ? textContent.items : [];
  let text = '';
  for (const item of items) {
    if (typeof item?.str === 'string') text += item.str;
    if (item?.hasEOL) text += '\n';
  }
  return text.trim();
}

export function pdfSearchPageOrder(pageCount, currentPage = 1) {
  const total = positiveInteger(pageCount);
  if (!total) return [];
  const current = clamp(positiveInteger(currentPage) || 1, 1, total);
  const pages = [current];
  for (let distance = 1; pages.length < total; distance += 1) {
    if (current + distance <= total) pages.push(current + distance);
    if (current - distance >= 1) pages.push(current - distance);
  }
  return pages;
}

function positiveInteger(value) {
  const number = Math.round(Number(value));
  return Number.isInteger(number) && number > 0 ? number : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
