import { useState, useEffect, useRef } from 'react';
import { api, Appointment, AppointmentStatus, Conversation, ConversationMessage, ConversationStatus, Patient, UNAUTHORIZED_EVENT } from './api';

import { io, Socket } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  ChevronDown,
  Search,
  X,
  ChevronLeft,
  Send,
  RefreshCw,
  Mail
} from 'lucide-react';
import {
  mockClinicInfo,
  mockAIStats,
  mockAppointments,
  mockPatients
} from './mockData';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NotificationItem } from './components/layout/NotificationsDropdown';
import { LiveQueuePage } from './features/live-queue/LiveQueuePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { PatientsPage } from './features/patients/PatientsPage';
import { AddPatientModal } from './features/patients/AddPatientModal';
import { PatientOutreachDrawer } from './features/patients/PatientOutreachDrawer';
import { PatientDetailDrawer } from './features/patients/PatientDetailDrawer';
import { AppointmentsPage } from './features/appointments/AppointmentsPage';
import { AppointmentDetailDrawer } from './features/appointments/AppointmentDetailDrawer';
import { NewAppointmentDrawer } from './features/appointments/NewAppointmentDrawer';

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
import logoBlue from './assets/logo-blue.svg';



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



const PRESET_SERVICES = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Physiotherapy',
  'Dental',
  'Mental Health/Psychiatry',
  'Nutrition',
  'General Practice',
  'Gynecology',
  'Orthopedics',
  'ENT',
  'Ophthalmology',
  'Urology',
  'Oncology'
];

