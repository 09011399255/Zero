export interface ClinicInfo {
  name: string;
  todayPatients: number;
  doctorsOnDuty: number;
  needsAttentionCount: number;
}

export interface AIStats {
  handledConversations: number;
  escalatedConversations: number;
  avgResponseTime: string;
  liveActivityFeed: string[];
}

export interface StatCardData {
  count: number;
  label: string;
  change: string;
  type: 'waiting' | 'withDoctor' | 'completed';
}

export interface Appointment {
  id: number;
  name: string;
  initials: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:00 AM"
  doctor: string;
  department: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  bookedVia: 'zero' | 'manual';
  notes?: string;
}

export interface AttentionItem {
  id: number;
  type: 'escalation' | 'recall';
  title: string;
  time: string;
  description: string;
  action: string;
}

export interface ChartDataPoint {
  day: string;
  bookings: number;
  aiHandled: number;
}

export const mockClinicInfo: ClinicInfo = {
  name: "Apex Family Clinic",
  todayPatients: 14,
  doctorsOnDuty: 2,
  needsAttentionCount: 3,
};

export const mockAIStats: AIStats = {
  handledConversations: 23,
  escalatedConversations: 2,
  avgResponseTime: "8 seconds",
  liveActivityFeed: [
    "Just now — booked an appointment for Rand al'Thor",
    "2 mins ago — completed intake form for Egwene al'Vere",
    "5 mins ago — answered prescription query for Matrim Cauthon",
    "12 mins ago — updated insurance details for Perrin Aybara",
    "18 mins ago — sent automated recall follow-up to Nynaeve al'Meara",
  ],
};

