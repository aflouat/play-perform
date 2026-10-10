/** Public API of the collab module: the chat of a pair during their common project, archived and audited by Play Perform. */
export type { ChatState } from './domain/chat';
export { CHAT_NOTICE, MESSAGE_MAX, MESSAGES_PER_MINUTE, weekWindow, chatState, membersKey, validateMessage } from './domain/chat';
export { PairChat } from './ui/PairChat';
export { ChatAudit } from './ui/ChatAudit';
