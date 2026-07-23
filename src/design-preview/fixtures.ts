// ============================================================================
// Design-harness fixtures — realistic mock data for the standalone design
// preview (see DesignPreview.tsx). Lives entirely outside the production auth /
// API flow so every screen can be rendered and styled without a backend or a
// login. Nigerian-clinic flavour to match the real WhatsApp test data.
//
// This folder is a DEV-ONLY design playground. It is never imported by the
// production app (main.tsx / App.tsx) and is safe to delete.
// ============================================================================

import {
  Appointment,
  Conversation,
  DashboardSummary,
  Patient,
} from '../api';
import type { QueueEntry } from '../features/live-queue/LiveQueuePage';
import type { StaffListItem } from '../features/settings/SettingsPage';
import type { NotificationItem } from '../components/layout/NotificationsDropdown';

export const doctorOptions = [
  'Dr. Amina Bello',
  'Dr. Chukwuemeka Okafor',
  'Dr. Folake Adeyemi',
  'Dr. Ibrahim Sani',
];

export const dashboardSummary: DashboardSummary = {
  clinicName: 'Grace Medical Centre',
  patientsToday: 34,
  doctorsOnDuty: 4,
  conversationsNeedingAttention: 3,
  aiActivity: {
    conversationsHandledToday: 61,
    escalatedToStaff: 3,
    avgResponseTimeSeconds: 8,
  },
  queueSnapshot: { waiting: 5, withDoctor: 2, completedToday: 27 },
  aiAutonomy: {
    autonomyRatePercent: 94,
    autopilotSessions: 58,
    manualEscalations: 3,
    recallSuccessRatePercent: 71,
    insightLine: 'Zero handled 94% of conversations end-to-end today.',
  },
};

export const queue: QueueEntry[] = [
  { id: 'q1', patientId: 'p1', name: 'Ada Obi', initials: 'AO', phone: '+234 803 000 0003', arrivalTime: '09:12', doctor: 'Dr. Amina Bello', reason: 'Headache & fever, 2 days', waitTime: '18 min', source: 'zero', status: 'WAITING' },
  { id: 'q2', patientId: 'p2', name: 'Emeka Nwosu', initials: 'EN', phone: '+234 806 111 2222', arrivalTime: '09:20', doctor: null, reason: 'Follow-up, BP check', waitTime: '10 min', source: 'walk-in', status: 'WAITING' },
  { id: 'q3', patientId: 'p3', name: 'Zainab Yusuf', initials: 'ZY', phone: '+234 809 333 4444', arrivalTime: '09:05', doctor: 'Dr. Folake Adeyemi', reason: 'Antenatal check', waitTime: '25 min', source: 'zero', status: 'WAITING' },
  { id: 'q4', patientId: 'p4', name: 'Tunde Balogun', initials: 'TB', phone: '+234 802 555 6666', arrivalTime: '09:31', doctor: null, reason: 'Persistent cough', waitTime: '4 min', source: 'walk-in', status: 'WAITING' },
  { id: 'q5', patientId: 'p5', name: 'Ngozi Eze', initials: 'NE', phone: '+234 805 777 8888', arrivalTime: '08:58', doctor: 'Dr. Ibrahim Sani', reason: 'Diabetes review', waitTime: '32 min', source: 'zero', status: 'WAITING' },
  { id: 'q6', patientId: 'p6', name: 'Bola Ahmed', initials: 'BA', phone: '+234 807 999 0000', arrivalTime: '08:40', doctor: 'Dr. Amina Bello', reason: 'Skin rash', waitTime: 'In room 12 min', source: 'zero', status: 'WITH_DOCTOR' },
  { id: 'q7', patientId: 'p7', name: 'Chidi Okonkwo', initials: 'CO', phone: '+234 803 222 3333', arrivalTime: '08:35', doctor: 'Dr. Chukwuemeka Okafor', reason: 'Sprained ankle', waitTime: 'In room 20 min', source: 'walk-in', status: 'WITH_DOCTOR' },
  { id: 'q8', patientId: 'p8', name: 'Halima Musa', initials: 'HM', phone: '+234 808 444 5555', arrivalTime: '08:10', doctor: 'Dr. Folake Adeyemi', reason: 'Malaria test', waitTime: 'Done 08:45', source: 'zero', status: 'COMPLETED' },
  { id: 'q9', patientId: 'p9', name: 'Segun Oyelaran', initials: 'SO', phone: '+234 802 666 7777', arrivalTime: '07:55', doctor: 'Dr. Ibrahim Sani', reason: 'Blood pressure', waitTime: 'Done 08:30', source: 'walk-in', status: 'COMPLETED' },
  { id: 'q10', patientId: 'p10', name: 'Fatima Sadiq', initials: 'FS', phone: '+234 809 888 9999', arrivalTime: '08:00', doctor: null, reason: 'Did not arrive', waitTime: '—', source: 'zero', status: 'NO_SHOW' },
];

