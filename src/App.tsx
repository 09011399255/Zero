import { useState, useEffect, useRef } from 'react';
import { api, Appointment, AppointmentStatus, Conversation, ConversationMessage, ConversationStatus, DashboardSummary, Patient, StaffMemberDTO, UNAUTHORIZED_EVENT } from './api';

import { io, Socket } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  RefreshCw,
} from 'lucide-react';
import {
  mockAppointments,
  mockPatients
} from './mockData';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NotificationItem } from './components/layout/NotificationsDropdown';
import { LiveQueuePage } from './features/live-queue/LiveQueuePage';
import { SettingsPage, StaffListItem } from './features/settings/SettingsPage';
import { PatientsPage } from './features/patients/PatientsPage';
import { AddPatientModal } from './features/patients/AddPatientModal';
import { PatientOutreachDrawer } from './features/patients/PatientOutreachDrawer';
import { PatientDetailDrawer } from './features/patients/PatientDetailDrawer';
import { AppointmentsPage } from './features/appointments/AppointmentsPage';
import { AppointmentDetailDrawer } from './features/appointments/AppointmentDetailDrawer';
import { NewAppointmentDrawer } from './features/appointments/NewAppointmentDrawer';
import { ZeroChatPage } from './features/zero-chat/ZeroChatPage';
import { VerifyEmailPage } from './features/auth/VerifyEmailPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { OnboardingWizard } from './features/onboarding/OnboardingWizard';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { useToast } from './components/shared/Toast';
import { formatAuthError } from './lib/authErrors';

const mappedMockAppointments: Appointment[] = mockAppointments.map(apt => ({
  id: apt.id,
  patientId: apt.patientId || null,
  patientName: apt.name,
  patientPhone: apt.phone,
  doctor: apt.doctor,
  date: apt.date,
  time: apt.time,
  visitType: apt.department,
  status: apt.status.toLowerCase() as AppointmentStatus,
  bookedVia: apt.bookedVia,
  notes: apt.notes
}));



interface QueueEntry {
  id: string;
  patientId?: string | null;
  name: string;
  initials: string;
  phone: string;
  arrivalTime: string;
  doctor: string;
  reason: string;
  waitTime: string;
  source: 'zero' | 'walk-in' | 'manual';
  status: string;
}

const initialQueue: QueueEntry[] = [
  {
    id: "bf3a302a-50e5-5914-e2a2-da9287b3ca61",
    patientId: "e58d0777-a222-3615-ef17-9d0b0040e9bd",
    name: "Min Farshaw",
    initials: "MF",
    phone: "+1 (555) 022-7766",
    arrivalTime: "10:15 AM",
    doctor: "Dr. Lan Mandragoran",
    reason: "Routine prenatal checkup",
    waitTime: "~12 min",
    source: "zero",
    status: "waiting"
  },
  {
    id: "281e9b0c-43a9-d256-3a44-5b630b1c56d0",
    patientId: "9741499a-aa80-5af7-3c51-ad75dd3b8094",
    name: "Matrim Cauthon",
    initials: "MC",
    phone: "+1 (555) 018-4321",
    arrivalTime: "10:07 AM",
    doctor: "Dr. Lan Mandragoran",
    reason: "Cardiology follow-up",
    waitTime: "~20 min",
    source: "zero",
    status: "waiting"
  },
  {
    id: "d0e4ff40-6728-616d-278e-e55cd537a864",
    patientId: "740556e2-7ef9-2020-8fc2-e783b6ea888a",
    name: "Perrin Aybara",
    initials: "PA",
    phone: "+1 (555) 017-9876",
    arrivalTime: "10:02 AM",
    doctor: "Dr. Moiraine Damodred",
    reason: "Diabetic foot check",
    waitTime: "~25 min",
    source: "walk-in",
    status: "waiting"
  },
  {
    id: "f22de231-a3e8-39a0-d4ab-985809feeee0",
    patientId: "2e7b1d36-5288-286a-4c63-a70c0c4e529c",
    name: "Aviendha",
    initials: "AV",
    phone: "+1 (555) 023-5544",
    arrivalTime: "09:55 AM",
    doctor: "Dr. Moiraine Damodred",
    reason: "Migraine consult",
    waitTime: "~32 min",
    source: "zero",
    status: "waiting"
  },
  {
    id: "78c546e7-3c93-3c9a-7ff9-e681852db45d",
    patientId: null,
    name: "Loial Son of Arent",
    initials: "LS",
    phone: "+1 (555) 035-1234",
    arrivalTime: "09:42 AM",
    doctor: "Dr. Moiraine Damodred",
    reason: "Joint pain examination",
    waitTime: "~45 min",
    source: "walk-in",
    status: "waiting"
  },
  {
    id: "13d66642-f344-766e-33f6-f4b281667471",
    patientId: "cb1ac7ae-fbcb-d748-82a4-d5f4f99da0a6",
    name: "Nynaeve al'Meara",
    initials: "NM",
    phone: "+1 (555) 019-2834",
    arrivalTime: "09:30 AM",
    doctor: "Dr. Lan Mandragoran",
    reason: "Hypertension checkup",
    waitTime: "~57 min",
    source: "zero",
    status: "waiting"
  },
  {
    id: "dd099091-4090-4ed3-07a4-d817834d0ec3",
    patientId: "9822c35c-fe20-d5a8-1afb-ec00664b51c9",
    name: "Rand al'Thor",
    initials: "RT",
    phone: "+1 (555) 012-3456",
    arrivalTime: "09:37 AM",
    doctor: "Dr. Lan Mandragoran",
    reason: "Migraine follow-up check",
    waitTime: "—",
    source: "zero",
    status: "with_doctor"
  },
  {
    id: "0091ecc4-cb31-1659-fb4b-3515bcc26b53",
    patientId: "bb852bc4-3370-4eac-d311-3a8329dd905c",
    name: "Egwene al'Vere",
    initials: "EA",
    phone: "+1 (555) 015-6789",
    arrivalTime: "09:32 AM",
    doctor: "Dr. Moiraine Damodred",
    reason: "Routine blood panel review",
    waitTime: "—",
    source: "zero",
    status: "with_doctor"
  },
  {
    id: "42c22aef-1c75-559c-3d43-9f80e0e32462",
    patientId: "44437c83-f938-d569-4afb-28b8df23bf97",
    name: "Elayne Trakand",
    initials: "ET",
    phone: "+1 (555) 021-9988",
    arrivalTime: "08:00 AM",
    doctor: "Dr. Moiraine Damodred",
    reason: "General follow-up",
    waitTime: "—",
    source: "zero",
    status: "completed"
  },
  {
    id: "28c8c38b-bb5e-87b3-6cb6-40d1936d8df6",
    patientId: "adc302cc-323b-428f-e108-6a7852208f98",
    name: "Thom Merrilin",
    initials: "TM",
    phone: "+1 (555) 024-8899",
    arrivalTime: "08:15 AM",
    doctor: "Dr. Moiraine Damodred",
    reason: "Throat irritation check",
    waitTime: "—",
    source: "walk-in",
    status: "completed"
  },
  {
    id: "a0dd6f90-56d6-de61-2b25-0a801c5ea504",
    patientId: "3d355419-986a-0109-6669-c6f315fed274",
    name: "Birgitte Silverbow",
    initials: "BS",
    phone: "+1 (555) 025-1122",
    arrivalTime: "08:30 AM",
    doctor: "Dr. Lan Mandragoran",
    reason: "Vision acuity review",
    waitTime: "—",
    source: "zero",
    status: "completed"
  },
  {
    id: "6dea5e39-8b82-81b6-d815-2ae5441afd91",
    patientId: "6b120d55-6f79-a375-d410-153583664610",
    name: "Siuan Sanche",
    initials: "SS",
    phone: "+1 (555) 026-3344",
    arrivalTime: "08:45 AM",
    doctor: "Dr. Lan Mandragoran",
    reason: "Routine screening follow-up",
    waitTime: "—",
    source: "zero",
    status: "completed"
  },
  {
    id: "53cfb6c8-9850-0192-b832-81831d386aa2",
    patientId: "3ca18d22-e754-620a-6318-8c86281831dc",
    name: "Gareth Bryne",
    initials: "GB",
    phone: "+1 (555) 027-5566",
    arrivalTime: "09:00 AM",
    doctor: "Dr. Moiraine Damodred",
    reason: "Physical therapy review",
    waitTime: "—",
    source: "zero",
    status: "completed"
  },
  {
    id: "8abbd8a2-8fbd-ce27-446f-c84ce580f13b",
    patientId: "2bfffa51-1780-6086-af02-d39518b7300e",
    name: "Galad Damodred",
    initials: "GD",
    phone: "+1 (555) 028-7788",
    arrivalTime: "—",
    doctor: "Dr. Lan Mandragoran",
    reason: "Eye strain checkup",
    waitTime: "—",
    source: "zero",
    status: "no_show"
  },
  {
    id: "05cf9f8c-d6c2-53d5-8b70-ac10ef4d7358",
    patientId: "71e3e0fa-100c-4482-5796-5ccb9f5be3af",
    name: "Gawyn Trakand",
    initials: "GT",
    phone: "+1 (555) 029-9900",
    arrivalTime: "—",
    doctor: "Dr. Moiraine Damodred",
    reason: "Knee pain evaluation",
    waitTime: "—",
    source: "zero",
    status: "no_show"
  }
];



