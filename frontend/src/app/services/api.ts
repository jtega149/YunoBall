const API = import.meta.env.VITE_API_URL ?? '';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export type DebateRoomDto = {
  roomId: string;
  title: string;
  description: string;
  visibility: string;
  status: string;
  hostUsername: string;
  hashtags: string[];
  createdAt: string;
};

export type DebateHistoryDto = {
  id: number;
  roomId: string;
  title: string;
  debateEndedAt: string;
  myRole: string;
  myResult: string;
  winnerUsername: string;
  hostUsername: string;
  guestUsername: string;
};

export type LeaderboardRow = {
  rank: number;
  username: string;
  wins: number;
  losses: number;
  totalDebates: number;
  winRate: number;
};

export type LeaderboardDto = {
  top: LeaderboardRow[];
  me: LeaderboardRow;
};

export function createDebate(body: {
  title: string;
  description: string;
  visibility: string;
  hashtags: string[];
}) {
  return apiFetch<DebateRoomDto>('/api/debates', { method: 'POST', body: JSON.stringify(body) });
}

export function getDebate(roomId: string) {
  return apiFetch<DebateRoomDto>(`/api/debates/${encodeURIComponent(roomId)}`);
}

/** Host-only: persist ENDED in DB and clear live session. */
export function endDebateRoom(roomId: string) {
  return apiFetch<void>(`/api/debates/${encodeURIComponent(roomId)}/end`, { method: 'POST' });
}

export function searchDebates(q: string) {
  const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  return apiFetch<DebateRoomDto[]>(`/api/debates/search${qs}`);
}

export function recommendedDebates() {
  return apiFetch<DebateRoomDto[]>('/api/debates/recommended');
}

export function myDebateHistory() {
  return apiFetch<DebateHistoryDto[]>('/api/debates/history/me');
}

export function leaderboard() {
  return apiFetch<LeaderboardDto>('/api/leaderboard');
}