export const mockStatCards: StatCardData[] = [
  { count: 4, label: "Waiting in Queue", change: "-1 vs avg", type: 'waiting' },
  { count: 2, label: "With Doctor", change: "On schedule", type: 'withDoctor' },
  { count: 8, label: "Completed Today", change: "+3 vs yesterday", type: 'completed' },
];

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    name: "Rand al'Thor",
    initials: "RT",
    phone: "+1 (555) 012-3456",
    date: "2026-06-23",
    time: "02:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "Neurology",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Migraine follow-up check-in."
  },
  {
    id: 2,
    name: "Egwene al'Vere",
    initials: "EA",
    phone: "+1 (555) 015-6789",
    date: "2026-06-23",
    time: "10:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Pending",
    bookedVia: "zero",
    notes: "Routine blood panel review."
  },
  {
    id: 3,
    name: "Matrim Cauthon",
    initials: "MC",
    phone: "+1 (555) 018-4321",
    date: "2026-06-25",
    time: "09:00 AM",
    doctor: "Dr. Lan Mandragoran",
    department: "Cardiology",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Check heart rate variability."
  },
  {
    id: 4,
    name: "Perrin Aybara",
    initials: "PA",
    phone: "+1 (555) 017-9876",
    date: "2026-06-22",
    time: "11:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Cancelled",
    bookedVia: "manual",
    notes: "Diabetic foot exam - cancelled by patient."
  },
  {
    id: 5,
    name: "Nynaeve al'Meara",
    initials: "NM",
    phone: "+1 (555) 019-2834",
    date: "2026-06-24",
    time: "03:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Hypertension follow-up recall slot."
  },
  {
    id: 6,
    name: "Elayne Trakand",
    initials: "ET",
    phone: "+1 (555) 021-9988",
    date: "2026-06-24",
    time: "08:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "Prenatal",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Routine prenatal exam."
  },
  {
    id: 7,
    name: "Min Farshaw",
    initials: "MF",
    phone: "+1 (555) 022-7766",
    date: "2026-06-22",
    time: "04:00 PM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Completed",
    bookedVia: "zero",
    notes: "Follow-up on previous lab results."
  },
  {
    id: 8,
    name: "Aviendha",
    initials: "AV",
    phone: "+1 (555) 023-5544",
    date: "2026-06-26",
    time: "01:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Asthma action plan review."
  },
  {
    id: 9,
    name: "Siuan Sanche",
    initials: "SS",
    phone: "+1 (555) 028-4433",
    date: "2026-06-25",
    time: "11:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Pending",
    bookedVia: "zero",
    notes: "Glaucoma screening."
  },
  {
    id: 10,
    name: "Thom Merrilin",
    initials: "TM",
    phone: "+1 (555) 026-8877",
    date: "2026-06-26",
    time: "10:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Hearing checkup."
  },
  {
    id: 11,
    name: "Loial",
    initials: "LO",
    phone: "+1 (555) 027-6655",
    date: "2026-06-23",
    time: "12:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "General Medicine",
    status: "Completed",
    bookedVia: "manual",
    notes: "Scheduled checkup."
  },
  {
    id: 12,
    name: "Logain Ablar",
    initials: "LA",
    phone: "+1 (555) 029-2211",
    date: "2026-06-22",
    time: "09:00 AM",
    doctor: "Dr. Lan Mandragoran",
    department: "Neurology",
    status: "Completed",
    bookedVia: "zero",
    notes: "Initial neurological assessment."
  },
  {
    id: 13,
    name: "Verin Mathwin",
    initials: "VM",
    phone: "+1 (555) 030-9988",
    date: "2026-06-23",
    time: "04:00 PM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Routine prescription refill assessment."
  },
  {
    id: 14,
    name: "Cadsuane Melaidhrin",
    initials: "CM",
    phone: "+1 (555) 031-7766",
    date: "2026-06-24",
    time: "11:00 AM",
    doctor: "Dr. Lan Mandragoran",
    department: "Cardiology",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Routine cardiology assessment."
  },
  {
    id: 15,
    name: "Alivia",
    initials: "AL",
    phone: "+1 (555) 032-5544",
    date: "2026-06-22",
    time: "02:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "Dermatology",
    status: "Completed",
    bookedVia: "zero",
    notes: "Skin assessment exam."
  },
  {
    id: 16,
    name: "Tuon",
    initials: "TU",
    phone: "+1 (555) 033-3322",
    date: "2026-06-25",
    time: "02:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "General Medicine",
    status: "Pending",
    bookedVia: "zero",
    notes: "Routine blood panel review."
  },
  {
    id: 17,
    name: "Birgitte Silverbow",
    initials: "BS",
    phone: "+1 (555) 034-1100",
    date: "2026-06-23",
    time: "08:00 AM",
    doctor: "Dr. Lan Mandragoran",
    department: "General Medicine",
    status: "Completed",
    bookedVia: "zero",
    notes: "Shoulder strain follow-up physical review."
  },
  {
    id: 18,
    name: "Gaul",
    initials: "GL",
    phone: "+1 (555) 035-8877",
    date: "2026-06-26",
    time: "03:00 PM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "manual",
    notes: "Annual physical exam."
  },
  {
    id: 19,
    name: "Siuan Sanche",
    initials: "SS",
    phone: "+1 (555) 028-4433",
    date: "2026-06-18",
    time: "10:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Completed",
    bookedVia: "zero",
    notes: "Previous glaucoma follow-up review."
  },
  {
    id: 20,
    name: "Rand al'Thor",
    initials: "RT",
    phone: "+1 (555) 012-3456",
    date: "2026-06-19",
    time: "03:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "Neurology",
    status: "Completed",
    bookedVia: "zero",
    notes: "Previous migraine follow-up exam."
  },
  {
    id: 21,
    name: "Egwene al'Vere",
    initials: "EA",
    phone: "+1 (555) 015-6789",
    date: "2026-06-30",
    time: "11:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Next month routine checkup."
  },
  {
    id: 22,
    name: "Perrin Aybara",
    initials: "PA",
    phone: "+1 (555) 017-9876",
    date: "2026-07-02",
    time: "09:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "manual",
    notes: "Rescheduled diabetic foot check."
  },
  {
    id: 23,
    name: "Matrim Cauthon",
    initials: "MC",
    phone: "+1 (555) 018-4321",
    date: "2026-06-24",
    time: "02:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "Cardiology",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Review of occasional palpitations."
  },
  {
    id: 24,
    name: "Nynaeve al'Meara",
    initials: "NM",
    phone: "+1 (555) 019-2834",
    date: "2026-06-25",
    time: "03:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Recall slot booked automatically via Zero."
  },
  {
    id: 25,
    name: "Elayne Trakand",
    initials: "ET",
    phone: "+1 (555) 021-9988",
    date: "2026-06-26",
    time: "09:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "Prenatal",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Second prenatal wellness review check."
  },
  {
    id: 26,
    name: "Loial",
    initials: "LO",
    phone: "+1 (555) 027-6655",
    date: "2026-06-27",
    time: "10:00 AM",
    doctor: "Dr. Lan Mandragoran",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "manual",
    notes: "Weekend wellness check."
  },
  {
    id: 27,
    name: "Gaul",
    initials: "GL",
    phone: "+1 (555) 035-8877",
    date: "2026-06-27",
    time: "11:00 AM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "manual",
    notes: "Follow-up test review."
  },
  {
    id: 28,
    name: "Cadsuane Melaidhrin",
    initials: "CM",
    phone: "+1 (555) 031-7766",
    date: "2026-06-28",
    time: "01:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "Cardiology",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Hypertension/BP spike review."
  },
  {
    id: 29,
    name: "Verin Mathwin",
    initials: "VM",
    phone: "+1 (555) 030-9988",
    date: "2026-06-28",
    time: "03:00 PM",
    doctor: "Dr. Moiraine Damodred",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Refill assessment."
  },
  {
    id: 30,
    name: "Birgitte Silverbow",
    initials: "BS",
    phone: "+1 (555) 034-1100",
    date: "2026-06-24",
    time: "04:00 PM",
    doctor: "Dr. Lan Mandragoran",
    department: "General Medicine",
    status: "Confirmed",
    bookedVia: "zero",
    notes: "Weekly physical therapy check."
  }
];

