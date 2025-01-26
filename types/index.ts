export interface ConversationMessage {
  role: string;
  content: string;
 }


 export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}