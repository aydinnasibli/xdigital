import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Escapes special regex characters to prevent ReDoS and injection attacks
 * @param string - The string to escape
 * @returns Escaped string safe for use in RegExp
 */
export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify with safe configuration
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use isomorphic-dompurify
    const createDOMPurify = require('isomorphic-dompurify');
    const DOMPurify = createDOMPurify();

    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
        'img', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'iframe' // For video embeds
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id',
        'width', 'height', 'frameborder', 'allowfullscreen', 'allow'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ALLOW_DATA_ATTR: false,
    });
  } else {
    // Client-side: use DOMPurify
    const createDOMPurify = require('dompurify');
    const DOMPurify = createDOMPurify(window);

    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
        'img', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'iframe' // For video embeds
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id',
        'width', 'height', 'frameborder', 'allowfullscreen', 'allow'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ALLOW_DATA_ATTR: false,
    });
  }
}
