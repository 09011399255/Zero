const BASE_URL = "https://zero-ai-production-5544.up.railway.app";

// Fired whenever an authenticated request comes back 401 (expired/invalid
// token) so the app can react in one place instead of every call site
// needing to check for it.
export const UNAUTHORIZED_EVENT = "zero:unauthorized";

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
    // Backend error responses are shaped { error, code, details? } — normalize
    // to `message` here so every caller can just read err.message/err.code.
    const responseBody = await res.json().catch(() => ({ error: res.statusText }));
    if (requiresAuth && res.status === 401) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    // On a 429 the rate limiter reports seconds-until-reset. With
    // legacyHeaders off the standard `RateLimit-Reset` carries it; keep
    // `Retry-After` as a fallback. Surfaced so callers can show "try again
    // in X". (Both are CORS-exposed by the backend, else fetch hides them.)
    const resetHeader = res.headers.get("Retry-After") || res.headers.get("RateLimit-Reset");
    const retryAfter = resetHeader ? parseInt(resetHeader, 10) : undefined;
    throw {
      status: res.status,
      message: responseBody.error || responseBody.message || res.statusText,
      code: responseBody.code,
      details: responseBody.details,
      retryAfter: Number.isFinite(retryAfter) ? retryAfter : undefined,
    };
  }
  return res.json();
}

export type QueueStatus = "WAITING" | "WITH_DOCTOR" | "COMPLETED" | "NO_SHOW";

// One queue row as the backend formats it (formatQueuePatient).
export interface QueuePatientDTO {
  id: string;
  patientId: string | null;
  name: string;
  initials: string;
  phone: string;
  queueNumber: number | null;
  arrivalTime: string;
  doctor: string | null;
  reason: string;
  waitTime: string;
  status: string;
  source: 'zero' | 'walk-in';
}

