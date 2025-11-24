import { Task } from '@/types';

/**
 * Generates a Google Calendar event URL from a task
 * @param task - The task to convert to a calendar event
 * @returns Google Calendar URL with pre-filled event details
 */
export function generateGoogleCalendarUrl(task: Task): string {
    const baseUrl = 'https://calendar.google.com/calendar/render';

    // Event title
    const title = task.content;

    // Event description - include category and priority
    const descriptionParts = [
        `Category: ${task.list_category.replace('_', ' ')}`,
    ];

    if (task.priority) {
        const priorityText = task.priority === 'high' ? '🔴 High Priority' :
            task.priority === 'medium' ? '🟡 Medium Priority' :
                '🟢 Low Priority';
        descriptionParts.push(`Priority: ${priorityText}`);
    }

    // Add subtasks to description if any
    if (task.subtasks && task.subtasks.length > 0) {
        descriptionParts.push('');
        descriptionParts.push('Subtasks:');
        task.subtasks.forEach((subtask, index) => {
            descriptionParts.push(`${index + 1}. ${subtask.content}`);
        });
    }

    const description = descriptionParts.join('\n');

    // Parse date from suggested_due_date
    const dates = parseDueDate(task.suggested_due_date);

    // Build URL parameters
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        details: description,
    });

    if (dates) {
        params.append('dates', dates);
    }

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Converts a due date string to Google Calendar date format
 * @param dueDate - Due date string like "tomorrow", "next friday", "2024-12-25"
 * @returns Date range in format "YYYYMMDDTHHmmss/YYYYMMDDTHHmmss" or null
 */
function parseDueDate(dueDate?: string): string | null {
    if (!dueDate) return null;

    const now = new Date();
    let targetDate = new Date();

    const dueDateLower = dueDate.toLowerCase();

    // Parse common date expressions
    if (dueDateLower.includes('today') || dueDateLower.includes('hoy')) {
        targetDate = new Date(now);
    } else if (dueDateLower.includes('tomorrow') || dueDateLower.includes('mañana')) {
        targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + 1);
    } else if (dueDateLower.includes('next week') || dueDateLower.includes('próxima semana')) {
        targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + 7);
    } else if (dueDateLower.includes('next month') || dueDateLower.includes('próximo mes')) {
        targetDate = new Date(now);
        targetDate.setMonth(targetDate.getMonth() + 1);
    } else {
        // Try to parse as ISO date
        const parsed = new Date(dueDate);
        if (!isNaN(parsed.getTime())) {
            targetDate = parsed;
        } else {
            // Default to tomorrow if we can't parse
            targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() + 1);
        }
    }

    // Set time to 9:00 AM
    targetDate.setHours(9, 0, 0, 0);

    // End time is 1 hour later
    const endDate = new Date(targetDate);
    endDate.setHours(10, 0, 0, 0);

    // Format: YYYYMMDDTHHmmss
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };

    return `${formatDate(targetDate)}/${formatDate(endDate)}`;
}
