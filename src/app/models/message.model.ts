export interface Message {
    sender: string;
    recipient?: string;
    text: string;
    timestamp: Date;
    read?: boolean;
}
