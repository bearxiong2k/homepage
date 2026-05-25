function stripOuter(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('"') && text.endsWith('"'))) {
    return text.slice(1, -1).trim();
  }
  return text;
}

const latexAccents = {
  "'": { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'ý', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', Y: 'Ý' },
  '`': { a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù', A: 'À', E: 'È', I: 'Ì', O: 'Ò', U: 'Ù' },
  '"': { a: 'ä', e: 'ë', i: 'ï', o: 'ö', u: 'ü', y: 'ÿ', A: 'Ä', E: 'Ë', I: 'Ï', O: 'Ö', U: 'Ü' },
  '^': { a: 'â', e: 'ê', i: 'î', o: 'ô', u: 'û', A: 'Â', E: 'Ê', I: 'Î', O: 'Ô', U: 'Û' },
  '~': { a: 'ã', n: 'ñ', o: 'õ', A: 'Ã', N: 'Ñ', O: 'Õ' },
  c: { c: 'ç', C: 'Ç' }
};

function decodeLatex(value) {
  return value
    .replace(/\{\\([`'"^~c])\{?([A-Za-z])\}?\}/g, (_, accent, letter) => latexAccents[accent]?.[letter] ?? letter)
    .replace(/\\([`'"^~c])\{?([A-Za-z])\}?/g, (_, accent, letter) => latexAccents[accent]?.[letter] ?? letter)
    .replace(/\{-\}/g, '-')
    .replace(/\\&/g, '&');
}

function cleanValue(value) {
  return decodeLatex(stripOuter(value))
    .replace(/\s+/g, ' ')
    .replace(/[{}]/g, '')
    .trim();
}

function splitBibtexFields(body) {
  const fields = {};
  let index = 0;
  while (index < body.length) {
    while (index < body.length && /[\s,]/.test(body[index])) index += 1;
    const keyMatch = body.slice(index).match(/^([A-Za-z][A-Za-z0-9_-]*)\s*=/);
    if (!keyMatch) {
      index += 1;
      continue;
    }

    const key = keyMatch[1].toLowerCase();
    index += keyMatch[0].length;
    while (index < body.length && /\s/.test(body[index])) index += 1;

    const quote = body[index] === '"' ? '"' : null;
    const brace = body[index] === '{';
    if (quote || brace) index += 1;
    const start = index;
    let depth = brace ? 1 : 0;
    while (index < body.length) {
      const char = body[index];
      if (brace) {
        if (char === '{') depth += 1;
        if (char === '}') {
          depth -= 1;
          if (depth === 0) break;
        }
      } else if (quote && char === '"') {
        break;
      } else if (!quote && !brace && char === ',') {
        break;
      }
      index += 1;
    }
    fields[key] = cleanValue(body.slice(start, index));
    while (index < body.length && body[index] !== ',') index += 1;
  }
  return fields;
}

export function parseBibtexEntry(bibtex) {
  const text = String(bibtex ?? '').trim();
  const header = text.match(/^@([A-Za-z]+)\s*\{\s*([^,\s]+)\s*,/);
  if (!header) return null;
  const bodyStart = header[0].length;
  let depth = 1;
  let end = text.length;
  for (let index = bodyStart; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    if (text[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = index;
        break;
      }
    }
  }
  return {
    type: header[1].toLowerCase(),
    key: header[2],
    fields: splitBibtexFields(text.slice(bodyStart, end))
  };
}

function displayAuthor(author) {
  const cleaned = cleanValue(author);
  if (!cleaned.includes(',')) return cleaned;
  const [last, ...rest] = cleaned.split(',').map((part) => part.trim()).filter(Boolean);
  return [...rest, last].join(' ');
}

export function bibtexAuthors(fields = {}) {
  return String(fields.author ?? '')
    .split(/\s+and\s+/i)
    .map(displayAuthor)
    .filter(Boolean);
}

function compactConferenceVenue(venue, year) {
  const text = cleanValue(venue);
  const acronym = text.match(/\(([A-Z][A-Z0-9-]{1,12})\)/)?.[1];
  if (acronym && year) return `${acronym} ${year}`;
  const acronymYear = [...text.matchAll(/\b([A-Z][A-Z0-9-]{1,12})\s+(20\d{2})\b/g)]
    .map((match) => ({ acronym: match[1], year: Number(match[2]) }))
    .find((match) => !['ACM', 'IEEE'].includes(match.acronym));
  if (acronymYear) return `${acronymYear.acronym} ${acronymYear.year}`;
  return text;
}

export function citationDisplayMetadata(bibtex) {
  const entry = parseBibtexEntry(bibtex);
  if (!entry) {
    return {
      title: '',
      year: null,
      publication: { venue: '', type: '', doi: '', url: '' },
      authors: []
    };
  }

  const { type, fields } = entry;
  const year = fields.year && /^\d{4}$/.test(fields.year) ? Number(fields.year) : null;
  const publicationType = type === 'inproceedings'
    ? 'conference'
    : type === 'article'
      ? 'article'
      : 'other';
  const rawVenue = fields.booktitle || fields.journal || fields.howpublished || '';
  const venue = fields.booktitle ? compactConferenceVenue(rawVenue, year) : cleanValue(rawVenue);

  return {
    title: cleanValue(fields.title),
    year,
    publication: {
      venue,
      type: publicationType,
      doi: cleanValue(fields.doi),
      url: fields.doi ? `https://doi.org/${cleanValue(fields.doi)}` : cleanValue(fields.url)
    },
    authors: bibtexAuthors(fields)
  };
}