// Times use the "HH:00 AM/PM" format the calendar grid matches on, and dates
// land inside the current visible week so appointments populate the grid.
export const appointments: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'Ada Obi', patientPhone: '+234 803 000 0003', doctor: 'Dr. Amina Bello', date: todayISO(), time: '10:00 AM', visitType: 'Consultation', status: 'confirmed', bookedVia: 'zero' },
  { id: 'a2', patientId: 'p3', patientName: 'Zainab Yusuf', patientPhone: '+234 809 333 4444', doctor: 'Dr. Folake Adeyemi', date: todayISO(), time: '11:00 AM', visitType: 'Antenatal', status: 'confirmed', bookedVia: 'zero' },
  { id: 'a3', patientId: 'p5', patientName: 'Ngozi Eze', patientPhone: '+234 805 777 8888', doctor: 'Dr. Ibrahim Sani', date: todayISO(), time: '01:00 PM', visitType: 'Review', status: 'pending', bookedVia: 'manual' },
  { id: 'a4', patientId: 'p2', patientName: 'Emeka Nwosu', patientPhone: '+234 806 111 2222', doctor: 'Dr. Chukwuemeka Okafor', date: addDaysISO(1), time: '09:00 AM', visitType: 'Follow-up', status: 'confirmed', bookedVia: 'zero' },
  { id: 'a5', patientId: 'p7', patientName: 'Chidi Okonkwo', patientPhone: '+234 803 222 3333', doctor: 'Dr. Amina Bello', date: addDaysISO(1), time: '02:00 PM', visitType: 'Physiotherapy', status: 'confirmed', bookedVia: 'manual' },
  { id: 'a6', patientId: 'p6', patientName: 'Bola Ahmed', patientPhone: '+234 807 999 0000', doctor: 'Dr. Folake Adeyemi', date: addDaysISO(2), time: '10:00 AM', visitType: 'Dermatology', status: 'pending', bookedVia: 'zero' },
  { id: 'a7', patientId: 'p9', patientName: 'Segun Oyelaran', patientPhone: '+234 802 666 7777', doctor: 'Dr. Ibrahim Sani', date: addDaysISO(3), time: '12:00 PM', visitType: 'Consultation', status: 'cancelled', bookedVia: 'manual' },
];

