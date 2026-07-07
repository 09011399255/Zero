import { useState, useEffect, useRef } from 'react';
import { api, AppointmentStatus, Conversation, ConversationMessage, ConversationStatus, Patient } from './api';
import { jwtDecode } from 'jwt-decode';
import { io, Socket } from 'socket.io-client';
import {
  LayoutGrid,
  Timer,
  Calendar,
  MessageSquare,
  Users,
  TrendingUp,
  Settings,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  LogOut,
  HelpCircle,
  Bell,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  X,
  ChevronLeft,
  Send,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  mockClinicInfo,
  mockAIStats,
  mockAppointments,
  Appointment,
  mockPatients
} from './mockData';



interface NotificationItem {
  id: string;
  type: 'escalation' | 'recall' | 'no-show';
  title: string;
  description: string;
  time: string;
  read: boolean;
  linkData: {
    route: string;
    patientId?: string;
    tab?: string;
  };
}

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

const recallStatusLabels: Record<string, string> = {
  UP_TO_DATE: "Up to date",
  DUE_SOON: "Due Soon",
  OVERDUE: "Overdue",
};

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

const statusLabels: Record<string, string> = {
  WAITING: "Waiting",
  waiting: "Waiting",
  WITH_DOCTOR: "With Doctor",
  with_doctor: "With Doctor",
  COMPLETED: "Completed",
  completed: "Completed",
  NO_SHOW: "No Show",
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
  const [currentRoute, setCurrentRoute] = useState<'dashboard' | string>('dashboard');
  const [dismissedAttentionIds, setDismissedAttentionIds] = useState<string[]>([]);
  const [queueLoaded, setQueueLoaded] = useState(false);
  const [appointmentsLoadedThisSession, setAppointmentsLoadedThisSession] = useState(false);
  const [conversationsLoadedThisSession, setConversationsLoadedThisSession] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Auth & Session States
  const [sessionChecked, setSessionChecked] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(localStorage.getItem("zero_clinic_id"));
  const [queueLoading, setQueueLoading] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);

  // Session Check on App Load
  useEffect(() => {
    const token = localStorage.getItem("zero_token");
    if (!token) {
      setSessionChecked(true);
      return;
    }
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const isExpired = decoded.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem("zero_token");
        localStorage.removeItem("zero_clinic_id");
        setClinicId(null);
        setSessionChecked(true);
        return;
      }
      api.clinic.get()
        .then((clinic: any) => {
          if (clinic?.id) {
            localStorage.setItem("zero_clinic_id", clinic.id);
            setClinicId(clinic.id);
          }
          setIsOnboarded(true);
          setCurrentRoute("dashboard");
          setSessionChecked(true);
        })
        .catch((err: any) => {
          if (err.status === 401) {
            localStorage.removeItem("zero_token");
            localStorage.removeItem("zero_clinic_id");
            setClinicId(null);
          }
          setSessionChecked(true);
        });
    } catch {
      localStorage.removeItem("zero_token");
      localStorage.removeItem("zero_clinic_id");
      setClinicId(null);
      setSessionChecked(true);
    }
  }, []);

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
      setAppointments(prev => [...prev, payload.appointment]);
    });

    socket.on("appointment:updated", (payload: { appointment: Appointment }) => {
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === payload.appointment.id ? payload.appointment : apt
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
      const data = await api.queue.get();
      const allEntries = [
        ...data.waiting,
        ...data.with_doctor,
        ...data.completed,
        ...data.no_show,
      ];
      setQueue(allEntries);
      setQueueLoaded(true);
    } catch (err) {
      console.error("Failed to load queue:", err);
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
  const [walkInReason, setWalkInReason] = useState('');
  const [walkInDoctor, setWalkInDoctor] = useState('Dr. Lan Mandragoran');

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
  const [onboardingAuthMode, setOnboardingAuthMode] = useState<'signup' | 'login'>('signup');
  
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
      setAppointments(data);
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
      const newAppt = await api.appointments.create({
        patientId: formPatientId,
        patientName: patient.name,
        doctor: formDoctor,
        date: formDate || new Date().toISOString().split("T")[0],
        time: convertTo24Hour(formTime),
        visitType: formDept,
        bookedVia: "manual",
      });
      setAppointments(prev => [newAppt, ...prev]);
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
      const statusMap: Record<string, 'PENDING' | 'CONFIRMED' | 'CANCELLED'> = {
        Confirmed: 'CONFIRMED',
        Pending: 'PENDING',
        Cancelled: 'CANCELLED'
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
  const renderLiveQueueScreen = () => {


    const waitingCount = queue.filter(q => statusToTab[q.status] === 'waiting').length;
    const withDoctorCount = queue.filter(q => statusToTab[q.status] === 'with_doctor').length;
    const completedCount = queue.filter(q => statusToTab[q.status] === 'completed').length;
    const noShowCount = queue.filter(q => statusToTab[q.status] === 'no_show').length;

    const filteredQueue = queue.filter(q => statusToTab[q.status] === queueTab);

    const handleCallIn = async (id: string) => {
      const entry = queue.find(q => q.id === id);
      const patientId = entry?.patientId;
      if (!patientId) return;
      try {
        await api.queue.updateStatus(patientId, "WITH_DOCTOR");
        await loadQueue();
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    };

    const handleComplete = async (id: string) => {
      const entry = queue.find(q => q.id === id);
      const patientId = entry?.patientId;
      if (!patientId) return;
      try {
        await api.queue.updateStatus(patientId, "COMPLETED");
        await loadQueue();
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    };

    const handleMarkArrived = async (id: string) => {
      const entry = queue.find(q => q.id === id);
      const patientId = entry?.patientId;
      if (!patientId) return;
      try {
        await api.queue.updateStatus(patientId, "WAITING");
        await loadQueue();
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    };

    return (
      <div className="space-y-6 relative animate-fade-in">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-text-primary leading-tight">Live Queue</h2>
            <p className="text-[14px] text-text-secondary mt-1">
              {waitingCount} waiting · {withDoctorCount} with doctor · {completedCount} completed today
            </p>
          </div>

          <button
            onClick={() => {
              setWalkInType('registered');
              setWalkInPatientId(null);
              setWalkInNewPatientName('');
              setWalkInReason('');
              setWalkInDoctor('Dr. Lan Mandragoran');
              setIsNewWalkInDrawerOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-brand-500 text-brand-500 hover:bg-brand-50 font-semibold rounded-xl text-xs transition duration-200"
          >
            <Plus size={16} />
            <span>Add Walk-in</span>
          </button>
        </div>

        {/* STATUS TABS */}
        <div className="flex border-b border-surface-border/30 gap-6">
          <button
            onClick={() => setQueueTab('waiting')}
            className={`pb-3 text-sm font-semibold relative transition duration-150 flex items-center gap-2 ${
              queueTab === 'waiting' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Waiting</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              queueTab === 'waiting' ? 'bg-status-warningBg text-status-warning' : 'bg-surface-subtle text-text-muted'
            }`}>
              {waitingCount}
            </span>
            {queueTab === 'waiting' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setQueueTab('with_doctor')}
            className={`pb-3 text-sm font-semibold relative transition duration-150 flex items-center gap-2 ${
              queueTab === 'with_doctor' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>With Doctor</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              queueTab === 'with_doctor' ? 'bg-brand-100 text-brand-700' : 'bg-surface-subtle text-text-muted'
            }`}>
              {withDoctorCount}
            </span>
            {queueTab === 'with_doctor' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setQueueTab('completed')}
            className={`pb-3 text-sm font-semibold relative transition duration-150 flex items-center gap-2 ${
              queueTab === 'completed' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Completed</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              queueTab === 'completed' ? 'bg-status-successBg text-status-success' : 'bg-surface-subtle text-text-muted'
            }`}>
              {completedCount}
            </span>
            {queueTab === 'completed' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setQueueTab('no_show')}
            className={`pb-3 text-sm font-semibold relative transition duration-150 flex items-center gap-2 ${
              queueTab === 'no_show' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>No-show</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              queueTab === 'no_show' ? 'bg-status-dangerBg text-status-danger' : 'bg-surface-subtle text-text-muted'
            }`}>
              {noShowCount}
            </span>
            {queueTab === 'no_show' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* QUEUE TABLE */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 overflow-hidden flex flex-col justify-between min-h-[500px]">
          <div className="overflow-x-auto">
            {queueLoading ? (
              <div className="flex flex-col items-center justify-center py-40 text-center">
                <RefreshCw className="animate-spin text-brand-500 mb-4" size={32} />
                <p className="text-sm font-semibold text-text-primary">Loading live queue...</p>
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 bg-surface-subtle text-text-secondary rounded-full flex items-center justify-center mb-4">
                  <Search size={22} />
                </div>
                <p className="text-sm font-semibold text-text-primary">No patients in queue</p>
                <p className="text-xs text-text-secondary mt-1 max-w-xs capitalize">
                  There are no patients currently marked as {queueTab.replace('_', ' ')}.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border/30 text-left bg-surface-subtle/35">
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans w-16">No.</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Patient</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Arrival Time</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Doctor</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Reason</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Wait Time</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Source</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Status</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider text-right font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/20">
                  {filteredQueue.map((item, index) => {
                    const positionNumber = index + 1;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => {
                          if (item.patientId) {
                            setSelectedPatientId(item.patientId);
                            setDrawerTab('history');
                          }
                        }}
                        className={`transition duration-150 ${
                          item.patientId ? 'hover:bg-surface-subtle/50 cursor-pointer' : ''
                        }`}
                      >
                        <td className="py-3.5 px-6 text-xs font-bold text-text-secondary">
                          {positionNumber}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100 flex-shrink-0">
                              {item.initials}
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-text-primary block">{item.name}</span>
                              <span className="text-[10px] text-text-secondary mt-0.5 block">{item.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-xs font-medium text-text-primary">
                          {item.arrivalTime}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-text-secondary font-medium">
                          {item.doctor}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-text-secondary font-medium max-w-[200px] truncate">
                          {item.reason}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-text-secondary font-medium">
                          {item.waitTime}
                        </td>
                        <td className="py-3.5 px-6">
                          {item.source === 'zero' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-ai-50 text-ai-600 border border-ai-100/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-ai-500"></span>
                              via Zero
                            </span>
                          ) : (
                            <span className="text-xs text-text-secondary font-medium">Walk-in</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            statusToTab[item.status] === 'waiting'
                              ? 'bg-status-warningBg text-status-warning'
                              : statusToTab[item.status] === 'with_doctor'
                              ? 'bg-brand-50 text-brand-500'
                              : statusToTab[item.status] === 'completed'
                              ? 'bg-status-successBg text-status-success'
                              : 'bg-status-dangerBg text-status-danger'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              statusToTab[item.status] === 'waiting'
                                ? 'bg-status-warning'
                                : statusToTab[item.status] === 'with_doctor'
                                ? 'bg-brand-500'
                                : statusToTab[item.status] === 'completed'
                                ? 'bg-status-success'
                                : 'bg-status-danger'
                            }`}></span>
                            {statusLabels[item.status] || item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          {statusToTab[item.status] === 'waiting' && (
                            <button
                              onClick={() => handleCallIn(item.id)}
                              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-[11px] shadow-sm transition duration-150"
                            >
                              Call In
                            </button>
                          )}
                          {statusToTab[item.status] === 'with_doctor' && (
                            <button
                              onClick={() => handleComplete(item.id)}
                              className="px-3 py-1.5 bg-status-success hover:bg-status-success/90 text-white font-bold rounded-xl text-[11px] shadow-sm transition duration-150"
                            >
                              Complete
                            </button>
                          )}
                          {statusToTab[item.status] === 'completed' && item.patientId && (
                            <button
                              onClick={() => setSelectedPatientId(item.patientId!)}
                              className="text-brand-500 hover:text-brand-600 hover:underline font-bold text-xs transition duration-150"
                            >
                              View
                            </button>
                          )}
                          {statusToTab[item.status] === 'no_show' && (
                            <button
                              onClick={() => handleMarkArrived(item.id)}
                              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-[11px] shadow-sm transition duration-150"
                            >
                              Mark Arrived
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ADD WALK-IN SIDE DRAWER */}
        {isNewWalkInDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
              onClick={() => setIsNewWalkInDrawerOpen(false)}
            ></div>

            <div className="relative w-full max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col z-10 animate-slide-in overflow-hidden font-sans text-xs font-semibold">
              {/* Header */}
              <div className="p-6 border-b border-surface-border/20 flex items-center justify-between flex-shrink-0">
                <h3 className="text-base font-bold text-text-primary">Add Walk-in Patient</h3>
                <button
                  onClick={() => setIsNewWalkInDrawerOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  let patientName = '';

                  if (walkInType === 'registered') {
                    if (!walkInPatientId) {
                      alert("Please select a patient.");
                      return;
                    }
                    const patient = patients.find(p => p.id === walkInPatientId);
                    if (!patient) return;
                    patientName = patient.name;
                  } else {
                    if (!walkInNewPatientName.trim()) {
                      alert("Please enter patient name.");
                      return;
                    }
                    patientName = walkInNewPatientName.trim();
                  }

                  try {
                    setWalkInLoading(true);
                    await api.queue.addWalkIn({
                      patientName,
                      reason: walkInReason || "General consultation",
                      doctor: walkInDoctor,
                      source: "walk-in",
                    });
                    setIsNewWalkInDrawerOpen(false);
                    await loadQueue();
                  } catch (err) {
                    console.error("Failed to add walk-in:", err);
                  } finally {
                    setWalkInLoading(false);
                  }
                }}
                className="p-6 space-y-5 flex-1 overflow-y-auto"
              >
                {/* Select Patient Mode (Registered vs New) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="walkInType"
                        checked={walkInType === 'registered'}
                        onChange={() => setWalkInType('registered')}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                      <span>Registered Patient</span>
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="walkInType"
                        checked={walkInType === 'new'}
                        onChange={() => setWalkInType('new')}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                      <span>New / Unregistered</span>
                    </label>
                  </div>
                </div>

                {/* Registered Patient Select */}
                {walkInType === 'registered' ? (
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Patient</label>
                    <select
                      value={walkInPatientId || ''}
                      onChange={(e) => setWalkInPatientId(e.target.value)}
                      required
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Select patient...</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient Full Name</label>
                    <input
                      type="text"
                      value={walkInNewPatientName}
                      onChange={(e) => setWalkInNewPatientName(e.target.value)}
                      placeholder="Enter full name..."
                      required
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                )}

                {/* Doctor select */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Doctor Assignment</label>
                  <select
                    value={walkInDoctor}
                    onChange={(e) => setWalkInDoctor(e.target.value)}
                    required
                    className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Dr. Lan Mandragoran">Dr. Lan Mandragoran</option>
                    <option value="Dr. Moiraine Damodred">Dr. Moiraine Damodred</option>
                  </select>
                </div>

                {/* Reason for visit */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Reason for Visit</label>
                  <input
                    type="text"
                    value={walkInReason}
                    onChange={(e) => setWalkInReason(e.target.value)}
                    placeholder="e.g. Hypertension checkup, general consulting..."
                    className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {/* Form Actions Footer */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={walkInLoading}
                    className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200 flex items-center justify-center gap-2"
                  >
                    {walkInLoading ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <span>Add to Queue</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewWalkInDrawerOpen(false)}
                    className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Patients Screen
  const renderPatientsScreen = () => {
    const currentList = patientsTab === 'recall' ? recallPatients : patients;

    const filteredPatients = currentList.filter(patient => {
      const query = searchQuery.toLowerCase().trim();
      return patient.name.toLowerCase().includes(query) || patient.phone.includes(query);
    });

    if (patientsTab === 'recall') {
      filteredPatients.sort((a, b) => {
        const statusA = (a.recallStatus || '').toUpperCase();
        const statusB = (b.recallStatus || '').toUpperCase();
        if (statusA === 'OVERDUE' && statusB === 'DUE_SOON') return -1;
        if (statusA === 'DUE_SOON' && statusB === 'OVERDUE') return 1;
        return 0;
      });
    }

    const totalPatientsCount = patients.length;
    const totalRecallCount = recallPatients.length > 0 ? recallPatients.length : patients.filter(p => {
      const s = (p.recallStatus || '').toUpperCase();
      return s === 'OVERDUE' || s === 'DUE_SOON';
    }).length;

    const itemsPerPage = 8;
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div className="space-y-6 relative animate-fade-in">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-text-primary leading-tight">Patients</h2>
            <p className="text-[14px] text-text-secondary mt-1">
              {totalPatientsCount} patients · <span className="font-semibold text-status-warning">{totalRecallCount} overdue for recall</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-text-muted" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search patients by name or phone..."
                className="pl-10 pr-4 py-2 w-full sm:w-[280px] bg-surface-base border border-surface-border rounded-xl text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-500 transition duration-150"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Add Patient Button */}
            <button
              onClick={() => setAddPatientModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-brand-500 text-brand-500 hover:bg-brand-50 font-semibold rounded-xl text-xs transition duration-200"
            >
              <Plus size={16} />
              <span>Add Patient</span>
            </button>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex border-b border-surface-border/30 gap-6">
          <button
            onClick={() => {
              setPatientsTab('all');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-semibold relative transition duration-150 ${
              patientsTab === 'all' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            All Patients
            {patientsTab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => {
              setPatientsTab('recall');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-semibold relative flex items-center gap-2 transition duration-150 ${
              patientsTab === 'recall' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Recall Due
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              totalRecallCount > 0 ? 'bg-status-warningBg text-status-warning' : 'bg-surface-subtle text-text-muted'
            }`}>
              {totalRecallCount}
            </span>
            {patientsTab === 'recall' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 overflow-hidden flex flex-col justify-between min-h-[500px]">
          <div className="overflow-x-auto">
            {patientsLoading || recallLoading ? (
              <div className="flex flex-col items-center justify-center py-40 text-center">
                <RefreshCw className="animate-spin text-brand-500 mb-4" size={32} />
                <p className="text-sm font-semibold text-text-primary">Loading patients...</p>
              </div>
            ) : paginatedPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 bg-surface-subtle text-text-secondary rounded-full flex items-center justify-center mb-4">
                  <Search size={22} />
                </div>
                <p className="text-sm font-semibold text-text-primary">No patients found</p>
                <p className="text-xs text-text-secondary mt-1 max-w-xs">
                  We couldn't find any results matching "{searchQuery}". Check the spelling or try a different term.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border/30 text-left bg-surface-subtle/35">
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Patient</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Phone</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Last Visit</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Next Appointment</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Recall Status</th>
                    
                    {patientsTab === 'recall' && (
                      <>
                        <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">Recall Reason</th>
                        <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans">AI Outreach</th>
                      </>
                    )}
                    
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider font-sans text-right">Conversations</th>
                    <th className="py-3 px-6 text-xs font-semibold text-text-secondary tracking-wider text-right font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/20">
                  {paginatedPatients.map((patient) => {
                    return (
                      <tr
                        key={patient.id}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className="hover:bg-surface-subtle/50 transition duration-150 cursor-pointer"
                      >
                        <td className="py-3.5 px-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100 flex-shrink-0">
                            {patient.initials}
                          </div>
                          <span className="text-xs font-semibold text-text-primary">{patient.name}</span>
                        </td>
                        <td className="py-3.5 px-6 text-xs font-medium text-text-primary">{patient.phone}</td>
                        <td className="py-3.5 px-6 text-xs text-text-secondary font-medium">{patient.lastVisit}</td>
                        <td className="py-3.5 px-6 text-xs text-text-secondary font-medium">{patient.nextAppointment}</td>
                         <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            (patient.recallStatus || '').toUpperCase() === 'UP_TO_DATE'
                              ? 'bg-status-successBg text-status-success'
                              : (patient.recallStatus || '').toUpperCase() === 'DUE_SOON'
                              ? 'bg-status-warningBg text-status-warning'
                              : (patient.recallStatus || '').toUpperCase() === 'OVERDUE'
                              ? 'bg-status-dangerBg text-status-danger'
                              : 'bg-surface-subtle text-text-muted'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              (patient.recallStatus || '').toUpperCase() === 'UP_TO_DATE'
                                ? 'bg-status-success'
                                : (patient.recallStatus || '').toUpperCase() === 'DUE_SOON'
                                ? 'bg-status-warning'
                                : (patient.recallStatus || '').toUpperCase() === 'OVERDUE'
                                ? 'bg-status-danger'
                                : 'bg-text-muted'
                            }`}></span>
                            {recallStatusLabels[(patient.recallStatus || '').toUpperCase()] || patient.recallStatus || '—'}
                          </span>
                        </td>
                        
                        {patientsTab === 'recall' && (
                          <>
                            <td className="py-3.5 px-6 text-xs text-text-primary font-medium">{patient.recallReason || '—'}</td>
                            <td className="py-3.5 px-6" onClick={(e) => e.stopPropagation()}>
                              {patient.aiOutreachDraft ? (
                                <button
                                  onClick={() => {
                                    setExpandedOutreachId(patient.id);
                                    setDraftMessageText(patient.aiOutreachDraft || '');
                                  }}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border border-ai-100 bg-ai-50 text-ai-600 hover:bg-ai-100/50 transition duration-150 font-sans"
                                >
                                  Draft Ready
                                </button>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-status-successBg text-status-success border border-status-success/15 font-sans">
                                  Sent
                                </span>
                              )}
                            </td>
                          </>
                        )}
                        
                        <td className="py-3.5 px-6 text-xs text-text-secondary font-semibold text-right font-sans">
                          {patient.conversationsCount}
                        </td>
                        <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedPatientId(patient.id)}
                            className="px-3 py-1.5 border border-surface-border text-text-secondary hover:text-text-primary bg-surface-base hover:bg-surface-subtle font-medium rounded-xl text-xs transition duration-150 shadow-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION PANEL */}
          {filteredPatients.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border/20 bg-surface-subtle/10 text-xs font-semibold text-text-secondary">
              <div>
                Showing <span className="text-text-primary">{startIndex + 1}</span>–
                <span className="text-text-primary">{Math.min(startIndex + itemsPerPage, filteredPatients.length)}</span> of{' '}
                <span className="text-text-primary">{filteredPatients.length}</span>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 border border-surface-border rounded-xl bg-surface-base hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 shadow-sm flex items-center"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1.5 border border-surface-border rounded-xl bg-surface-base hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition duration-150 shadow-sm flex items-center"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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

  const renderAppointmentsScreen = () => {
    // 1. Calculations & Week days
    const weekDays = getWeekDays(currentWeekStart);
    const startStr = formatDateString(weekDays[0]);
    const endStr = formatDateString(weekDays[6]);

    // Current week appointments count
    const weekAppts = appointments.filter(a => a.date >= startStr && a.date <= endStr && a.status !== 'CANCELLED');
    const todayStr = "2026-06-23"; // Today's date in mock clinic OS
    const todayAppts = appointments.filter(a => a.date === todayStr && a.status !== 'CANCELLED');

    // 2. Filter logic (especially for List view)
    const filteredAppts = appointments.filter(a => {
      const query = apptSearchQuery.toLowerCase().trim();
      const matchesSearch = a.name.toLowerCase().includes(query) || a.phone.includes(query);
      const matchesDoctor = apptDoctorFilter === 'all' || a.doctor === apptDoctorFilter;
      const matchesStatus = apptStatusFilter === 'all' || a.status === apptStatusFilter;
      return matchesSearch && matchesDoctor && matchesStatus;
    });

    // Sort by Date/Time
    const sortedAppts = [...filteredAppts].sort((a, b) => {
      const getMinutes = (t: string) => {
        const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!m) return 0;
        let h = parseInt(m[1], 10);
        if (m[3].toUpperCase() === "PM" && h < 12) h += 12;
        if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
        return h * 60 + parseInt(m[2], 10);
      };
      const diff = a.date !== b.date 
        ? a.date.localeCompare(b.date) 
        : getMinutes(a.time) - getMinutes(b.time);
      return apptSortOrder === 'asc' ? diff : -diff;
    });

    // Pagination for list view
    const itemsPerPage = 8;
    const totalPages = Math.ceil(sortedAppts.length / itemsPerPage);
    const startIndex = (apptCurrentPage - 1) * itemsPerPage;
    const paginatedAppts = sortedAppts.slice(startIndex, startIndex + itemsPerPage);

    // Time Slots
    const timeSlots = [
      "08:00 AM",
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM"
    ];

    // Handle clicking empty calendar slot
    const handleEmptySlotClick = (dateStr: string, timeSlot: string) => {
      setFormPatientId(null);
      setFormDate(dateStr);
      setFormTime(timeSlot);
      setFormDoctor("Dr. Lan Mandragoran");
      setFormDept("General Medicine");
      setFormNotes("");
      setIsNewApptDrawerOpen(true);
    };

    return (
      <div className="space-y-6 animate-fade-in">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-text-primary leading-tight flex items-center gap-2">
              <span>Appointments</span>
              {appointmentsLoading && (
                <span className="text-xs font-normal text-text-muted animate-pulse">(Updating...)</span>
              )}
            </h2>
            <p className="text-[14px] text-text-secondary mt-1">
              {weekAppts.length} active appointments this week · {todayAppts.length} today
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-surface-base border border-surface-border/50 p-1 rounded-xl flex items-center shadow-soft">
              <button
                type="button"
                onClick={() => setApptViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-150 flex items-center gap-1.5 ${
                  apptViewMode === 'calendar'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Calendar size={14} />
                <span>Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setApptViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-150 flex items-center gap-1.5 ${
                  apptViewMode === 'list'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Activity size={14} />
                <span>List View</span>
              </button>
            </div>

            {/* New Appointment Button */}
            <button
              type="button"
              onClick={() => {
                setFormPatientId(null);
                setFormDate("2026-06-23"); // default to today
                setFormTime("09:00 AM");
                setFormDoctor("Dr. Lan Mandragoran");
                setFormDept("General Medicine");
                setFormNotes("");
                setIsNewApptDrawerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl text-sm transition duration-200 shadow-sm"
            >
              <Plus size={16} />
              <span>New Appointment</span>
            </button>
          </div>
        </div>

        {/* DATE NAVIGATION & CONTROLS ROW */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-base p-4 rounded-2xl border border-surface-border/50 shadow-soft">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const prev = new Date(currentWeekStart);
                prev.setDate(prev.getDate() - 7);
                setCurrentWeekStart(prev);
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition duration-150"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentWeekStart(new Date('2026-06-22')); // Jump back to current week
              }}
              className="px-3 py-1.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-semibold rounded-xl text-xs transition duration-150"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => {
                const next = new Date(currentWeekStart);
                next.setDate(next.getDate() + 7);
                setCurrentWeekStart(next);
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition duration-150"
            >
              <ChevronRight size={16} />
            </button>

            <span className="text-sm font-bold text-text-primary pl-2">
              {formatRangeLabel(currentWeekStart)}
            </span>
          </div>

          {/* Quick Stats or Sub-filters */}
          {apptViewMode === 'list' && (
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-60">
                <Search size={14} className="absolute left-3 top-3 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={apptSearchQuery}
                  onChange={(e) => {
                    setApptSearchQuery(e.target.value);
                    setApptCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                />
              </div>

              {/* Doctor filter */}
              <select
                value={apptDoctorFilter}
                onChange={(e) => {
                  setApptDoctorFilter(e.target.value);
                  setApptCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl text-text-primary font-medium focus:outline-none"
              >
                <option value="all">All Doctors</option>
                <option value="Dr. Lan Mandragoran">Dr. Lan Mandragoran</option>
                <option value="Dr. Moiraine Damodred">Dr. Moiraine Damodred</option>
              </select>

              {/* Status filter */}
              <select
                value={apptStatusFilter}
                onChange={(e) => {
                  setApptStatusFilter(e.target.value);
                  setApptCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl text-text-primary font-medium focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Sort order toggle button */}
              <button
                type="button"
                onClick={() => {
                  setApptSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  setApptCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-surface-subtle border border-surface-border rounded-xl text-text-primary font-medium hover:bg-surface-border/30 transition duration-150 focus:outline-none"
              >
                Sort: {apptSortOrder === 'asc' ? 'Soonest first' : 'Latest first'}
              </button>
            </div>
          )}
        </div>

        {/* MAIN VIEWS */}
        {apptViewMode === 'calendar' ? (
          <div className="bg-surface-base rounded-2xl border border-surface-border/50 shadow-soft overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Calendar Grid Header */}
              <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-surface-border/50">
                {/* Time Label Header */}
                <div className="p-3 bg-surface-subtle/50 flex items-center justify-center border-r border-surface-border/35">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted">Time</span>
                </div>
                {/* Days Headers */}
                {weekDays.map((day, idx) => {
                  const dateStr = formatDateString(day);
                  const isTodayStr = dateStr === "2026-06-23";
                  return (
                    <div
                      key={idx}
                      className={`p-3 text-center border-r border-surface-border/35 last:border-r-0 flex flex-col items-center justify-center ${
                        isTodayStr ? 'bg-brand-50/50' : 'bg-surface-subtle/20'
                      }`}
                    >
                      <span className={`text-[11px] font-bold ${isTodayStr ? 'text-brand-600' : 'text-text-secondary'}`}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className={`text-base font-extrabold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center ${
                        isTodayStr ? 'bg-brand-500 text-white shadow-sm' : 'text-text-primary'
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Grid Body */}
              <div className="divide-y divide-surface-border/35">
                {timeSlots.map((slot, sIdx) => (
                  <div key={sIdx} className="grid grid-cols-[80px_repeat(7,1fr)]">
                    {/* Time Indicator Cell */}
                    <div className="p-3 bg-surface-subtle/20 border-r border-surface-border/35 flex items-start justify-end pr-4 pt-4">
                      <span className="text-[11px] font-bold text-text-muted whitespace-nowrap">{slot}</span>
                    </div>

                    {/* 7 Days Cells */}
                    {weekDays.map((day, dIdx) => {
                      const dateStr = formatDateString(day);
                      const slotAppts = appointments.filter(a => a.date === dateStr && a.time === slot);
                      return (
                        <div
                          key={dIdx}
                          onClick={() => slotAppts.length === 0 && handleEmptySlotClick(dateStr, slot)}
                          className={`p-2 border-r border-surface-border/35 last:border-r-0 min-h-[90px] relative group transition-colors ${
                            slotAppts.length === 0 ? 'hover:bg-brand-50/10 cursor-pointer' : ''
                          }`}
                        >
                          {slotAppts.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <span className="w-7 h-7 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center border border-brand-100 shadow-sm">
                                <Plus size={14} />
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1.5 h-full justify-start">
                              {slotAppts.map((appt) => {
                                const isZero = appt.bookedVia === 'zero';
                                let statusClasses = 'bg-brand-50/50 border-brand-200/50 text-brand-700';
                                if (appt.status === 'PENDING') statusClasses = 'bg-status-warningBg border-status-warning/20 text-status-warning';
                                else if (appt.status === 'COMPLETED') statusClasses = 'bg-status-successBg border-status-success/20 text-status-success';
                                else if (appt.status === 'CANCELLED') statusClasses = 'bg-status-dangerBg/30 border-status-danger/10 text-text-muted line-through opacity-70';

                                return (
                                  <div
                                    key={appt.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAppointmentId(appt.id);
                                    }}
                                    className={`p-2.5 rounded-xl border ${statusClasses} text-[11px] leading-tight font-semibold shadow-soft cursor-pointer hover:shadow-soft-md hover:scale-[1.01] transition-all flex flex-col justify-between h-full select-none`}
                                  >
                                    <div className="flex items-start justify-between gap-1.5">
                                      <span className="truncate block font-bold text-text-primary">{appt.name}</span>
                                      {isZero && (
                                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-ai-500 inline-block" title="Booked via Zero AI"></span>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between mt-2.5 text-[10px] text-text-secondary font-medium font-semibold">
                                      <span>{appt.doctor.split(' ')[1]}</span>
                                      <span className="opacity-80 text-[9px] px-1.5 py-0.5 rounded-md bg-white/60 border border-surface-border/5">{appt.department}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-base rounded-2xl border border-surface-border/50 shadow-soft overflow-hidden">
            {/* Table layout */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-border/50 text-[11px] font-bold text-text-muted uppercase tracking-wider bg-surface-subtle/30">
                    <th className="p-4 pl-6">Patient</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Doctor</th>
                    <th className="p-4">Department / Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Booking Source</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/30 text-xs">
                  {paginatedAppts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-text-secondary">
                        No appointments found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedAppts.map((appt) => {
                      const isZero = appt.bookedVia === 'zero';
                      return (
                        <tr key={appt.id} className="hover:bg-surface-subtle/30 transition duration-150 font-medium">
                          {/* Patient info */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-bold text-[11px] flex items-center justify-center border border-brand-100 flex-shrink-0">
                                {appt.initials}
                              </div>
                              <div>
                                <span className="font-bold text-text-primary block">{appt.name}</span>
                                <span className="text-[10px] text-text-secondary font-medium">{appt.phone}</span>
                              </div>
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-text-primary block">
                                {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-text-secondary font-medium flex items-center gap-1">
                                <Clock size={10} />
                                {appt.time}
                              </span>
                            </div>
                          </td>

                          {/* Doctor */}
                          <td className="p-4 text-text-primary font-semibold">{appt.doctor}</td>

                          {/* Department */}
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-lg bg-surface-subtle border border-surface-border/40 text-[10px] text-text-secondary">
                              {appt.department}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              appt.status === 'CONFIRMED'
                                ? 'bg-status-successBg text-status-success border border-status-success/15'
                                : appt.status === 'PENDING'
                                ? 'bg-status-warningBg text-status-warning border border-status-warning/15'
                                : appt.status === 'COMPLETED'
                                ? 'bg-brand-50 text-brand-500 border border-brand-100'
                                : 'bg-status-dangerBg text-status-danger border border-status-danger/15'
                            }`}>
                              {appointmentStatusLabels[appt.status] || appt.status}
                            </span>
                          </td>

                          {/* Booking Source */}
                          <td className="p-4">
                            {isZero ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-ai-50 text-ai-600 border border-ai-100/50 font-semibold">
                                <span>via Zero</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-surface-subtle text-text-secondary border border-surface-border">
                                Manual
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="p-4 text-right pr-6">
                            <button
                              type="button"
                              onClick={() => setSelectedAppointmentId(appt.id)}
                              className="px-3 py-1.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-[10px] transition duration-150"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-surface-border/30 bg-surface-subtle/10 flex items-center justify-between text-xs">
                <span className="text-text-secondary font-medium">
                  Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedAppts.length)} of {sortedAppts.length}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={apptCurrentPage === 1}
                    onClick={() => setApptCurrentPage(prev => prev - 1)}
                    className="px-3 py-1.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary rounded-xl font-bold transition duration-150 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Previous
                  </button>
                  <span className="text-text-primary font-semibold">
                    {apptCurrentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={apptCurrentPage === totalPages}
                    onClick={() => setApptCurrentPage(prev => prev + 1)}
                    className="px-3 py-1.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary rounded-xl font-bold transition duration-150 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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

        {/* STEP 1: ACCOUNT SETUP */}
        {onboardingStep === 1 && (
          <div className="bg-surface-base rounded-3xl shadow-[0_15px_45px_-8px_rgba(0,0,0,0.06),0_10px_20px_-10px_rgba(0,0,0,0.03)] border border-surface-border/30 p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex w-10 h-10 bg-brand-50 rounded-xl items-center justify-center border border-brand-100 mb-2">
                <span className="text-lg font-bold text-brand-600">Z</span>
              </div>
              <h2 className="text-lg font-bold text-text-primary">Welcome to Zero Clinic OS</h2>
              <p className="text-text-secondary">Let's set up your clinic's AI patient operator in minutes.</p>
            </div>

            {/* Sign Up / Log In Toggle */}
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

            {onboardingAuthMode === 'signup' ? (
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
                    setOnboardingStep(2);
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
                    const cId = res.clinic?.id || res.staff?.clinicId;
                    if (cId) {
                      localStorage.setItem("zero_clinic_id", cId);
                      setClinicId(cId);
                    }
                    
                    try {
                      const decoded = jwtDecode<{ name?: string }>(res.token);
                      if (decoded.name) {
                        setOnboardingAdminName(decoded.name);
                      }
                    } catch (e) {
                      // ignore
                    }

                    if (res.onboardingComplete) {
                      setIsOnboarded(true);
                      setCurrentRoute("dashboard");
                    } else {
                      setOnboardingStep(2);
                      setIsOnboarded(false);
                    }
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
                                  onClick={() => {
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
                                  onClick={() => {
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
                                  onClick={() => {
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
                                  onClick={() => {
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
  const renderSettingsScreen = () => {
    const isDirty =
      settingsClinicName !== savedClinicName ||
      settingsAddress !== savedAddress ||
      settingsHours !== savedHours ||
      settingsServices !== savedServices;

    const handleSaveChanges = (e: React.FormEvent) => {
      e.preventDefault();
      setSavedClinicName(settingsClinicName);
      setSavedAddress(settingsAddress);
      setSavedHours(settingsHours);
      setSavedServices(settingsServices);
      alert("Clinic settings saved successfully!");
    };

    const handleAddStaff = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newStaffName.trim() || !newStaffEmail.trim()) {
        alert("Please fill in Name and Email.");
        return;
      }
      const nextId = crypto.randomUUID();
      const initials = newStaffName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';
      setStaffList(prev => [
        ...prev,
        {
          id: nextId,
          name: newStaffName.trim(),
          role: newStaffRole,
          email: newStaffEmail.trim(),
          initials
        }
      ]);
      setNewStaffName('');
      setNewStaffEmail('');
      setIsAddStaffOpen(false);
    };

    const handleRemoveStaff = (id: string) => {
      if (confirm("Are you sure you want to remove this staff member?")) {
        setStaffList(prev => prev.filter(s => s.id !== id));
      }
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in font-sans text-xs">
        {/* PAGE HEADER */}
        <div>
          <h2 className="text-[24px] font-semibold text-text-primary leading-tight font-sans">Settings</h2>
          <p className="text-[14px] text-text-secondary mt-1">
            Manage your clinic's configuration, connections, and team
          </p>
        </div>

        {/* SECTION 1: CLINIC INFO */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 space-y-5">
          <div className="border-b border-surface-border/30 pb-4">
            <h3 className="text-sm font-bold text-text-primary">Clinic Information</h3>
            <p className="text-text-secondary mt-0.5">Basic details about your healthcare practice</p>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinic Name</label>
                <input
                  type="text"
                  value={settingsClinicName}
                  onChange={(e) => setSettingsClinicName(e.target.value)}
                  required
                  placeholder="e.g. Apex Family Clinic"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Services Offered (Comma Separated)</label>
                <input
                  type="text"
                  value={settingsServices}
                  onChange={(e) => setSettingsServices(e.target.value)}
                  placeholder="e.g. Cardiology, Dermatology, Physiotherapy"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinic Address</label>
                <input
                  type="text"
                  value={settingsAddress}
                  onChange={(e) => setSettingsAddress(e.target.value)}
                  required
                  placeholder="e.g. 123 Eldene Way, Suite 400, Apex City"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Operating Hours</label>
                <input
                  type="text"
                  value={settingsHours}
                  onChange={(e) => setSettingsHours(e.target.value)}
                  required
                  placeholder="e.g. Mon - Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!isDirty}
                className={`px-5 py-2.5 font-bold rounded-xl text-xs transition duration-200 shadow-sm ${
                  isDirty
                    ? 'bg-brand-500 hover:bg-brand-600 text-white cursor-pointer'
                    : 'bg-surface-subtle text-text-muted border border-surface-border/50 cursor-not-allowed'
                }`}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: WHATSAPP CONNECTION */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 space-y-5">
          <div className="border-b border-surface-border/30 pb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary">WhatsApp Business Connection</h3>
              <p className="text-text-secondary mt-0.5">Integrate your official WhatsApp business number</p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-status-warningBg text-status-warning border border-status-warning/20">
              <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse"></span>
              Pending Verification
            </span>
          </div>

          <div className="bg-status-warningBg/30 border border-status-warning/10 rounded-xl p-4 space-y-3">
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              Your WhatsApp Business API connection is awaiting Meta verification. Once approved, Zero will connect directly to your clinic's WhatsApp number.
            </p>

            {/* Steps checklist */}
            <div className="space-y-2 pt-1.5">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-status-successBg text-status-success border border-status-success/20 flex items-center justify-center text-[9px] font-bold">✓</span>
                <span className="text-[11px] font-bold text-text-primary">Business details submitted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-status-warningBg text-status-warning border border-status-warning/20 flex items-center justify-center text-[9px] font-bold">●</span>
                <span className="text-[11px] font-bold text-text-primary">Meta verification review in progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-surface-subtle text-text-muted border border-surface-border flex items-center justify-center text-[9px] font-bold">3</span>
                <span className="text-[11px] font-medium text-text-secondary">Number linking and configuration pending</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => alert("Verification status refreshed: Still reviewing. Meta verification typically takes 1-3 business days.")}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-surface-border text-text-secondary hover:bg-surface-subtle font-bold rounded-xl text-xs transition duration-150"
            >
              <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
              <span>Check Status</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: STAFF */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 space-y-5">
          <div className="border-b border-surface-border/30 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Staff Management</h3>
              <p className="text-text-secondary mt-0.5">Configure access roles for clinic practitioners and admins</p>
            </div>

            <button
              onClick={() => setIsAddStaffOpen(!isAddStaffOpen)}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-brand-500 text-brand-500 hover:bg-brand-50 font-bold rounded-xl text-xs transition duration-150"
            >
              <Plus size={14} />
              <span>Add Staff</span>
            </button>
          </div>

          {/* Add Staff Inline Form */}
          {isAddStaffOpen && (
            <form onSubmit={handleAddStaff} className="bg-surface-subtle/50 border border-surface-border/20 rounded-xl p-4 space-y-3 animate-fade-in">
              <h4 className="text-xs font-bold text-text-primary">New Staff Member</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="p-2.5 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="p-2.5 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="p-2.5 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Lead Physician">Lead Physician</option>
                  <option value="Chief of Staff">Chief of Staff</option>
                  <option value="General Practitioner">General Practitioner</option>
                  <option value="Clinic Manager">Clinic Manager</option>
                  <option value="Billing Admin">Billing Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-150"
                >
                  Save Staff
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 border border-surface-border hover:bg-surface-subtle text-text-secondary font-bold rounded-xl text-xs transition duration-150"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Staff List Table */}
          <div className="border border-surface-border/20 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border/30 text-left bg-surface-subtle/35">
                  <th className="py-2.5 px-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Staff Member</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Role</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/10">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-surface-subtle/30 transition duration-150">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-bold text-xs flex items-center justify-center border border-brand-100 flex-shrink-0">
                        {staff.initials}
                      </div>
                      <span className="font-bold text-text-primary text-xs">{staff.name}</span>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-text-secondary">
                      {staff.role}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-text-secondary">
                      {staff.email}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRemoveStaff(staff.id)}
                        className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-dangerBg/50 rounded-lg transition duration-150"
                        title="Remove Staff"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: NOTIFICATIONS */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 space-y-5">
          <div className="border-b border-surface-border/30 pb-4">
            <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
            <p className="text-text-secondary mt-0.5">Control how and when your staff is notified about clinic events</p>
          </div>

          <div className="divide-y divide-surface-border/20">
            {/* Escalation Alerts */}
            <div className="py-4 flex items-center justify-between gap-6 first:pt-0">
              <div>
                <label className="text-xs font-bold text-text-primary block">Escalation alerts</label>
                <span className="text-[11px] text-text-secondary mt-0.5 block">Notify staff immediately when Zero AI escalates a conversation</span>
              </div>
              <button
                type="button"
                onClick={() => setNotificationEscalation(!notificationEscalation)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  notificationEscalation ? 'bg-brand-500' : 'bg-gray-300'
                }`}
              >
                <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  notificationEscalation ? 'translate-x-4' : 'translate-x-0'
                }`}></span>
              </button>
            </div>

            {/* Recall Reminders */}
            <div className="py-4 flex items-center justify-between gap-6">
              <div>
                <label className="text-xs font-bold text-text-primary block">Recall reminders</label>
                <span className="text-[11px] text-text-secondary mt-0.5 block">Daily summary of patient recalls due or overdue</span>
              </div>
              <button
                type="button"
                onClick={() => setNotificationRecall(!notificationRecall)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  notificationRecall ? 'bg-brand-500' : 'bg-gray-300'
                }`}
              >
                <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  notificationRecall ? 'translate-x-4' : 'translate-x-0'
                }`}></span>
              </button>
            </div>

            {/* No-show Alerts */}
            <div className="py-4 flex items-center justify-between gap-6">
              <div>
                <label className="text-xs font-bold text-text-primary block">No-show alerts</label>
                <span className="text-[11px] text-text-secondary mt-0.5 block">Notify when a booked patient fails to check in on time</span>
              </div>
              <button
                type="button"
                onClick={() => setNotificationNoShow(!notificationNoShow)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  notificationNoShow ? 'bg-brand-500' : 'bg-gray-300'
                }`}
              >
                <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  notificationNoShow ? 'translate-x-4' : 'translate-x-0'
                }`}></span>
              </button>
            </div>

            {/* Daily Summary Email */}
            <div className="py-4 flex items-center justify-between gap-6 last:pb-0">
              <div>
                <label className="text-xs font-bold text-text-primary block">Daily summary email</label>
                <span className="text-[11px] text-text-secondary mt-0.5 block">End-of-day report detailing clinic performance and AI stats</span>
              </div>
              <button
                type="button"
                onClick={() => setNotificationSummary(!notificationSummary)}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  notificationSummary ? 'bg-brand-500' : 'bg-gray-300'
                }`}
              >
                <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  notificationSummary ? 'translate-x-4' : 'translate-x-0'
                }`}></span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: BILLING */}
        <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 space-y-5">
          <div className="border-b border-surface-border/30 pb-4">
            <h3 className="text-sm font-bold text-text-primary">Subscription & Billing</h3>
            <p className="text-text-secondary mt-0.5">Manage plan tiers and invoicing details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Info Card */}
            <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider block mb-1">Active Plan</span>
                <h4 className="text-sm font-extrabold text-brand-900">Navigator Plan — $299/mo</h4>
                <p className="text-[11px] text-brand-700/80 mt-1 leading-relaxed font-semibold">
                  Includes full AI automation on recall and pre-intake, up to 1,500 active patient interactions, and multi-doctor live queue capabilities.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-brand-100/50 flex items-center justify-between text-[11px] font-semibold text-brand-800">
                <span>Next Invoice Date:</span>
                <span>July 15, 2026</span>
              </div>
            </div>

            {/* Actions / Invoices list */}
            <div className="border border-surface-border/25 rounded-xl p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Billing Inquiries</span>
                <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                  Need to change your payout methods, download past invoices, or cancel/upgrade plans?
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => alert("Billing management dashboard link clicked (Stripe customer portal interface in mockup mode).")}
                  className="px-4 py-2 border border-surface-border text-text-secondary hover:bg-surface-subtle font-bold rounded-xl text-xs transition duration-150"
                >
                  Manage Billing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  if (!isOnboarded) {
    return (
      <div className="flex min-h-screen dot-grid-bg justify-center items-center p-6 w-full relative">
        {renderOnboardingWizard()}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      {/* 1. SIDEBAR */}
      <aside className="w-[260px] bg-brand-900 text-white flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30 select-none shadow-lg">
        <div>
          {/* Logo Section */}
          <div className="p-6 pb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-xl font-bold text-white tracking-wider">Z</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">Zero</h1>
              <span className="text-[10px] text-brand-100/60 uppercase tracking-widest font-semibold">Clinic OS</span>
            </div>
          </div>

          {/* Sidebar Nav Sections */}
          <nav className="px-4 py-3 space-y-6">
            {/* OPERATIONS SECTION */}
            <div>
              <div className="px-3 text-[11px] font-semibold text-brand-100/40 uppercase tracking-widest mb-2">
                Operations
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentRoute('dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
                      currentRoute === 'dashboard'
                        ? 'bg-ai-50 text-brand-500 font-semibold'
                        : 'text-brand-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LayoutGrid size={16} />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentRoute('live-queue')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
                      currentRoute === 'live-queue'
                        ? 'bg-ai-50 text-brand-500 font-semibold'
                        : 'text-brand-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Timer size={16} />
                    <span>Live Queue</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentRoute('appointments')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
                      currentRoute === 'appointments'
                        ? 'bg-ai-50 text-brand-500 font-semibold'
                        : 'text-brand-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Calendar size={16} />
                    <span>Appointments</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentRoute('zero-chat')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
                      currentRoute === 'zero-chat'
                        ? 'bg-ai-50 text-brand-500 font-semibold'
                        : 'text-brand-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare size={16} />
                      <span>ZeroChat</span>
                    </div>
                    {conversationCounts.needs_review > 0 && (
                      <span className="bg-status-danger text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold font-sans">
                        {conversationCounts.needs_review}
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            </div>

            {/* PATIENTS SECTION */}
            <div>
              <div className="px-3 text-[11px] font-semibold text-brand-100/40 uppercase tracking-widest mb-2">
                Patients
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentRoute('patients')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
                      currentRoute === 'patients'
                        ? 'bg-ai-50 text-brand-500 font-semibold'
                        : 'text-brand-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Users size={16} />
                    <span>Patients</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* INSIGHTS SECTION */}
            <div>
              <div className="px-3 text-[11px] font-semibold text-brand-100/40 uppercase tracking-widest mb-2">
                Insights
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentRoute('analytics')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
                      currentRoute === 'analytics'
                        ? 'bg-ai-50 text-brand-500 font-semibold'
                        : 'text-brand-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <TrendingUp size={16} />
                    <span>Analytics</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* SETUP SECTION */}
            <div>
              <div className="px-3 text-[11px] font-semibold text-brand-100/40 uppercase tracking-widest mb-2">
                Setup
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCurrentRoute('settings')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
                      currentRoute === 'settings'
                        ? 'bg-ai-50 text-brand-500 font-semibold'
                        : 'text-brand-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* User / Footer Info */}
        <div className="border-t border-white/10 p-4 space-y-2">
          {/* User Profile */}
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/5 transition duration-150 cursor-pointer">
            <div className="w-9 h-9 bg-brand-700 rounded-full flex items-center justify-center font-bold text-sm border border-brand-500">
              {isOnboarded ? (onboardingAdminName.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'AD') : 'AD'}
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-semibold text-white truncate">{isOnboarded ? onboardingAdminName || 'Apex Clinic Admin' : 'Apex Clinic Admin'}</div>
              <div className="text-[10px] text-brand-100/60 truncate">{isOnboarded ? onboardingEmail || 'admin@apexclinic.com' : 'admin@apexclinic.com'}</div>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-1">
            <button
              onClick={() => alert('Support module is coming soon!')}
              className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded-lg text-xs text-brand-100/60 hover:text-white hover:bg-white/5 transition duration-150"
            >
              <HelpCircle size={14} />
              <span>Support</span>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("zero_token");
                localStorage.removeItem("zero_clinic_id");
                setClinicId(null);
                setIsOnboarded(false);
                setOnboardingStep(1);
              }}
              className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded-lg text-xs text-brand-100/60 hover:text-white hover:bg-white/5 transition duration-150"
            >
              <LogOut size={14} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 pl-[260px] min-h-screen flex flex-col">
        {/* 2. TOPBAR */}
        <header className="h-16 bg-surface-base border-b border-surface-border/50 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary font-medium">{isOnboarded ? settingsClinicName : 'Apex Family Clinic'}</span>
            <ChevronRight size={14} className="text-text-muted" />
            <span className="text-text-primary font-semibold capitalize">
              {currentRoute === 'dashboard' ? 'Dashboard' : currentRoute.replace('-', ' ')}
            </span>
          </div>

          {/* Connection Status & Notification Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-status-successBg border border-status-success/10 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
              </span>
              <span className="text-xs text-status-success font-medium">Connected</span>
            </div>

            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen)}
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition duration-150 border ${
                  isNotificationsDropdownOpen
                    ? 'bg-brand-50 border-brand-200 text-brand-600'
                    : 'text-text-secondary hover:bg-surface-subtle border-surface-border/30'
                }`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-status-danger text-white rounded-full border border-surface-base text-[9px] font-extrabold flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN PANEL */}
              {isNotificationsDropdownOpen && (
                <div
                  id="notification-dropdown-panel"
                  className="absolute right-0 mt-2 w-80 bg-surface-base rounded-2xl shadow-soft border border-surface-border/60 py-3 z-50 animate-fade-in text-xs"
                >
                  <div className="px-4 pb-2 border-b border-surface-border/30 flex items-center justify-between">
                    <span className="font-bold text-text-primary text-xs">Notifications</span>
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                      className={`font-bold transition duration-150 text-[11px] ${
                        unreadCount > 0
                          ? 'text-brand-500 hover:text-brand-600 cursor-pointer'
                          : 'text-text-muted cursor-not-allowed'
                      }`}
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-surface-border/10">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-text-muted">
                        You're all caught up!
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isUnread = !notif.read;
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`px-4 py-3 cursor-pointer transition duration-150 flex items-start gap-3 hover:bg-surface-subtle/50 ${
                              isUnread ? 'bg-brand-50/20' : ''
                            }`}
                          >
                            {/* Color-coded dot */}
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                notif.type === 'escalation'
                                  ? notif.description.includes('dispute')
                                    ? 'bg-status-warning'
                                    : 'bg-status-danger'
                                  : notif.type === 'recall'
                                  ? 'bg-status-warning'
                                  : 'bg-status-danger'
                              }`}
                            />
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] leading-relaxed text-text-primary ${isUnread ? 'font-bold' : 'font-medium'}`}>
                                {notif.description}
                              </p>
                              <span className="text-[10px] text-text-muted mt-1 block">
                                {notif.time}
                              </span>
                            </div>

                            {isUnread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT AREA */}
        <main className="p-8 flex-1 space-y-6 w-full">
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
                            .filter(a => a.status !== 'CANCELLED')
                            .sort((a, b) => {
                              if (a.date !== b.date) return a.date.localeCompare(b.date);
                              const getMinutes = (t: string) => {
                                const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
                                if (!m) return 0;
                                let h = parseInt(m[1], 10);
                                if (m[3].toUpperCase() === "PM" && h < 12) h += 12;
                                if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
                                return h * 60 + parseInt(m[2], 10);
                              };
                              return getMinutes(a.time) - getMinutes(b.time);
                            })
                            .slice(0, 8)
                            .map((apt) => (
                              <tr key={apt.id} className="hover:bg-surface-subtle/50 transition duration-150">
                                <td className="py-3 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-500 font-semibold text-xs flex items-center justify-center border border-brand-100">
                                    {apt.initials}
                                  </div>
                                  <span className="text-xs font-semibold text-text-primary">{apt.name}</span>
                                </td>
                                <td className="py-3 text-xs font-medium text-text-primary">{apt.time}</td>
                                <td className="py-3 text-xs text-text-secondary font-medium">{apt.doctor}</td>
                                <td className="py-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                    apt.status === 'CONFIRMED'
                                      ? 'bg-status-successBg text-status-success'
                                      : apt.status === 'PENDING'
                                      ? 'bg-status-warningBg text-status-warning'
                                      : 'bg-status-dangerBg text-status-danger'
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full ${
                                      apt.status === 'CONFIRMED'
                                        ? 'bg-status-success'
                                        : apt.status === 'PENDING'
                                        ? 'bg-status-warning'
                                        : 'bg-status-danger'
                                    }`}></span>
                                    {appointmentStatusLabels[apt.status] || apt.status}
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
                            ))}
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
        </main>
      </div>
      {/* 4. SIDE DRAWERS */}
      {(currentRoute === 'patients' || currentRoute === 'zero-chat' || currentRoute === 'live-queue') && (
        <>
          {/* ADD PATIENT DRAWER */}
          {currentRoute === 'patients' && addPatientModalOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
              <div
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
                onClick={() => setAddPatientModalOpen(false)}
              ></div>

              <div className="relative w-full max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col z-10 animate-slide-in overflow-hidden font-sans">
                {/* Header */}
                <div className="p-6 border-b border-surface-border/20 flex items-center justify-between flex-shrink-0">
                  <h3 className="text-base font-bold text-text-primary">Add Patient</h3>
                  <button
                    onClick={() => setAddPatientModalOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Form Body */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddPatient();
                  }}
                  className="p-6 space-y-5 flex-1 overflow-y-auto text-xs font-semibold"
                >
                  {addPatientError && (
                    <div className="p-3 bg-status-dangerBg text-status-danger border border-status-danger/20 rounded-xl text-xs">
                      {addPatientError}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={addPatientName}
                      onChange={(e) => setAddPatientName(e.target.value)}
                      placeholder="Rand al'Thor"
                      className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addPatientPhone}
                      onChange={(e) => setAddPatientPhone(e.target.value)}
                      placeholder="+1 555-0199"
                      className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={addPatientEmail}
                      onChange={(e) => setAddPatientEmail(e.target.value)}
                      placeholder="rand@tworivers.net"
                      className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Date of Birth</label>
                      <input
                        type="date"
                        value={addPatientDob}
                        onChange={(e) => setAddPatientDob(e.target.value)}
                        className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-text-secondary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Gender</label>
                      <select
                        value={addPatientGender}
                        onChange={(e) => setAddPatientGender(e.target.value)}
                        className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Primary Doctor</label>
                    <select
                      value={addPatientDoctor}
                      onChange={(e) => setAddPatientDoctor(e.target.value)}
                      className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                    >
                      <option value="Dr. Lan Mandragoran">Dr. Lan Mandragoran</option>
                      <option value="Dr. Nynaeve al'Meara">Dr. Nynaeve al'Meara</option>
                      <option value="Dr. Elayne Trakand">Dr. Elayne Trakand</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Recall Status</label>
                      <select
                        value={addPatientRecallStatus}
                        onChange={(e) => setAddPatientRecallStatus(e.target.value)}
                        className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                      >
                        <option value="UP_TO_DATE">Up to date</option>
                        <option value="DUE_SOON">Due Soon</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Recall Reason</label>
                      <input
                        type="text"
                        value={addPatientRecallReason}
                        onChange={(e) => setAddPatientRecallReason(e.target.value)}
                        placeholder="6-month cleaning"
                        className="w-full p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Form Actions Footer */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={addPatientLoading}
                      className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200 flex items-center justify-center gap-2"
                    >
                      {addPatientLoading ? (
                        <>
                          <RefreshCw className="animate-spin" size={14} />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Patient</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddPatientModalOpen(false)}
                      className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* AI OUTREACH DRAWER */}
          {currentRoute === 'patients' && patientsTab === 'recall' && expandedOutreachId !== null && (() => {
            const p = patients.find(patient => patient.id === expandedOutreachId);
            if (!p || !p.aiOutreachDraft) return null;
            const isEditing = editOutreachId === p.id;
            return (
              <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
                <div
                  className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
                  onClick={() => {
                    setExpandedOutreachId(null);
                    setEditOutreachId(null);
                  }}
                ></div>

                <div className="relative w-full max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col justify-between z-10 animate-slide-in">
                  {/* HEADER */}
                  <div className="p-6 border-b border-surface-border/20 flex items-center justify-between">
                    <div className="overflow-hidden">
                      <h3 className="text-base font-bold text-text-primary truncate">{p.name}</h3>
                      <p className="text-xs text-text-secondary mt-0.5 truncate">Recall Reason: {p.recallReason || '—'}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setExpandedOutreachId(null);
                        setEditOutreachId(null);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-start">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-ai-600 uppercase tracking-wider">Suggested by Zero</span>
                      </div>
                      
                      {isEditing ? (
                        <textarea
                          value={draftMessageText}
                          onChange={(e) => setDraftMessageText(e.target.value)}
                          className="w-full min-h-[160px] p-3.5 text-xs text-text-primary bg-surface-base border border-ai-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-ai-400 font-sans leading-relaxed resize-none"
                        />
                      ) : (
                        <div className="bg-ai-50/70 border border-ai-100/50 text-text-primary rounded-2xl rounded-tl-none shadow-sm p-4 text-xs leading-relaxed font-sans">
                          {p.aiOutreachDraft}
                        </div>
                      )}
                    </div>

                    {/* ACTIONS STACKED DIRECTLY BELOW */}
                    <div className="flex flex-col gap-2.5 w-full">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => {
                              if (draftMessageText.trim()) {
                                handleSaveOutreach(p.id, draftMessageText);
                                handleApproveOutreach(p.id);
                              }
                            }}
                            className="w-full py-2.5 bg-ai-500 hover:bg-ai-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200 font-sans"
                          >
                            Save & Send
                          </button>
                          <button
                            onClick={() => setEditOutreachId(null)}
                            className="w-full py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150 font-sans"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApproveOutreach(p.id)}
                            className="w-full py-2.5 bg-ai-500 hover:bg-ai-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200 font-sans"
                          >
                            Approve & Send
                          </button>
                          <button
                            onClick={() => {
                              setEditOutreachId(p.id);
                              setDraftMessageText(p.aiOutreachDraft || '');
                            }}
                            className="w-full py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150 font-sans"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* PATIENT DETAIL SIDE DRAWER */}
          {selectedPatientId && (
            <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
              <div
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
                onClick={() => setSelectedPatientId(null)}
              ></div>

              <div className="relative w-full max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col z-10 animate-slide-in overflow-hidden">
                <div className="p-6 border-b border-surface-border/20 flex-shrink-0">
                  {/* Close Button Row */}
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setSelectedPatientId(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {(!selectedPatient || patientDetailLoading) ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <RefreshCw className="animate-spin text-brand-500 mb-4" size={24} />
                      <p className="text-xs text-text-secondary">Loading details...</p>
                    </div>
                  ) : (
                    <>
                      {/* Patient Information Row */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-500 font-bold text-base flex items-center justify-center border border-brand-100 flex-shrink-0">
                          {selectedPatient.initials || selectedPatient.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT'}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-text-primary leading-snug">{selectedPatient.name}</h3>
                          <p className="text-xs text-text-secondary mt-0.5">{selectedPatient.phone}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-surface-border/10 text-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Last Visit</span>
                          <span className="text-xs font-bold text-text-primary mt-1">{selectedPatient.lastVisit || '—'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Next Appt</span>
                          <span className="text-xs font-bold text-text-primary mt-1">{selectedPatient.nextAppointment || '—'}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Recall</span>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            (selectedPatient.recallStatus || '').toUpperCase() === 'UP_TO_DATE'
                              ? 'bg-status-successBg text-status-success'
                              : (selectedPatient.recallStatus || '').toUpperCase() === 'DUE_SOON'
                              ? 'bg-status-warningBg text-status-warning'
                              : (selectedPatient.recallStatus || '').toUpperCase() === 'OVERDUE'
                              ? 'bg-status-dangerBg text-status-danger'
                              : 'bg-surface-subtle text-text-muted'
                          }`}>
                            {recallStatusLabels[(selectedPatient.recallStatus || '').toUpperCase()] || selectedPatient.recallStatus || '—'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {selectedPatient && !patientDetailLoading && (
                  <>
                    <div className="flex border-b border-surface-border/10 px-6 gap-4 flex-shrink-0">
                      <button
                        onClick={() => setDrawerTab('history')}
                        className={`pb-2 pt-1 text-xs font-bold relative transition duration-150 ${
                          drawerTab === 'history' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        History
                        {drawerTab === 'history' && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
                        )}
                      </button>
                      <button
                        onClick={() => setDrawerTab('intake')}
                        className={`pb-2 pt-1 text-xs font-bold relative transition duration-150 flex items-center gap-1 ${
                          drawerTab === 'intake' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Intake Notes
                        {selectedPatient.intakeNotes && (
                          <span className="w-1.5 h-1.5 bg-ai-500 rounded-full"></span>
                        )}
                        {drawerTab === 'intake' && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
                        )}
                      </button>
                      <button
                        onClick={() => setDrawerTab('conversations')}
                        className={`pb-2 pt-1 text-xs font-bold relative transition duration-150 ${
                          drawerTab === 'conversations' ? 'text-brand-500' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Conversations
                        {drawerTab === 'conversations' && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"></span>
                        )}
                      </button>
                    </div>

                    <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                      {drawerTab === 'history' && (
                        <div className="space-y-4">
                          {!selectedPatient.history || selectedPatient.history.length === 0 ? (
                            <div className="text-center py-8 text-xs text-text-secondary">
                              No visit history yet
                            </div>
                          ) : (
                            selectedPatient.history.map((record, index) => (
                              <div key={index} className="bg-surface-subtle/50 rounded-xl p-4 border border-surface-border/10 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-text-primary">{record.date}</span>
                                  <span className="text-text-secondary font-medium">{record.doctor}</span>
                                </div>
                                <div className="text-xs font-bold text-brand-600">
                                  Reason: {record.reason}
                                </div>
                                <p className="text-[11px] text-text-secondary leading-relaxed bg-white/60 p-2.5 rounded-lg border border-surface-border/5">
                                  {record.notes}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {drawerTab === 'intake' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">WhatsApp Pre-Intake</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-ai-50 text-ai-600 border border-ai-100">
                              <span>Captured by Zero</span>
                            </span>
                          </div>

                          {!selectedPatient.intakeNotes || !selectedPatient.intakeNotes.structuredAnswers || selectedPatient.intakeNotes.structuredAnswers.length === 0 ? (
                            <div className="text-center py-8 text-xs text-text-secondary">
                              No intake notes yet — these appear after Zero has collected patient information via WhatsApp.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {selectedPatient.intakeNotes.symptoms && (
                                <div className="bg-ai-50/10 border-l-2 border-ai-400 p-3.5 rounded-r-xl space-y-1">
                                  <span className="text-[10px] font-bold text-ai-600 uppercase tracking-wide">Reported Symptoms</span>
                                  <p className="text-xs text-text-primary leading-relaxed">
                                    "{selectedPatient.intakeNotes.symptoms}"
                                  </p>
                                </div>
                              )}

                              <div className="space-y-2.5 pt-2">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-sans">Structured Answers</span>
                                {selectedPatient.intakeNotes.structuredAnswers.map((item, idx) => (
                                  <div key={idx} className="bg-surface-subtle/50 rounded-xl p-3 border border-surface-border/10 text-xs">
                                    <div className="font-semibold text-text-secondary">{item.question}</div>
                                    <div className="font-bold text-text-primary mt-1">{item.answer}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {drawerTab === 'conversations' && (() => {
                        const patientConv = conversations.find(c => c.patientId === selectedPatient.id);
                        if (!patientConv) {
                          return (
                            <div className="text-center py-8 text-xs text-text-secondary font-sans font-medium">
                              No message exchange log available.
                            </div>
                          );
                        }
                        const messagesToShow = activeConversation && activeConversation.id === patientConv.id
                          ? activeConversation.messages
                          : patientConv.messages;

                        if (!messagesToShow || messagesToShow.length === 0) {
                          return (
                            <div className="text-center py-8 text-xs text-text-secondary font-sans font-medium">
                              {threadLoading ? "Loading conversation..." : "No messages in this conversation."}
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3 flex flex-col">
                            {messagesToShow.map((msg, index) => {
                              const isSystem = msg.role === 'system';
                              if (isSystem) {
                                return (
                                  <div key={index} className="flex items-center justify-center my-2">
                                    <span className="text-[9px] font-bold text-text-muted bg-surface-subtle px-3 py-1 rounded-full border border-surface-border/50 uppercase tracking-wider font-sans">
                                      {msg.text}
                                    </span>
                                  </div>
                                );
                              }

                              const isAI = msg.role === 'ai';
                              const isPatient = msg.role === 'patient';

                              return (
                                <div
                                  key={index}
                                  className={`flex flex-col max-w-[85%] ${isPatient ? 'self-end items-end' : 'self-start'}`}
                                >
                                  <span className={`text-[9px] font-bold mb-1 px-1 font-sans ${
                                    isAI ? 'text-ai-600 font-bold' : isPatient ? 'text-text-muted' : 'text-brand-600 font-bold'
                                  }`}>
                                    {isAI ? 'Zero AI' : isPatient ? patientConv.patientName : (msg.senderName || 'Staff')}
                                  </span>

                                  <div className={`p-3.5 text-xs leading-relaxed font-sans shadow-sm ${
                                    isAI
                                      ? 'bg-ai-100 border border-ai-200 text-ai-950 rounded-2xl rounded-tl-none border-l-4 border-l-ai-500'
                                      : isPatient
                                      ? 'bg-white border border-surface-border text-text-primary rounded-2xl rounded-tr-none'
                                      : 'bg-brand-100 border border-brand-200 text-brand-950 rounded-2xl rounded-tl-none border-l-4 border-l-brand-500'
                                  }`}>
                                    {msg.text}
                                  </div>
                                  <span className="text-[9px] text-text-muted mt-1 px-1 font-sans">
                                    {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="px-6 pt-6 pb-8 border-t border-surface-border/20 bg-surface-subtle/20 flex gap-3 flex-shrink-0">
                      <button
                        onClick={() => alert(`Booking flow triggered for ${selectedPatient.name}`)}
                        className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200 font-sans"
                      >
                        Book Appointment
                      </button>
                      <button
                        onClick={() => {
                          const patientConv = conversations.find(c => c.patientId === selectedPatient.id);
                          if (patientConv) {
                            setSelectedChatId(patientConv.id);
                          } else {
                            setSelectedChatId(null);
                          }
                          setCurrentRoute('zero-chat');
                          setSelectedPatientId(null);
                        }}
                        className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150 font-sans"
                      >
                        Send Message
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {currentRoute === 'appointments' && (
        <>
          {/* APPOINTMENT DETAIL SIDE DRAWER */}
          {selectedAppointmentId !== null && (() => {
            const appt = appointments.find(a => a.id === selectedAppointmentId);
            if (!appt) return null;
            return (
              <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
                <div
                  className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
                  onClick={() => {
                    setSelectedAppointmentId(null);
                    setIsRescheduling(false);
                  }}
                ></div>

                <div className="relative w-full max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col z-10 animate-slide-in overflow-hidden font-sans">
                  <div className="p-6 border-b border-surface-border/20 flex-shrink-0">
                    {/* Close Button Row */}
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => {
                          setSelectedAppointmentId(null);
                          setIsRescheduling(false);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Patient Information Row */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-500 font-bold text-base flex items-center justify-center border border-brand-100 flex-shrink-0">
                        {appt.initials}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-text-primary leading-snug">{appt.name}</h3>
                        <p className="text-xs text-text-secondary mt-0.5">{appt.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Content */}
                  <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Appointment Info</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          appt.status === 'CONFIRMED'
                            ? 'bg-status-successBg text-status-success border border-status-success/15'
                            : appt.status === 'PENDING'
                            ? 'bg-status-warningBg text-status-warning border border-status-warning/15'
                            : appt.status === 'COMPLETED'
                            ? 'bg-brand-50 text-brand-500 border border-brand-100'
                            : 'bg-status-dangerBg text-status-danger border border-status-danger/15'
                        }`}>
                          {appointmentStatusLabels[appt.status] || appt.status}
                        </span>
                      </div>

                      {/* Display Info Table */}
                      <div className="bg-surface-subtle/50 rounded-xl p-4 border border-surface-border/10 space-y-3.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-secondary font-semibold">Doctor</span>
                          <span className="font-bold text-text-primary">{appt.doctor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary font-semibold">Department</span>
                          <span className="font-bold text-text-primary">{appt.department}</span>
                        </div>
                        {!isRescheduling ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-text-secondary font-semibold">Date</span>
                              <span className="font-bold text-text-primary">
                                {new Date(appt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary font-semibold">Time Slot</span>
                              <span className="font-bold text-text-primary flex items-center gap-1">
                                <Clock size={12} className="text-text-muted" />
                                {appt.time}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="pt-2 border-t border-surface-border/20 space-y-3">
                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide block">Reschedule Appointment</span>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-text-secondary block">New Date</label>
                              <input
                                type="date"
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                className="w-full p-2 bg-surface-base border border-surface-border rounded-xl text-xs font-semibold focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-text-secondary block">New Time Slot</label>
                              <select
                                value={rescheduleTime}
                                onChange={(e) => setRescheduleTime(e.target.value)}
                                className="w-full p-2 bg-surface-base border border-surface-border rounded-xl text-xs font-semibold focus:outline-none"
                              >
                                {[
                                  "08:00 AM",
                                  "09:00 AM",
                                  "10:00 AM",
                                  "11:00 AM",
                                  "12:00 PM",
                                  "01:00 PM",
                                  "02:00 PM",
                                  "03:00 PM",
                                  "04:00 PM",
                                  "05:00 PM"
                                ].map(slot => (
                                  <option key={slot} value={slot}>{slot}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex gap-2 pt-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (rescheduleDate) {
                                    try {
                                      await api.appointments.update(appt.id, {
                                        date: rescheduleDate,
                                        time: convertTo24Hour(rescheduleTime)
                                      });
                                      setIsRescheduling(false);
                                      setSelectedAppointmentId(null);
                                      await loadAppointmentsRange(currentWeekStart);
                                    } catch (err) {
                                      console.error("Failed to reschedule appointment:", err);
                                    }
                                  }
                                }}
                                className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-xs transition duration-150"
                              >
                                Save Time
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsRescheduling(false)}
                                className="flex-1 py-2 border border-surface-border hover:bg-surface-subtle text-text-secondary font-bold rounded-lg text-xs transition duration-150"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notes / Visit details */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Notes</span>
                        <div className="bg-white border border-surface-border/30 rounded-xl p-3.5 text-xs text-text-primary leading-relaxed font-semibold">
                          {appt.notes || "No additional visit notes provided."}
                        </div>
                      </div>

                      {/* Booking source details */}
                      <div className="pt-2 border-t border-surface-border/10 space-y-1.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Booking Attribution</span>
                        <div className="flex items-center gap-2 text-xs">
                          {appt.bookedVia === 'zero' ? (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full bg-ai-500 flex-shrink-0"></span>
                              <span className="font-bold text-ai-600">Booked via Zero AI (WhatsApp Agent)</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full bg-text-secondary flex-shrink-0"></span>
                              <span className="font-bold text-text-secondary">Booked manually by clinic staff</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  {!isRescheduling && (
                    <div className="px-6 pt-6 pb-8 border-t border-surface-border/20 bg-surface-subtle/20 flex flex-col gap-2.5 flex-shrink-0">
                      <div className="flex gap-3">
                        {appt.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await api.appointments.update(appt.id, { status: "COMPLETED" });
                                setSelectedAppointmentId(null);
                                await loadAppointmentsRange(currentWeekStart);
                              } catch (err) {
                                console.error("Failed to complete appointment:", err);
                              }
                            }}
                            className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleDate(appt.date);
                            setRescheduleTime(formatTime12h(appt.time));
                            setIsRescheduling(true);
                          }}
                          className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150"
                        >
                          Reschedule
                        </button>
                      </div>
                      {appt.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await api.appointments.update(appt.id, { status: "CANCELLED" });
                              setSelectedAppointmentId(null);
                              await loadAppointmentsRange(currentWeekStart);
                            } catch (err) {
                              console.error("Failed to cancel appointment:", err);
                            }
                          }}
                          className="w-full py-2.5 border border-status-danger/30 hover:bg-status-dangerBg text-status-danger font-bold rounded-xl text-xs transition duration-150"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* NEW APPOINTMENT SIDE DRAWER */}
          {isNewApptDrawerOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
              <div
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
                onClick={() => setIsNewApptDrawerOpen(false)}
              ></div>

              <div className="relative w-full max-w-md bg-surface-base h-full shadow-2xl border-l border-surface-border/20 flex flex-col z-10 animate-slide-in overflow-hidden font-sans">
                {/* Header */}
                <div className="p-6 border-b border-surface-border/20 flex items-center justify-between flex-shrink-0">
                  <h3 className="text-base font-bold text-text-primary">New Appointment</h3>
                  <button
                    onClick={() => setIsNewApptDrawerOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition duration-150 border border-surface-border/30"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Form Body */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateAppointment();
                  }}
                  className="p-6 space-y-5 flex-1 overflow-y-auto text-xs font-semibold"
                >
                  {/* Patient select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient</label>
                    <select
                      value={formPatientId || ''}
                      onChange={(e) => setFormPatientId(e.target.value)}
                      required
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">Select a patient...</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                      ))}
                    </select>
                  </div>

                  {/* Date picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {/* Time slot select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Time Slot</label>
                    <select
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      required
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      {[
                        "08:00 AM",
                        "09:00 AM",
                        "10:00 AM",
                        "11:00 AM",
                        "12:00 PM",
                        "01:00 PM",
                        "02:00 PM",
                        "03:00 PM",
                        "04:00 PM",
                        "05:00 PM"
                      ].map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Doctor</label>
                    <select
                      value={formDoctor}
                      onChange={(e) => setFormDoctor(e.target.value)}
                      required
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="Dr. Lan Mandragoran">Dr. Lan Mandragoran</option>
                      <option value="Dr. Moiraine Damodred">Dr. Moiraine Damodred</option>
                    </select>
                  </div>

                  {/* Visit Type / Department */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Visit Type / Department</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      required
                      className="w-full p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Prenatal">Prenatal</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Notes</label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Add any specific clinical notes or reason for visit..."
                      className="w-full min-h-[100px] p-3.5 bg-surface-base border border-surface-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans leading-relaxed resize-none font-semibold"
                    />
                  </div>

                  {newApptError && (
                    <div className="p-3 bg-status-dangerBg border border-status-danger/20 rounded-xl text-status-danger text-xs font-semibold">
                      {newApptError}
                    </div>
                  )}

                  {/* Form Actions Footer */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={newApptLoading}
                      className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200"
                    >
                      {newApptLoading ? "Booking..." : "Book Appointment"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewApptDrawerOpen(false)}
                      className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
