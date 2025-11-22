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
 * Server-side only - uses isomorphic-dompurify
 */
export function sanitizeHtml(dirty: string): string {
  // This function should only be used server-side in Next.js server actions
  // Dynamic import won't work in server actions, so we use a simpler approach
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  } catch (error) {
    // Fallback: if DOMPurify fails, strip all HTML tags for safety
    console.error('DOMPurify sanitization failed:', error);
    return dirty.replace(/<[^>]*>/g, '');
  }
}
