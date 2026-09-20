import { describe, expect, it } from 'vitest';

import { sanitizeHtml } from './sanitize-html';

/**
 * Coverage for the "webmail-stage-reply" launch-qa workflow
 * (launch-qa-evidence.json): a staged reply draft must be sanitised before it
 * is persisted or rendered, so a stored-XSS payload in a draft cannot execute
 * when the mailbox provider later syncs it. These tests pin the sanitiser
 * contract the reply-staging flow depends on.
 */
describe('webmail reply-draft sanitisation contract', () => {
  it('strips <script> tags from a staged reply draft', () => {
    expect(sanitizeHtml('<p>Hello</p><script>alert(1)</script>'))
      .toBe('<p>Hello</p>');
  });

  it('removes event-handler attributes (onerror) from images/markup', () => {
    const out = sanitizeHtml('<p onclick="alert(1)">Hi</p>');
    expect(out).not.toContain('onclick');
  });

  it('blocks javascript: URLs in links', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
  });

  it('keeps safe formatting allowed in a reply body', () => {
    const out = sanitizeHtml('<p>Hello <strong>team</strong></p>');
    expect(out).toContain('<strong>team</strong>');
  });

  it('forces rel="noopener noreferrer" on links in staged content', () => {
    const out = sanitizeHtml('<a href="https://example.com">link</a>');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it('returns empty string for empty / non-string drafts', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml('   ')).toBe('');
    // @ts-expect-error runtime guard for non-string input
    expect(sanitizeHtml(null)).toBe('');
  });

  it('drops disallowed tags but preserves their text content', () => {
    const out = sanitizeHtml('<div>Keep <iframe src="https://evil.example"></iframe>this</div>');
    expect(out).not.toContain('<iframe');
    expect(out).toContain('Keep');
    expect(out).toContain('this');
  });
});
