import { useState, useEffect } from 'react';
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
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  mockClinicInfo,
  mockAIStats,
  mockStatCards,
  mockAppointments,
  mockAttentionItems,
  mockChartData,
  Appointment,
  AttentionItem,
  mockPatients,
  Patient
} from './mockData';

interface ChatMessage {
  sender: 'ai' | 'patient' | 'staff' | 'system';
  senderName?: string;
  text: string;
  time: string;
}

interface ChatConversation {
  id: number;
  patientName: string;
  patientInitials: string;
  patientPhone: string;
  status: 'needs_review' | 'ai_handling' | 'resolved';
  urgency: 'urgent' | 'admin' | 'none';
  escalationReason?: string;
  lastMessageTime?: string;
  messages: ChatMessage[];
  assignedStaff?: string;
}

interface NotificationItem {
  id: string;
  type: 'escalation' | 'recall' | 'no-show';
  title: string;
  description: string;
  time: string;
  read: boolean;
  linkData: {
    route: string;
    patientId?: number;
    tab?: string;
  };
}

interface QueueEntry {
  id: number;
  patientId?: number | null;
  name: string;
  initials: string;
  phone: string;
  arrivalTime: string;
  doctor: string;
  reason: string;
  waitTime: string;
  source: 'zero' | 'walk-in' | 'manual';
  status: 'waiting' | 'with_doctor' | 'completed' | 'no_show';
}

