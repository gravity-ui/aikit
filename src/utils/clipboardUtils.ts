/**
 * Formats content for copying to clipboard.
 * Joins array items with double newline, or returns string as-is.
 *
 * @param content - Content to format (string or array of strings)
 * @returns Formatted text ready for clipboard
 */
export function formatCopyText(content: string | string[]): string {
    if (Array.isArray(content)) {
        return content.join('\n\n');
    }
    return content;
}

/**
 * Copy content to clipboard using execCommand.
 * Reliable method that works in all environments including iframes, HTTP, and older browsers.
 * Accepts both string and array of strings (arrays are joined with double newline).
 *
 * @param content - Content to copy (string or array of strings)
 * @returns true if copy was successful, false otherwise
 */
export function copyToClipboard(content: string | string[]): boolean {
    const text = formatCopyText(content);

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to copy text:', err);
    }

    document.body.removeChild(textarea);
    return successful;
}