const PRESET_ROLES = [
  'Lead Physician',
  'General Practitioner',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Physiotherapist',
  'Dentist',
  'Psychiatrist',
  'Gynecologist',
  'Orthopedic Surgeon',
  'Ophthalmologist'
];

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const statusToTab: Record<string, string> = {
  WAITING: "waiting",
  waiting: "waiting",
  WITH_DOCTOR: "with_doctor",
  with_doctor: "with_doctor",
  COMPLETED: "completed",
  completed: "completed",
  NO_SHOW: "no_show",
  no_show: "no_show",
};


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
  const currentRoute = location.pathname === '/' ? 'dashboard' : location.pathname.slice(1);
  const setCurrentRoute = (route: string) => navigate('/' + route);
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

  const handleResendVerification = async (email: string) => {
    if (resendCooldown > 0) return;
    try {
      setResendCooldown(30);
      await api.auth.resendVerification({ email });
    } catch (err) {
      console.error("Failed to resend verification:", err);
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

      if (staff && !staff.emailVerified) {
        setIsVerificationPending(true);
        setOnboardingStep(1);
        setIsOnboarded(false);
        return;
      }

      // Once the email is verified, go straight to the dashboard —
      // clinic setup (address/services/staff) is no longer a hard
      // gate on login, just a settings task the admin can finish later.
      setIsOnboarded(true);
      setCurrentRoute("dashboard");
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
  const [recallLoading, setRecallLoading] = useState(false);
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
      const data = await api.patients.list();
      setPatients(data);
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setPatientsLoading(false);
    }
  };

  // Load Recall Patients from Backend
  const loadRecallPatients = async () => {
    try {
      setRecallLoading(true);
      const data = await api.patients.list({ recall: true });
      setRecallPatients(data);
    } catch (err) {
      console.error("Failed to load recall patients:", err);
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
      
      // Save onboarding info to settings state
      setSettingsClinicName(onboardingClinicName || 'Apex Family Clinic');
      setSavedClinicName(onboardingClinicName || 'Apex Family Clinic');
      setSettingsAddress(onboardingAddress || '123 Eldene Way, Suite 400, Apex City');
      setSavedAddress(onboardingAddress || '123 Eldene Way, Suite 400, Apex City');
      setSettingsHours(onboardingHours || 'Mon - Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM');
      setSavedHours(onboardingHours || 'Mon - Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM');
      setSettingsServices(onboardingServices || 'Cardiology, Dermatology, Physiotherapy, General Medicine');
      setSavedServices(onboardingServices || 'Cardiology, Dermatology, Physiotherapy, General Medicine');
      
      // Add doctor to staff list if provided
      if (onboardingDoctorName.trim()) {
        const initials = onboardingDoctorName.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'MD';
        setStaffList(prev => {
          if (prev.some(s => s.email.toLowerCase() === (onboardingDoctorEmail.trim() || 'doctor@clinic.com').toLowerCase())) {
            return prev;
          }
          const nextId = crypto.randomUUID();
          return [
            ...prev,
            {
              id: nextId,
              name: onboardingDoctorName.trim(),
              role: onboardingDoctorRole,
              email: onboardingDoctorEmail.trim() || 'doctor@clinic.com',
              initials
            }
          ];
        });
      }
    }, 3600);
  };

  // Settings screen states
  const [settingsClinicName, setSettingsClinicName] = useState('Apex Family Clinic');
  const [settingsAddress, setSettingsAddress] = useState('123 Eldene Way, Suite 400, Apex City');
  const [settingsHours, setSettingsHours] = useState('Mon - Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM');
  const [settingsServices, setSettingsServices] = useState('Cardiology, Dermatology, Physiotherapy, General Medicine');

  // To track initial/saved values for dirty state comparison
  const [savedClinicName, setSavedClinicName] = useState('Apex Family Clinic');
  const [savedAddress, setSavedAddress] = useState('123 Eldene Way, Suite 400, Apex City');
  const [savedHours, setSavedHours] = useState('Mon - Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM');
  const [savedServices, setSavedServices] = useState('Cardiology, Dermatology, Physiotherapy, General Medicine');

  // Staff list state
  const [staffList, setStaffList] = useState([
    { id: "f7e742af-ab57-a0fb-37aa-dba915bce01e", name: 'Dr. Lan Mandragoran', role: 'Lead Physician', email: 'lan.m@apexfamily.com', initials: 'LM' },
    { id: "c95c6b3c-555b-9d66-dd77-9a1d3215c7bf", name: 'Dr. Moiraine Damodred', role: 'Chief of Staff', email: 'moiraine.d@apexfamily.com', initials: 'MD' },
    { id: "835e8e96-6a2d-aa7f-9f22-a3798b8f4bb7", name: 'Sarah Sedai', role: 'Clinic Manager', email: 'sarah.s@apexfamily.com', initials: 'SS' }
  ]);
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
    alert("Recall outreach approved & sent via WhatsApp!");
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

  const renderZeroChatScreen = () => {
    const filteredConversations = conversations.filter(c =>
      c.patientName.toLowerCase().includes(chatSearchQuery.toLowerCase())
    );

    const needsReviewList = filteredConversations.filter(c => c.status === 'NEEDS_REVIEW');
    const aiHandlingList = filteredConversations.filter(c => c.status === 'AI_HANDLING' || c.status === 'STAFF_TOOK_OVER');
    const resolvedList = filteredConversations.filter(c => c.status === 'RESOLVED');

    const selectedConv = conversations.find(c => c.id === selectedChatId) || conversations[0];
    const messagesToShow = activeConversation && activeConversation.id === selectedConv?.id
      ? activeConversation.messages || []
      : selectedConv?.messages || [];

    const handleSendMessage = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!chatInputText.trim() || !selectedConv || !selectedConv.assignedStaff) return;
      
      try {
        setSendingMessage(true);
        const newMsg = await api.conversations.reply(selectedConv.id, { text: chatInputText });
        if (activeConversation && activeConversation.id === selectedConv.id) {
          setActiveConversation(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [...(prev.messages || []), newMsg]
            };
          });
        }
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConv.id ? { ...c, lastMessage: newMsg.text } : c
          )
        );
        setChatInputText('');
      } catch (err) {
        console.error("Failed to send message:", err);
      } finally {
        setSendingMessage(false);
      }
    };

    const renderConvRow = (conv: Conversation, selectedConv: Conversation) => {
      const isSelected = selectedConv && selectedConv.id === conv.id;
      const initials = getInitials(conv.patientName);
      const lastMsgText = conv.lastMessage || (conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : "No messages");
      const lastMsgTime = conv.lastMessageTime || "";

      return (
        <button
          key={conv.id}
          onClick={() => {
            setSelectedChatId(conv.id);
            setChatInputText('');
          }}
          className={`w-full text-left p-3 rounded-xl transition duration-150 flex items-start gap-3 border ${
            isSelected
              ? 'bg-brand-50/50 border-brand-100/80 shadow-sm font-semibold'
              : 'bg-transparent border-transparent hover:bg-surface-subtle/40'
          }`}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-[11px] flex items-center justify-center border border-brand-100 flex-shrink-0 mt-0.5 font-sans">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-xs font-bold text-text-primary truncate">{conv.patientName}</span>
              <span className="text-[9px] text-text-muted font-medium whitespace-nowrap font-sans">{lastMsgTime}</span>
            </div>
            
            <p className="text-[11px] text-text-secondary truncate mt-1 leading-normal font-medium font-sans">
              {lastMsgText}
            </p>

            {/* Sub-tag or urgency badge inside row */}
            {conv.status === 'NEEDS_REVIEW' && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${conv.urgency === 'urgent' ? 'bg-status-danger' : 'bg-status-warning'}`}></span>
                <span className={`text-[9px] font-bold uppercase tracking-wider font-sans ${conv.urgency === 'urgent' ? 'text-status-danger' : 'text-status-warning'}`}>
                  {conv.urgency === 'urgent' ? 'Urgent Medical' : 'Billing/Admin'}
                </span>
              </div>
            )}
            
            {conv.assignedStaff && (
              <div className="flex items-center gap-1.5 mt-1.5 text-brand-600">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                <span className="text-[9px] font-bold uppercase tracking-wider font-sans">
                  Assigned: {conv.assignedStaff}
                </span>
              </div>
            )}
          </div>
        </button>
      );
    };

    return (
      <div className="flex bg-surface-base rounded-2xl border border-surface-border/25 shadow-soft overflow-hidden h-[calc(100vh-170px)] animate-fade-in">
        {/* CONVERSATION LIST (LEFT PANEL) */}
        <div className="w-[320px] border-r border-surface-border/25 flex flex-col bg-surface-base h-full flex-shrink-0">
          {/* List Search Header */}
          <div className="p-4 border-b border-surface-border/15">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-text-muted" size={14} />
              <input
                type="text"
                placeholder="Search patient..."
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-surface-subtle border border-surface-border/50 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans"
              />
            </div>
          </div>

          {/* Collapsible Sections Container */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
            {conversationsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted gap-2">
                <RefreshCw size={18} className="animate-spin text-brand-500" />
                <span className="text-[11px] font-medium font-sans">Loading chats...</span>
              </div>
            ) : (
              <>
                {/* Needs Review Section */}
                <div>
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, needs_review: !prev.needs_review }))}
                    className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider hover:text-text-primary transition duration-150 font-sans"
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronDown size={12} className={`transition-transform duration-150 ${expandedSections.needs_review ? '' : '-rotate-90'}`} />
                      <span>Needs Review</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-sans ${
                      needsReviewList.length > 0
                        ? 'bg-status-dangerBg text-status-danger border border-status-danger/10'
                        : 'bg-surface-subtle text-text-muted'
                    }`}>
                      {needsReviewList.length}
                    </span>
                  </button>

                  {expandedSections.needs_review && (
                    <div className="mt-1.5 space-y-1">
                      {needsReviewList.length === 0 ? (
                        <div className="text-[11px] text-text-muted text-center py-4 italic font-sans">No items need review</div>
                      ) : (
                        needsReviewList.map(conv => renderConvRow(conv, selectedConv))
                      )}
                    </div>
                  )}
                </div>

                {/* AI Handling Section */}
                <div>
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, ai_handling: !prev.ai_handling }))}
                    className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider hover:text-text-primary transition duration-150 font-sans"
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronDown size={12} className={`transition-transform duration-150 ${expandedSections.ai_handling ? '' : '-rotate-90'}`} />
                      <span>AI Handling</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-ai-50 text-ai-600 border border-ai-100/50 font-sans">
                      {aiHandlingList.length}
                    </span>
                  </button>

                  {expandedSections.ai_handling && (
                    <div className="mt-1.5 space-y-1">
                      {aiHandlingList.length === 0 ? (
                        <div className="text-[11px] text-text-muted text-center py-4 italic font-sans">No active AI conversations</div>
                      ) : (
                        aiHandlingList.map(conv => renderConvRow(conv, selectedConv))
                      )}
                    </div>
                  )}
                </div>

                {/* Resolved Section */}
                <div>
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, resolved: !prev.resolved }))}
                    className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider hover:text-text-primary transition duration-150 font-sans"
                  >
                    <div className="flex items-center gap-1.5">
                      <ChevronDown size={12} className={`transition-transform duration-150 ${expandedSections.resolved ? '' : '-rotate-90'}`} />
                      <span>Resolved</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-status-successBg text-status-success border border-status-success/10 font-sans">
                      {resolvedList.length}
                    </span>
                  </button>

                  {expandedSections.resolved && (
                    <div className="mt-1.5 space-y-1">
                      {resolvedList.length === 0 ? (
                        <div className="text-[11px] text-text-muted text-center py-4 italic font-sans">No resolved conversations</div>
                      ) : (
                        resolvedList.map(conv => renderConvRow(conv, selectedConv))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ACTIVE THREAD (RIGHT PANEL) */}
        <div className="flex-1 flex flex-col bg-surface-subtle/15 h-full min-w-0">
          {selectedConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-surface-border/20 bg-surface-base flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100 flex-shrink-0 font-sans">
                    {getInitials(selectedConv.patientName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-text-primary truncate">{selectedConv.patientName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-sans whitespace-nowrap ${
                        selectedConv.status === 'NEEDS_REVIEW'
                          ? selectedConv.urgency === 'urgent'
                            ? 'bg-status-dangerBg text-status-danger border border-status-danger/10'
                            : 'bg-status-warningBg text-status-warning border border-status-warning/10'
                          : selectedConv.status === 'AI_HANDLING' || selectedConv.status === 'STAFF_TOOK_OVER'
                          ? 'bg-ai-50 text-ai-600 border border-ai-100/50'
                          : 'bg-status-successBg text-status-success border border-status-success/10'
                      }`}>
                        {selectedConv.status === 'NEEDS_REVIEW'
                          ? `Needs Review · ${selectedConv.urgency === 'urgent' ? 'Urgent' : 'Admin'}`
                          : selectedConv.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                      <span className="text-text-secondary font-sans">{selectedConv.patientPhone}</span>
                      <span className="text-text-muted">·</span>
                      <button
                        onClick={() => setSelectedPatientId(selectedConv.patientId)}
                        className="font-bold text-brand-500 hover:text-brand-600 transition"
                      >
                        View Patient
                      </button>
                    </div>
                  </div>
                </div>

                {/* Take Over & Resolve Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!selectedConv.assignedStaff && selectedConv.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleTakeOver(selectedConv.id)}
                      className="px-3 py-1.5 text-xs font-bold border border-status-warning/45 text-status-warning hover:bg-status-warningBg/80 rounded-xl transition duration-150 shadow-sm"
                    >
                      Take Over
                    </button>
                  )}
                  {selectedConv.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolve(selectedConv.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-status-success hover:bg-status-success/90 text-white rounded-xl transition duration-150 shadow-sm"
                    >
                      Resolve
                    </button>
                  )}
                  {selectedConv.status === 'RESOLVED' && (
                    <button
                      onClick={() => handleReopen(selectedConv.id)}
                      className="px-3 py-1.5 text-xs font-bold border border-brand-500 text-brand-500 hover:bg-brand-50 rounded-xl transition duration-150 shadow-sm"
                    >
                      Reopen Thread
                    </button>
                  )}
                </div>
              </div>

              {/* Escalation Context Banner */}
              {selectedConv.status === 'NEEDS_REVIEW' && selectedConv.escalationReason && (
                <div className={`p-3.5 mx-6 mt-4 border-l-4 rounded-r-xl flex items-start gap-3 shadow-sm ${
                  selectedConv.urgency === 'urgent'
                    ? 'bg-status-dangerBg border-status-danger text-status-danger'
                    : 'bg-status-warningBg border-status-warning text-status-warning'
                }`}>
                  <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider font-sans">Escalation Triggered</h5>
                    <p className="text-xs mt-0.5 font-medium leading-relaxed font-sans">{selectedConv.escalationReason}</p>
                  </div>
                </div>
              )}

              {/* Message List area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-start">
                {threadLoading ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    <span className="text-[11px] text-text-muted mt-2 font-sans">Loading thread...</span>
                  </div>
                ) : messagesToShow.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                    <MessageSquare size={36} className="text-text-muted mb-2" />
                    <p className="text-xs text-text-secondary font-sans font-medium">No messages in this thread yet.</p>
                  </div>
                ) : (
                  messagesToShow.map((msg, index) => {
                    const isSystem = msg.role === 'system';
                    if (isSystem) {
                      return (
                        <div key={index} className="flex items-center justify-center my-2">
                          <span className="text-[9px] font-bold text-text-muted bg-surface-subtle px-3 py-1 rounded-full border border-surface-border/50 uppercase tracking-wider font-sans">
                            {msg.text} · {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    }

                    const isAI = msg.role === 'ai';
                    const isPatient = msg.role === 'patient';

                    return (
                      <div
                        key={index}
                        className={`flex flex-col max-w-[75%] ${isPatient ? 'self-end items-end' : 'self-start'}`}
                      >
                        {/* Name / Sender Indicator */}
                        <span className={`text-[9px] font-bold mb-1 px-1 font-sans ${
                          isAI ? 'text-ai-600 font-bold' : isPatient ? 'text-text-muted' : 'text-brand-600 font-bold'
                        }`}>
                          {isAI ? 'Zero AI' : isPatient ? selectedConv.patientName : (msg.senderName || 'Staff')}
                        </span>

                        {/* Bubble */}
                        <div className={`p-3.5 text-xs leading-relaxed font-sans shadow-sm ${
                          isAI
                            ? 'bg-ai-100 border border-ai-200 text-ai-950 rounded-2xl rounded-tl-none border-l-4 border-l-ai-500'
                            : isPatient
                            ? 'bg-white border border-surface-border text-text-primary rounded-2xl rounded-tr-none'
                            : 'bg-brand-100 border border-brand-200 text-brand-950 rounded-2xl rounded-tl-none border-l-4 border-l-brand-500'
                        }`}>
                          {msg.text}
                        </div>

                        {/* Time */}
                        <span className="text-[8px] text-text-muted mt-1 px-1 font-sans">
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Panel */}
              <div className="p-4 bg-surface-base border-t border-surface-border/20 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input
                    type="text"
                    disabled={!selectedConv.assignedStaff || selectedConv.status === 'RESOLVED' || sendingMessage}
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder={
                      selectedConv.status === 'RESOLVED'
                        ? "This conversation is resolved."
                        : selectedConv.assignedStaff
                        ? sendingMessage
                          ? "Sending..."
                          : "Type your message..."
                        : "Click 'Take Over' to reply manually..."
                    }
                    className={`flex-1 px-4 py-3 bg-surface-subtle border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans ${
                      !selectedConv.assignedStaff || selectedConv.status === 'RESOLVED' || sendingMessage
                        ? 'cursor-not-allowed text-text-muted border-surface-border/50'
                        : 'text-text-primary border-surface-border/80'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!chatInputText.trim() || !selectedConv.assignedStaff || selectedConv.status === 'RESOLVED' || sendingMessage}
                    className={`p-3 rounded-xl transition duration-150 flex items-center justify-center ${
                      !chatInputText.trim() || !selectedConv.assignedStaff || selectedConv.status === 'RESOLVED' || sendingMessage
                        ? 'bg-surface-subtle border border-surface-border/50 text-text-muted cursor-not-allowed'
                        : 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                    }`}
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <MessageSquare size={48} className="text-text-muted mb-4" />
              <h3 className="text-sm font-semibold text-text-primary">No conversation selected</h3>
              <p className="text-xs text-text-secondary mt-1">Select a conversation from the left menu to view the chat history.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Onboarding Wizard Screen
    const renderVerifyEmailScreen = () => {
    return (
      <div className="w-full max-w-md bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoBlue} className="h-7 w-auto object-contain" alt="Zero Logo" />
            <div className="h-4 w-px bg-brand-200"></div>
            <span className="text-[11px] text-brand-600 uppercase tracking-widest font-bold">
              Clinic OS
            </span>
          </div>
        </div>

        {verificationState === 'loading' && (
          <div className="text-center py-6 space-y-4">
            <RefreshCw className="animate-spin text-brand-500 mx-auto" size={32} />
            <p className="text-sm font-medium text-text-secondary">Verifying your email... Please wait.</p>
          </div>
        )}

        {verificationState === 'success' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-status-successBg text-status-success rounded-full flex items-center justify-center mx-auto border border-status-success/20 shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">Email Verified!</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Email verified! You can now continue setting up your clinic.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
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
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
            >
              Continue to Setup
            </button>
          </div>
        )}

        {verificationState === 'expired' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">This link has expired.</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                The email verification link has expired. You can request a new verification email below.
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5 flex flex-col text-left">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={onboardingEmail}
                  onChange={(e) => setOnboardingEmail(e.target.value)}
                  placeholder="name@clinic.com"
                  className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                />
              </div>
              <button
                type="button"
                disabled={resendCooldown > 0 || !onboardingEmail.trim()}
                onClick={() => handleResendVerification(onboardingEmail)}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
              >
                {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : "Resend email"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentRoute('dashboard');
                  setIsOnboarded(false);
                  setOnboardingStep(1);
                  setOnboardingAuthMode('login');
                }}
                className="w-full py-3 border border-surface-border hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl text-xs transition duration-150"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {verificationState === 'invalid' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">This verification link isn't valid.</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                This verification link isn't valid. It may be broken or tampered with. Please log in and request a fresh verification link from your settings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCurrentRoute('dashboard');
                setIsOnboarded(false);
                setOnboardingStep(1);
                setOnboardingAuthMode('login');
              }}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
            >
              Back to Login
            </button>
          </div>
        )}

        {verificationState === 'missing' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">Missing Verification Token</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                No verification token was provided in the link. Please check your email again or return to sign up.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCurrentRoute('dashboard');
                setIsOnboarded(false);
                setOnboardingStep(1);
                setOnboardingAuthMode('login');
              }}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderResetPasswordScreen = () => {
    const backToLogin = () => {
      window.history.replaceState({}, '', '/');
      setCurrentRoute('dashboard');
      setIsOnboarded(false);
      setOnboardingStep(1);
      setOnboardingAuthMode('login');
    };

    return (
      <div className="w-full max-w-md bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoBlue} className="h-7 w-auto object-contain" alt="Zero Logo" />
            <div className="h-4 w-px bg-brand-200"></div>
            <span className="text-[11px] text-brand-600 uppercase tracking-widest font-bold">
              Clinic OS
            </span>
          </div>
        </div>

        {resetPasswordState === 'missing' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">Missing Reset Token</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                No reset token was provided in the link. Please check your email again or request a new one.
              </p>
            </div>
            <button type="button" onClick={backToLogin} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150">
              Back to Login
            </button>
          </div>
        )}

        {resetPasswordState === 'invalid' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">This reset link isn't valid.</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                It may be broken or already used. Please request a fresh password reset link.
              </p>
            </div>
            <button type="button" onClick={backToLogin} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150">
              Back to Login
            </button>
          </div>
        )}

        {resetPasswordState === 'expired' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mx-auto border border-status-danger/20 shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">This link has expired.</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Password reset links expire after 1 hour. Please request a new one from the login screen.
              </p>
            </div>
            <button type="button" onClick={backToLogin} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150">
              Back to Login
            </button>
          </div>
        )}

        {resetPasswordState === 'success' && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-status-successBg text-status-success rounded-full flex items-center justify-center mx-auto border border-status-success/20 shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-text-primary">Password updated</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your password has been reset successfully. Log in with your new password.
              </p>
            </div>
            <button type="button" onClick={backToLogin} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150">
              Back to Login
            </button>
          </div>
        )}

        {(resetPasswordState === 'form' || resetPasswordState === 'submitting') && (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setResetPasswordError(null);

              if (resetPasswordValue.length < 8) {
                setResetPasswordError('Password must be at least 8 characters.');
                return;
              }
              if (resetPasswordValue !== resetPasswordConfirm) {
                setResetPasswordError('Passwords do not match.');
                return;
              }
              if (!resetPasswordToken) {
                setResetPasswordState('missing');
                return;
              }

              try {
                setResetPasswordState('submitting');
                await api.auth.resetPassword({ token: resetPasswordToken, password: resetPasswordValue });
                setResetPasswordState('success');
              } catch (err: any) {
                if (err.code === 'TOKEN_EXPIRED') {
                  setResetPasswordState('expired');
                } else if (err.code === 'INVALID_TOKEN') {
                  setResetPasswordState('invalid');
                } else {
                  setResetPasswordState('form');
                  setResetPasswordError(err.message || 'Could not reset password. Please try again.');
                }
              }
            }}
          >
            <div className="text-center space-y-2 pb-2">
              <h3 className="text-base font-bold text-text-primary">Set a new password</h3>
              <p className="text-xs text-text-secondary">Choose a new password for your account.</p>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                value={resetPasswordConfirm}
                onChange={(e) => setResetPasswordConfirm(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {resetPasswordError && (
              <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span>{resetPasswordError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={resetPasswordState === 'submitting'}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2 flex items-center justify-center gap-2"
            >
              {resetPasswordState === 'submitting' ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    );
  };

const renderOnboardingWizard = () => {
    if (isTransitioningStep) {
      const statusTexts = [
        "Reading your clinic's services...",
        `Preparing Zero for ${onboardingClinicName || 'your clinic'}...`,
        "Almost ready..."
      ];
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center max-w-[460px] bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 w-full animate-fade-in space-y-8">
          <div className="relative flex h-32 w-32 items-center justify-center">
            {/* Layered Pulsing Glow Rings */}
            <span className="animate-ring-1 absolute inline-flex h-full w-full rounded-full bg-ai-500/10"></span>
            <span className="animate-ring-2 absolute inline-flex h-full w-full rounded-full bg-ai-500/10" style={{ animationDelay: '1.1s' }}></span>
            <span className="animate-ring-3 absolute inline-flex h-full w-full rounded-full bg-ai-500/10" style={{ animationDelay: '2.2s' }}></span>
            
            {/* Pulsing Orb Center */}
            <div className="animate-orb-glow relative inline-flex rounded-full h-20 w-20 bg-gradient-to-tr from-ai-500 to-ai-600 shadow-xl items-center justify-center text-white text-lg font-bold select-none z-10">
              Zero
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-base font-bold text-text-primary">Configuring Clinic Assistant</h3>
            <p className="text-xs text-text-muted animate-pulse font-medium">{statusTexts[transitionStatusIndex]}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-[460px] w-full mx-auto pb-16 pt-8 animate-fade-in font-sans text-xs relative">
        {/* Back Button (except Step 1 and 5) */}
        {onboardingStep > 1 && onboardingStep < 5 && (
          <button
            onClick={() => setOnboardingStep(prev => prev - 1)}
            className="absolute -top-4 left-0 flex items-center gap-1 text-text-secondary hover:text-text-primary text-[11px] font-bold transition duration-150"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}

                {/* Step Indicator dots */}
        {!isVerificationPending && (
          <div className="flex justify-center items-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stepNum === onboardingStep
                    ? 'w-8 bg-brand-500'
                    : stepNum < onboardingStep
                    ? 'w-2 bg-brand-200'
                    : 'w-2 bg-surface-border'
                }`}
              />
            ))}
          </div>
        )}

                {/* STEP 1: ACCOUNT SETUP */}
        {onboardingStep === 1 && (
          <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
            {isVerificationPending ? (
              <div className="space-y-6 text-center py-4 animate-fade-in">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <img src={logoBlue} className="h-7 w-auto object-contain" alt="Zero Logo" />
                  <div className="h-4 w-px bg-brand-200"></div>
                  <span className="text-[11px] text-brand-600 uppercase tracking-widest font-bold">
                    Clinic OS
                  </span>
                </div>
                <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto border border-brand-100 shadow-sm animate-pulse">
                  <Mail size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-text-primary">Check your email</h3>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                    We sent a verification link to <span className="font-semibold text-text-primary">{onboardingEmail}</span>. Please click the link in that email to verify your account.
                  </p>
                </div>
                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={() => handleResendVerification(onboardingEmail)}
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs shadow-soft transition duration-150"
                  >
                    {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : "Resend email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVerificationPending(false)}
                    className="w-full py-3 border border-surface-border hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl text-xs transition duration-150"
                  >
                    Back to Sign Up
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <img src={logoBlue} className="h-7 w-auto object-contain" alt="Zero Logo" />
                    <div className="h-4 w-px bg-brand-200"></div>
                    <span className="text-[11px] text-brand-600 uppercase tracking-widest font-bold">
                      Clinic OS
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-text-primary">Welcome to Zero Clinic OS</h2>
                  <p className="text-text-secondary">Let's set up your clinic's AI patient operator in minutes.</p>
                </div>

                {/* Sign Up / Log In Toggle */}
                {onboardingAuthMode !== 'forgot' && (
                <div className="flex bg-surface-subtle p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setOnboardingAuthMode('signup');
                  setOnboardingAdminName('');
                  setOnboardingEmail('');
                  setOnboardingPassword('');
                }}
                className={`flex-1 py-2 rounded-lg font-bold transition duration-150 ${
                  onboardingAuthMode === 'signup'
                    ? 'bg-surface-base text-brand-600 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setOnboardingAuthMode('login');
                  setOnboardingAdminName('');
                  setOnboardingEmail('');
                  setOnboardingPassword('');
                }}
                className={`flex-1 py-2 rounded-lg font-bold transition duration-150 ${
                  onboardingAuthMode === 'login'
                    ? 'bg-surface-base text-brand-600 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Log In
              </button>
            </div>
            )}

            {onboardingAuthMode === 'forgot' ? (
              <form
                key="forgot-password-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setIsLoading(true);
                    setForgotPasswordError(null);
                    await api.auth.forgotPassword({ email: forgotPasswordEmail });
                    setForgotPasswordSent(true);
                  } catch (err: any) {
                    setForgotPasswordError(err.message || "Could not send reset email. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="text-center space-y-1 pb-1">
                  <h3 className="text-sm font-bold text-text-primary">Reset your password</h3>
                  <p className="text-[11px] text-text-secondary">
                    {forgotPasswordSent
                      ? "If an account exists for that email, we've sent a reset link."
                      : "Enter your work email and we'll send you a reset link."}
                  </p>
                </div>

                {!forgotPasswordSent && (
                  <>
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Work Email</label>
                      <input
                        key="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        required
                        placeholder="e.g. admin@yourclinic.com"
                        className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    {forgotPasswordError && (
                      <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle size={14} className="flex-shrink-0" />
                        <span>{forgotPasswordError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="animate-spin" size={14} />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setOnboardingAuthMode('login');
                    setForgotPasswordEmail('');
                    setForgotPasswordSent(false);
                    setForgotPasswordError(null);
                  }}
                  className="w-full py-3 border border-surface-border hover:bg-surface-subtle text-text-secondary font-semibold rounded-xl text-xs transition duration-150"
                >
                  Back to Login
                </button>
              </form>
            ) : onboardingAuthMode === 'signup' ? (
              <form
                key="signup-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setIsLoading(true);
                    setSignUpError(null);
                    const res = await api.auth.register({
                      fullName: onboardingAdminName,
                      email: onboardingEmail,
                      password: onboardingPassword,
                      clinicName: onboardingClinicName.trim() || "New Clinic",
                    });
                                        localStorage.setItem("zero_token", res.token);
                    const cId = res.clinic?.id || res.staff?.clinicId;
                    if (cId) {
                      localStorage.setItem("zero_clinic_id", cId);
                      setClinicId(cId);
                    }
                    setIsVerificationPending(true);
                  } catch (err: any) {
                    setSignUpError(err.message || "Registration failed. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Admin Full Name</label>
                  <input
                    key="signup-name"
                    type="text"
                    value={onboardingAdminName}
                    onChange={(e) => setOnboardingAdminName(e.target.value)}
                    required
                    placeholder="e.g. Sarah Sedai"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Work Email</label>
                  <input
                    key="signup-email"
                    type="email"
                    value={onboardingEmail}
                    onChange={(e) => setOnboardingEmail(e.target.value)}
                    required
                    placeholder="e.g. admin@yourclinic.com"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Password</label>
                  <input
                    key="signup-password"
                    type="password"
                    value={onboardingPassword}
                    onChange={(e) => setOnboardingPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {signUpError && (
                  <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>{signUpError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>
            ) : (
              <form
                key="login-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setIsLoading(true);
                    setLoginError(null);
                    const res = await api.auth.login({
                      email: onboardingEmail,
                      password: onboardingPassword,
                    });
                                        localStorage.setItem("zero_token", res.token);
                    await checkSession();
                  } catch (err: any) {
                    setLoginError(err.message || "Invalid email or password.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email</label>
                  <input
                    key="login-email"
                    type="email"
                    value={onboardingEmail}
                    onChange={(e) => setOnboardingEmail(e.target.value)}
                    required
                    placeholder="e.g. admin@yourclinic.com"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Password</label>
                  <input
                    key="login-password"
                    type="password"
                    value={onboardingPassword}
                    onChange={(e) => setOnboardingPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardingAuthMode('forgot');
                      setForgotPasswordEmail(onboardingEmail);
                      setForgotPasswordSent(false);
                      setForgotPasswordError(null);
                      setLoginError(null);
                    }}
                    className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 transition duration-150"
                  >
                    Forgot password?
                  </button>
                </div>

                {loginError && (
                  <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/15 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      <span>Logging In...</span>
                    </>
                  ) : (
                    <span>Log In</span>
                  )}
                </button>
              </form>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-surface-border/40"></div>
              <span className="flex-shrink mx-4 text-text-muted text-[10px] font-bold uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-surface-border/40"></div>
            </div>

                        <button
              type="button"
              onClick={() => {
                if (onboardingAuthMode === 'login') {
                  if (!onboardingAdminName.trim()) {
                    setOnboardingAdminName('Apex Clinic Admin');
                  }
                  setIsOnboarded(true);
                } else {
                  setOnboardingStep(2);
                }
              }}
              className="w-full py-3 bg-surface-base hover:bg-surface-subtle border border-surface-border rounded-xl font-bold text-text-primary transition duration-150 text-xs flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.281 1.77 15.485 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.984 0-.743-.08-1.302-.178-1.782h-10.615z" />
              </svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
    )}

        {/* STEP 2: CLINIC INFO */}
        {onboardingStep === 2 && (
          <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-text-primary">Clinic Details</h2>
              <p className="text-text-secondary">Provide details to train your AI operator on your services and hours.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setOnboardingStep(3);
              }}
              className="space-y-4"
            >
              <div className="space-y-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinic Name</label>
                  <input
                    type="text"
                    value={onboardingClinicName}
                    onChange={(e) => setOnboardingClinicName(e.target.value)}
                    required
                    placeholder="e.g. Apex Family Clinic"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />
                </div>

                {/* Services Offered Searchable Tag Selector */}
                <div className="space-y-1.5 flex flex-col relative">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Services Offered</label>
                  
                  {/* Selected Tags Display */}
                  {selectedServices.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {selectedServices.map(service => (
                        <span
                          key={service}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100"
                        >
                          {service}
                          <button
                            type="button"
                            onClick={() => setSelectedServices(prev => prev.filter(s => s !== service))}
                            className="text-brand-500 hover:text-brand-700 focus:outline-none"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Input Field */}
                  <div className="relative">
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => {
                        setServiceSearch(e.target.value);
                        setIsServiceDropdownOpen(true);
                      }}
                      onFocus={() => setIsServiceDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsServiceDropdownOpen(false), 200)}
                      placeholder={selectedServices.length === 0 ? "Search or type services..." : "Add another service..."}
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                    />
                    
                    {/* Dropdown Menu */}
                    {isServiceDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1.5 bg-surface-base border border-surface-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {(() => {
                          const filtered = PRESET_SERVICES.filter(
                            s => s.toLowerCase().includes(serviceSearch.toLowerCase()) && !selectedServices.includes(s)
                          );
                          
                          return (
                            <div className="py-1">
                              {filtered.map(service => (
                                <button
                                  key={service}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setSelectedServices(prev => [...prev, service]);
                                    setServiceSearch('');
                                    setIsServiceDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-surface-subtle font-medium transition duration-150"
                                >
                                  {service}
                                </button>
                              ))}
                              
                              {/* Custom option */}
                              {serviceSearch.trim() && !PRESET_SERVICES.some(s => s.toLowerCase() === serviceSearch.trim().toLowerCase()) && !selectedServices.some(s => s.toLowerCase() === serviceSearch.trim().toLowerCase()) && (
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setSelectedServices(prev => [...prev, serviceSearch.trim()]);
                                    setServiceSearch('');
                                    setIsServiceDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs text-brand-600 hover:bg-brand-50/50 font-semibold border-t border-surface-border/40 transition duration-150"
                                >
                                  Add "{serviceSearch.trim()}" as a custom service
                                </button>
                              )}
                              
                              {filtered.length === 0 && !serviceSearch.trim() && (
                                <div className="px-3.5 py-2 text-xs text-text-muted text-center font-medium">
                                  All preset services selected
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinic Address</label>
                  <input
                    type="text"
                    value={onboardingAddress}
                    onChange={(e) => setOnboardingAddress(e.target.value)}
                    required
                    placeholder="e.g. 123 Eldene Way, Suite 400, Apex City"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />
                </div>

                {/* Structured Operating Hours Picker */}
                <div className="space-y-2 flex flex-col border border-surface-border/30 bg-surface-subtle/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-500" />
                    <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Operating Hours</span>
                  </div>

                  {/* Day range chips */}
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedDays(prev => prev.filter(d => d !== day));
                            } else {
                              setSelectedDays(prev => [...prev, day]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition duration-150 ${
                            isSelected
                              ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                              : 'bg-surface-base border-surface-border text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Time range selectors */}
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <div className="flex flex-col space-y-1">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Opens At</span>
                      <select
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        className="p-2.5 bg-surface-base border border-surface-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        {['7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM'].map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Closes At</span>
                      <select
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        className="p-2.5 bg-surface-base border border-surface-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        {['3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '8:00 PM'].map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: CONNECT WHATSAPP */}
        {onboardingStep === 3 && (
          <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-text-primary">Connect WhatsApp Business API</h2>
              <p className="text-text-secondary">Deploy Zero directly onto your official business number.</p>
            </div>

            {/* Honest Status Pattern */}
            <div className="p-4 bg-status-warningBg border border-status-warning/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-status-warning flex items-center gap-1.5">
                  <Clock size={14} /> Verification Pending
                </span>
                <span className="text-[10px] font-bold text-text-muted bg-surface-base px-2 py-0.5 rounded-md border border-surface-border/30">Meta API Review</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Once verified, your patients will be able to book, get reminders, and reach your clinic 24/7 — right from WhatsApp, with no app to download.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Meta Integration Steps</h4>
              <div className="space-y-2 bg-surface-subtle p-4 rounded-xl">
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <CheckCircle2 size={14} className="text-status-success" />
                  <span className="line-through font-medium text-text-muted">Create Meta Developer Account</span>
                </div>
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <CheckCircle2 size={14} className="text-status-success" />
                  <span className="line-through font-medium text-text-muted">Link Business Manager Portfolio</span>
                </div>
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <Clock size={14} className="text-status-warning animate-pulse" />
                  <span className="font-bold text-text-primary">Meta Business Verification (In Review)</span>
                </div>
                <div className="flex items-center gap-2.5 text-text-muted">
                  <div className="w-3.5 h-3.5 rounded-full border border-surface-border flex items-center justify-center text-[8px] font-bold">4</div>
                  <span>Phone Number Registration</span>
                </div>
              </div>
            </div>

            <div className="bg-brand-50/50 border border-brand-100 p-4 rounded-xl flex gap-3">
              <span className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-[10px] text-brand-600 font-bold flex-shrink-0">i</span>
              <p className="text-[11px] text-brand-700 leading-relaxed">
                <strong>Sandbox active:</strong> While Meta verifies your business details, we have pre-configured a Sandbox environment so you can experience Zero's patient interaction immediately.
              </p>
            </div>

            <button
              onClick={() => setOnboardingStep(4)}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2"
            >
              Continue to Staff Setup
            </button>
          </div>
        )}

        {/* STEP 4: ADD STAFF / DOCTORS */}
        {onboardingStep === 4 && (
          <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-text-primary">Practitioner Profiles</h2>
              <p className="text-text-secondary">Add at least one doctor to help Zero schedule appointments correctly.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                startTransitionToStep5();
              }}
              className="space-y-4"
            >
              <div className="space-y-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Doctor Name</label>
                  <input
                    type="text"
                    value={onboardingDoctorName}
                    onChange={(e) => setOnboardingDoctorName(e.target.value)}
                    required
                    placeholder="e.g. Dr. Lan Mandragoran"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />
                </div>

                {/* Doctor Roles Searchable Tag Selector */}
                <div className="space-y-1.5 flex flex-col relative">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Role / Specialization</label>
                  
                  {/* Selected Tags Display */}
                  {selectedDoctorRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {selectedDoctorRoles.map(role => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100"
                        >
                          {role}
                          <button
                            type="button"
                            onClick={() => setSelectedDoctorRoles(prev => prev.filter(r => r !== role))}
                            className="text-brand-500 hover:text-brand-700 focus:outline-none"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Input Field */}
                  <div className="relative">
                    <input
                      type="text"
                      value={doctorRoleSearch}
                      onChange={(e) => {
                        setDoctorRoleSearch(e.target.value);
                        setIsDoctorRoleDropdownOpen(true);
                      }}
                      onFocus={() => setIsDoctorRoleDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDoctorRoleDropdownOpen(false), 200)}
                      placeholder={selectedDoctorRoles.length === 0 ? "Search or type specialization..." : "Add another..."}
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                    />
                    
                    {/* Dropdown Menu */}
                    {isDoctorRoleDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1.5 bg-surface-base border border-surface-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {(() => {
                          const filtered = PRESET_ROLES.filter(
                            r => r.toLowerCase().includes(doctorRoleSearch.toLowerCase()) && !selectedDoctorRoles.includes(r)
                          );
                          
                          return (
                            <div className="py-1">
                              {filtered.map(role => (
                                <button
                                  key={role}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setSelectedDoctorRoles(prev => [...prev, role]);
                                    setDoctorRoleSearch('');
                                    setIsDoctorRoleDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-surface-subtle font-medium transition duration-150"
                                >
                                  {role}
                                </button>
                              ))}
                              
                              {/* Custom option */}
                              {doctorRoleSearch.trim() && !PRESET_ROLES.some(r => r.toLowerCase() === doctorRoleSearch.trim().toLowerCase()) && !selectedDoctorRoles.some(r => r.toLowerCase() === doctorRoleSearch.trim().toLowerCase()) && (
                                <button
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setSelectedDoctorRoles(prev => [...prev, doctorRoleSearch.trim()]);
                                    setDoctorRoleSearch('');
                                    setIsDoctorRoleDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs text-brand-600 hover:bg-brand-50/50 font-semibold border-t border-surface-border/40 transition duration-150"
                                >
                                  Add "{doctorRoleSearch.trim()}" as a custom role
                                </button>
                              )}
                              
                              {filtered.length === 0 && !doctorRoleSearch.trim() && (
                                <div className="px-3.5 py-2 text-xs text-text-muted text-center font-medium">
                                  All preset roles selected
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={onboardingDoctorEmail}
                    onChange={(e) => setOnboardingDoctorEmail(e.target.value)}
                    required
                    placeholder="e.g. lan.m@apexfamily.com"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2"
              >
                Continue to Preview
              </button>
            </form>
          </div>
        )}

        {/* STEP 5: SIMULATED PREVIEW */}
        {onboardingStep === 5 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-text-primary">Zero is Ready</h2>
              <p className="text-text-secondary">Here is how Zero interacts with a patient booking at your clinic in real time.</p>
            </div>

            {/* Chat preview card (Ask Super AI Card-shaped representation) */}
            <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-6 space-y-4 w-full relative overflow-hidden">
              {/* Simple Agent Header (Christian/Agent Header-shaped representation) */}
              <div className="flex items-center gap-3 pb-3 border-b border-surface-border/40">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ai-500 to-ai-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                  Z
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-text-primary text-xs">Zero AI</span>
                    <span className="w-2 h-2 rounded-full bg-status-success"></span>
                  </div>
                  <span className="text-[10px] text-text-muted">WhatsApp Care Operator</span>
                </div>
              </div>

              {/* Message List */}
              <div className="space-y-3.5 min-h-[220px] flex flex-col justify-end">
                {previewMessages.map((msg, index) => {
                  const isAI = msg.sender === 'ai';
                  return (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[80%] ${
                        isAI ? 'self-start items-start' : 'self-end items-end'
                      }`}
                    >
                      <div
                        className={`px-4 py-3 text-xs leading-relaxed ${
                          isAI
                            ? 'bg-ai-50/70 text-ai-900 border border-ai-100/50 rounded-2xl rounded-tl-none font-medium'
                            : 'bg-surface-subtle/70 text-text-primary border border-surface-border/20 rounded-2xl rounded-tr-none font-medium'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-text-muted mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })}

                {/* Bouncing Dots typing indicator */}
                {previewTyping && (
                  <div className="flex gap-1.5 items-center bg-ai-50/40 border border-ai-100/30 px-4 py-3 rounded-2xl w-fit max-w-[70%] text-text-secondary self-start rounded-tl-none">
                    <span className="w-1.5 h-1.5 bg-ai-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-ai-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-ai-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-4 max-w-sm mx-auto">
              <p className="text-[13px] text-text-primary font-bold">
                This is Zero, working for {onboardingClinicName.trim() || 'your clinic'}.
              </p>
              <button
                onClick={() => {
                  setIsOnboarded(true);
                  setCurrentRoute('dashboard');
                }}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

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
      setSavedClinicName={setSavedClinicName}
      savedAddress={savedAddress}
      setSavedAddress={setSavedAddress}
      savedHours={savedHours}
      setSavedHours={setSavedHours}
      savedServices={savedServices}
      setSavedServices={setSavedServices}
      staffList={staffList}
      setStaffList={setStaffList}
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
      />

      {/* MAIN CONTAINER */}
      <div className="flex-1 pl-[260px] min-h-screen flex flex-col">
        <Topbar
          clinicName={settingsClinicName}
          currentRoute={currentRoute}
          isNotificationsOpen={isNotificationsDropdownOpen}
          onToggleNotifications={() => setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllAsRead}
          onNotificationClick={handleNotificationClick}
        />

                {/* 3. MAIN CONTENT AREA */}
        <main className="p-8 flex-1 space-y-6 w-full">
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
            <>
              {/* GREETING HEADER */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-[24px] font-semibold text-text-primary leading-tight">
                    Good afternoon, {isOnboarded ? settingsClinicName : mockClinicInfo.name}
                  </h2>
                  <p className="text-[14px] text-text-secondary mt-1">
                    {mockClinicInfo.todayPatients} patients today · {mockClinicInfo.doctorsOnDuty} doctors on duty ·{' '}
                    <span className="font-semibold text-status-warning">
                      {conversations.filter(c => c.status === 'NEEDS_REVIEW' && !dismissedAttentionIds.includes(c.id)).length} conversations need your attention
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => alert('Report download started...')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-brand-500 text-brand-500 hover:bg-brand-50 font-medium rounded-xl text-sm transition duration-200"
                >
                  <Download size={16} />
                  <span>Download Report</span>
                </button>
              </div>

              {/* HERO: AI ACTIVITY CARD */}
              <div className="bg-surface-base border border-surface-border/35 border-l-4 border-l-ai-500 rounded-2xl shadow-soft p-6 relative overflow-hidden flex flex-col gap-6">
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-text-secondary">
                    Zero is working — AI patient care operations
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 border border-brand-100">
                      <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
                      Analytics Pending
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                      <span className="text-[12px] font-semibold text-status-success">Active</span>
                    </div>
                  </div>
                </div>

                {/* Stat Row */}
                <div className="grid grid-cols-3 border-t border-surface-border/60 pt-6">
                  {/* Conversations Handled Today */}
                  <div className="flex flex-col items-center justify-center text-center py-1">
                    <span className="text-[24px] font-semibold text-text-primary leading-none">
                      {mockAIStats.handledConversations}
                    </span>
                    <span className="text-[12px] text-text-secondary mt-1.5">
                      Conversations handled today
                    </span>
                  </div>

                  {/* Escalated to Staff */}
                  <div className="flex flex-col items-center justify-center text-center py-1 border-x border-surface-border/60">
                    <span className="text-[24px] font-semibold text-text-primary leading-none">
                      {mockAIStats.escalatedConversations}
                    </span>
                    <span className="text-[12px] text-text-secondary mt-1.5">
                      Escalated to staff
                    </span>
                  </div>

                  {/* Avg Response Time */}
                  <div className="flex flex-col items-center justify-center text-center py-1">
                    <span className="text-[24px] font-semibold text-text-primary leading-none">
                      {mockAIStats.avgResponseTime === '8 seconds' ? '8s' : mockAIStats.avgResponseTime}
                    </span>
                    <span className="text-[12px] text-text-secondary mt-1.5">
                      Avg response time
                    </span>
                  </div>
                </div>
              </div>

              {/* STAT ROW (3 Compact Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    label: "Patients Waiting",
                    count: queue.filter(q => statusToTab[q.status] === 'waiting').length,
                    change: "Live count",
                    type: "waiting"
                  },
                  {
                    label: "With Doctor",
                    count: queue.filter(q => statusToTab[q.status] === 'with_doctor').length,
                    change: "Live count",
                    type: "withDoctor"
                  },
                  {
                    label: "Completed Today",
                    count: queue.filter(q => statusToTab[q.status] === 'completed').length,
                    change: "Live count",
                    type: "completed"
                  }
                ].map((card) => (
                  <div
                    key={card.label}
                    className="bg-surface-base rounded-2xl p-6 shadow-soft hover:shadow-soft-md transition duration-200 border border-surface-border/20 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs text-text-secondary font-medium tracking-wide block uppercase">
                        {card.label}
                      </span>
                      <span className="text-3xl font-bold text-text-primary block mt-1.5">
                        {card.count}
                      </span>
                      <span className={`text-xs font-semibold inline-block mt-2 px-2.5 py-0.5 rounded-full ${
                        card.type === 'waiting'
                          ? 'bg-status-warningBg text-status-warning'
                          : card.type === 'withDoctor'
                          ? 'bg-brand-50 text-brand-600'
                          : 'bg-status-successBg text-status-success'
                      }`}>
                        {card.change}
                      </span>
                    </div>

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      card.type === 'waiting'
                        ? 'bg-status-warningBg text-status-warning'
                        : card.type === 'withDoctor'
                        ? 'bg-brand-50 text-brand-500'
                        : 'bg-status-successBg text-status-success'
                    }`}>
                      {card.type === 'waiting' && <Clock size={22} />}
                      {card.type === 'withDoctor' && <Users size={22} />}
                      {card.type === 'completed' && <CheckCircle2 size={22} />}
                    </div>
                  </div>
                ))}
              </div>

              {/* TWO COLUMN ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Today's Appointments (Mini) - 60% width */}
                <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-text-primary">Today's Appointments</h3>
                      <button
                        onClick={() => setCurrentRoute('appointments')}
                        className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1 transition duration-150"
                      >
                        <span>View All</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-surface-border/30 text-left">
                            <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider">Patient</th>
                            <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider">Time</th>
                            <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider">Doctor</th>
                            <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider">Status</th>
                            <th className="pb-3 text-xs font-semibold text-text-secondary tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                                                <tbody className="divide-y divide-surface-border/20">
                                                    {[...appointments]
                            .filter(a => a && a.date && (a.status?.toLowerCase() ?? '') !== 'cancelled')
                            .sort((a, b) => {
                              if (a.date !== b.date) return a.date.localeCompare(b.date);
                              const getMinutes = (t: string) => {
                                if (!t) return 0;
                                const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
                                if (!m) return 0;
                                let h = parseInt(m[1], 10);
                                const mins = parseInt(m[2], 10);
                                if (m[3]) {
                                  const ampm = m[3].toUpperCase();
                                  if (ampm === "PM" && h < 12) h += 12;
                                  if (ampm === "AM" && h === 12) h = 0;
                                }
                                return h * 60 + mins;
                              };
                              return getMinutes(a.time) - getMinutes(b.time);
                            })
                            .slice(0, 8)
                            .map((apt) => {
                              const aptStatus = apt.status?.toLowerCase();
                              return (
                                <tr key={apt.id} className="hover:bg-surface-subtle/50 transition duration-150">
                                  <td className="py-3 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100">
                                      {apt.patientName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT'}
                                    </div>
                                    <span className="text-xs font-semibold text-text-primary">{apt.patientName ?? ''}</span>
                                  </td>
                                  <td className="py-3 text-xs font-medium text-text-primary">{apt.time}</td>
                                  <td className="py-3 text-xs text-text-secondary font-medium">{apt.doctor}</td>
                                  <td className="py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                      aptStatus === 'confirmed'
                                        ? 'bg-status-successBg text-status-success'
                                        : aptStatus === 'pending'
                                        ? 'bg-status-warningBg text-status-warning'
                                        : 'bg-status-dangerBg text-status-danger'
                                    }`}>
                                      <span className={`w-1 h-1 rounded-full ${
                                        aptStatus === 'confirmed'
                                          ? 'bg-status-success'
                                          : aptStatus === 'pending'
                                          ? 'bg-status-warning'
                                          : 'bg-status-danger'
                                      }`}></span>
                                      {appointmentStatusLabels[aptStatus as AppointmentStatus] || apt.status}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right relative">
                                    <div className="relative inline-block text-left">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenDropdownId(openDropdownId === apt.id ? null : apt.id);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-surface-border text-text-secondary hover:text-text-primary bg-surface-base hover:bg-surface-subtle font-medium rounded-xl text-xs transition duration-150 shadow-sm"
                                      >
                                        <span>Actions</span>
                                        <ChevronDown size={12} className="text-text-muted" />
                                      </button>
                                      
                                      {openDropdownId === apt.id && (
                                        <div className="absolute right-0 mt-1.5 w-28 bg-surface-base border border-surface-border rounded-xl shadow-lg z-50 py-1 origin-top-right">
                                          <button
                                            onClick={() => {
                                              handleStatusChange(apt.id, 'Confirmed');
                                              setOpenDropdownId(null);
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs text-status-success hover:bg-status-successBg font-semibold transition duration-150"
                                          >
                                            Accept
                                          </button>
                                          <button
                                            onClick={() => {
                                              handleStatusChange(apt.id, 'Cancelled');
                                              setOpenDropdownId(null);
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs text-status-danger hover:bg-status-dangerBg font-semibold transition duration-150"
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Needs Attention - 40% width */}
                <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-text-primary mb-6">Needs Attention</h3>
                    
                    {conversations.filter(c => c.status === 'NEEDS_REVIEW' && !dismissedAttentionIds.includes(c.id)).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-12 h-12 bg-status-successBg text-status-success rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 size={24} />
                        </div>
                        <p className="text-sm font-semibold text-text-primary">Nothing needs attention</p>
                        <p className="text-xs text-text-secondary mt-1">AI and queue are running smoothly.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conversations
                          .filter(c => c.status === 'NEEDS_REVIEW' && !dismissedAttentionIds.includes(c.id))
                          .map((conv) => {
                            const isUrgent = conv.urgency === 'urgent';
                            const title = isUrgent ? 'Urgent Medical' : 'Billing/Admin';
                            const type = isUrgent ? 'escalation' : 'warning';
                            return (
                              <div
                                key={conv.id}
                                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition duration-150 ${
                                  type === 'escalation'
                                    ? 'bg-status-dangerBg border-status-danger/10'
                                    : 'bg-status-warningBg border-status-warning/10'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      type === 'escalation'
                                        ? 'bg-status-danger text-white'
                                        : 'bg-status-warning text-white'
                                    }`}>
                                      {type === 'escalation' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-text-primary leading-tight">{title}</h4>
                                      <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                                        {conv.escalationReason || 'Requires review'}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-semibold text-text-muted flex-shrink-0">
                                    {conv.lastMessageTime || ''}
                                  </span>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-1 border-t border-black/[0.03]">
                                  <button
                                    onClick={() => setDismissedAttentionIds(prev => [...prev, conv.id])}
                                    className="px-2.5 py-1 text-[10px] font-bold text-text-secondary hover:text-text-primary rounded-md transition duration-150"
                                  >
                                    Dismiss
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedChatId(conv.id);
                                      setCurrentRoute('zero-chat');
                                    }}
                                    className={`px-3 py-1 rounded-md font-bold text-[10px] transition duration-150 text-white shadow-sm ${
                                      type === 'escalation'
                                        ? 'bg-status-danger hover:bg-status-danger/90'
                                        : 'bg-status-warning hover:bg-status-warning/90'
                                    }`}
                                  >
                                    Review
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: TREND CHART */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Booking Trend Chart - 70% width -> Placeholder */}
                <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-7 flex flex-col justify-center items-center min-h-[340px] relative overflow-hidden group">
                  {/* Subtle decorative background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50/10 to-ai-50/10 opacity-30"></div>
                  <div className="relative flex flex-col items-center text-center max-w-sm px-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4 animate-pulse">
                      <RefreshCw size={24} className="animate-spin text-brand-500" style={{ animationDuration: '4s' }} />
                    </div>
                    <h3 className="text-base font-bold text-text-primary mb-2">Analytics Sync Pending</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Real-time booking and conversation trends will populate here once the backend analytics integration goes live.
                    </p>
                  </div>
                </div>

                {/* AI Performance Insights - 30% width */}
                <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-3 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-50 text-brand-600 border border-brand-100">
                      Syncing...
                    </span>
                  </div>
                  <div className="space-y-4">
                    <span className="text-[11px] font-semibold text-ai-600 uppercase tracking-widest block">
                      AI AUTONOMY RATE
                    </span>
                    <div>
                      <span className="text-4xl font-bold text-text-primary tracking-tight">91.3%</span>
                      <div className="flex items-center gap-1 text-xs text-status-success font-medium mt-1">
                        <TrendingUp size={14} />
                        <span>+2.4% vs last week</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-surface-border/30 space-y-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Autopilot Sessions</span>
                        <span className="font-bold text-text-primary">103 sessions</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Manual Escalations</span>
                        <span className="font-bold text-text-primary">9 sessions</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Recall Success Rate</span>
                        <span className="font-bold text-text-primary">78% response</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-ai-50/50 border border-ai-100/50 rounded-xl p-3 flex items-start">
                    <p className="text-[11px] text-ai-600 leading-relaxed font-medium">
                      Zero automated 89% of billing queries this week, lowering escalation rates by 5.4%.
                    </p>
                  </div>
                </div>
              </div>
                          </>
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
