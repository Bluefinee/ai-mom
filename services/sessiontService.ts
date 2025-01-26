import { v4 as uuidv4 } from 'uuid';

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  persona: string;
  createdAt: number;
  lastAccessedAt: number;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export class SessionManager {
  private storage: Storage | null = null;
  private readonly SESSION_EXPIRY = 24 * 60 * 60 * 1000;
  private readonly MAX_MESSAGES = 100;

  constructor() {
    if (typeof window !== 'undefined') {
      this.storage = window.localStorage;
    }
  }

  private ensureStorage(): Storage {
    if (!this.storage) {
      throw new Error('Storage is not available in this environment');
    }
    return this.storage;
  }

  public initializeSession(): string {
    const existingSession = this.getCurrentSession();
    if (existingSession) {
      this.updateSessionTimestamp(existingSession.sessionId);
      return existingSession.sessionId;
    }

    const sessionId = uuidv4();
    const newSession: ChatSession = {
      sessionId,
      messages: [],
      persona: 'caring',
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };

    this.saveSession(newSession);
    return sessionId;
  }

  public getCurrentSession(): ChatSession | null {
    try {
      const storage = this.ensureStorage();
      const sessionId = storage.getItem('currentSessionId');
      if (!sessionId) return null;

      const sessionData = storage.getItem(`session_${sessionId}`);
      if (!sessionData) return null;

      const session: ChatSession = JSON.parse(sessionData);
      
      if (Date.now() - session.lastAccessedAt > this.SESSION_EXPIRY) {
        this.clearSession(sessionId);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  public addMessage(message: Omit<ChatMessage, 'timestamp'>): void {
    const session = this.getCurrentSession();
    if (!session) return;

    const newMessage = { ...message, timestamp: Date.now() };
    const messages = [...session.messages, newMessage];
    if (messages.length > this.MAX_MESSAGES) {
      messages.shift();
    }

    const updatedSession: ChatSession = {
      ...session,
      messages,
      lastAccessedAt: Date.now(),
    };

    this.saveSession(updatedSession);
  }

  public getConversationContext(): ChatMessage[] {
    const session = this.getCurrentSession();
    if (!session) return [];
    return session.messages.slice(-10);
  }

  public updatePersona(persona: string): void {
    const session = this.getCurrentSession();
    if (!session) return;

    const updatedSession: ChatSession = {
      ...session,
      persona,
      lastAccessedAt: Date.now(),
    };

    this.saveSession(updatedSession);
  }

  private saveSession(session: ChatSession): void {
    try {
      const storage = this.ensureStorage();
      storage.setItem('currentSessionId', session.sessionId);
      storage.setItem(`session_${session.sessionId}`, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
      this.clearOldSessions();
      const storage = this.ensureStorage();
      storage.setItem('currentSessionId', session.sessionId);
      storage.setItem(`session_${session.sessionId}`, JSON.stringify(session));
    }
  }

  private clearSession(sessionId: string): void {
    const storage = this.ensureStorage();
    storage.removeItem(`session_${sessionId}`);
    storage.removeItem('currentSessionId');
  }

  private updateSessionTimestamp(sessionId: string): void {
    const storage = this.ensureStorage();
    const sessionData = storage.getItem(`session_${sessionId}`);
    if (!sessionData) return;

    const session: ChatSession = JSON.parse(sessionData);
    session.lastAccessedAt = Date.now();
    this.saveSession(session);
  }

  private clearOldSessions(): void {
    const storage = this.ensureStorage();
    const keys = Object.keys(storage);
    const sessionKeys = keys.filter(key => key.startsWith('session_'));
    
    for (const key of sessionKeys) {
      const sessionData = storage.getItem(key);
      if (!sessionData) continue;

      const session: ChatSession = JSON.parse(sessionData);
      if (Date.now() - session.lastAccessedAt > this.SESSION_EXPIRY) {
        storage.removeItem(key);
      }
    }
  }
}