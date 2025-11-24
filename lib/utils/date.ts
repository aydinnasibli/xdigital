// Safe date formatting that avoids hydration mismatches
export function formatMessageDate(date: string | Date): string {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        // Use consistent formatting that works on both server and client
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const day = d.getDate();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');

        return `${month} ${day}, ${hours}:${minutes}`;
    } catch {
        return '';
    }
}

export function formatMessageTime(date: string | Date): string {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    } catch {
        return '';
    }
}

export function formatConversationDate(date: string | Date): string {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const day = d.getDate();

        return `${month} ${day}`;
    } catch {
        return '';
    }
}
