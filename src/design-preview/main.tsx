// Dev-only entry for the design harness. Served at /design.html.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '../index.css';
import { DesignPreview } from './DesignPreview';
import { ToastProvider } from '../components/shared/Toast';
import { api } from '../api';

// Backend-free mock of the admin console API so /design.html?route=admin renders
// with realistic data. Dev harness only — never bundled into production.
const ok = <T,>(v: T) => () => Promise.resolve(v);
const clinicRows = [
  { id: '1', name: 'Apex Clinic', plan: 'NAVIGATOR', whatsappStatus: 'CONNECTED', suspended: false, adminEmail: 'admin@apex.ng', patientCount: 1204, staffCount: 6, createdAt: '2026-02-11' },
  { id: '2', name: 'Bloom Medical', plan: 'ENTERPRISE', whatsappStatus: 'CONNECTED', suspended: true, adminEmail: 'care@bloom.ng', patientCount: 3908, staffCount: 14, createdAt: '2025-11-03' },
  { id: '3', name: 'uthman', plan: 'STARTER', whatsappStatus: 'AWAITING_OTP', suspended: false, adminEmail: 'dolapodhee@gmail.com', patientCount: 0, staffCount: 1, createdAt: '2026-07-20' },
  { id: '4', name: "St. Mary's Hospital", plan: 'STARTER', whatsappStatus: 'NOT_CONNECTED', suspended: false, adminEmail: 'front@stmarys.ng', patientCount: 312, staffCount: 3, createdAt: '2026-06-18' },
  { id: '5', name: 'Grace Medical Centre', plan: 'NAVIGATOR', whatsappStatus: 'VERIFICATION_PENDING', suspended: false, adminEmail: 'amina@gracemedical.ng', patientCount: 842, staffCount: 8, createdAt: '2026-04-27' },
];
(api as any).admin = {
  overview: ok({ clinics: 42, active: 39, suspended: 3, whatsappConnected: 27, patients: 12480, conversations: 8914, staff: 118, newThisMonth: 7, mrr: 1240000 }),
  clinics: ok(clinicRows),
  clinic: (id: string) => Promise.resolve({
    ...(clinicRows.find((c) => c.id === id) || clinicRows[0]),
    address: '14 Adeola Odeku St, Victoria Island, Lagos', services: ['General', 'Cardiology', 'Antenatal'],
    openDays: [1, 2, 3, 4, 5], opensAt: '08:00', closesAt: '18:00', planExpiresAt: '2026-08-15',
    phoneNumber: '+234 802 111 3344', phoneNumberId: '11327243', onboardingCompletedAt: '2026-02-12', suspendedAt: null,
    counts: { patients: 1204, appointments: 318, conversations: 906 },
    staff: [
      { id: 's1', fullName: 'Dr. Amina Bello', email: 'amina@apex.ng', role: 'ADMIN', isActive: true, lastLoginAt: '2026-07-22' },
      { id: 's2', fullName: 'Tunde Okafor', email: 'tunde@apex.ng', role: 'PHYSICIAN', isActive: true, lastLoginAt: '2026-07-21' },
    ],
  }),
  suspend: ok({ id: '1', suspended: true }), reactivate: ok({ id: '1', suspended: false }),
  changePlan: ok({ id: '1', plan: 'NAVIGATOR', planExpiresAt: null }),
  billing: ok({
    mrr: 1240000,
    byPlan: [
      { plan: 'STARTER', count: 18, monthly: 0, revenue: 0 },
      { plan: 'NAVIGATOR', count: 15, monthly: 25000, revenue: 375000 },
      { plan: 'ENTERPRISE', count: 6, monthly: 75000, revenue: 450000 },
    ],
    renewalsDue: [
      { id: '5', name: 'Grace Medical Centre', plan: 'NAVIGATOR', planExpiresAt: '2026-07-30' },
      { id: '1', name: 'Apex Clinic', plan: 'NAVIGATOR', planExpiresAt: '2026-08-02' },
    ],
    expired: [{ id: '9', name: 'Old Town Clinic', plan: 'STARTER', planExpiresAt: '2026-06-30' }],
  }),
  audit: ok([
    { id: 'a1', actorEmail: 'info.latencyzero@gmail.com', action: 'clinic.plan_change', clinicId: '1', clinicName: 'Apex Clinic', detail: 'STARTER → NAVIGATOR', createdAt: '2026-07-23T14:02:00Z' },
    { id: 'a2', actorEmail: 'info.latencyzero@gmail.com', action: 'clinic.suspend', clinicId: '2', clinicName: 'Bloom Medical', detail: null, createdAt: '2026-07-23T11:40:00Z' },
    { id: 'a3', actorEmail: 'info.latencyzero@gmail.com', action: 'whatsapp.mark_connected', clinicId: '1', clinicName: 'Apex Clinic', detail: '11327243', createdAt: '2026-07-22T16:20:00Z' },
    { id: 'a4', actorEmail: 'info.latencyzero@gmail.com', action: 'staff.deactivate', clinicId: '4', clinicName: "St. Mary's Hospital", detail: 'locum@stmarys.ng', createdAt: '2026-07-22T09:12:00Z' },
  ]),
  staff: ok([
    { id: 's1', fullName: 'Dr. Amina Bello', email: 'amina@apex.ng', role: 'ADMIN', isActive: true, lastLoginAt: '2026-07-22', clinic: { id: '1', name: 'Apex Clinic' } },
    { id: 's2', fullName: 'Tunde Okafor', email: 'tunde@apex.ng', role: 'PHYSICIAN', isActive: true, lastLoginAt: '2026-07-21', clinic: { id: '1', name: 'Apex Clinic' } },
    { id: 's3', fullName: 'Ngozi Eze', email: 'ngozi@bloom.ng', role: 'STAFF', isActive: false, lastLoginAt: null, clinic: { id: '2', name: 'Bloom Medical' } },
  ]),
  deactivateStaff: ok({ id: 's1', isActive: false }), activateStaff: ok({ id: 's1', isActive: true }),
  whatsappPipeline: ok([
    { id: '3', name: 'uthman', whatsappStatus: 'AWAITING_OTP', requestedNumber: '07075255121', setupChoice: 'new', notifyEmail: 'dolapodhee@gmail.com', requestedAt: '2026-07-23T13:00:00Z', clinicReadyAt: '2026-07-23T13:05:00Z', otpCode: '224567', otpSubmittedAt: '2026-07-23T13:10:00Z', phoneNumber: null, phoneNumberId: null },
    { id: '1', name: 'Apex Clinic', whatsappStatus: 'CONNECTED', requestedNumber: '+234 802 111 3344', setupChoice: 'new', notifyEmail: 'admin@apex.ng', requestedAt: '2026-02-11T09:00:00Z', clinicReadyAt: null, otpCode: null, otpSubmittedAt: null, phoneNumber: '+234 802 111 3344', phoneNumberId: '11327243' },
  ]),
  sendOtp: ok({}), markConnected: ok({}), reset: ok({}),
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <DesignPreview />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
