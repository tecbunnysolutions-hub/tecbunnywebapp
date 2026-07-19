import sanitize from 'sanitize-html';

const sanitizerOptions: sanitize.IOptions = {
  allowedTags: [
    'a', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'p', 'br',
    'span', 'div', 'section', 'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'blockquote'
  ],
  allowedAttributes: {
    '*': ['class', 'title'],
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    a: ['http', 'https', 'mailto', 'tel'],
  },
  transformTags: {
    a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
  },
  disallowedTagsMode: 'discard',
  enforceHtmlBoundary: true,
};

export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string' || !input.trim()) return '';

  return sanitize(input, sanitizerOptions);
}

export default sanitizeHtml;