export interface QueueResponse {
  waiting: QueuePatientDTO[];
  withDoctor: QueuePatientDTO[];
  completed: QueuePatientDTO[];
  noShow: QueuePatientDTO[];
  total?: number;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: string;
  patientId?: string | null;
  patientName: string;
  patientPhone: string;
  doctor: string;
  date: string;
  time: string;
  visitType?: string | null;
  status: AppointmentStatus;
  bookedVia: 'zero' | 'manual';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ConversationStatus =
  | "AI_HANDLING"
  | "NEEDS_REVIEW"
  | "STAFF_TOOK_OVER"
  | "RESOLVED";

export interface ConversationMessage {
  id: string;
  role: "ai" | "patient" | "staff" | "system";
  text: string;
  createdAt: string;
  senderName?: string;
}

export interface Conversation {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  status: ConversationStatus;
  urgency: "urgent" | "admin" | "none";
  escalationReason?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  messages?: ConversationMessage[];
  assignedStaff?: string;
}

export interface PatientHistoryItem {
  date: string;
  doctor: string;
  reason: string;
  notes: string;
}

export interface PatientIntakeNotes {
  symptoms?: string;
  structuredAnswers?: { question: string; answer: string }[];
  dob?: string;
  gender?: string;
  primaryDoctor?: string;
  lastVisit?: string;
  nextAppointment?: string;
  reasonForVisit?: string;
  services?: string[];
}

export interface PatientChatMessage {
  sender: 'ai' | 'patient';
  text: string;
  time: string;
}

export interface Patient {
  id: string;
  name: string;
  initials: string;
  phone: string;
  lastVisit: string;
  nextAppointment: string;
  recallStatus: 'UP_TO_DATE' | 'DUE_SOON' | 'OVERDUE' | 'NA';
  conversationsCount: number;
  recallReason?: string;
  aiOutreachDraft?: string;
  history: PatientHistoryItem[];
  intakeNotes?: PatientIntakeNotes;
  conversations: PatientChatMessage[];
}

export interface MeResponse {
  staff: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
  clinic?: {
    id: string;
    name: string;
    address?: string;
    services?: string[];
    whatsappStatus?: string;
    plan?: string;
  } | null;
  onboardingComplete: boolean;
  // True when the signed-in user may open the internal Zero admin dashboard.
  isPlatformAdmin?: boolean;
}

export interface DashboardSummary {
  clinicName: string;
  patientsToday: number;
  doctorsOnDuty: number;
  conversationsNeedingAttention: number;
  aiActivity: {
    conversationsHandledToday: number;
    escalatedToStaff: number;
    avgResponseTimeSeconds: number;
  };
  queueSnapshot: { waiting: number; withDoctor: number; completedToday: number };
  aiAutonomy: {
    autonomyRatePercent: number;
    autopilotSessions: number;
    manualEscalations: number;
    recallSuccessRatePercent: number;
    insightLine: string;
  };
}

// Mirrors the Prisma WhatsAppStatus enum in zero-ai.
// AWAITING_OTP = we've triggered Meta; the clinic must now enter the code.
export type WhatsAppStatus =
  | 'NOT_CONNECTED'
  | 'VERIFICATION_PENDING'
  | 'AWAITING_OTP'
  | 'CONNECTED'
  | 'SANDBOX';

export interface WhatsAppStatusResponse {
  whatsappStatus: WhatsAppStatus;
  phoneNumber: string | null;
  phoneNumberId: string | null;
  // Present during / after a manual connection request.
  whatsappRequestedNumber?: string | null;
  whatsappSetupChoice?: 'new' | 'migrate' | null;
  whatsappOtpSubmittedAt?: string | null;
}

// One clinic as seen in the internal admin dashboard's WhatsApp pipeline.
export interface AdminClinic {
  id: string;
  name: string;
  whatsappStatus: WhatsAppStatus;
  requestedNumber: string | null;
  setupChoice: 'new' | 'migrate' | null;
  notifyEmail: string | null;
  requestedAt: string | null;
  clinicReadyAt: string | null;
  otpCode: string | null;
  otpSubmittedAt: string | null;
  phoneNumber: string | null;
  phoneNumberId: string | null;
}

// ── Admin console shapes ───────────────────────────────────────────────────
export interface AdminOverview {
  clinics: number;
  active: number;
  suspended: number;
  whatsappConnected: number;
  patients: number;
  conversations: number;
  staff: number;
  newThisMonth: number;
}

// One row in the admin clinics table.
export interface AdminClinicRow {
  id: string;
  name: string;
  plan: string;
  whatsappStatus: WhatsAppStatus;
  suspended: boolean;
  adminEmail: string | null;
  patientCount: number;
  staffCount: number;
  createdAt: string;
}

export interface AdminClinicStaff {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

// Full clinic detail for the admin drawer.
export interface AdminClinicDetail {
  id: string;
  name: string;
  address: string | null;
  services: string[];
  openDays: number[];
  opensAt: string;
  closesAt: string;
  plan: string;
  planExpiresAt: string | null;
  whatsappStatus: WhatsAppStatus;
  phoneNumber: string | null;
  phoneNumberId: string | null;
  suspended: boolean;
  suspendedAt: string | null;
  onboardingCompletedAt: string | null;
  createdAt: string;
  staff: AdminClinicStaff[];
  counts: { patients: number; appointments: number; conversations: number };
}

// Clinic shape returned by GET /api/clinic (backend formatClinic).
export interface ClinicDTO {
  id: string;
  name: string;
  address: string | null;
  servicesOffered: string[];
  operatingHours: { days: string[]; openTime: string; closeTime: string };
  whatsappStatus: WhatsAppStatus;
  phoneNumber: string | null;
  plan: string;
  escalationAlerts: boolean;
  recallReminders: boolean;
  noShowAlerts: boolean;
  dailySummaryEmail: boolean;
  createdAt: string;
  updatedAt: string;
}

// Body accepted by PATCH /api/clinic (backend UpdateClinicSchema).
export interface ClinicUpdate {
  name?: string;
  address?: string;
  servicesOffered?: string[];
  operatingHours?: { days?: string[]; openTime?: string; closeTime?: string };
  escalationAlerts?: boolean;
  recallReminders?: boolean;
  noShowAlerts?: boolean;
  dailySummaryEmail?: boolean;
}

// Raw notification row from the backend (Prisma Notification model).
export interface NotificationDTO {
  id: string;
  type: string; // 'escalation' | 'noshow' | 'recall' | ...
  title: string;
  body: string;
  metadata: { conversationId?: string; appointmentId?: string; patientId?: string } | null;
  isRead: boolean;
  createdAt: string;
}

export interface StaffMemberDTO {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'PHYSICIAN' | 'STAFF';
  specialization?: string | null;
  whatsappNumber?: string | null;
  lastLoginAt?: string | null;
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
    verifyEmail: (body: { token: string }) =>
      request<{ success: boolean; message: string }>("POST", "/api/auth/verify-email", body, false),
    resendVerification: (body: { email: string }) =>
      request<{ success: boolean }>("POST", "/api/auth/resend-verification", body, false),
    forgotPassword: (body: { email: string }) =>
      request<{ success: boolean }>("POST", "/api/auth/forgot-password", body, false),
    resetPassword: (body: { token: string; password: string }) =>
      request<{ success: boolean; message: string }>("POST", "/api/auth/reset-password", body, false),
    me: () =>
      request<MeResponse>("GET", "/api/auth/me"),
  },
  clinic: {
    get: () => request<ClinicDTO>("GET", "/api/clinic"),
    update: (body: ClinicUpdate) => request<ClinicDTO>("PATCH", "/api/clinic", body),
    completeOnboarding: () => request<ClinicDTO>("POST", "/api/clinic/complete-onboarding"),
    whatsappStatus: () => request<WhatsAppStatusResponse>("GET", "/api/clinic/whatsapp-status"),

    // ── Manual "concierge" WhatsApp connection (current live flow) ──────────
    // The clinic submits the number they want connected; our team adds it to
    // our Meta Business Manager by hand and relays the OTP for them.
    requestWhatsapp: (body: {
      phoneNumber: string;
      email: string;
      setupChoice: 'new' | 'migrate';
    }) => request<WhatsAppStatusResponse>("POST", "/api/clinic/request-whatsapp", body),
    // "I'm ready to receive my code" — nudges our team to run verification now.
    whatsappReady: () =>
      request<{ success: boolean; whatsappStatus: WhatsAppStatus }>("POST", "/api/clinic/whatsapp-ready"),
    // Clinic relays the code Meta texted them.
    submitOtp: (body: { code: string }) =>
      request<{ success: boolean; whatsappStatus: WhatsAppStatus; whatsappOtpSubmittedAt: string | null }>(
        "POST", "/api/clinic/submit-otp", body
      ),

    // ── Meta self-serve Embedded Signup (parked until Meta verification clears) ─
    // Not called by the current UI, kept for the eventual switch back. Hands
    // Meta's popup result to the backend to exchange for a token.
    connectWhatsapp: (body: {
      code: string;
      phoneNumberId: string;
      wabaId: string;
      phoneNumber?: string;
    }) => request<WhatsAppStatusResponse>("POST", "/api/clinic/connect-whatsapp", body),
    disconnectWhatsapp: () =>
      request<{ success: boolean; whatsappStatus: WhatsAppStatus }>("POST", "/api/clinic/disconnect-whatsapp"),
  },