export const mockAttentionItems: AttentionItem[] = [
  {
    id: 1,
    type: "escalation",
    title: "Patient dispute — billing question",
    time: "12 min ago",
    description: "WhatsApp conversation escalated: patient questioning billing charge for booking fee.",
    action: "Review",
  },
  {
    id: 2,
    type: "escalation",
    title: "Symptom flagged as urgent",
    time: "18 min ago",
    description: "AI detected urgent safety keyword: patient reports chest tightness following new dose.",
    action: "Review",
  },
  {
    id: 3,
    type: "recall",
    title: "3 patients overdue for recall",
    time: "Overdue",
    description: "Patients failed to respond to third automated reminder for hypertension checkup.",
    action: "View",
  },
];

export const mockChartData: ChartDataPoint[] = [
  { day: "Mon", bookings: 12, aiHandled: 10 },
  { day: "Tue", bookings: 18, aiHandled: 16 },
  { day: "Wed", bookings: 15, aiHandled: 13 },
  { day: "Thu", bookings: 22, aiHandled: 20 },
  { day: "Fri", bookings: 25, aiHandled: 23 },
  { day: "Sat", bookings: 8, aiHandled: 7 },
  { day: "Sun", bookings: 5, aiHandled: 4 },
];

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
  id: number;
  name: string;
  initials: string;
  phone: string;
  lastVisit: string;
  nextAppointment: string;
  recallStatus: 'up_to_date' | 'due_soon' | 'overdue' | 'na';
  conversationsCount: number;
  recallReason?: string;
  aiOutreachDraft?: string;
  history: PatientHistoryItem[];
  intakeNotes?: PatientIntakeNotes;
  conversations: PatientChatMessage[];
}

