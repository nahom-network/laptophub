const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://laptophub.autoqueue.systems/api";

export interface LaptopImage {
  image: string;
}

export interface Review {
  id: number;
  user: string;
  rating: number;
  comment?: string | null;
  created_at: string;
}

export interface LaptopPost {
  uuid: string;
  title: string;
  storage?: string | null;
  processor?: string | null;
  graphics?: string | null;
  display?: string | null;
  ram?: string | null;
  battrey?: string | null;
  status?: string | null;
  description?: string | null;
  price?: string | null;
  channel_name: string;
  posted_at: string;
  reviews: Review[];
  average_rating: string;
  images: LaptopImage[];
  color?: string | null;
  channel: string;
  simmilar_items: SimilarItem[];
}

export interface SimilarItem {
  score: number;
  similar_laptop: {
    uuid: string;
    title: string;
    storage?: string | null;
    processor?: string | null;
    graphics?: string | null;
    display?: string | null;
    ram?: string | null;
    battrey?: string | null;
    status?: string | null;
    price?: string | null;
    channel_name: string;
    channel: string;
    posted_at: string;
    images: LaptopImage[];
    color?: string | null;
  };
}

export interface PaginatedLaptopPostList {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: LaptopPost[];
}

export interface Chat {
  channel_id: number;
  chat_posts: string;
  username?: string | null;
  title: string;
  description?: string | null;
  member_count?: number | null;
  is_verified?: boolean;
  is_private?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  profile_photo: string;
  language?: string | null;
  category?: string | null;
}

export interface PaginatedChatList {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Chat[];
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password: string;
}

export interface UserProfile {
  id: number;
  email: string;
  is_verified: boolean;
  date_joined: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_picture: string | null;
  bio: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

async function postJSON<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const firstMsg =
      Object.values(err)
        .flat()
        .find((v): v is string => typeof v === "string") ??
      `HTTP ${res.status}`;
    throw new Error(firstMsg);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function deleteJSON(path: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function patchJSON<T>(
  path: string,
  body: unknown,
  token: string,
  method: "PUT" | "PATCH" = "PATCH",
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const firstMsg =
      Object.values(err)
        .flat()
        .find((v): v is string => typeof v === "string") ??
      `HTTP ${res.status}`;
    throw new Error(firstMsg);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function patchFormData<T>(
  path: string,
  body: FormData,
  token: string,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const firstMsg =
      Object.values(err)
        .flat()
        .find((v): v is string => typeof v === "string") ??
      `HTTP ${res.status}`;
    throw new Error(firstMsg);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function getJSONAuth<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null as T;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  laptops: {
    list: (page = 1, q = "") => {
      const params = new URLSearchParams({ page: String(page) });
      if (q.trim()) params.set("q", q.trim());
      return fetchJSON<PaginatedLaptopPostList>(
        `${BASE_URL}/laptops/?${params}`,
      );
    },
    retrieve: (uuid: string) =>
      fetchJSON<LaptopPost>(`${BASE_URL}/laptops/${uuid}/`),
  },
  chats: {
    list: (page = 1) =>
      fetchJSON<PaginatedChatList>(`${BASE_URL}/chats/?page=${page}`),
    retrieve: (channelId: number) =>
      fetchJSON<Chat>(`${BASE_URL}/chats/${channelId}/`),
  },
  chat: {
    posts: (channelId: number, page = 1) =>
      fetchJSON<PaginatedLaptopPostList>(
        `${BASE_URL}/chat/${channelId}?page=${page}`,
      ),
  },
  auth: {
    register: (data: RegisterData) =>
      postJSON<{ email: string }>("/auth/register/", data),
    login: (email: string, password: string) =>
      postJSON<TokenResponse>("/token/", { email, password }),
    changePassword: (
      token: string,
      data: { old_password: string; new_password: string },
    ) => postJSON<void>("/auth/password/change/", data, token),
    requestPasswordReset: (email: string) =>
      postJSON<void>("/auth/password/reset/request/", { email }),
    confirmPasswordReset: (data: {
      token: string;
      uid: string;
      new_password: string;
    }) => postJSON<void>("/auth/password/reset/confirm/", data),
    verifyEmail: (uid: string, token: string) =>
      postJSON<void>("/auth/email/verify/", { uid, token }),
    resendVerification: (accessToken: string) =>
      postJSON<void>("/auth/email/resend/", {}, accessToken),
  },
  profile: {
    get: (token: string) => getJSONAuth<UserProfile>("/auth/profile/", token),
    update: (token: string, data: FormData) =>
      patchFormData<UserProfile>("/auth/profile/", data, token),
    deleteAccount: (token: string) =>
      deleteJSON("/auth/profile/delete/", token),
  },
  reviews: {
    create: (
      uuid: string,
      token: string,
      data: { rating: number; comment?: string },
    ) => postJSON<Review>(`/laptops/${uuid}/reviews/`, data, token),
    destroy: (id: number, token: string) =>
      deleteJSON(`/reviews/${id}/`, token),
    // New: manage your own review via product UUID
    getMine: (uuid: string, token: string) =>
      getJSONAuth<Review | null>(`/laptops/${uuid}/reviews/mine/`, token),
    updateMine: (
      uuid: string,
      token: string,
      data: { rating: number; comment?: string },
    ) => patchJSON<Review>(`/laptops/${uuid}/reviews/mine/`, data, token),
    deleteMine: (uuid: string, token: string) =>
      deleteJSON(`/laptops/${uuid}/reviews/mine/`, token),
  },
};