const initialQueue: QueueEntry[] = [
  {
    id: 1,
    patientId: 9,
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
    id: 2,
    patientId: 3,
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
    id: 3,
    patientId: 4,
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
    id: 4,
    patientId: 10,
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
    id: 5,
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
    id: 6,
    patientId: 1,
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
    id: 7,
    patientId: 2,
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
    id: 8,
    patientId: 5,
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
    id: 9,
    patientId: 6,
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
    id: 10,
    patientId: 11,
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
    id: 11,
    patientId: 12,
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
    id: 12,
    patientId: 13,
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
    id: 13,
    patientId: 14,
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
    id: 14,
    patientId: 15,
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
    id: 15,
    patientId: 16,
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

const initialConversations: ChatConversation[] = [
  {
    id: 1,
    patientName: "Nynaeve al'Meara",
    patientInitials: "NM",
    patientPhone: "+1 (555) 019-2834",
    status: 'needs_review',
    urgency: 'urgent',
    escalationReason: "Urgent — patient reported chest tightness, flagged as urgent",
    messages: [
      { sender: 'ai', text: "Hi Nynaeve, this is Zero. It looks like you're due for your hypertension checkup. Would you like to schedule a visit?", time: "09:15 AM" },
      { sender: 'patient', text: "I have been having some headaches, but today my chest feels really tight and heavy.", time: "09:17 AM" },
      { sender: 'ai', text: "I'm flagging this immediately for clinic staff. Please sit down, rest, and we will contact you right away. If you feel it's an emergency, please call 911.", time: "09:18 AM" }
    ]
  },
  {
    id: 3,
    patientName: "Egwene al'Vere",
    patientInitials: "EA",
    patientPhone: "+1 (555) 015-6789",
    status: 'needs_review',
    urgency: 'admin',
    escalationReason: "Billing — billing dispute requires human judgment",
    messages: [
      { sender: 'ai', text: "Hi Egwene, we noticed your routine blood panel checkup is due soon. Dr. Moiraine has openings on Tuesday. Would you like to schedule?", time: "10:30 AM" },
      { sender: 'patient', text: "I want to, but I got a bill for $120 for my last visit which should have been fully covered by my copay. I'm not booking anything until this is sorted.", time: "10:32 AM" },
      { sender: 'ai', text: "I understand your concern. Let me escalate this to our billing supervisor to review your charge. Someone will reply to you here shortly.", time: "10:33 AM" }
    ]
  },
  {
    id: 8,
    patientName: "Aviendha",
    patientInitials: "AV",
    patientPhone: "+1 (555) 023-5544",
    status: 'needs_review',
    urgency: 'urgent',
    escalationReason: "Urgent — patient reporting severe shortness of breath after new inhaler",
    messages: [
      { sender: 'ai', text: "Hi Aviendha, Dr. Lan would like to review your asthma action plan. Do you have 15 minutes this Friday?", time: "Yesterday" },
      { sender: 'patient', text: "I started the new inhaler today but I feel very short of breath and wheezy. Is that normal?", time: "Yesterday" },
      { sender: 'ai', text: "This is not normal. I am escalating this to Dr. Lan and the clinical team immediately. Please take your rescue inhaler and sit upright. Staff will message you now.", time: "Yesterday" }
    ]
  },
  {
    id: 2,
    patientName: "Rand al'Thor",
    patientInitials: "RT",
    patientPhone: "+1 (555) 012-3456",
    status: 'ai_handling',
    urgency: 'none',
    messages: [
      { sender: 'patient', text: "I need to book my follow-up for next week.", time: "11:00 AM" },
      { sender: 'ai', text: "Sure, Rand! Dr. Lan has slots on June 25th at 02:30 PM. Would that work?", time: "11:01 AM" },
      { sender: 'patient', text: "Do you have anything in the morning?", time: "11:02 AM" },
      { sender: 'ai', text: "Yes, we have 09:30 AM on the same day. Should I book that for you?", time: "11:03 AM" }
    ]
  },
  {
    id: 4,
    patientName: "Perrin Aybara",
    patientInitials: "PA",
    patientPhone: "+1 (555) 017-9876",
    status: 'ai_handling',
    urgency: 'none',
    messages: [
      { sender: 'ai', text: "Hi Perrin, your annual diabetic foot check is overdue. Would you like to book an appointment with Dr. Moiraine?", time: "Monday" },
      { sender: 'patient', text: "Is it covered by Cigna insurance?", time: "Monday" },
      { sender: 'ai', text: "Yes, Apex Family Clinic is in-network with Cigna. Your preventive foot exam should be fully covered, subject to your plan details.", time: "Monday" }
    ]
  },
  {
    id: 5,
    patientName: "Matrim Cauthon",
    patientInitials: "MC",
    patientPhone: "+1 (555) 018-4321",
    status: 'ai_handling',
    urgency: 'none',
    messages: [
      { sender: 'patient', text: "What are your hours on Saturday?", time: "Sunday" },
      { sender: 'ai', text: "Hi Matrim! We are open on Saturdays from 09:00 AM to 01:00 PM for urgent care and pre-scheduled appointments.", time: "Sunday" }
    ]
  },
  {
    id: 6,
    patientName: "Elayne Trakand",
    patientInitials: "ET",
    patientPhone: "+1 (555) 021-9988",
    status: 'ai_handling',
    urgency: 'none',
    messages: [
      { sender: 'ai', text: "Hi Elayne, it is time for your next prenatal wellness check. Dr. Moiraine is available on Wednesday morning. Let us know if you'd like to book!", time: "2 days ago" },
      { sender: 'patient', text: "Can we do 11:30 AM?", time: "2 days ago" },
      { sender: 'ai', text: "Yes, I've reserved Wednesday at 11:30 AM with Dr. Moiraine for you. You will receive a confirmation text shortly.", time: "2 days ago" }
    ]
  },
  {
    id: 7,
    patientName: "Min Farshaw",
    patientInitials: "MF",
    patientPhone: "+1 (555) 022-7766",
    status: 'resolved',
    urgency: 'none',
    messages: [
      { sender: 'patient', text: "Can I get a refill on my eye drops?", time: "Jun 15" },
      { sender: 'ai', text: "Sure, Min. I've sent a refill request for your Systane drops to Dr. Moiraine for approval. You'll get a text when sent to your pharmacy.", time: "Jun 15" },
      { sender: 'ai', text: "Your prescription refill has been approved and sent to Walgreens. It's ready for pickup.", time: "Jun 16" }
    ]
  },
  {
    id: 9,
    patientName: "Moiraine Damodred",
    patientInitials: "MD",
    patientPhone: "+1 (555) 024-3322",
    status: 'resolved',
    urgency: 'none',
    messages: []
  },
  {
    id: 10,
    patientName: "Lan Mandragoran",
    patientInitials: "LM",
    patientPhone: "+1 (555) 025-1100",
    status: 'resolved',
    urgency: 'none',
    messages: []
  },
  {
    id: 11,
    patientName: "Thom Merrilin",
    patientInitials: "TM",
    patientPhone: "+1 (555) 026-8877",
    status: 'resolved',
    urgency: 'none',
    assignedStaff: "Apex Billing",
    messages: [
      { sender: 'ai', text: "Hi Thom, it's time for your routine audiology hearing checkup. Would you like to check availability for next week?", time: "Jun 20" },
      { sender: 'patient', text: "I lost my hearing aid insurance card. Can you find my policy on file?", time: "Jun 20" },
      { sender: 'ai', text: "I am escalating this query so our front desk staff can look up your archived insurance details.", time: "Jun 20" },
      { sender: 'system', text: "Taken over by Apex Billing", time: "Jun 20" },
      { sender: 'staff', senderName: "Apex Billing", text: "Hi Thom, this is Sarah from the billing office. I located your policy details on file: BlueShield Policy #BS998372. You are all set!", time: "Jun 21" },
      { sender: 'system', text: "Conversation marked resolved", time: "Jun 21" }
    ]
  },
  {
    id: 12,
    patientName: "Loial",
    patientInitials: "LO",
    patientPhone: "+1 (555) 027-6655",
    status: 'resolved',
    urgency: 'none',
    messages: [
      { sender: 'patient', text: "Need to cancel my appointment for tomorrow. My book club was rescheduled.", time: "Jun 18" },
      { sender: 'ai', text: "No problem, Loial. I have cancelled your appointment. Would you like to reschedule for next week?", time: "Jun 18" },
      { sender: 'patient', text: "No, I will call the clinic later. Thank you.", time: "Jun 18" },
      { sender: 'ai', text: "You're welcome! Have a great day.", time: "Jun 18" }
    ]
  },
  {
    id: 13,
    patientName: "Siuan Sanche",
    patientInitials: "SS",
    patientPhone: "+1 (555) 028-4433",
    status: 'resolved',
    urgency: 'none',
    messages: []
  },
  {
    id: 14,
    patientName: "Logain Ablar",
    patientInitials: "LA",
    patientPhone: "+1 (555) 029-2211",
    status: 'resolved',
    urgency: 'none',
    messages: []
  },
  {
    id: 15,
    patientName: "Verin Mathwin",
    patientInitials: "VM",
    patientPhone: "+1 (555) 030-9988",
    status: 'resolved',
    urgency: 'none',
    messages: []
  },
  {
    id: 16,
    patientName: "Cadsuane Melaidhrin",
    patientInitials: "CM",
    patientPhone: "+1 (555) 031-7766",
    status: 'resolved',
    urgency: 'none',
    messages: []
  },
  {
    id: 17,
    patientName: "Alivia",
    patientInitials: "AL",
    patientPhone: "+1 (555) 032-5544",
    status: 'resolved',
    urgency: 'none',
    messages: []
  },
  {
    id: 18,
    patientName: "Tuon",
    patientInitials: "TU",
    patientPhone: "+1 (555) 033-3322",
    status: 'resolved',
    urgency: 'none',
    messages: []
  },
  {
    id: 19,
    patientName: "Birgitte Silverbow",
    patientInitials: "BS",
    patientPhone: "+1 (555) 034-1100",
    status: 'resolved',
    urgency: 'none',
    messages: []
  },
  {
    id: 20,
    patientName: "Gaul",
    patientInitials: "GL",
    patientPhone: "+1 (555) 035-8877",
    status: 'resolved',
    urgency: 'none',
    messages: []
  }
];

function App() {
  const [currentRoute, setCurrentRoute] = useState<'dashboard' | string>('dashboard');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>(mockAttentionItems);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

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
        patientId: 1
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
        patientId: 6,
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
        patientId: 3
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
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [drawerTab, setDrawerTab] = useState<'history' | 'intake' | 'conversations'>('history');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOutreachId, setExpandedOutreachId] = useState<number | null>(null);
  const [editOutreachId, setEditOutreachId] = useState<number | null>(null);
  const [draftMessageText, setDraftMessageText] = useState('');

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  // Appointments screen states
  const [apptViewMode, setApptViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date('2026-06-22'));
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isNewApptDrawerOpen, setIsNewApptDrawerOpen] = useState(false);

  // Filters state
  const [apptSearchQuery, setApptSearchQuery] = useState('');
  const [apptDoctorFilter, setApptDoctorFilter] = useState('all');
  const [apptStatusFilter, setApptStatusFilter] = useState('all');
  const [apptSortOrder, setApptSortOrder] = useState<'asc' | 'desc'>('asc');
  const [apptCurrentPage, setApptCurrentPage] = useState(1);

  // New Appointment Form state
  const [formPatientId, setFormPatientId] = useState<number | null>(null);
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
  const [walkInPatientId, setWalkInPatientId] = useState<number | null>(null);
  const [walkInNewPatientName, setWalkInNewPatientName] = useState('');
  const [walkInReason, setWalkInReason] = useState('');
  const [walkInDoctor, setWalkInDoctor] = useState('Dr. Lan Mandragoran');

  // ZeroChat screen states
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(initialConversations);
  const [selectedChatId, setSelectedChatId] = useState<number>(1);
  const [chatInputText, setChatInputText] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    needs_review: true,
    ai_handling: true,
    resolved: true
  });

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
    
    const t1 = setTimeout(() => setTransitionStatusIndex(1), 1200);
    const t2 = setTimeout(() => setTransitionStatusIndex(2), 2400);
    const t3 = setTimeout(() => {
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
          const nextId = prev.length ? Math.max(...prev.map(s => s.id)) + 1 : 1;
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
    { id: 1, name: 'Dr. Lan Mandragoran', role: 'Lead Physician', email: 'lan.m@apexfamily.com', initials: 'LM' },
    { id: 2, name: 'Dr. Moiraine Damodred', role: 'Chief of Staff', email: 'moiraine.d@apexfamily.com', initials: 'MD' },
    { id: 3, name: 'Sarah Sedai', role: 'Clinic Manager', email: 'sarah.s@apexfamily.com', initials: 'SS' }
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

  // Rotate the AI live activity feed ticker every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prevIndex) => (prevIndex + 1) % mockAIStats.liveActivityFeed.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  const handleResolveAttention = (id: number) => {
    setAttentionItems(prev => prev.filter(item => item.id !== id));
  };

  const handleStatusChange = (id: number, newStatus: 'Confirmed' | 'Pending' | 'Cancelled') => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: newStatus } : apt));
  };

  const handleApproveOutreach = (patientId: number) => {
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

  const handleSaveOutreach = (patientId: number, text: string) => {
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
    const waitingCount = queue.filter(q => q.status === 'waiting').length;
    const withDoctorCount = queue.filter(q => q.status === 'with_doctor').length;
    const completedCount = queue.filter(q => q.status === 'completed').length;
    const noShowCount = queue.filter(q => q.status === 'no_show').length;

    const filteredQueue = queue.filter(q => q.status === queueTab);

    const handleCallIn = (id: number) => {
      setQueue(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'with_doctor',
            waitTime: '—'
          };
        }
        return item;
      }));
    };

    const handleComplete = (id: number) => {
      setQueue(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'completed',
            waitTime: '—'
          };
        }
        return item;
      }));
    };

    const handleMarkArrived = (id: number) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setQueue(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'waiting',
            arrivalTime: timeStr,
            waitTime: '~0 min'
          };
        }
        return item;
      }));
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
            {filteredQueue.length === 0 ? (
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
                            item.status === 'waiting'
                              ? 'bg-status-warningBg text-status-warning'
                              : item.status === 'with_doctor'
                              ? 'bg-brand-50 text-brand-500'
                              : item.status === 'completed'
                              ? 'bg-status-successBg text-status-success'
                              : 'bg-status-dangerBg text-status-danger'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'waiting'
                                ? 'bg-status-warning'
                                : item.status === 'with_doctor'
                                ? 'bg-brand-500'
                                : item.status === 'completed'
                                ? 'bg-status-success'
                                : 'bg-status-danger'
                            }`}></span>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          {item.status === 'waiting' && (
                            <button
                              onClick={() => handleCallIn(item.id)}
                              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-[11px] shadow-sm transition duration-150"
                            >
                              Call In
                            </button>
                          )}
                          {item.status === 'with_doctor' && (
                            <button
                              onClick={() => handleComplete(item.id)}
                              className="px-3 py-1.5 bg-status-success hover:bg-status-success/90 text-white font-bold rounded-xl text-[11px] shadow-sm transition duration-150"
                            >
                              Complete
                            </button>
                          )}
                          {item.status === 'completed' && item.patientId && (
                            <button
                              onClick={() => setSelectedPatientId(item.patientId!)}
                              className="text-brand-500 hover:text-brand-600 hover:underline font-bold text-xs transition duration-150"
                            >
                              View
                            </button>
                          )}
                          {item.status === 'no_show' && (
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
                onSubmit={(e) => {
                  e.preventDefault();
                  let patientName = '';
                  let patientInitials = '';
                  let patientPhone = '';
                  let patientIdToUse: number | null = null;

                  if (walkInType === 'registered') {
                    if (!walkInPatientId) {
                      alert("Please select a patient.");
                      return;
                    }
                    const patient = patients.find(p => p.id === walkInPatientId);
                    if (!patient) return;
                    patientName = patient.name;
                    patientInitials = patient.initials;
                    patientPhone = patient.phone;
                    patientIdToUse = patient.id;
                  } else {
                    if (!walkInNewPatientName.trim()) {
                      alert("Please enter patient name.");
                      return;
                    }
                    patientName = walkInNewPatientName.trim();
                    patientInitials = patientName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'PT';
                    patientPhone = `+1 (555) 036-${Math.floor(1000 + Math.random() * 9000)}`;
                    
                    // Create a new Patient object and add it to patients list
                    const nextPatientId = Math.max(...patients.map(p => p.id)) + 1;
                    const newPatient: Patient = {
                      id: nextPatientId,
                      name: patientName,
                      initials: patientInitials,
                      phone: patientPhone,
                      lastVisit: 'Today',
                      nextAppointment: '—',
                      recallStatus: 'up_to_date',
                      conversationsCount: 0,
                      conversations: [],
                      history: [
                        {
                          date: new Date().toISOString().split('T')[0],
                          doctor: walkInDoctor,
                          reason: walkInReason || 'Walk-in Consultation',
                          notes: 'Checked in as a walk-in patient.'
                        }
                      ]
                    };
                    setPatients(prev => [...prev, newPatient]);
                    patientIdToUse = nextPatientId;
                  }

                  const nextQueueId = Math.max(...queue.map(q => q.id)) + 1;
                  const newQueueEntry: QueueEntry = {
                    id: nextQueueId,
                    patientId: patientIdToUse,
                    name: patientName,
                    initials: patientInitials,
                    phone: patientPhone,
                    arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    doctor: walkInDoctor,
                    reason: walkInReason || "General consultation",
                    waitTime: "~0 min",
                    source: 'walk-in',
                    status: 'waiting'
                  };

                  setQueue(prev => [...prev, newQueueEntry]);
                  setIsNewWalkInDrawerOpen(false);
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
                      onChange={(e) => setWalkInPatientId(Number(e.target.value))}
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
                    className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200"
                  >
                    Add to Queue
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
    const filteredPatients = patients.filter(patient => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = patient.name.toLowerCase().includes(query) || patient.phone.includes(query);
      
      if (patientsTab === 'recall') {
        const isRecall = patient.recallStatus === 'overdue' || patient.recallStatus === 'due_soon';
        return isRecall && matchesSearch;
      }
      return matchesSearch;
    });

    if (patientsTab === 'recall') {
      filteredPatients.sort((a, b) => {
        if (a.recallStatus === 'overdue' && b.recallStatus === 'due_soon') return -1;
        if (a.recallStatus === 'due_soon' && b.recallStatus === 'overdue') return 1;
        return 0;
      });
    }

    const totalPatientsCount = patients.length;
    const totalRecallCount = patients.filter(p => p.recallStatus === 'overdue' || p.recallStatus === 'due_soon').length;

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
              onClick={() => alert('Add Patient flow is coming soon!')}
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
            {paginatedPatients.length === 0 ? (
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
                            patient.recallStatus === 'up_to_date'
                              ? 'bg-status-successBg text-status-success'
                              : patient.recallStatus === 'due_soon'
                              ? 'bg-status-warningBg text-status-warning'
                              : patient.recallStatus === 'overdue'
                              ? 'bg-status-dangerBg text-status-danger'
                              : 'bg-surface-subtle text-text-muted'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${
                              patient.recallStatus === 'up_to_date'
                                ? 'bg-status-success'
                                : patient.recallStatus === 'due_soon'
                                ? 'bg-status-warning'
                                : patient.recallStatus === 'overdue'
                                ? 'bg-status-danger'
                                : 'bg-text-muted'
                            }`}></span>
                            {patient.recallStatus.replace('_', ' ')}
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
    const weekAppts = appointments.filter(a => a.date >= startStr && a.date <= endStr && a.status !== 'Cancelled');
    const todayStr = "2026-06-23"; // Today's date in mock clinic OS
    const todayAppts = appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled');

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
      const timeA = new Date(`${a.date} ${a.time}`).getTime();
      const timeB = new Date(`${b.date} ${b.time}`).getTime();
      return apptSortOrder === 'asc' ? timeA - timeB : timeB - timeA;
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
            <h2 className="text-[24px] font-semibold text-text-primary leading-tight">
              Appointments
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
                                if (appt.status === 'Pending') statusClasses = 'bg-status-warningBg border-status-warning/20 text-status-warning';
                                else if (appt.status === 'Completed') statusClasses = 'bg-status-successBg border-status-success/20 text-status-success';
                                else if (appt.status === 'Cancelled') statusClasses = 'bg-status-dangerBg/30 border-status-danger/10 text-text-muted line-through opacity-70';

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
                              appt.status === 'Confirmed'
                                ? 'bg-status-successBg text-status-success border border-status-success/15'
                                : appt.status === 'Pending'
                                ? 'bg-status-warningBg text-status-warning border border-status-warning/15'
                                : appt.status === 'Completed'
                                ? 'bg-brand-50 text-brand-500 border border-brand-100'
                                : 'bg-status-dangerBg text-status-danger border border-status-danger/15'
                            }`}>
                              {appt.status}
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

  const handleTakeOver = (convId: number) => {
    setChatConversations(prev => prev.map(c => {
      if (c.id === convId) {
        return {
          ...c,
          assignedStaff: "Apex Admin",
          messages: [
            ...c.messages,
            { sender: 'system', text: "Taken over by Apex Admin", time: "Just now" }
          ]
        };
      }
      return c;
    }));
  };

  const handleResolve = (convId: number) => {
    setChatConversations(prev => prev.map(c => {
      if (c.id === convId) {
        return {
          ...c,
          status: 'resolved',
          messages: [
            ...c.messages,
            { sender: 'system', text: "Conversation marked resolved", time: "Just now" }
          ]
        };
      }
      return c;
    }));
  };

  const handleReopen = (convId: number) => {
    setChatConversations(prev => prev.map(c => {
      if (c.id === convId) {
        return {
          ...c,
          status: 'ai_handling',
          assignedStaff: undefined,
          messages: [
            ...c.messages,
            { sender: 'system', text: "Conversation reopened, handed back to Zero AI", time: "Just now" }
          ]
        };
      }
      return c;
    }));
  };

  const renderZeroChatScreen = () => {
    // Filter conversations by search query
    const filteredConversations = chatConversations.filter(c =>
      c.patientName.toLowerCase().includes(chatSearchQuery.toLowerCase())
    );

    // Grouping
    const needsReviewList = filteredConversations.filter(c => c.status === 'needs_review');
    const aiHandlingList = filteredConversations.filter(c => c.status === 'ai_handling');
    const resolvedList = filteredConversations.filter(c => c.status === 'resolved');

    const selectedConv = chatConversations.find(c => c.id === selectedChatId) || chatConversations[0];

    const handleSendMessage = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!chatInputText.trim() || !selectedConv || !selectedConv.assignedStaff) return;
      
      const newMsg: ChatMessage = {
        sender: 'staff',
        senderName: "Apex Admin",
        text: chatInputText,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setChatConversations(prev => prev.map(c => {
        if (c.id === selectedConv.id) {
          return {
            ...c,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      }));
      setChatInputText('');
    };

    const renderConvRow = (conv: ChatConversation, selectedConv: ChatConversation) => {
      const isSelected = selectedConv && selectedConv.id === conv.id;
      const lastMsg = conv.messages[conv.messages.length - 1];

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
            {conv.patientInitials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-xs font-bold text-text-primary truncate">{conv.patientName}</span>
              <span className="text-[9px] text-text-muted font-medium whitespace-nowrap font-sans">{conv.lastMessageTime || lastMsg?.time}</span>
            </div>
            
            <p className="text-[11px] text-text-secondary truncate mt-1 leading-normal font-medium font-sans">
              {lastMsg ? lastMsg.text : 'No messages'}
            </p>

            {/* Sub-tag or urgency badge inside row */}
            {conv.status === 'needs_review' && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${conv.urgency === 'urgent' ? 'bg-status-danger' : 'bg-status-warning'}`}></span>
                <span className={`text-[9px] font-bold uppercase tracking-wider font-sans ${conv.urgency === 'urgent' ? 'text-status-danger' : 'text-status-warning'}`}>
                  {conv.urgency === 'urgent' ? 'Urgent Medical' : 'Billing Dispute'}
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
                    {selectedConv.patientInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-text-primary truncate">{selectedConv.patientName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-sans whitespace-nowrap ${
                        selectedConv.status === 'needs_review'
                          ? selectedConv.urgency === 'urgent'
                            ? 'bg-status-dangerBg text-status-danger border border-status-danger/10'
                            : 'bg-status-warningBg text-status-warning border border-status-warning/10'
                          : selectedConv.status === 'ai_handling'
                          ? 'bg-ai-50 text-ai-600 border border-ai-100/50'
                          : 'bg-status-successBg text-status-success border border-status-success/10'
                      }`}>
                        {selectedConv.status === 'needs_review'
                          ? `Needs Review · ${selectedConv.urgency === 'urgent' ? 'Urgent' : 'Admin'}`
                          : selectedConv.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                      <span className="text-text-secondary font-sans">{selectedConv.patientPhone}</span>
                      <span className="text-text-muted">·</span>
                      <button
                        onClick={() => setSelectedPatientId(selectedConv.id)}
                        className="font-bold text-brand-500 hover:text-brand-600 transition"
                      >
                        View Patient
                      </button>
                    </div>
                  </div>
                </div>

                {/* Take Over & Resolve Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!selectedConv.assignedStaff && selectedConv.status !== 'resolved' && (
                    <button
                      onClick={() => handleTakeOver(selectedConv.id)}
                      className="px-3 py-1.5 text-xs font-bold border border-status-warning/45 text-status-warning hover:bg-status-warningBg/80 rounded-xl transition duration-150 shadow-sm"
                    >
                      Take Over
                    </button>
                  )}
                  {selectedConv.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(selectedConv.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-status-success hover:bg-status-success/90 text-white rounded-xl transition duration-150 shadow-sm"
                    >
                      Resolve
                    </button>
                  )}
                  {selectedConv.status === 'resolved' && (
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
              {selectedConv.status === 'needs_review' && selectedConv.escalationReason && (
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
                {selectedConv.messages.map((msg, index) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={index} className="flex items-center justify-center my-2">
                        <span className="text-[9px] font-bold text-text-muted bg-surface-subtle px-3 py-1 rounded-full border border-surface-border/50 uppercase tracking-wider font-sans">
                          {msg.text} · {msg.time}
                        </span>
                      </div>
                    );
                  }

                  const isAI = msg.sender === 'ai';
                  const isPatient = msg.sender === 'patient';

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
                      <span className="text-[8px] text-text-muted mt-1 px-1 font-sans">{msg.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Panel */}
              <div className="p-4 bg-surface-base border-t border-surface-border/20 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <input
                    type="text"
                    disabled={!selectedConv.assignedStaff || selectedConv.status === 'resolved'}
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    placeholder={
                      selectedConv.status === 'resolved'
                        ? "This conversation is resolved."
                        : selectedConv.assignedStaff
                        ? "Type your message..."
                        : "Click 'Take Over' to reply manually..."
                    }
                    className={`flex-1 px-4 py-3 bg-surface-subtle border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans ${
                      !selectedConv.assignedStaff || selectedConv.status === 'resolved'
                        ? 'cursor-not-allowed text-text-muted border-surface-border/50'
                        : 'text-text-primary border-surface-border/80'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!chatInputText.trim() || !selectedConv.assignedStaff || selectedConv.status === 'resolved'}
                    className={`p-3 rounded-xl transition duration-150 flex items-center justify-center ${
                      !chatInputText.trim() || !selectedConv.assignedStaff || selectedConv.status === 'resolved'
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
        <div className="flex flex-col items-center justify-center p-12 text-center max-w-md bg-surface-base rounded-2xl shadow-soft border border-surface-border/30 w-full animate-fade-in space-y-6">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ai-500 opacity-20"></span>
            <div className="relative inline-flex rounded-full h-14 w-14 bg-gradient-to-tr from-ai-500 to-ai-600 shadow-lg items-center justify-center text-white text-base font-bold select-none">
              Zero
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text-primary">Configuring Clinic Assistant</h3>
            <p className="text-xs text-text-muted animate-pulse">{statusTexts[transitionStatusIndex]}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-xl w-full mx-auto pb-16 pt-8 animate-fade-in font-sans text-xs relative">
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
          <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-8 space-y-6">
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
                onClick={() => setOnboardingAuthMode('signup')}
                className={`flex-1 py-2 rounded-lg font-bold transition duration-150 ${
                  onboardingAuthMode === 'signup'
                    ? 'bg-surface-base text-brand-600 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setOnboardingAuthMode('login')}
                className={`flex-1 py-2 rounded-lg font-bold transition duration-150 ${
                  onboardingAuthMode === 'login'
                    ? 'bg-surface-base text-brand-600 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Log In
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setOnboardingStep(2);
              }}
              className="space-y-4"
            >
              {onboardingAuthMode === 'signup' && (
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Admin Full Name</label>
                  <input
                    type="text"
                    value={onboardingAdminName}
                    onChange={(e) => setOnboardingAdminName(e.target.value)}
                    required
                    placeholder="e.g. Sarah Sedai"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              )}

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Work Email</label>
                <input
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
                  type="password"
                  value={onboardingPassword}
                  onChange={(e) => setOnboardingPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition duration-150 shadow-sm text-xs mt-2"
              >
                {onboardingAuthMode === 'signup' ? 'Create Account' : 'Log In'}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-surface-border/40"></div>
              <span className="flex-shrink mx-4 text-text-muted text-[10px] font-bold uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-surface-border/40"></div>
            </div>

            <button
              onClick={() => setOnboardingStep(2)}
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
          <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-8 space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinic Name</label>
                  <input
                    type="text"
                    value={onboardingClinicName}
                    onChange={(e) => setOnboardingClinicName(e.target.value)}
                    required
                    placeholder="e.g. Apex Family Clinic"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Services Offered (Comma Separated)</label>
                  <input
                    type="text"
                    value={onboardingServices}
                    onChange={(e) => setOnboardingServices(e.target.value)}
                    required
                    placeholder="e.g. Cardiology, Dermatology, General Medicine"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Clinic Address</label>
                  <input
                    type="text"
                    value={onboardingAddress}
                    onChange={(e) => setOnboardingAddress(e.target.value)}
                    required
                    placeholder="e.g. 123 Eldene Way, Suite 400, Apex City"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Operating Hours</label>
                  <input
                    type="text"
                    value={onboardingHours}
                    onChange={(e) => setOnboardingHours(e.target.value)}
                    required
                    placeholder="e.g. Mon - Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
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
          <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-8 space-y-6">
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
          <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-8 space-y-6">
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
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Doctor Name</label>
                <input
                  type="text"
                  value={onboardingDoctorName}
                  onChange={(e) => setOnboardingDoctorName(e.target.value)}
                  required
                  placeholder="e.g. Dr. Lan Mandragoran"
                  className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Role / Specialization</label>
                  <select
                    value={onboardingDoctorRole}
                    onChange={(e) => setOnboardingDoctorRole(e.target.value)}
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Lead Physician">Lead Physician</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Physiotherapist">Physiotherapist</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={onboardingDoctorEmail}
                    onChange={(e) => setOnboardingDoctorEmail(e.target.value)}
                    required
                    placeholder="e.g. lan.m@apexfamily.com"
                    className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
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
            <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/30 p-6 space-y-4 max-w-md mx-auto relative overflow-hidden">
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
      const nextId = staffList.length ? Math.max(...staffList.map(s => s.id)) + 1 : 1;
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

    const handleRemoveStaff = (id: number) => {
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

  if (!isOnboarded) {
    return (
      <div className="flex min-h-screen bg-surface-subtle justify-center items-center p-6 w-full relative">
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition duration-150 ${
                      currentRoute === 'zero-chat'
                        ? 'bg-ai-50 text-brand-500 font-semibold'
                        : 'text-brand-100/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare size={16} />
                    <span>ZeroChat</span>
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
                      {attentionItems.length} conversations need your attention
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
              <div className="bg-gradient-to-tr from-ai-50 via-ai-50/10 to-surface-base border-l-4 border-ai-500 rounded-2xl shadow-soft p-6 relative overflow-hidden flex flex-col md:flex-row items-stretch justify-between gap-6">
                {/* Background Decorative Gradient Orbs */}
                <div className="absolute right-0 top-0 w-80 h-80 bg-ai-100/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                <div className="flex-1 flex flex-col justify-between min-h-[140px] space-y-4">
                  <div>
                    <span className="text-[12px] font-semibold text-ai-600 uppercase tracking-widest">
                      Zero is Working
                    </span>
                    <h3 className="text-xl font-bold text-text-primary mt-1">
                      AI Patient Care Operations
                    </h3>
                  </div>

                  {/* AI KPI Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-text-secondary font-medium">Conversations Handled Today</span>
                      <span className="text-3xl font-bold text-ai-600 mt-1 flex items-baseline gap-2">
                        {mockAIStats.handledConversations}
                        <span className="text-xs font-semibold text-status-success bg-status-successBg px-2 py-0.5 rounded-full">
                          100% Auto
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-text-secondary font-medium">Escalated to Staff</span>
                      <span className="text-3xl font-bold text-text-primary mt-1 flex items-center gap-2">
                        {mockAIStats.escalatedConversations}
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-warning animate-pulse"></span>
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-text-secondary font-medium">Avg Response Time</span>
                      <span className="text-3xl font-bold text-text-primary mt-1">
                        {mockAIStats.avgResponseTime}
                      </span>
                    </div>
                  </div>

                  {/* Live Activity Feed Ticker */}
                  <div className="bg-surface-base/80 border border-ai-100/50 rounded-xl px-4 py-2 flex items-center gap-2.5 text-xs text-text-secondary shadow-sm min-h-[36px]">
                    <span className="w-2 h-2 rounded-full bg-ai-500 animate-pulse flex-shrink-0"></span>
                    <span className="font-semibold text-ai-600 uppercase tracking-wider text-[10px]">LIVE FEED:</span>
                    <span className="animate-fade-in text-text-primary transition-all duration-300">
                      {mockAIStats.liveActivityFeed[tickerIndex]}
                    </span>
                  </div>
                </div>

                {/* Pulsing Orb Visual Block */}
                <div className="w-full md:w-[220px] flex flex-col items-center justify-center bg-white/40 border border-ai-100/20 rounded-xl p-4 text-center relative overflow-hidden backdrop-blur-sm self-center">
                  <div className="relative w-16 h-16 mb-3 flex items-center justify-center">
                    {/* Glowing pulse background */}
                    <div className="absolute inset-0 rounded-full bg-ai-500/25 animate-orb-pulse"></div>
                    {/* Core brand indicator */}
                    <div className="relative w-10 h-10 bg-ai-500 rounded-full flex items-center justify-center text-white shadow-md font-sans font-bold text-sm">
                      Z
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-ai-600 uppercase tracking-widest block">AI Active</span>
                  <span className="text-[11px] text-text-secondary mt-1">Monitoring WhatsApp queue</span>
                </div>
              </div>

              {/* STAT ROW (3 Compact Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockStatCards.map((card) => (
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
                          {appointments.slice(0, 8).map((apt) => (
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
                                  apt.status === 'Confirmed'
                                    ? 'bg-status-successBg text-status-success'
                                    : apt.status === 'Pending'
                                    ? 'bg-status-warningBg text-status-warning'
                                    : 'bg-status-dangerBg text-status-danger'
                                }`}>
                                  <span className={`w-1 h-1 rounded-full ${
                                    apt.status === 'Confirmed'
                                      ? 'bg-status-success'
                                      : apt.status === 'Pending'
                                      ? 'bg-status-warning'
                                      : 'bg-status-danger'
                                  }`}></span>
                                  {apt.status}
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
                    
                    {attentionItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-12 h-12 bg-status-successBg text-status-success rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 size={24} />
                        </div>
                        <p className="text-sm font-semibold text-text-primary">Nothing needs attention</p>
                        <p className="text-xs text-text-secondary mt-1">AI and queue are running smoothly.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {attentionItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition duration-150 ${
                              item.type === 'escalation'
                                ? 'bg-status-dangerBg border-status-danger/10'
                                : 'bg-status-warningBg border-status-warning/10'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  item.type === 'escalation'
                                    ? 'bg-status-danger text-white'
                                    : 'bg-status-warning text-white'
                                }`}>
                                  {item.type === 'escalation' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-text-primary leading-tight">{item.title}</h4>
                                  <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-semibold text-text-muted flex-shrink-0">{item.time}</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-black/[0.03]">
                              <button
                                onClick={() => handleResolveAttention(item.id)}
                                className="px-2.5 py-1 text-[10px] font-bold text-text-secondary hover:text-text-primary rounded-md transition duration-150"
                              >
                                Dismiss
                              </button>
                              <button
                                onClick={() => {
                                  if (item.type === 'escalation') {
                                    setCurrentRoute('zero-chat');
                                  } else {
                                    setCurrentRoute('patients');
                                  }
                                }}
                                className={`px-3 py-1 rounded-md font-bold text-[10px] transition duration-150 text-white shadow-sm ${
                                  item.type === 'escalation'
                                    ? 'bg-status-danger hover:bg-status-danger/90'
                                    : 'bg-status-warning hover:bg-status-warning/90'
                                }`}
                              >
                                {item.action}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: TREND CHART */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Booking Trend Chart - 70% width */}
                <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-text-primary">Bookings & Conversations</h3>
                        <p className="text-xs text-text-secondary mt-0.5">Weekly comparison of total bookings handled by Zero AI</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-brand-500"></span>
                          <span className="text-text-secondary">Total Bookings</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-ai-500"></span>
                          <span className="text-text-secondary">AI Handled</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-60 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={mockChartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01}/>
                            </linearGradient>
                            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.01}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                            }}
                            labelStyle={{ fontWeight: 'bold', color: '#0F172A', fontSize: '12px' }}
                            itemStyle={{ fontSize: '11px', padding: '2px 0' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="bookings"
                            stroke="#2563EB"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorBookings)"
                            name="Total Bookings"
                          />
                          <Area
                            type="monotone"
                            dataKey="aiHandled"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAI)"
                            name="AI Handled"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* AI Performance Insights - 30% width */}
                <div className="bg-surface-base rounded-2xl shadow-soft border border-surface-border/20 p-6 lg:col-span-3 flex flex-col justify-between">
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
          {selectedPatient && (
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

                  {/* Patient Information Row */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-500 font-bold text-base flex items-center justify-center border border-brand-100 flex-shrink-0">
                      {selectedPatient.initials}
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
                        selectedPatient.recallStatus === 'up_to_date'
                          ? 'bg-status-successBg text-status-success'
                          : selectedPatient.recallStatus === 'due_soon'
                          ? 'bg-status-warningBg text-status-warning'
                          : selectedPatient.recallStatus === 'overdue'
                          ? 'bg-status-dangerBg text-status-danger'
                          : 'bg-surface-subtle text-text-muted'
                      }`}>
                        {selectedPatient.recallStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

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
                      {selectedPatient.history.length === 0 ? (
                        <div className="text-center py-8 text-xs text-text-secondary">
                          No previous visit history recorded.
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

                      {!selectedPatient.intakeNotes ? (
                        <div className="text-center py-8 text-xs text-text-secondary">
                          No pre-intake notes captured for this patient.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-ai-50/10 border-l-2 border-ai-400 p-3.5 rounded-r-xl space-y-1">
                            <span className="text-[10px] font-bold text-ai-600 uppercase tracking-wide">Reported Symptoms</span>
                            <p className="text-xs text-text-primary leading-relaxed">
                              "{selectedPatient.intakeNotes.symptoms}"
                            </p>
                          </div>

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
                    const activeConv = chatConversations.find(c => c.id === selectedPatient.id);
                    if (!activeConv || !activeConv.messages || activeConv.messages.length === 0) {
                      return (
                        <div className="text-center py-8 text-xs text-text-secondary font-sans font-medium">
                          No message exchange log available.
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3 flex flex-col">
                        {activeConv.messages.map((msg, index) => {
                          if (msg.sender === 'system') {
                            return (
                              <div key={index} className="flex items-center justify-center my-2">
                                <span className="text-[9px] font-bold text-text-muted bg-surface-subtle px-3 py-1 rounded-full border border-surface-border/50 uppercase tracking-wider font-sans">
                                  {msg.text} · {msg.time}
                                </span>
                              </div>
                            );
                          }

                          const isAI = msg.sender === 'ai';
                          const isPatient = msg.sender === 'patient';

                          return (
                            <div
                              key={index}
                              className={`flex flex-col max-w-[85%] ${isPatient ? 'self-end items-end' : 'self-start'}`}
                            >
                              <span className={`text-[9px] font-bold mb-1 px-1 font-sans ${
                                isAI ? 'text-ai-600 font-bold' : isPatient ? 'text-text-muted' : 'text-brand-600 font-bold'
                              }`}>
                                {isAI ? 'Zero AI' : isPatient ? activeConv.patientName : (msg.senderName || 'Staff')}
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
                              <span className="text-[9px] text-text-muted mt-1 px-1 font-sans">{msg.time}</span>
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
                      const exists = chatConversations.some(c => c.id === selectedPatient.id);
                      if (!exists) {
                        const newConv: ChatConversation = {
                          id: selectedPatient.id,
                          patientName: selectedPatient.name,
                          patientInitials: selectedPatient.initials,
                          patientPhone: selectedPatient.phone,
                          status: 'ai_handling',
                          urgency: 'none',
                          messages: []
                        };
                        setChatConversations(prev => [newConv, ...prev]);
                      }
                      setSelectedChatId(selectedPatient.id);
                      setCurrentRoute('zero-chat');
                      setSelectedPatientId(null);
                    }}
                    className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150 font-sans"
                  >
                    Send Message
                  </button>
                </div>
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
                          appt.status === 'Confirmed'
                            ? 'bg-status-successBg text-status-success border border-status-success/15'
                            : appt.status === 'Pending'
                            ? 'bg-status-warningBg text-status-warning border border-status-warning/15'
                            : appt.status === 'Completed'
                            ? 'bg-brand-50 text-brand-500 border border-brand-100'
                            : 'bg-status-dangerBg text-status-danger border border-status-danger/15'
                        }`}>
                          {appt.status}
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
                                onClick={() => {
                                  if (rescheduleDate) {
                                    setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, date: rescheduleDate, time: rescheduleTime } : a));
                                    setIsRescheduling(false);
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
                        {appt.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'Completed' } : a));
                              setSelectedAppointmentId(null);
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
                            setRescheduleTime(appt.time);
                            setIsRescheduling(true);
                          }}
                          className="flex-1 py-2.5 border border-surface-border hover:bg-surface-subtle text-text-secondary hover:text-text-primary font-bold rounded-xl text-xs transition duration-150"
                        >
                          Reschedule
                        </button>
                      </div>
                      {appt.status !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'Cancelled' } : a));
                            setSelectedAppointmentId(null);
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
                    if (!formPatientId) {
                      alert("Please select a patient.");
                      return;
                    }
                    const patient = patients.find(p => p.id === formPatientId);
                    if (!patient) return;

                    const nextId = Math.max(...appointments.map(a => a.id)) + 1;
                    const newAppt: Appointment = {
                      id: nextId,
                      name: patient.name,
                      initials: patient.initials,
                      phone: patient.phone,
                      date: formDate || "2026-06-23",
                      time: formTime,
                      doctor: formDoctor,
                      department: formDept,
                      status: 'Confirmed',
                      bookedVia: 'manual',
                      notes: formNotes
                    };

                    setAppointments(prev => [newAppt, ...prev]);
                    setIsNewApptDrawerOpen(false);
                  }}
                  className="p-6 space-y-5 flex-1 overflow-y-auto text-xs font-semibold"
                >
                  {/* Patient select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient</label>
                    <select
                      value={formPatientId || ''}
                      onChange={(e) => setFormPatientId(Number(e.target.value))}
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

                  {/* Form Actions Footer */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-xs shadow-sm transition duration-200"
                    >
                      Book Appointment
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
