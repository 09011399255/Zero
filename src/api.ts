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

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  patientId?: string;
  name: string;
  initials: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:00 AM"
  doctor: string;
  department: string;
  status: AppointmentStatus;
  bookedVia: 'zero' | 'manual';
  notes?: string;
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
    list: (params?: { recall?: boolean }) => {
      const query = params?.recall ? "?recall=true" : "";
      return request<any[]>("GET", `/api/patients${query}`);
    },
    get: (id: string) =>
      request<any>("GET", `/api/patients/${id}`),
    create: (body: {
      name: string;
      phone: string;
      email?: string;
      dob?: string;
      gender?: string;
      primaryDoctor?: string;
      recallStatus?: string;
      recallReason?: string;
    }) => request<any>("POST", "/api/patients", body),
  },
  appointments: {
    list: (params?: { from?: string; to?: string; status?: string; doctor?: string }) => {
      const query = new URLSearchParams();
      if (params?.from) query.append("from", params.from);
      if (params?.to) query.append("to", params.to);
      if (params?.status) query.append("status", params.status);
      if (params?.doctor) query.append("doctor", params.doctor);
      const qs = query.toString();
      return request<Appointment[]>("GET", `/api/appointments${qs ? `?${qs}` : ""}`);
    },
    create: (body: {
      patientId?: string;
      patientName: string;
      doctor: string;
      date: string;         // "YYYY-MM-DD"
      time: string;         // "HH:MM"
      visitType: string;
      bookedVia: "manual";  // always "manual" when created from dashboard
    }) => request<Appointment>("POST", "/api/appointments", body),
    update: (id: string, body: Partial<{
      status: AppointmentStatus;
      date: string;
      time: string;
      doctor: string;
    }>) => request<Appointment>("PATCH", `/api/appointments/${id}`, body),
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
