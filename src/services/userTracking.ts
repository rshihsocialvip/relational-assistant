// Simple user tracking service without Supabase Auth
export interface UserSession {
  userId: string;
  sessionStart: Date;
  lastActivity: Date;
  deviceInfo: string;
  userAgent: string;
}

export class UserTrackingService {
  private static readonly USER_ID_KEY = 'ai-user-id';
  private static readonly USER_SESSION_KEY = 'ai-user-session';

  // Generate or retrieve persistent user ID
  static getUserId(): string {
    let userId = localStorage.getItem(this.USER_ID_KEY);
    if (!userId) {
      userId = this.generateUserId();
      localStorage.setItem(this.USER_ID_KEY, userId);
    }
    return userId;
  }

  // Generate unique user ID
  private static generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `user_${timestamp}_${random}`;
  }

  // Get device info for tracking
  static getDeviceInfo(): string {
    const screen = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    return `${screen}|${timezone}|${language}`;
  }

  // Initialize user session
  static initializeSession(): UserSession {
    const userId = this.getUserId();
    const now = new Date();
    
    const userSession: UserSession = {
      userId,
      sessionStart: now,
      lastActivity: now,
      deviceInfo: this.getDeviceInfo(),
      userAgent: navigator.userAgent
    };

    localStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(userSession));
    return userSession;
  }

  // Update last activity
  static updateActivity(): void {
    const sessionData = localStorage.getItem(this.USER_SESSION_KEY);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.lastActivity = new Date();
      localStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(session));
    }
  }

  // Get current session
  static getCurrentSession(): UserSession | null {
    const sessionData = localStorage.getItem(this.USER_SESSION_KEY);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      return {
        ...session,
        sessionStart: new Date(session.sessionStart),
        lastActivity: new Date(session.lastActivity)
      };
    }
    return null;
  }

  // Clear user data (for privacy/reset)
  static clearUserData(): void {
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.USER_SESSION_KEY);
  }
}