  // Internal Zero-team dashboard. Every call is 403'd by the backend unless the
  // signed-in user's email is in PLATFORM_ADMIN_EMAILS.
  admin: {
    // Console
    overview: () => request<AdminOverview>("GET", "/api/admin/overview"),
    clinics: () => request<AdminClinicRow[]>("GET", "/api/admin/clinics"),
    clinic: (id: string) => request<AdminClinicDetail>("GET", `/api/admin/clinics/${id}`),
    suspend: (id: string) =>
      request<{ id: string; suspended: boolean }>("POST", `/api/admin/clinics/${id}/suspend`),
    reactivate: (id: string) =>
      request<{ id: string; suspended: boolean }>("POST", `/api/admin/clinics/${id}/reactivate`),

    // WhatsApp connection pipeline
    whatsappPipeline: () => request<AdminClinic[]>("GET", "/api/admin/whatsapp-pipeline"),
    // Team is about to trigger Meta's code send → flips clinic to AWAITING_OTP.
    sendOtp: (id: string) =>
      request<AdminClinic>("POST", `/api/admin/clinics/${id}/send-otp`),
    // Number is verified & live on our WABA → store its phoneNumberId, go live.
    markConnected: (id: string, body: { phoneNumberId: string; phoneNumber?: string }) =>
      request<AdminClinic>("POST", `/api/admin/clinics/${id}/mark-connected`, body),
    // Send the clinic back to the start (wrong number, redo, etc.).
    reset: (id: string) =>
      request<AdminClinic>("POST", `/api/admin/clinics/${id}/reset`),
  },
  staff: {
    list: () => request<StaffMemberDTO[]>("GET", "/api/staff"),
    create: (body: {
      fullName: string;
      email: string;
      role: 'ADMIN' | 'PHYSICIAN' | 'STAFF';
      specialization?: string;
    }) => request<StaffMemberDTO>("POST", "/api/staff", body),
    remove: (id: string) => request<{ success: boolean }>("DELETE", `/api/staff/${id}`),
  },
  analytics: {
    dashboard: () => request<DashboardSummary>("GET", "/api/analytics/dashboard"),
  },
  notifications: {
    list: () => request<NotificationDTO[]>("GET", "/api/notifications"),
    markRead: (id: string) => request<{ success: boolean }>("PATCH", `/api/notifications/${id}/read`),
    markAllRead: () => request<{ success: boolean }>("PATCH", "/api/notifications/read-all"),
  },
  patients: {
    list: (params?: { recall?: boolean }) => {
      const query = params?.recall ? "?recall=true" : "";
      return request<Patient[]>("GET", `/api/patients${query}`);
    },
    get: (id: string) =>
      request<Patient>("GET", `/api/patients/${id}`),
    create: (body: {
      name: string;
      phone: string;
      email?: string;
      dob?: string;
      gender?: string;
      primaryDoctor?: string;
      recallStatus?: string;
      recallReason?: string;
    }) => request<Patient>("POST", "/api/patients", body),
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
      patientPhone: string;
      doctor?: string;
      doctorName?: string;
      date?: string;
      time?: string;
      scheduledAt: string;
      visitType?: string;
      bookedVia: "manual";
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
      name: string;
      phone: string;
      reason: string;
      doctor: string;
      source: "walk-in";
    }) => request<QueuePatientDTO>("POST", "/api/queue/walk-in", body),
    updateStatus: (patientId: string, status: QueueStatus) =>
      request<QueuePatientDTO>(
        "PATCH",
        `/api/queue/patients/${patientId}/status`,
        { status }
      ),
  },
  conversations: {
    list: (params?: { status?: string }) => {
      const query = params?.status ? `?status=${params.status}` : "";
      return request<Conversation[]>("GET", `/api/conversations${query}`);
    },
    counts: () =>
      request<{ needs_review: number; ai_handling: number; resolved: number }>(
        "GET",
        "/api/conversations/counts"
      ),
    get: (id: string) =>
      request<Conversation>("GET", `/api/conversations/${id}`),
    takeOver: (id: string) =>
      request<Conversation>("POST", `/api/conversations/${id}/take-over`, {}),
    reply: (id: string, body: { text: string }) =>
      request<ConversationMessage>(
        "POST",
        `/api/conversations/${id}/reply`,
        body
      ),
    resolve: (id: string) =>
      request<Conversation>("POST", `/api/conversations/${id}/resolve`, {}),
  },
};