export const conversations: Conversation[] = [
  {
    id: 'c1', patientId: 'p11', patientName: 'Kelechi Umeh', patientPhone: '+234 803 111 0001',
    status: 'NEEDS_REVIEW', urgency: 'urgent', escalationReason: 'Patient reports chest pain radiating to left arm',
    lastMessage: 'It started about an hour ago and it hurts to breathe', lastMessageTime: '2m ago',
    messages: [
      { id: 'm1', role: 'patient', text: 'Hi, I have really bad chest pain', createdAt: iso(-12) },
      { id: 'm2', role: 'ai', text: '⚠️ This sounds urgent. I am flagging this to our team right now. Please stay on this chat.', createdAt: iso(-11) },
      { id: 'm3', role: 'patient', text: 'It started about an hour ago and it hurts to breathe', createdAt: iso(-2) },
    ],
  },
  {
    id: 'c2', patientId: 'p12', patientName: 'Aisha Bello', patientPhone: '+234 806 222 0002',
    status: 'NEEDS_REVIEW', urgency: 'admin', escalationReason: 'Insurance / HMO billing dispute',
    lastMessage: 'My HMO said this should be covered though', lastMessageTime: '14m ago',
    messages: [
      { id: 'm4', role: 'patient', text: 'Why was I charged for the consultation?', createdAt: iso(-30) },
      { id: 'm5', role: 'ai', text: 'Let me connect you with our team to review your billing.', createdAt: iso(-29) },
      { id: 'm6', role: 'patient', text: 'My HMO said this should be covered though', createdAt: iso(-14) },
    ],
  },
  {
    id: 'c3', patientId: 'p13', patientName: 'David Achebe', patientPhone: '+234 809 333 0003',
    status: 'NEEDS_REVIEW', urgency: 'none', escalationReason: 'Requested to speak with a human',
    lastMessage: 'Can someone call me please?', lastMessageTime: '31m ago',
    messages: [
      { id: 'm7', role: 'patient', text: 'Can someone call me please?', createdAt: iso(-31) },
    ],
  },
  {
    id: 'c4', patientId: 'p1', patientName: 'Ada Obi', patientPhone: '+234 803 000 0003',
    status: 'AI_HANDLING', urgency: 'none',
    lastMessage: 'You are all set, Ada. Queue number #4.', lastMessageTime: '18m ago',
    messages: [
      { id: 'm8', role: 'patient', text: "Hi, I'd like to see a doctor today", createdAt: iso(-25) },
      { id: 'm9', role: 'ai', text: 'Of course. Could I get your full name, age, and gender?', createdAt: iso(-24) },
      { id: 'm10', role: 'patient', text: "My name is Ada Obi, I'm 32, female", createdAt: iso(-23) },
      { id: 'm11', role: 'ai', text: 'Got it, Ada. What brings you in today?', createdAt: iso(-22) },
      { id: 'm12', role: 'patient', text: "I've had a bad headache and fever since yesterday", createdAt: iso(-21) },
      { id: 'm13', role: 'ai', text: 'You are all set, Ada. Queue number #4. Please take a seat. 🙏', createdAt: iso(-18) },
    ],
  },
  {
    id: 'c5', patientId: 'p14', patientName: 'Grace Nnamdi', patientPhone: '+234 802 444 0004',
    status: 'AI_HANDLING', urgency: 'none',
    lastMessage: 'What time do you close today?', lastMessageTime: '42m ago',
    messages: [{ id: 'm14', role: 'patient', text: 'What time do you close today?', createdAt: iso(-42) }],
  },
  {
    id: 'c6', patientId: 'p15', patientName: 'Yusuf Danladi', patientPhone: '+234 807 555 0005',
    status: 'RESOLVED', urgency: 'none', assignedStaff: 'Dr. Amina Bello',
    lastMessage: 'Thank you, that helps a lot', lastMessageTime: '2h ago',
    messages: [{ id: 'm15', role: 'patient', text: 'Thank you, that helps a lot', createdAt: iso(-120) }],
  },
];