function App() {
  // Real URL-based routing bridge: `currentRoute` is derived from the actual
  // browser URL (so back/forward and refresh-on-any-route work), and
  // `setCurrentRoute` navigates to it — every existing `currentRoute === 'x'`
  // check and `setCurrentRoute('x')` call elsewhere in this file keeps
  // working unchanged. This is intentionally a thin bridge, not a full
  // <Routes> tree — that emerges naturally as each feature gets extracted
  // into its own routed page component in later migration phases.
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const currentRoute = location.pathname === '/' ? 'dashboard' : location.pathname.slice(1);
  const setCurrentRoute = (route: string) => navigate('/' + route);
  // Mobile sidebar drawer (hamburger). Always-open on lg+ via CSS.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => { setIsSidebarOpen(false); }, [currentRoute]);
  const [dismissedAttentionIds, setDismissedAttentionIds] = useState<string[]>([]);
  const [queueLoaded, setQueueLoaded] = useState(false);
  const [appointmentsLoadedThisSession, setAppointmentsLoadedThisSession] = useState(false);
  const [conversationsLoadedThisSession, setConversationsLoadedThisSession] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>(mappedMockAppointments);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    // Auth & Session States
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(localStorage.getItem("zero_clinic_id"));
  const [queueLoading, setQueueLoading] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);

  // New Email Verification States
  const [isVerificationPending, setIsVerificationPending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'expired' | 'invalid' | 'missing'>('loading');

  // Forgot / Reset Password States
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [resetPasswordState, setResetPasswordState] = useState<'form' | 'submitting' | 'success' | 'invalid' | 'expired' | 'missing'>('form');

  // Clears all session state and returns the user to the login screen —
  // used both for the manual "Log out" button and for the automatic
  // logout that fires when any API call comes back 401 (expired/invalid token).
  const handleLogout = () => {
    localStorage.removeItem("zero_token");
    localStorage.removeItem("zero_clinic_id");
    setClinicId(null);
    setIsOnboarded(false);
    setOnboardingStep(1);
    setOnboardingAuthMode('login');
  };

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, handleLogout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleLogout);
  }, []);

    // Resend email verification timer & handler
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Poll for email verification while on the "Check your email" screen —
  // if the link gets clicked on a different device/tab, this tab has no
  // other way to find out. checkSession() clears isVerificationPending
  // once the backend reports the account as verified, which stops this
  // poll and (per checkSession's own logic) redirects to onboarding/
  // dashboard automatically, with no manual refresh needed.
  useEffect(() => {
    if (!isVerificationPending) return;
    const interval = setInterval(() => {
      checkSession();
    }, 4000);
    return () => clearInterval(interval);
  }, [isVerificationPending]);

  const handleResendVerification = async (email: string) => {
    if (resendCooldown > 0) return;
    try {
      setResendCooldown(30);
      await api.auth.resendVerification({ email });
      toast.success("Verification email sent. Check your inbox.");
    } catch (err: any) {
      console.error("Failed to resend verification:", err);
      toast.error(formatAuthError(err, "Couldn't resend the verification email. Please try again."));
    }
  };

  const checkSession = async () => {
    try {
      const res = await api.auth.me();
      const staff = res.staff;
      const clinic = res.clinic;

      if (staff?.email) {
        setOnboardingEmail(staff.email);
      }
      if (staff?.fullName) {
        setOnboardingAdminName(staff.fullName);
      }

      if (clinic?.id) {
        localStorage.setItem("zero_clinic_id", clinic.id);
        setClinicId(clinic.id);
      }
      // Seed the clinic name app-wide (header/sidebar) right after login, so it
      // isn't blank until the user happens to open Settings.
      if (clinic?.name) {
        setSettingsClinicName(clinic.name);
        setSavedClinicName(clinic.name);
      }

      if (staff && !staff.emailVerified) {
        setIsVerificationPending(true);
        setOnboardingStep(1);
        setIsOnboarded(false);
        return;
      }

      // Verified — stop polling / clear the pending flag in case we got
      // here from the auto-poll on the "check your email" screen (e.g.
      // the user verified on a different device).
      setIsVerificationPending(false);

      // onboardingComplete is now tracked server-side (Clinic.onboardingCompletedAt),
      // set once the wizard's "Go to Dashboard" step calls api.clinic.completeOnboarding().
      // That makes it sync across devices — a clinic that finished the wizard on desktop
      // won't see it again logging in from a phone that never touched it locally.
      if (res.onboardingComplete) {
        setIsOnboarded(true);
        setCurrentRoute("dashboard");
      } else {
        setOnboardingStep(2);
        setIsOnboarded(false);
      }
    } catch (err: any) {
      if (err.status === 401) {
        localStorage.removeItem("zero_token");
        localStorage.removeItem("zero_clinic_id");
        setClinicId(null);
      }
    } finally {
      setSessionChecked(true);
    }
  };

  // Session Check on App Load
  useEffect(() => {
    // currentRoute is derived from the URL now, so it's already correct on
    // these two routes without calling setCurrentRoute — doing so would
    // navigate() and strip the ?token= query string (and combined with
    // StrictMode's double-invoke of this effect, that self-corrupts the
    // second read below into thinking the token is missing).
    if (window.location.pathname === '/verify-email') {
      setSessionChecked(true);
      return;
    }

    // Check if we are on the reset-password page
    if (window.location.pathname === '/reset-password') {
      const token = new URLSearchParams(window.location.search).get('token');
      setResetPasswordToken(token);
      setResetPasswordState(token ? 'form' : 'missing');
      setSessionChecked(true);
      return;
    }

    const token = localStorage.getItem("zero_token");
    if (!token) {
      setSessionChecked(true);
      return;
    }
    checkSession();
  }, []);

  // Email verification check
  useEffect(() => {
    if (currentRoute !== 'verify-email') return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setVerificationState('missing');
      return;
    }

    const verify = async () => {
      try {
        setVerificationState('loading');
        await api.auth.verifyEmail({ token });
        setVerificationState('success');
      } catch (err: any) {
        const code = err.code || (err.message && err.message.includes('EXPIRED') ? 'TOKEN_EXPIRED' : '');
        if (code === 'TOKEN_EXPIRED' || err.message === 'TOKEN_EXPIRED') {
          setVerificationState('expired');
        } else if (code === 'INVALID_TOKEN' || err.message === 'INVALID_TOKEN') {
          setVerificationState('invalid');
        } else if (code === 'MISSING_TOKEN' || err.message === 'MISSING_TOKEN') {
          setVerificationState('missing');
        } else {
          const msg = (err.message || '').toUpperCase();
          if (msg.includes('EXPIRE')) {
            setVerificationState('expired');
          } else {
            setVerificationState('invalid');
          }
        }
      }
    };

    verify();
  }, [currentRoute]);

  // Socket.io Connection & Listeners
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!clinicId) {
      if (socketRef.current) {
        const oldClinicId = localStorage.getItem("zero_clinic_id") || "";
        socketRef.current.emit("leave:clinic", oldClinicId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io("https://zero-ai-production-5544.up.railway.app");
    socketRef.current = socket;

    socket.emit("join:clinic", clinicId);

    socket.on("queue:updated", (payload: { patientId: string; status: string }) => {
      setQueue(prev =>
        prev.map(entry =>
          entry.patientId === payload.patientId
            ? { ...entry, status: payload.status }
            : entry
        )
      );
    });

    socket.on("queue:patient-added", (payload: { patient: QueueEntry }) => {
      setQueue(prev => [...prev, payload.patient]);
    });

        socket.on("appointment:created", (payload: { appointment: Appointment }) => {
      const normalized = { ...payload.appointment, time: formatTime12h(payload.appointment.time) };
      setAppointments(prev => [...prev, normalized]);
    });

    socket.on("appointment:updated", (payload: { appointment: Appointment }) => {
      const normalized = { ...payload.appointment, time: formatTime12h(payload.appointment.time) };
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === normalized.id ? normalized : apt
        )
      );
    });

    socket.on(
      "conversation:updated",
      (payload: { conversationId: string; status: string; lastMessage: string; escalated: boolean }) => {
        // Update matching conversation in local state
        setConversations(prev =>
          prev.map(conv =>
            conv.id === payload.conversationId
              ? { ...conv, status: payload.status as ConversationStatus, lastMessage: payload.lastMessage }
              : conv
          )
        );
        // If this is the currently open thread, reload it
        if (activeConversationRef.current?.id === payload.conversationId) {
          loadConversationThread(payload.conversationId);
        }
      }
    );

    socket.on(
      "conversation:escalated",
      (_payload: { conversationId: string; patientPhone: string; reason: string }) => {
        // Reload conversations to pick up the new NEEDS_REVIEW entry
        loadConversations();
        loadConversationCounts();
      }
    );

    return () => {
      socket.emit("leave:clinic", clinicId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [clinicId]);

  // Load Queue from Backend
  const loadQueue = async () => {
    try {
      setQueueLoading(true);
      setQueueError(null);
      const data = await api.queue.get();
      const allEntries = [
        ...(data.waiting ?? []),
        ...(data.withDoctor ?? []),
        ...(data.completed ?? []),
        ...(data.noShow ?? []),
      ];
      setQueue(allEntries);
      setQueueLoaded(true);
    } catch (err) {
      console.error("Failed to load queue:", err);
      setQueueError("Couldn't load live queue data.");
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    if (currentRoute === 'live-queue' && clinicId) {
      loadQueue();
    }
  }, [currentRoute, clinicId]);



  // Notifications State & Logic
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'escalation',
      title: 'Escalation Alert',
      description: "Escalation: patient reported chest tightness — Nynaeve al'Meara",
      time: '12 min ago',
      read: false,
      linkData: {
        route: 'zero-chat',
        patientId: "cb1ac7ae-fbcb-d748-82a4-d5f4f99da0a6"
      }
    },
    {
      id: 'notif-2',
      type: 'recall',
      title: 'Recall Reminder',
      description: 'Recall due: Elayne Trakand (due for 6-month checkup)',
      time: '1 hour ago',
      read: false,
      linkData: {
        route: 'patients',
        patientId: "44437c83-f938-d569-4afb-28b8df23bf97",
        tab: 'recalls'
      }
    },
    {
      id: 'notif-3',
      type: 'no-show',
      title: 'No-show Alert',
      description: 'No-show: Galad Damodred missed 09:30 AM appointment',
      time: '2 hours ago',
      read: false,
      linkData: {
        route: 'live-queue',
        tab: 'no_show'
      }
    },
    {
      id: 'notif-4',
      type: 'escalation',
      title: 'Billing Dispute Escalation',
      description: "Escalation: billing dispute requires human review — Egwene al'Vere",
      time: '4 hours ago',
      read: true,
      linkData: {
        route: 'zero-chat',
        patientId: "9741499a-aa80-5af7-3c51-ad75dd3b8094"
      }
    }
  ]);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setIsNotificationsDropdownOpen(false);

    if (notif.linkData.route === 'zero-chat') {
      if (notif.linkData.patientId !== undefined) {
        setSelectedChatId(notif.linkData.patientId);
      }
      setCurrentRoute('zero-chat');
    } else if (notif.linkData.route === 'patients') {
      setCurrentRoute('patients');
      if (notif.linkData.tab === 'recalls') {
        setPatientsTab('recall');
      }
      if (notif.linkData.patientId !== undefined) {
        setSelectedPatientId(notif.linkData.patientId);
      }
    } else if (notif.linkData.route === 'live-queue') {
      setCurrentRoute('live-queue');
      if (notif.linkData.tab === 'no_show') {
        setQueueTab('no_show');
      }
    }
  };

  // Handle click outside notifications dropdown to close it
  useEffect(() => {
    if (!isNotificationsDropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#notification-bell-btn') && !target.closest('#notification-dropdown-panel')) {
        setIsNotificationsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationsDropdownOpen]);

  // Patients screen states
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [patientsTab, setPatientsTab] = useState<'all' | 'recall'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<'history' | 'intake' | 'conversations'>('history');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOutreachId, setExpandedOutreachId] = useState<string | null>(null);
  const [editOutreachId, setEditOutreachId] = useState<string | null>(null);
  const [draftMessageText, setDraftMessageText] = useState('');

  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [recallLoading, setRecallLoading] = useState(false);
  const [recallError, setRecallError] = useState<string | null>(null);
  const [recallPatients, setRecallPatients] = useState<Patient[]>([]);

  // Add Patient Form states
  const [addPatientModalOpen, setAddPatientModalOpen] = useState(false);
  const [addPatientLoading, setAddPatientLoading] = useState(false);
  const [addPatientError, setAddPatientError] = useState<string | null>(null);
  const [addPatientName, setAddPatientName] = useState('');
  const [addPatientPhone, setAddPatientPhone] = useState('');
  const [addPatientEmail, setAddPatientEmail] = useState('');
  const [addPatientDob, setAddPatientDob] = useState('');
  const [addPatientGender, setAddPatientGender] = useState('Male');
  const [addPatientDoctor, setAddPatientDoctor] = useState('Dr. Lan Mandragoran');
  const [addPatientRecallStatus, setAddPatientRecallStatus] = useState('UP_TO_DATE');
  const [addPatientRecallReason, setAddPatientRecallReason] = useState('');

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDetailLoading, setPatientDetailLoading] = useState(false);

  // Load Patients from Backend
  const loadPatients = async () => {
    try {
      setPatientsLoading(true);
      setPatientsError(null);
      const data = await api.patients.list();
      setPatients(data);
    } catch (err) {
      console.error("Failed to load patients:", err);
      setPatientsError("Couldn't load patients.");
    } finally {
      setPatientsLoading(false);
    }
  };

  // Load Recall Patients from Backend
  const loadRecallPatients = async () => {
    try {
      setRecallLoading(true);
      setRecallError(null);
      const data = await api.patients.list({ recall: true });
      setRecallPatients(data);
    } catch (err) {
      console.error("Failed to load recall patients:", err);
      setRecallError("Couldn't load recall list.");
    } finally {
      setRecallLoading(false);
    }
  };

  // Load Patient Detail Drawer
  const loadPatientDetail = async (patientId: string) => {
    try {
      setPatientDetailLoading(true);
      const data = await api.patients.get(patientId);
      setSelectedPatient(data);
    } catch (err) {
      console.error("Failed to load patient detail:", err);
    } finally {
      setPatientDetailLoading(false);
    }
  };

  useEffect(() => {
    if (currentRoute === 'patients' && clinicId) {
      if (patientsTab === 'recall') {
        loadRecallPatients();
      } else {
        loadPatients();
      }
    }
  }, [currentRoute, patientsTab, clinicId]);

  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDetail(selectedPatientId);
    } else {
      setSelectedPatient(null);
    }
  }, [selectedPatientId]);

  // Handle Add Patient form submit
  const handleAddPatient = async () => {
    if (!addPatientName.trim()) {
      setAddPatientError("Patient name is required.");
      return;
    }
    if (!addPatientPhone.trim()) {
      setAddPatientError("Phone number is required.");
      return;
    }
    try {
      setAddPatientLoading(true);
      setAddPatientError(null);
      const newPatient = await api.patients.create({
        name: addPatientName.trim(),
        phone: addPatientPhone.trim(),
        email: addPatientEmail.trim() || undefined,
        dob: addPatientDob || undefined,
        gender: addPatientGender,
        primaryDoctor: addPatientDoctor,
        recallStatus: addPatientRecallStatus,
        recallReason: addPatientRecallReason.trim() || undefined,
      });
      setPatients(prev => [newPatient, ...prev]);
      setAddPatientModalOpen(false);
      // Reset form fields
      setAddPatientName('');
      setAddPatientPhone('');
      setAddPatientEmail('');
      setAddPatientDob('');
      setAddPatientGender('Male');
      setAddPatientDoctor('Dr. Lan Mandragoran');
      setAddPatientRecallStatus('UP_TO_DATE');
      setAddPatientRecallReason('');
    } catch (err: any) {
      setAddPatientError(err.message || "Failed to add patient.");
    } finally {
      setAddPatientLoading(false);
    }
  };

  // Appointments screen states
  const [apptViewMode, setApptViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date('2026-06-22'));
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isNewApptDrawerOpen, setIsNewApptDrawerOpen] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [newApptLoading, setNewApptLoading] = useState(false);
  const [newApptError, setNewApptError] = useState<string | null>(null);

  // Filters state
  const [apptSearchQuery, setApptSearchQuery] = useState('');
  const [apptDoctorFilter, setApptDoctorFilter] = useState('all');
  const [apptStatusFilter, setApptStatusFilter] = useState('all');
  const [apptSortOrder, setApptSortOrder] = useState<'asc' | 'desc'>('asc');
  const [apptCurrentPage, setApptCurrentPage] = useState(1);

  // New Appointment Form state
  const [formPatientId, setFormPatientId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('09:00 AM');
  const [formDoctor, setFormDoctor] = useState('Dr. Lan Mandragoran');
  const [formDept, setFormDept] = useState('General Medicine');
  const [formNotes, setFormNotes] = useState('');

  // Reschedule state (inside detail drawer)
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Live Queue states
  const [queue, setQueue] = useState<QueueEntry[]>(initialQueue);
  const [queueTab, setQueueTab] = useState<'waiting' | 'with_doctor' | 'completed' | 'no_show'>('waiting');
  const [isNewWalkInDrawerOpen, setIsNewWalkInDrawerOpen] = useState(false);
  const [walkInType, setWalkInType] = useState<'registered' | 'new'>('registered');
    const [walkInPatientId, setWalkInPatientId] = useState<string | null>(null);
  const [walkInNewPatientName, setWalkInNewPatientName] = useState('');
  const [walkInNewPatientPhone, setWalkInNewPatientPhone] = useState('');
  const [walkInReason, setWalkInReason] = useState('');
  const [walkInDoctor, setWalkInDoctor] = useState('Dr. Lan Mandragoran');
  const [queueError, setQueueError] = useState<string | null>(null);

  // ZeroChat screen states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [conversationCounts, setConversationCounts] = useState<{ needs_review: number; ai_handling: number; resolved: number }>({ needs_review: 0, ai_handling: 0, resolved: 0 });
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    needs_review: true,
    ai_handling: true,
    resolved: true
  });

  const activeConversationRef = useRef<Conversation | null>(null);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Onboarding Wizard States
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingAuthMode, setOnboardingAuthMode] = useState<'signup' | 'login' | 'forgot'>('signup');
  
  // Step 1: Account
  const [onboardingAdminName, setOnboardingAdminName] = useState('');
  const [onboardingEmail, setOnboardingEmail] = useState('');
  const [onboardingPassword, setOnboardingPassword] = useState('');
  
  // Step 2: Clinic Info
  const [onboardingClinicName, setOnboardingClinicName] = useState('');
  const [onboardingAddress, setOnboardingAddress] = useState('');
  const [onboardingHours, setOnboardingHours] = useState('');
  const [onboardingServices, setOnboardingServices] = useState('');
  
  // Step 4: Add Doctor
  const [onboardingDoctorName, setOnboardingDoctorName] = useState('');
  const [onboardingDoctorEmail, setOnboardingDoctorEmail] = useState('');
  const [onboardingDoctorRole, setOnboardingDoctorRole] = useState('Lead Physician');

  // Operating Hours states
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [openTime, setOpenTime] = useState('9:00 AM');
  const [closeTime, setCloseTime] = useState('5:00 PM');

  // Services tag states
  const [selectedServices, setSelectedServices] = useState<string[]>(['Cardiology', 'Dermatology', 'General Medicine']);
  const [serviceSearch, setServiceSearch] = useState('');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  // Doctor Role tag states
  const [selectedDoctorRoles, setSelectedDoctorRoles] = useState<string[]>(['Lead Physician']);
  const [doctorRoleSearch, setDoctorRoleSearch] = useState('');
  const [isDoctorRoleDropdownOpen, setIsDoctorRoleDropdownOpen] = useState(false);

  // Sync selectedDays, openTime, closeTime with onboardingHours
  useEffect(() => {
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sortedDays = [...selectedDays].sort((a, b) => allDays.indexOf(a) - allDays.indexOf(b));
    
    let dayRangeStr = '';
    if (sortedDays.length === 7) {
      dayRangeStr = 'Every day';
    } else if (sortedDays.length === 5 && sortedDays.every(d => d !== 'Sat' && d !== 'Sun')) {
      dayRangeStr = 'Mon - Fri';
    } else if (sortedDays.length === 6 && sortedDays.every(d => d !== 'Sun')) {
      dayRangeStr = 'Mon - Sat';
    } else if (sortedDays.length === 0) {
      dayRangeStr = 'Closed';
    } else {
      dayRangeStr = sortedDays.join(', ');
    }
    
    if (dayRangeStr === 'Closed') {
      setOnboardingHours('Closed');
    } else {
      setOnboardingHours(`${dayRangeStr}: ${openTime} - ${closeTime}`);
    }
  }, [selectedDays, openTime, closeTime]);

  // Sync selectedServices with onboardingServices
  useEffect(() => {
    setOnboardingServices(selectedServices.join(', '));
  }, [selectedServices]);

  // Sync selectedDoctorRoles with onboardingDoctorRole
  useEffect(() => {
    setOnboardingDoctorRole(selectedDoctorRoles.join(', '));
  }, [selectedDoctorRoles]);

  // Time conversion helpers
  const convertTo24Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return timeStr;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const formatTime12h = (timeStr: string): string => {
    if (!timeStr) return '';
    if (/\s*(AM|PM)$/i.test(timeStr)) return timeStr;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return timeStr;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Load Appointments from Backend
  const loadAppointmentsRange = async (start: Date) => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      const weekStart = new Date(start);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday

      const fromStr = weekStart.toISOString().split("T")[0];
      const toStr = weekEnd.toISOString().split("T")[0];

            const data = await api.appointments.list({
        from: fromStr,
        to: toStr,
      });
      const normalized = data.map(appt => ({ ...appt, time: formatTime12h(appt.time) }));
      setAppointments(normalized);
      setAppointmentsLoadedThisSession(true);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setAppointmentsError("Couldn't load appointments.");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    if (currentRoute === 'appointments' && clinicId) {
      loadAppointmentsRange(currentWeekStart);
    }
  }, [currentRoute, currentWeekStart, clinicId]);

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      setConversationsError(null);
      const [needsReview, aiHandling, resolved] = await Promise.all([
        api.conversations.list({ status: "NEEDS_REVIEW" }),
        api.conversations.list({ status: "AI_HANDLING" }),
        api.conversations.list({ status: "RESOLVED" }),
      ]);
      const allConversations = [...needsReview, ...aiHandling, ...resolved];
      setConversations(allConversations);
      setConversationsLoadedThisSession(true);
      return { needsReview, aiHandling, resolved, allConversations };
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setConversationsError("Couldn't load conversations.");
      return null;
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadConversationCounts = async () => {
    try {
      const counts = await api.conversations.counts();
      setConversationCounts(counts);
    } catch (err) {
      console.error("Failed to load conversation counts:", err);
    }
  };

  // Real dashboard analytics from the backend (patients today, doctors on duty,
  // AI activity, autonomy rate, etc.) — replaces the old hardcoded mock stats.
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const loadDashboard = async () => {
    try {
      const data = await api.analytics.dashboard();
      setDashboardSummary(data);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
    }
  };

  useEffect(() => {
    if (currentRoute === 'dashboard' && clinicId) {
      loadDashboard();
    }
  }, [currentRoute, clinicId]);

  // Staff — loaded from the backend so Settings shows the clinic's real team
  // (just the admin, on a fresh account) rather than fabricated defaults.
  const roleLabel = (role: StaffMemberDTO['role']) =>
    role === 'ADMIN' ? 'Admin' : role === 'PHYSICIAN' ? 'Physician' : 'Staff';
  const staffInitials = (name: string) =>
    name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';
  const mapStaff = (s: StaffMemberDTO): StaffListItem => ({
    id: s.id,
    name: s.fullName,
    role: s.specialization || roleLabel(s.role),
    email: s.email,
    initials: staffInitials(s.fullName),
  });

  const loadStaff = async () => {
    try {
      const data = await api.staff.list();
      setStaffList(data.map(mapStaff));
    } catch (err) {
      console.error("Failed to load staff:", err);
    }
  };

  useEffect(() => {
    if (currentRoute === 'settings' && clinicId) {
      loadStaff();
      loadClinicSettings();
    }
  }, [currentRoute, clinicId]);

  // A physician title routes to the PHYSICIAN permission role; everything else
  // defaults to STAFF. The chosen title is kept verbatim as the specialization
  // so it displays back exactly as picked.
  const handleAddStaff = async (fullName: string, email: string, title: string) => {
    const isPhysician = /physician|practitioner|doctor|surgeon/i.test(title);
    try {
      await api.staff.create({
        fullName,
        email,
        role: isPhysician ? 'PHYSICIAN' : 'STAFF',
        specialization: title,
      });
      await loadStaff();
      toast.success(`Invite sent to ${email}.`);
    } catch (err: any) {
      toast.error(err?.message || "Couldn't add staff member.");
    }
  };

  const handleRemoveStaff = async (id: string) => {
    try {
      await api.staff.remove(id);
      await loadStaff();
      toast.success("Staff member removed.");
    } catch (err: any) {
      toast.error(err?.message || "Couldn't remove staff member.");
    }
  };

  // Clinic details for Settings — loaded from the backend (GET /api/clinic)
  // instead of the old "Apex Family Clinic" hardcoded defaults.
  const loadClinicSettings = async () => {
    try {
      const c = await api.clinic.get();
      const name = c?.name || '';
      const address = c?.address || '';
      const services = Array.isArray(c?.servicesOffered) ? c.servicesOffered.join(', ') : '';
      const oh = c?.operatingHours;
      const hours = oh && Array.isArray(oh.days) && oh.days.length
        ? `${oh.days.join(', ')}: ${oh.openTime} - ${oh.closeTime}`
        : '';
      setSettingsClinicName(name); setSavedClinicName(name);
      setSettingsAddress(address); setSavedAddress(address);
      setSettingsServices(services); setSavedServices(services);
      setSettingsHours(hours); setSavedHours(hours);
    } catch (err) {
      console.error("Failed to load clinic settings:", err);
    }
  };

  // Persists name/address/services to the backend. Operating hours is a
  // freeform text field here and can't be reliably parsed back into the
  // structured days/openTime/closeTime the API expects, so it's not sent —
  // structured hours are set during onboarding instead.
  const handleSaveClinic = async (name: string, address: string, hours: string, services: string) => {
    try {
      await api.clinic.update({
        name,
        address,
        servicesOffered: services.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSavedClinicName(name);
      setSavedAddress(address);
      setSavedHours(hours);
      setSavedServices(services);
      toast.success("Clinic settings saved.");
    } catch (err: any) {
      toast.error(err?.message || "Couldn't save clinic settings.");
    }
  };

  const loadConversationThread = async (conversationId: string) => {
    try {
      setThreadLoading(true);
      const data = await api.conversations.get(conversationId);
      setActiveConversation(data);
    } catch (err) {
      console.error("Failed to load conversation thread:", err);
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    if (currentRoute === 'zero-chat' && clinicId) {
      const initZeroChat = async () => {
        const res = await loadConversations();
        loadConversationCounts();
        if (res && !selectedChatId) {
          let defaultSelect: Conversation | null = null;
          if (res.needsReview.length > 0) {
            defaultSelect = res.needsReview[0];
          } else if (res.aiHandling.length > 0) {
            defaultSelect = res.aiHandling[0];
          } else if (res.resolved.length > 0) {
            defaultSelect = res.resolved[0];
          }
          if (defaultSelect) {
            setSelectedChatId(defaultSelect.id);
          }
        }
      };
      initZeroChat();
    }
  }, [currentRoute, clinicId]);

  useEffect(() => {
    if (currentRoute === 'dashboard' && clinicId) {
      if (!queueLoaded) {
        loadQueue();
      }
      if (!appointmentsLoadedThisSession) {
        loadAppointmentsRange(currentWeekStart);
      }
      if (!conversationsLoadedThisSession) {
        loadConversations();
        loadConversationCounts();
      }
    }
  }, [currentRoute, clinicId, queueLoaded, appointmentsLoadedThisSession, conversationsLoadedThisSession]);

  useEffect(() => {
    if (selectedChatId) {
      loadConversationThread(selectedChatId);
    } else {
      setActiveConversation(null);
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (drawerTab === 'conversations' && selectedPatient) {
      const patientConv = conversations.find(c => c.patientId === selectedPatient.id);
      if (patientConv) {
        setSelectedChatId(patientConv.id);
      }
    }
  }, [drawerTab, selectedPatient, conversations]);

  // Handle New Appointment Form submit
  const handleCreateAppointment = async () => {
    if (!formPatientId) {
      setNewApptError("Please select a patient.");
      return;
    }
    const patient = patients.find(p => p.id === formPatientId);
    if (!patient) return;

    try {
      setNewApptLoading(true);
      setNewApptError(null);
      const apptDate = formDate || new Date().toISOString().split("T")[0];
      const apptTime = convertTo24Hour(formTime);
      const newAppt = await api.appointments.create({
        patientId: formPatientId,
        patientName: patient.name,
        patientPhone: patient.phone,
        doctor: formDoctor,
        doctorName: formDoctor,
        date: apptDate,
        time: apptTime,
        scheduledAt: `${apptDate}T${apptTime}:00.000Z`,
        visitType: formDept,
        bookedVia: "manual",
      });
            const normalized = { ...newAppt, time: formatTime12h(newAppt.time) };
      setAppointments(prev => [normalized, ...prev]);
      setIsNewApptDrawerOpen(false);
      // Reset form fields
      setFormPatientId(null);
      setFormDate('');
      setFormTime('09:00 AM');
      setFormDoctor('Dr. Lan Mandragoran');
      setFormDept('General Medicine');
      setFormNotes('');
    } catch (err: any) {
      setNewApptError(err.message || "Failed to create appointment.");
    } finally {
      setNewApptLoading(false);
    }
  };

  // Step 4 -> 5 Transition state
  const [isTransitioningStep, setIsTransitioningStep] = useState(false);
  const [transitionStatusIndex, setTransitionStatusIndex] = useState(0);

  // Step 5 Preview state
  const [previewMessages, setPreviewMessages] = useState<{ sender: 'patient' | 'ai'; text: string; time: string }[]>([]);
  const [previewTyping, setPreviewTyping] = useState(false);

  // Simulated conversation in Step 5
  useEffect(() => {
    if (onboardingStep !== 5) {
      setPreviewMessages([]);
      setPreviewTyping(false);
      return;
    }

    const clinic = onboardingClinicName.trim() || 'Apex Family Clinic';
    const firstService = onboardingServices.split(',')[0]?.trim() || 'General Consultation';
    const doctorPart = onboardingDoctorName.trim() ? ` with Dr. ${onboardingDoctorName.trim()}` : '';
    const address = onboardingAddress.trim() || '123 Eldene Way, Suite 400, Apex City';

    const fullConversation = [
      {
        sender: 'patient' as const,
        text: `Hi, I'd like to book an appointment for a ${firstService} at ${clinic}.`,
        time: '02:30 PM'
      },
      {
        sender: 'ai' as const,
        text: `Hi there! I can help you book a ${firstService} at ${clinic}${doctorPart}. We have availability this Tuesday at 10:00 AM or Thursday at 2:00 PM. Would either of those work for you?`,
        time: '02:31 PM'
      },
      {
        sender: 'patient' as const,
        text: `Tuesday at 10:00 AM works great for me.`,
        time: '02:31 PM'
      },
      {
        sender: 'ai' as const,
        text: `Perfect! I've booked your ${firstService} appointment${doctorPart} for Tuesday at 10:00 AM. We look forward to seeing you at ${address}!`,
        time: '02:32 PM'
      }
    ];

    const timers: number[] = [];

    // Message 1 (Patient)
    const t1 = window.setTimeout(() => {
      setPreviewMessages([fullConversation[0]]);
    }, 600);
    timers.push(t1);

    // AI typing for Message 2
    const t2 = window.setTimeout(() => {
      setPreviewTyping(true);
    }, 1800);
    timers.push(t2);

    // Show Message 2 (AI)
    const t3 = window.setTimeout(() => {
      setPreviewTyping(false);
      setPreviewMessages(prev => [...prev, fullConversation[1]]);
    }, 3800);
    timers.push(t3);

    // Message 3 (Patient)
    const t4 = window.setTimeout(() => {
      setPreviewMessages(prev => [...prev, fullConversation[2]]);
    }, 5500);
    timers.push(t4);

    // AI typing for Message 4
    const t5 = window.setTimeout(() => {
      setPreviewTyping(true);
    }, 6800);
    timers.push(t5);

    // Show Message 4 (AI)
    const t6 = window.setTimeout(() => {
      setPreviewTyping(false);
      setPreviewMessages(prev => [...prev, fullConversation[3]]);
    }, 9000);
    timers.push(t6);

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [onboardingStep]);

  const startTransitionToStep5 = () => {
    setIsTransitioningStep(true);
    setTransitionStatusIndex(0);
    
    setTimeout(() => setTransitionStatusIndex(1), 1200);
    setTimeout(() => setTransitionStatusIndex(2), 2400);
    setTimeout(() => {
      setIsTransitioningStep(false);
      setOnboardingStep(5);
      
      // Reflect the entered values in Settings immediately (no fake defaults);
      // the backend fetch on visiting Settings will confirm/replace them.
      setSettingsClinicName(onboardingClinicName);
      setSavedClinicName(onboardingClinicName);
      setSettingsAddress(onboardingAddress);
      setSavedAddress(onboardingAddress);
      setSettingsHours(onboardingHours);
      setSavedHours(onboardingHours);
      setSettingsServices(onboardingServices);
      setSavedServices(onboardingServices);

      // Persist the clinic details + invited doctor to the backend so they
      // survive logout and populate Settings/dashboard for real, rather than
      // living only in this browser's memory (the old bug: onboarding never
      // saved address/services, so the DB kept them null).
      (async () => {
        try {
          await api.clinic.update({
            name: onboardingClinicName || undefined,
            address: onboardingAddress || undefined,
            servicesOffered: selectedServices,
            operatingHours: selectedDays.length
              ? { days: selectedDays, openTime: convertTo24Hour(openTime), closeTime: convertTo24Hour(closeTime) }
              : undefined,
          });
        } catch (err) {
          console.error("Failed to save clinic details during onboarding:", err);
        }

        const doctorEmail = onboardingDoctorEmail.trim();
        if (onboardingDoctorName.trim() && doctorEmail) {
          try {
            await api.staff.create({
              fullName: onboardingDoctorName.trim(),
              email: doctorEmail,
              role: 'PHYSICIAN',
              specialization: onboardingDoctorRole || undefined,
            });
          } catch (err) {
            console.error("Failed to add doctor during onboarding:", err);
          }
        }
      })();
    }, 3600);
  };

  // Settings screen states — loaded from the backend (GET /api/clinic) on
  // entering Settings; empty until then rather than fake "Apex Family" defaults.
  const [settingsClinicName, setSettingsClinicName] = useState('');
  const [settingsAddress, setSettingsAddress] = useState('');
  const [settingsHours, setSettingsHours] = useState('');
  const [settingsServices, setSettingsServices] = useState('');

  // To track initial/saved values for dirty state comparison
  const [savedClinicName, setSavedClinicName] = useState('');
  const [savedAddress, setSavedAddress] = useState('');
  const [savedHours, setSavedHours] = useState('');
  const [savedServices, setSavedServices] = useState('');

  // Staff list state
  // Real staff loaded from the backend (GET /api/staff). Starts empty — a
  // brand-new clinic has only the admin who registered, no fabricated defaults.
  const [staffList, setStaffList] = useState<StaffListItem[]>([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('General Practitioner');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  // Notifications state
  const [notificationEscalation, setNotificationEscalation] = useState(true);
  const [notificationRecall, setNotificationRecall] = useState(true);
  const [notificationNoShow, setNotificationNoShow] = useState(true);
  const [notificationSummary, setNotificationSummary] = useState(false);
  // Close dropdown menu when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);



    const handleStatusChange = async (id: string, newStatus: 'Confirmed' | 'Pending' | 'Cancelled') => {
    try {
      const statusMap: Record<string, AppointmentStatus> = {
        Confirmed: 'confirmed',
        Pending: 'pending',
        Cancelled: 'cancelled'
      };
      const backendStatus = statusMap[newStatus];
      await api.appointments.update(id, { status: backendStatus });
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: backendStatus } : apt));
    } catch (err) {
      console.error("Failed to update appointment status:", err);
    }
  };

  const handleApproveOutreach = (patientId: string) => {
    toast.success("Recall outreach approved & sent via WhatsApp!");
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          aiOutreachDraft: undefined // Remove draft to show outreach has been sent
        };
      }
      return p;
    }));
    setExpandedOutreachId(null);
  };

  const handleSaveOutreach = (patientId: string, text: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, aiOutreachDraft: text };
      }
      return p;
    }));
    setEditOutreachId(null);
  };

  // Render Live Queue Screen
  const renderLiveQueueScreen = () => (
    <LiveQueuePage
      queue={queue}
      queueTab={queueTab}
      setQueueTab={setQueueTab}
      queueLoading={queueLoading}
      queueError={queueError}
      setQueueError={setQueueError}
      loadQueue={loadQueue}
      patients={patients}
      onSelectPatient={(patientId) => {
        setSelectedPatientId(patientId);
        setDrawerTab('history');
      }}
      isNewWalkInDrawerOpen={isNewWalkInDrawerOpen}
      setIsNewWalkInDrawerOpen={setIsNewWalkInDrawerOpen}
      walkInType={walkInType}
      setWalkInType={setWalkInType}
      walkInPatientId={walkInPatientId}
      setWalkInPatientId={setWalkInPatientId}
      walkInNewPatientName={walkInNewPatientName}
      setWalkInNewPatientName={setWalkInNewPatientName}
      walkInNewPatientPhone={walkInNewPatientPhone}
      setWalkInNewPatientPhone={setWalkInNewPatientPhone}
      walkInReason={walkInReason}
      setWalkInReason={setWalkInReason}
      walkInDoctor={walkInDoctor}
      setWalkInDoctor={setWalkInDoctor}
      walkInLoading={walkInLoading}
      setWalkInLoading={setWalkInLoading}
    />
  );

  // Render Patients Screen
  const renderPatientsScreen = () => (
    <PatientsPage
      patients={patients}
      recallPatients={recallPatients}
      patientsTab={patientsTab}
      setPatientsTab={setPatientsTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      patientsLoading={patientsLoading}
      recallLoading={recallLoading}
      patientsError={patientsError}
      recallError={recallError}
      onRetryPatients={loadPatients}
      onRetryRecall={loadRecallPatients}
      onSelectPatient={(patientId) => setSelectedPatientId(patientId)}
      onOpenAddPatientModal={() => setAddPatientModalOpen(true)}
      onExpandOutreach={(patientId, draft) => {
        setExpandedOutreachId(patientId);
        setDraftMessageText(draft);
      }}
    />
  );


  // Helper for generating week days
  const getWeekDays = (start: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Helper for formatting date to string
  const formatDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper for range label formatting
  const formatRangeLabel = (start: Date) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const optionsStart: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const optionsEnd: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    
    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${end.toLocaleDateString('en-US', optionsEnd)}`;
    }
    if (start.getMonth() !== end.getMonth()) {
      return `${start.toLocaleDateString('en-US', optionsStart)} – ${end.toLocaleDateString('en-US', optionsEnd)}`;
    }
    return `${start.toLocaleDateString('en-US', optionsStart)} – ${end.getDate()}, ${start.getFullYear()}`;
  };

  const renderAppointmentsScreen = () => (
    <AppointmentsPage
      appointments={appointments}
      appointmentsLoading={appointmentsLoading}
      appointmentsError={appointmentsError}
      onRetryAppointments={() => loadAppointmentsRange(currentWeekStart)}
      currentWeekStart={currentWeekStart}
      setCurrentWeekStart={setCurrentWeekStart}
      apptViewMode={apptViewMode}
      setApptViewMode={setApptViewMode}
      apptSearchQuery={apptSearchQuery}
      setApptSearchQuery={setApptSearchQuery}
      apptDoctorFilter={apptDoctorFilter}
      setApptDoctorFilter={setApptDoctorFilter}
      apptStatusFilter={apptStatusFilter}
      setApptStatusFilter={setApptStatusFilter}
      apptSortOrder={apptSortOrder}
      setApptSortOrder={setApptSortOrder}
      apptCurrentPage={apptCurrentPage}
      setApptCurrentPage={setApptCurrentPage}
      onSelectAppointment={(id) => setSelectedAppointmentId(id)}
      onOpenNewAppointment={({ date, time }) => {
        setFormPatientId(null);
        setFormDate(date);
        setFormTime(time);
        setFormDoctor("Dr. Lan Mandragoran");
        setFormDept("General Medicine");
        setFormNotes("");
        setIsNewApptDrawerOpen(true);
      }}
      getWeekDays={getWeekDays}
      formatDateString={formatDateString}
      formatRangeLabel={formatRangeLabel}
    />
  );


  const handleTakeOver = async (convId: string) => {
    try {
      const updated = await api.conversations.takeOver(convId);
      setConversations(prev =>
        prev.map(c => (c.id === convId ? updated : c))
      );
      if (activeConversation && activeConversation.id === convId) {
        setActiveConversation(updated);
      }
      loadConversationCounts();
    } catch (err) {
      console.error("Failed to take over conversation:", err);
    }
  };

  const handleResolve = async (convId: string) => {
    try {
      const updated = await api.conversations.resolve(convId);
      setConversations(prev =>
        prev.map(c => (c.id === convId ? updated : c))
      );
      if (activeConversation && activeConversation.id === convId) {
        setActiveConversation(updated);
      }
      loadConversationCounts();
    } catch (err) {
      console.error("Failed to resolve conversation:", err);
    }
  };

  const handleReopen = (convId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            status: "AI_HANDLING" as ConversationStatus,
            assignedStaff: undefined,
          };
        }
        return c;
      })
    );
    if (activeConversation && activeConversation.id === convId) {
      setActiveConversation(prev => {
        if (!prev) return null;
        const newMsg: ConversationMessage = {
          id: `local-reopen-${Date.now()}`,
          role: "system",
          text: "Conversation reopened, handed back to Zero AI",
          createdAt: new Date().toISOString(),
        };
        return {
          ...prev,
          status: "AI_HANDLING" as ConversationStatus,
          assignedStaff: undefined,
          messages: [...(prev.messages || []), newMsg],
        };
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderZeroChatScreen = () => (
    <ZeroChatPage
      conversations={conversations}
      conversationsLoading={conversationsLoading}
      conversationsError={conversationsError}
      onRetryConversations={loadConversations}
      activeConversation={activeConversation}
      setActiveConversation={setActiveConversation}
      setConversations={setConversations}
      selectedChatId={selectedChatId}
      setSelectedChatId={setSelectedChatId}
      chatInputText={chatInputText}
      setChatInputText={setChatInputText}
      chatSearchQuery={chatSearchQuery}
      setChatSearchQuery={setChatSearchQuery}
      sendingMessage={sendingMessage}
      setSendingMessage={setSendingMessage}
      threadLoading={threadLoading}
      expandedSections={expandedSections}
      setExpandedSections={setExpandedSections}
      getInitials={getInitials}
      onSelectPatient={(patientId) => setSelectedPatientId(patientId)}
      onTakeOver={handleTakeOver}
      onResolve={handleResolve}
      onReopen={handleReopen}
    />
  );

  // Render Onboarding Wizard Screen
  const renderVerifyEmailScreen = () => (
    <VerifyEmailPage
      verificationState={verificationState}
      onboardingEmail={onboardingEmail}
      setOnboardingEmail={setOnboardingEmail}
      resendCooldown={resendCooldown}
      onResendVerification={handleResendVerification}
      onContinueAfterSuccess={async () => {
        const token = localStorage.getItem("zero_token");
        if (token) {
          await checkSession();
        } else {
          setCurrentRoute('dashboard');
          setIsOnboarded(false);
          setOnboardingStep(1);
          setOnboardingAuthMode('login');
        }
      }}
      onBackToLogin={() => {
        setCurrentRoute('dashboard');
        setIsOnboarded(false);
        setOnboardingStep(1);
        setOnboardingAuthMode('login');
      }}
    />
  );

  const renderResetPasswordScreen = () => (
    <ResetPasswordPage
      resetPasswordState={resetPasswordState}
      setResetPasswordState={setResetPasswordState}
      resetPasswordToken={resetPasswordToken}
      resetPasswordValue={resetPasswordValue}
      setResetPasswordValue={setResetPasswordValue}
      resetPasswordConfirm={resetPasswordConfirm}
      setResetPasswordConfirm={setResetPasswordConfirm}
      resetPasswordError={resetPasswordError}
      setResetPasswordError={setResetPasswordError}
      onBackToLogin={() => {
        window.history.replaceState({}, '', '/');
        setCurrentRoute('dashboard');
        setIsOnboarded(false);
        setOnboardingStep(1);
        setOnboardingAuthMode('login');
      }}
    />
  );

const renderOnboardingWizard = () => (
  <OnboardingWizard
    isTransitioningStep={isTransitioningStep}
    transitionStatusIndex={transitionStatusIndex}
    onboardingStep={onboardingStep}
    setOnboardingStep={setOnboardingStep}
    isVerificationPending={isVerificationPending}
    setIsVerificationPending={setIsVerificationPending}
    onboardingEmail={onboardingEmail}
    setOnboardingEmail={setOnboardingEmail}
    resendCooldown={resendCooldown}
    onResendVerification={handleResendVerification}
    onboardingAuthMode={onboardingAuthMode}
    setOnboardingAuthMode={setOnboardingAuthMode}
    onboardingAdminName={onboardingAdminName}
    setOnboardingAdminName={setOnboardingAdminName}
    onboardingPassword={onboardingPassword}
    setOnboardingPassword={setOnboardingPassword}
    forgotPasswordEmail={forgotPasswordEmail}
    setForgotPasswordEmail={setForgotPasswordEmail}
    forgotPasswordSent={forgotPasswordSent}
    setForgotPasswordSent={setForgotPasswordSent}
    forgotPasswordError={forgotPasswordError}
    setForgotPasswordError={setForgotPasswordError}
    isLoading={isLoading}
    setIsLoading={setIsLoading}
    signUpError={signUpError}
    setSignUpError={setSignUpError}
    setClinicId={setClinicId}
    loginError={loginError}
    setLoginError={setLoginError}
    onCheckSession={checkSession}
    setIsOnboarded={setIsOnboarded}
    onboardingClinicName={onboardingClinicName}
    setOnboardingClinicName={setOnboardingClinicName}
    selectedServices={selectedServices}
    setSelectedServices={setSelectedServices}
    serviceSearch={serviceSearch}
    setServiceSearch={setServiceSearch}
    isServiceDropdownOpen={isServiceDropdownOpen}
    setIsServiceDropdownOpen={setIsServiceDropdownOpen}
    onboardingAddress={onboardingAddress}
    setOnboardingAddress={setOnboardingAddress}
    selectedDays={selectedDays}
    setSelectedDays={setSelectedDays}
    openTime={openTime}
    setOpenTime={setOpenTime}
    closeTime={closeTime}
    setCloseTime={setCloseTime}
    onboardingDoctorName={onboardingDoctorName}
    setOnboardingDoctorName={setOnboardingDoctorName}
    selectedDoctorRoles={selectedDoctorRoles}
    setSelectedDoctorRoles={setSelectedDoctorRoles}
    doctorRoleSearch={doctorRoleSearch}
    setDoctorRoleSearch={setDoctorRoleSearch}
    isDoctorRoleDropdownOpen={isDoctorRoleDropdownOpen}
    setIsDoctorRoleDropdownOpen={setIsDoctorRoleDropdownOpen}
    onboardingDoctorEmail={onboardingDoctorEmail}
    setOnboardingDoctorEmail={setOnboardingDoctorEmail}
    onStartTransitionToStep5={startTransitionToStep5}
    previewMessages={previewMessages}
    previewTyping={previewTyping}
    setCurrentRoute={setCurrentRoute}
  />
);


  // Render Settings Screen
  const renderSettingsScreen = () => (
    <SettingsPage
      settingsClinicName={settingsClinicName}
      setSettingsClinicName={setSettingsClinicName}
      settingsAddress={settingsAddress}
      setSettingsAddress={setSettingsAddress}
      settingsHours={settingsHours}
      setSettingsHours={setSettingsHours}
      settingsServices={settingsServices}
      setSettingsServices={setSettingsServices}
      savedClinicName={savedClinicName}
      savedAddress={savedAddress}
      savedHours={savedHours}
      savedServices={savedServices}
      onSaveClinic={handleSaveClinic}
      staffList={staffList}
      onAddStaff={handleAddStaff}
      onRemoveStaff={handleRemoveStaff}
      isAddStaffOpen={isAddStaffOpen}
      setIsAddStaffOpen={setIsAddStaffOpen}
      newStaffName={newStaffName}
      setNewStaffName={setNewStaffName}
      newStaffRole={newStaffRole}
      setNewStaffRole={setNewStaffRole}
      newStaffEmail={newStaffEmail}
      setNewStaffEmail={setNewStaffEmail}
      notificationEscalation={notificationEscalation}
      setNotificationEscalation={setNotificationEscalation}
      notificationRecall={notificationRecall}
      setNotificationRecall={setNotificationRecall}
      notificationNoShow={notificationNoShow}
      setNotificationNoShow={setNotificationNoShow}
      notificationSummary={notificationSummary}
      setNotificationSummary={setNotificationSummary}
    />
  );

  // Render placeholder page for non-dashboard routes
  const renderPlaceholder = (routeName: string) => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-surface-base rounded-2xl shadow-soft p-12 border border-surface-border/50 text-center animate-fade-in">
        <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mb-6">
          <Activity size={32} />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2 capitalize">{routeName.replace('-', ' ')}</h2>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          This section is currently under development. Soon clinic staff will be able to access all core patient management operations here.
        </p>
        <button
          onClick={() => setCurrentRoute('dashboard')}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition duration-200 shadow-sm text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen bg-surface-subtle items-center justify-center">
        <div className="text-text-secondary text-sm font-semibold flex items-center gap-2">
          <RefreshCw className="animate-spin text-brand-500" size={16} />
          <span>Loading Zero Clinic OS...</span>
        </div>
      </div>
    );
  }

    if (currentRoute === 'verify-email') {
    return (
      <div className="flex min-h-screen dot-grid-bg justify-center items-center p-6 w-full relative">
        {renderVerifyEmailScreen()}
      </div>
    );
  }

  if (currentRoute === 'reset-password') {
    return (
      <div className="flex min-h-screen dot-grid-bg justify-center items-center p-6 w-full relative">
        {renderResetPasswordScreen()}
      </div>
    );
  }

if (!isOnboarded) {
    return (
      <div className="flex min-h-screen dot-grid-bg justify-center items-center p-6 w-full relative">
        {renderOnboardingWizard()}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        needsReviewCount={conversationCounts.needs_review}
        adminName={onboardingAdminName}
        adminEmail={onboardingEmail}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* MAIN CONTAINER */}
      {/* min-w-0 is required here: as a flex item of the sidebar row, this
          container's automatic min-width defaults to its content's intrinsic
          width, which lets any wide descendant (e.g. the calendar's
          min-w-[900px] grid) blow out the whole page even though it's wrapped
          in its own overflow-x-auto — the overflow-x-auto only takes effect
          once this flex item is allowed to actually shrink. */}
      <div className="flex-1 lg:pl-[260px] min-h-screen flex flex-col min-w-0">
        <Topbar
          clinicName={settingsClinicName}
          currentRoute={currentRoute}
          isNotificationsOpen={isNotificationsDropdownOpen}
          onToggleNotifications={() => setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllAsRead}
          onNotificationClick={handleNotificationClick}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />

                {/* 3. MAIN CONTENT AREA */}
        <main className="p-4 md:p-8 flex-1 space-y-6 w-full max-w-full overflow-x-hidden">
          <ErrorBoundary>
            {currentRoute === 'patients' ? (
            renderPatientsScreen()
          ) : currentRoute === 'appointments' ? (
            renderAppointmentsScreen()
          ) : currentRoute === 'zero-chat' ? (
            renderZeroChatScreen()
          ) : currentRoute === 'live-queue' ? (
            renderLiveQueueScreen()
          ) : currentRoute === 'settings' ? (
            renderSettingsScreen()
          ) : currentRoute !== 'dashboard' ? (
            renderPlaceholder(currentRoute)
          ) : (
            <DashboardPage
              clinicName={isOnboarded ? settingsClinicName : (dashboardSummary?.clinicName || settingsClinicName)}
              queue={queue}
              appointments={appointments}
              conversations={conversations}
              dismissedAttentionIds={dismissedAttentionIds}
              setDismissedAttentionIds={setDismissedAttentionIds}
              openDropdownId={openDropdownId}
              setOpenDropdownId={setOpenDropdownId}
              onStatusChange={handleStatusChange}
              onNavigate={setCurrentRoute}
              onSelectConversation={(convId) => {
                setSelectedChatId(convId);
                setCurrentRoute('zero-chat');
              }}
              summary={dashboardSummary}
            />
          )}
          </ErrorBoundary>
        </main>
      </div>
      {/* 4. SIDE DRAWERS */}
      {(currentRoute === 'patients' || currentRoute === 'zero-chat' || currentRoute === 'live-queue') && (
        <>
          {currentRoute === 'patients' && (
            <AddPatientModal
              isOpen={addPatientModalOpen}
              onClose={() => setAddPatientModalOpen(false)}
              onSubmit={handleAddPatient}
              addPatientError={addPatientError}
              addPatientLoading={addPatientLoading}
              addPatientName={addPatientName}
              setAddPatientName={setAddPatientName}
              addPatientPhone={addPatientPhone}
              setAddPatientPhone={setAddPatientPhone}
              addPatientEmail={addPatientEmail}
              setAddPatientEmail={setAddPatientEmail}
              addPatientDob={addPatientDob}
              setAddPatientDob={setAddPatientDob}
              addPatientGender={addPatientGender}
              setAddPatientGender={setAddPatientGender}
              addPatientDoctor={addPatientDoctor}
              setAddPatientDoctor={setAddPatientDoctor}
              addPatientRecallStatus={addPatientRecallStatus}
              setAddPatientRecallStatus={setAddPatientRecallStatus}
              addPatientRecallReason={addPatientRecallReason}
              setAddPatientRecallReason={setAddPatientRecallReason}
            />
          )}

          {currentRoute === 'patients' && patientsTab === 'recall' && (
            <PatientOutreachDrawer
              patients={patients}
              expandedOutreachId={expandedOutreachId}
              editOutreachId={editOutreachId}
              draftMessageText={draftMessageText}
              setDraftMessageText={setDraftMessageText}
              onClose={() => {
                setExpandedOutreachId(null);
                setEditOutreachId(null);
              }}
              onStartEdit={(patientId, draft) => {
                setEditOutreachId(patientId);
                setDraftMessageText(draft);
              }}
              onCancelEdit={() => setEditOutreachId(null)}
              onApprove={(patientId) => handleApproveOutreach(patientId)}
              onSaveAndApprove={(patientId, draft) => {
                handleSaveOutreach(patientId, draft);
                handleApproveOutreach(patientId);
              }}
            />
          )}

          <PatientDetailDrawer
            selectedPatientId={selectedPatientId}
            selectedPatient={selectedPatient}
            patientDetailLoading={patientDetailLoading}
            drawerTab={drawerTab}
            setDrawerTab={setDrawerTab}
            conversations={conversations}
            activeConversation={activeConversation}
            threadLoading={threadLoading}
            onClose={() => setSelectedPatientId(null)}
            onSendMessage={(patient) => {
              const patientConv = conversations.find(c => c.patientId === patient.id);
              if (patientConv) {
                setSelectedChatId(patientConv.id);
              } else {
                setSelectedChatId(null);
              }
              setCurrentRoute('zero-chat');
              setSelectedPatientId(null);
            }}
          />

        </>
      )}

      {currentRoute === 'appointments' && (
        <>
          <AppointmentDetailDrawer
            selectedAppointmentId={selectedAppointmentId}
            appointments={appointments}
            isRescheduling={isRescheduling}
            setIsRescheduling={setIsRescheduling}
            rescheduleDate={rescheduleDate}
            setRescheduleDate={setRescheduleDate}
            rescheduleTime={rescheduleTime}
            setRescheduleTime={setRescheduleTime}
            formatTime12h={formatTime12h}
            convertTo24Hour={convertTo24Hour}
            onClose={() => {
              setSelectedAppointmentId(null);
              setIsRescheduling(false);
            }}
            onUpdated={() => loadAppointmentsRange(currentWeekStart)}
          />

          <NewAppointmentDrawer
            isOpen={isNewApptDrawerOpen}
            onClose={() => setIsNewApptDrawerOpen(false)}
            onSubmit={handleCreateAppointment}
            patients={patients}
            formPatientId={formPatientId}
            setFormPatientId={setFormPatientId}
            formDate={formDate}
            setFormDate={setFormDate}
            formTime={formTime}
            setFormTime={setFormTime}
            formDoctor={formDoctor}
            setFormDoctor={setFormDoctor}
            formDept={formDept}
            setFormDept={setFormDept}
            formNotes={formNotes}
            setFormNotes={setFormNotes}
            newApptError={newApptError}
            newApptLoading={newApptLoading}
          />

        </>
      )}
    </div>
  );
}

export default App;