export const mockPatients: Patient[] = [
  {
    id: 1,
    name: "Nynaeve al'Meara",
    initials: "NM",
    phone: "+1 (555) 019-2834",
    lastVisit: "4 months ago",
    nextAppointment: "—",
    recallStatus: "overdue",
    conversationsCount: 14,
    recallReason: "Hypertension checkup",
    aiOutreachDraft: "Hi Nynaeve, it's been a while since your last hypertension checkup at Apex Family Clinic. Would you like to book a follow-up this week?",
    history: [
      { date: "2026-02-15", doctor: "Dr. Lan Mandragoran", reason: "Hypertension checkup", notes: "Blood pressure elevated at 142/92. Patient advised to monitor daily and return in 3 months for recheck." },
      { date: "2025-11-10", doctor: "Dr. Lan Mandragoran", reason: "Routine Wellness Exam", notes: "Patient in good health overall. Mild history of blood pressure fluctuations." }
    ],
    intakeNotes: {
      symptoms: "Mild headache, feeling slightly fatigued in the mornings.",
      structuredAnswers: [
        { question: "Are you currently taking any prescription medications?", answer: "Yes, Lisinopril 10mg daily." },
        { question: "Have you experienced any chest pain or shortness of breath?", answer: "No chest pain, just occasional fatigue." }
      ]
    },
    conversations: [
      { sender: "ai", text: "Hi Nynaeve, this is Zero, your virtual assistant at Apex Family Clinic. It looks like you're due for your hypertension checkup. Would you like to schedule a visit?", time: "2 days ago" },
      { sender: "patient", text: "Yes I should probably do that. Do you have anything this Thursday?", time: "2 days ago" },
      { sender: "ai", text: "I have slots with Dr. Lan Mandragoran at 10:00 AM or 2:30 PM. Do either of those work?", time: "2 days ago" },
      { sender: "patient", text: "I will check my calendar and get back to you tomorrow.", time: "1 day ago" }
    ]
  },
  {
    id: 2,
    name: "Rand al'Thor",
    initials: "RT",
    phone: "+1 (555) 012-3456",
    lastVisit: "2 weeks ago",
    nextAppointment: "2026-06-25",
    recallStatus: "up_to_date",
    conversationsCount: 28,
    history: [
      { date: "2026-06-10", doctor: "Dr. Lan Mandragoran", reason: "Migraine follow-up", notes: "Patient reports migraine frequency decreased since beginning new preventative routine." }
    ],
    intakeNotes: {
      symptoms: "None, checking in for regular follow-up.",
      structuredAnswers: [
        { question: "How frequent are your migraines now?", answer: "Less than once a week." }
      ]
    },
    conversations: [
      { sender: "patient", text: "I need to book my follow-up for next week.", time: "1 week ago" },
      { sender: "ai", text: "Sure, Rand! Dr. Lan has slots on June 25th at 02:30 PM. Would that work?", time: "1 week ago" },
      { sender: "patient", text: "Yes, book that please.", time: "1 week ago" },
      { sender: "ai", text: "Confirmed! I've booked you in for June 25th at 02:30 PM.", time: "1 week ago" }
    ]
  },
  {
    id: 3,
    name: "Egwene al'Vere",
    initials: "EA",
    phone: "+1 (555) 015-6789",
    lastVisit: "2 months ago",
    nextAppointment: "—",
    recallStatus: "due_soon",
    conversationsCount: 8,
    recallReason: "Routine Blood Panel Review",
    aiOutreachDraft: "Hi Egwene, we noticed your routine blood panel checkup is due soon. Dr. Moiraine has openings on Tuesday afternoon. Would you like to schedule?",
    history: [
      { date: "2026-04-12", doctor: "Dr. Moiraine Damodred", reason: "Annual physical", notes: "Patient reported fatigue. Ordered full blood panel and thyroid screens. Levels borderline, suggested re-eval in 2 months." }
    ],
    intakeNotes: {
      symptoms: "Occasional fatigue, dry skin.",
      structuredAnswers: [
        { question: "Do you have a family history of thyroid issues?", answer: "Yes, maternal side." }
      ]
    },
    conversations: [
      { sender: "ai", text: "Hi Egwene, we hope you're doing well. Just a quick check-in about your follow-up blood panel.", time: "3 days ago" },
      { sender: "patient", text: "Hi, I do need to get that done. Is there a slot next week?", time: "3 days ago" },
      { sender: "ai", text: "Yes, Dr. Moiraine is available on Tuesday at 3:15 PM. Shall I reserve it?", time: "3 days ago" }
    ]
  },
  {
    id: 4,
    name: "Perrin Aybara",
    initials: "PA",
    phone: "+1 (555) 017-9876",
    lastVisit: "6 months ago",
    nextAppointment: "—",
    recallStatus: "overdue",
    conversationsCount: 12,
    recallReason: "Diabetic Foot Exam",
    aiOutreachDraft: "Hi Perrin, your annual diabetic foot check is overdue. It's important for preventing complications. Would you like to book an appointment with Dr. Moiraine?",
    history: [
      { date: "2025-12-05", doctor: "Dr. Moiraine Damodred", reason: "Type 2 Diabetes follow-up", notes: "A1c stable at 6.8%. Discussed foot care compliance and routine monitoring. Scheduled for annual foot exam in May." }
    ],
    intakeNotes: {
      symptoms: "Dry skin on lower extremities, no neuropathic signs.",
      structuredAnswers: [
        { question: "Do you inspect your feet daily?", answer: "Mostly, yes." }
      ]
    },
    conversations: [
      { sender: "ai", text: "Hi Perrin, it's Zero from Apex Family Clinic. Your annual diabetic foot exam was due in May. Shall we schedule it?", time: "5 days ago" },
      { sender: "patient", text: "Let me check my calendar. I'll get back to you.", time: "4 days ago" }
    ]
  },
  {
    id: 5,
    name: "Matrim Cauthon",
    initials: "MC",
    phone: "+1 (555) 018-4321",
    lastVisit: "1 month ago",
    nextAppointment: "2026-06-25",
    recallStatus: "up_to_date",
    conversationsCount: 6,
    history: [],
    conversations: []
  },
  {
    id: 6,
    name: "Elayne Trakand",
    initials: "ET",
    phone: "+1 (555) 021-9988",
    lastVisit: "1 month ago",
    nextAppointment: "—",
    recallStatus: "due_soon",
    conversationsCount: 15,
    recallReason: "Prenatal checkup",
    aiOutreachDraft: "Hi Elayne, it is time for your next prenatal wellness check. Dr. Moiraine is available on Wednesday morning. Let us know if you'd like to book!",
    history: [],
    conversations: []
  },
  {
    id: 7,
    name: "Min Farshaw",
    initials: "MF",
    phone: "+1 (555) 022-7766",
    lastVisit: "1 week ago",
    nextAppointment: "—",
    recallStatus: "up_to_date",
    conversationsCount: 3,
    history: [],
    conversations: []
  },
  {
    id: 8,
    name: "Aviendha",
    initials: "AV",
    phone: "+1 (555) 023-5544",
    lastVisit: "5 months ago",
    nextAppointment: "—",
    recallStatus: "overdue",
    conversationsCount: 9,
    recallReason: "Asthma action plan review",
    aiOutreachDraft: "Hi Aviendha, Dr. Lan would like to review your asthma action plan to ensure your inhaler dosage is optimal. Do you have 15 minutes this Friday for a consultation?",
    history: [],
    conversations: []
  },
  {
    id: 9,
    name: "Moiraine Damodred",
    initials: "MD",
    phone: "+1 (555) 024-3322",
    lastVisit: "3 weeks ago",
    nextAppointment: "—",
    recallStatus: "up_to_date",
    conversationsCount: 4,
    history: [],
    conversations: []
  },
  {
    id: 10,
    name: "Lan Mandragoran",
    initials: "LM",
    phone: "+1 (555) 025-1100",
    lastVisit: "—",
    nextAppointment: "—",
    recallStatus: "na",
    conversationsCount: 1,
    history: [],
    conversations: []
  },
  {
    id: 11,
    name: "Thom Merrilin",
    initials: "TM",
    phone: "+1 (555) 026-8877",
    lastVisit: "8 months ago",
    nextAppointment: "—",
    recallStatus: "overdue",
    conversationsCount: 7,
    recallReason: "Audiology follow-up",
    aiOutreachDraft: "Hi Thom, it's time for your routine audiology hearing checkup at Apex Family Clinic. Would you like to check availability for next week?",
    history: [],
    conversations: []
  },
  {
    id: 12,
    name: "Loial",
    initials: "LO",
    phone: "+1 (555) 027-6655",
    lastVisit: "3 weeks ago",
    nextAppointment: "—",
    recallStatus: "up_to_date",
    conversationsCount: 2,
    history: [],
    conversations: []
  },
  {
    id: 13,
    name: "Siuan Sanche",
    initials: "SS",
    phone: "+1 (555) 028-4433",
    lastVisit: "1 month ago",
    nextAppointment: "—",
    recallStatus: "due_soon",
    conversationsCount: 5,
    recallReason: "Glaucoma check",
    aiOutreachDraft: "Hi Siuan, your scheduled eye pressure check is due soon. Would you like us to find a morning slot with Dr. Moiraine?",
    history: [],
    conversations: []
  },
  {
    id: 14,
    name: "Logain Ablar",
    initials: "LA",
    phone: "+1 (555) 029-2211",
    lastVisit: "—",
    nextAppointment: "—",
    recallStatus: "na",
    conversationsCount: 0,
    history: [],
    conversations: []
  },
  {
    id: 15,
    name: "Verin Mathwin",
    initials: "VM",
    phone: "+1 (555) 030-9988",
    lastVisit: "1 week ago",
    nextAppointment: "—",
    recallStatus: "up_to_date",
    conversationsCount: 11,
    history: [],
    conversations: []
  },
  {
    id: 16,
    name: "Cadsuane Melaidhrin",
    initials: "CM",
    phone: "+1 (555) 031-7766",
    lastVisit: "10 months ago",
    nextAppointment: "—",
    recallStatus: "overdue",
    conversationsCount: 19,
    recallReason: "Cardiology follow-up",
    aiOutreachDraft: "Hi Cadsuane, it's time for your semi-annual cardiology assessment with Dr. Lan Mandragoran. Would you like to schedule a session this week?",
    history: [],
    conversations: []
  },
  {
    id: 17,
    name: "Alivia",
    initials: "AL",
    phone: "+1 (555) 032-5544",
    lastVisit: "1 week ago",
    nextAppointment: "—",
    recallStatus: "up_to_date",
    conversationsCount: 2,
    history: [],
    conversations: []
  },
  {
    id: 18,
    name: "Tuon",
    initials: "TU",
    phone: "+1 (555) 033-3322",
    lastVisit: "1 month ago",
    nextAppointment: "—",
    recallStatus: "due_soon",
    conversationsCount: 4,
    recallReason: "Routine blood panel",
    aiOutreachDraft: "Hi Tuon, it's time to schedule your scheduled routine blood panel. Dr. Lan has slots open on Thursday morning. Shall we reserve one?",
    history: [],
    conversations: []
  },
  {
    id: 19,
    name: "Birgitte Silverbow",
    initials: "BS",
    phone: "+1 (555) 034-1100",
    lastVisit: "3 weeks ago",
    nextAppointment: "—",
    recallStatus: "up_to_date",
    conversationsCount: 3,
    history: [],
    conversations: []
  },
  {
    id: 20,
    name: "Gaul",
    initials: "GL",
    phone: "+1 (555) 035-8877",
    lastVisit: "—",
    nextAppointment: "—",
    recallStatus: "na",
    conversationsCount: 1,
    history: [],
    conversations: []
  }
];
