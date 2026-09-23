// A chat attachment is handed to the model whole: nothing extracts its text and
// nothing truncates it, so a large document can exhaust the context window on
// the first request it appears in. The server's own direct-upload ceiling is
// 1GB, which is a storage limit rather than a conversation one.
export const AGENT_CHAT_MAX_ATTACHMENT_SIZE_IN_BYTES = 10 * 1024 * 1024;

export const AGENT_CHAT_MAX_ATTACHMENT_SIZE_LABEL = '10MB' as const;
