// Connected social media accounts — localStorage for now, Supabase later

export interface ConnectedAccount {
  platform: 'facebook' | 'instagram' | 'pinterest';
  username: string;
  profilePicture?: string;
  connectedAt: string;
  tokenExpiry?: string;
  accessToken?: string;
  refreshToken?: string;
  pageId?: string;        // Facebook page ID
  pageToken?: string;     // Facebook page-specific token
  igAccountId?: string;   // Instagram Business account ID
  boardId?: string;       // Pinterest default board
}

const STORAGE_KEY = 'biz-social-connected-accounts';

export function getConnectedAccounts(): ConnectedAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ConnectedAccount[];
  } catch {
    return [];
  }
}

export function addConnectedAccount(account: ConnectedAccount): void {
  const accounts = getConnectedAccounts();
  // Replace existing account for the same platform
  const filtered = accounts.filter(a => a.platform !== account.platform);
  filtered.push(account);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function removeConnectedAccount(platform: string): void {
  const accounts = getConnectedAccounts();
  const filtered = accounts.filter(a => a.platform !== platform);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getAccount(platform: string): ConnectedAccount | undefined {
  return getConnectedAccounts().find(a => a.platform === platform);
}

export function isConnected(platform: string): boolean {
  return getConnectedAccounts().some(a => a.platform === platform);
}

export function getConnectedPlatforms(): string[] {
  return getConnectedAccounts().map(a => a.platform);
}
