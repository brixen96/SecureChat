export interface User {
    username: string;
    password?: string;
    role?: string;
    unread_count?: number;
    last_message_timestamp?: string;
    expanded?: boolean;
    notes?: any[];
    newNote?: string;
}
