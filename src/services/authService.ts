import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const AUTH_STORAGE_KEY = 'locura_auth_user';
const ALL_USERS_KEY = 'locura_all_users';

type AuthListener = (user: UserProfile | null) => void;
const listeners: Set<AuthListener> = new Set();

class AuthService {
  private currentUser: UserProfile | null = null;
  private allUsers: UserProfile[] = [];

  constructor() {
    const rawUsers = loadFromStorage<UserProfile[]>(ALL_USERS_KEY, INITIAL_USERS);
    this.allUsers = rawUsers.filter((u: any) => u.role !== 'ADMIN');
    
    // Check if user was logged in previously
    const saved = loadFromStorage<UserProfile | null>(AUTH_STORAGE_KEY, null);
    if (saved && (saved as any).role === 'ADMIN') {
      this.currentUser = null;
      saveToStorage(AUTH_STORAGE_KEY, null);
    } else {
      this.currentUser = saved;
    }

    saveToStorage(ALL_USERS_KEY, this.allUsers);
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public getAllUsers(): UserProfile[] {
    return this.allUsers;
  }

  public subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    listener(this.currentUser);
    return () => listeners.delete(listener);
  }

  private notify() {
    listeners.forEach((fn) => fn(this.currentUser));
  }

  public loginAsTraveler(): UserProfile {
    const traveler = this.allUsers.find((u) => u.role === 'USER') || this.allUsers[0];
    this.currentUser = traveler;
    saveToStorage(AUTH_STORAGE_KEY, this.currentUser);
    this.notify();
    return traveler;
  }

  public loginAsHelper(): UserProfile {
    const helper = this.allUsers.find((u) => u.role === 'HELPER') || this.allUsers[1];
    this.currentUser = helper;
    saveToStorage(AUTH_STORAGE_KEY, this.currentUser);
    this.notify();
    return helper;
  }

  public login(email: string): { success: boolean; message?: string } {
    const found = this.allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      this.currentUser = found;
      saveToStorage(AUTH_STORAGE_KEY, this.currentUser);
      this.notify();
      return { success: true };
    }
    return { success: false, message: 'User not found. Please choose Traveler or Helper, or register below.' };
  }

  public register(name: string, email: string, phone: string, role: UserRole): { success: boolean; user: UserProfile } {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role,
      trustScore: role === 'HELPER' ? 3.0 : undefined,
      badge: role === 'HELPER' ? 'Volunteer Applicant' : 'Community Member'
    };

    this.allUsers.push(newUser);
    this.currentUser = newUser;
    saveToStorage(ALL_USERS_KEY, this.allUsers);
    saveToStorage(AUTH_STORAGE_KEY, this.currentUser);
    this.notify();
    return { success: true, user: newUser };
  }

  public switchPersona(userId: string) {
    const target = this.allUsers.find((u) => u.id === userId);
    if (target) {
      this.currentUser = target;
      saveToStorage(AUTH_STORAGE_KEY, this.currentUser);
      this.notify();
    }
  }

  public logout() {
    this.currentUser = null;
    saveToStorage(AUTH_STORAGE_KEY, null);
    this.notify();
  }

  public isUser(): boolean {
    return this.currentUser?.role === 'USER';
  }

  public isHelper(): boolean {
    return this.currentUser?.role === 'HELPER';
  }
}

export const authService = new AuthService();
