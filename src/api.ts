const BASE_URL = "https://zero-ai-production-5544.up.railway.app";

function getToken(): string | null {
  return localStorage.getItem("zero_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (requiresAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw { status: res.status, ...error };
  }
  return res.json();
}

export type QueueStatus = "WAITING" | "WITH_DOCTOR" | "COMPLETED" | "NO_SHOW";

export interface QueueResponse {
  waiting: any[];
  with_doctor: any[];
  completed: any[];
  no_show: any[];
}

export const api = {
  auth: {
    register: (body: {
      fullName: string;
      email: string;
      password: string;
      clinicName: string;
    }) => request<{ token: string; staff: { clinicId?: string }; clinic: { id?: string } }>(
      "POST", "/api/auth/register", body, false
    ),
    login: (body: { email: string; password: string }) =>
      request<{
        token: string;
        staff: { clinicId?: string };
        clinic: { id?: string };
        onboardingComplete: boolean;
      }>("POST", "/api/auth/login", body, false),
  },
  clinic: {
    get: () => request<any>("GET", "/api/clinic"),
    update: (body: any) => request<any>("PATCH", "/api/clinic", body),
  },
  staff: {
    list: () => request<any[]>("GET", "/api/staff"),
    create: (body: { fullName: string; role: 'ADMIN' | 'PHYSICIAN' | 'STAFF'; email: string }) => 
      request<any>("POST", "/api/staff", body),
  },
  patients: {
    list: () => request<any[]>("GET", "/api/patients"),
    create: (body: { name: string; phone: string; age?: number; gender?: string; complaint?: string }) => 
      request<any>("POST", "/api/patients", body),
    getById: (id: string) => request<any>("GET", `/api/patients/${id}`),
  },
  appointments: {
    list: () => request<any[]>("GET", "/api/appointments"),
    create: (body: { patientId: string; patientName: string; patientPhone: string; doctorName?: string; scheduledAt: string }) => 
      request<any>("POST", "/api/appointments", body),
    updateStatus: (id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW') => 
      request<any>("PATCH", `/api/appointments/${id}`, { status }),
  },
  queue: {
    get: () => request<QueueResponse>("GET", "/api/queue"),
    addWalkIn: (body: {
      patientName: string;
      reason: string;
      doctor: string;
      source: "walk-in";
    }) => request<any>("POST", "/api/queue/walk-in", body),
    updateStatus: (patientId: string, status: QueueStatus) =>
      request<any>(
        "PATCH",
        `/api/queue/patients/${patientId}/status`,
        { status }
      ),
  }
};