export const patients: Patient[] = [
  patient('p1', 'Ada Obi', 'AO', '+234 803 000 0003', 'UP_TO_DATE', 2),
  patient('p2', 'Emeka Nwosu', 'EN', '+234 806 111 2222', 'DUE_SOON', 5, 'BP review due in 2 weeks'),
  patient('p3', 'Zainab Yusuf', 'ZY', '+234 809 333 4444', 'UP_TO_DATE', 3),
  patient('p5', 'Ngozi Eze', 'NE', '+234 805 777 8888', 'OVERDUE', 8, 'Diabetes review 3 months overdue'),
  patient('p6', 'Bola Ahmed', 'BA', '+234 807 999 0000', 'UP_TO_DATE', 1),
  patient('p7', 'Chidi Okonkwo', 'CO', '+234 803 222 3333', 'DUE_SOON', 4, 'Physio follow-up due soon'),
  patient('p8', 'Halima Musa', 'HM', '+234 808 444 5555', 'NA', 2),
  patient('p9', 'Segun Oyelaran', 'SO', '+234 802 666 7777', 'OVERDUE', 6, 'Annual check overdue'),
];

export const recallPatients: Patient[] = patients.filter(
  (p) => p.recallStatus === 'DUE_SOON' || p.recallStatus === 'OVERDUE'
);

export const staffList: StaffListItem[] = [
  { id: 's1', name: 'Dr. Amina Bello', role: 'Lead Physician', email: 'amina@gracemedical.ng', initials: 'AB' },
  { id: 's2', name: 'Dr. Chukwuemeka Okafor', role: 'Physician', email: 'emeka@gracemedical.ng', initials: 'CO' },
  { id: 's3', name: 'Dr. Folake Adeyemi', role: 'Physician', email: 'folake@gracemedical.ng', initials: 'FA' },
  { id: 's4', name: 'Ibrahim Sani', role: 'Front Desk', email: 'ibrahim@gracemedical.ng', initials: 'IS' },
];

export const notifications: NotificationItem[] = [
  { id: 'n1', type: 'escalation', title: 'Urgent escalation', description: 'Kelechi Umeh — possible chest pain', time: '2m ago', read: false, linkData: { route: 'zero-chat', patientId: 'p11' } },
  { id: 'n2', type: 'escalation', title: 'Billing dispute', description: 'Aisha Bello — HMO coverage question', time: '14m ago', read: false, linkData: { route: 'zero-chat', patientId: 'p12' } },
  { id: 'n3', type: 'recall', title: 'Recall reminder', description: 'Ngozi Eze — diabetes review overdue', time: '1h ago', read: false, linkData: { route: 'patients', patientId: 'p5', tab: 'recall' } },
  { id: 'n4', type: 'no-show', title: 'No-show', description: 'Fatima Sadiq missed her 08:00 slot', time: '2h ago', read: true, linkData: { route: 'live-queue', tab: 'no_show' } },
];

// ── helpers ────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, '0');
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function iso(minutesFromNow: number) {
  return new Date(Date.now() + minutesFromNow * 60_000).toISOString();
}
function patient(
  id: string,
  name: string,
  initials: string,
  phone: string,
  recallStatus: Patient['recallStatus'],
  conversationsCount: number,
  recallReason?: string
): Patient {
  return {
    id,
    name,
    initials,
    phone,
    lastVisit: '12 Jun 2026',
    nextAppointment: recallStatus === 'OVERDUE' ? '—' : '28 Jul 2026',
    recallStatus,
    conversationsCount,
    recallReason,
    aiOutreachDraft: recallReason
      ? `Hi ${name.split(' ')[0]}, this is Grace Medical Centre. It's time for your ${recallReason.toLowerCase()}. Would you like to book a visit?`
      : undefined,
    history: [
      { date: '12 Jun 2026', doctor: 'Dr. Amina Bello', reason: 'General consultation', notes: 'Prescribed rest and fluids.' },
      { date: '03 Mar 2026', doctor: 'Dr. Folake Adeyemi', reason: 'Routine check', notes: 'All vitals normal.' },
    ],
    intakeNotes: {
      symptoms: 'Headache, mild fever',
      gender: 'Female',
      reasonForVisit: 'Feeling unwell for 2 days',
    },
    conversations: [
      { sender: 'patient', text: 'Hi, I need to see a doctor', time: '09:10' },
      { sender: 'ai', text: 'Of course — let me get you registered.', time: '09:10' },
    ],
  };
}
