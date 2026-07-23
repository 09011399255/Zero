// ============================================================================
// DesignPreview — a standalone, backend-free harness for designing every screen
// of the app. Renders the REAL page components inside the REAL Sidebar/Topbar
// shell, fed by fixtures.ts and driven by local state, so styling work never
// needs a login or a live API.
//
// Served at /design.html (dev only). Never imported by production code.
// ============================================================================

import { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { LiveQueuePage } from '../features/live-queue/LiveQueuePage';
import { PatientsPage } from '../features/patients/PatientsPage';
import { AppointmentsPage } from '../features/appointments/AppointmentsPage';
import { ZeroChatPage } from '../features/zero-chat/ZeroChatPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { AdminConsole } from '../features/admin/AdminConsole';
import { AddPatientModal } from '../features/patients/AddPatientModal';
import { PatientDetailDrawer } from '../features/patients/PatientDetailDrawer';
import { AppointmentDetailDrawer } from '../features/appointments/AppointmentDetailDrawer';
import { NewAppointmentDrawer } from '../features/appointments/NewAppointmentDrawer';
import type { Conversation } from '../api';
import * as fx from './fixtures';

const noop = () => {};

// Date helpers mirrored from App.tsx so AppointmentsPage behaves identically.
function getWeekDays(start: Date) {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}
function formatDateString(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function formatRangeLabel(start: Date) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const optsStart: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const optsEnd: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', optsStart)} – ${end.toLocaleDateString('en-US', optsEnd)}`;
}

// Allow deep-linking straight to a screen: /design.html?route=live-queue
// Makes the harness easy to drive when the screenshot tool is flaky.
function initialRoute() {
  if (typeof window === 'undefined') return 'dashboard';
  return new URLSearchParams(window.location.search).get('route') || 'dashboard';
}
// Deep-link an overlay open for previewing: /design.html?overlay=add-patient
function initialOverlay() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('overlay');
}

export function DesignPreview() {
  const [currentRoute, setCurrentRoute] = useState(initialRoute);
  const [overlay, setOverlay] = useState<string | null>(initialOverlay);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Dashboard local state
  const [dismissedAttentionIds, setDismissedAttentionIds] = useState<string[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Live queue local state
  const [queueTab, setQueueTab] = useState<'waiting' | 'with_doctor' | 'completed' | 'no_show'>('waiting');
  const [isNewWalkInDrawerOpen, setIsNewWalkInDrawerOpen] = useState(false);
  const [walkInType, setWalkInType] = useState<'registered' | 'new'>('registered');
  const [walkInPatientId, setWalkInPatientId] = useState<string | null>(null);
  const [walkInNewPatientName, setWalkInNewPatientName] = useState('');
  const [walkInNewPatientPhone, setWalkInNewPatientPhone] = useState('');
  const [walkInReason, setWalkInReason] = useState('');
  const [walkInDoctor, setWalkInDoctor] = useState('');
  const [walkInLoading, setWalkInLoading] = useState(false);

  // Patients local state
  const [patientsTab, setPatientsTab] = useState<'all' | 'recall'>('all');
  const [drawerTab, setDrawerTab] = useState<'history' | 'intake' | 'conversations'>('history');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Appointments local state
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  });
  const [apptViewMode, setApptViewMode] = useState<'calendar' | 'list'>('calendar');
  const [apptSearchQuery, setApptSearchQuery] = useState('');
  const [apptDoctorFilter, setApptDoctorFilter] = useState('all');
  const [apptStatusFilter, setApptStatusFilter] = useState('all');
  const [apptSortOrder, setApptSortOrder] = useState<'asc' | 'desc'>('asc');
  const [apptCurrentPage, setApptCurrentPage] = useState(1);

  // Zero-chat local state
  const [conversations, setConversations] = useState<Conversation[]>(fx.conversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(fx.conversations[0]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(fx.conversations[0]?.id ?? null);
  const [chatInputText, setChatInputText] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    needs_review: true,
    ai_handling: true,
    resolved: false,
  });

  // Settings local state
  const [settingsClinicName, setSettingsClinicName] = useState('Grace Medical Centre');
  const [settingsAddress, setSettingsAddress] = useState('14 Adeola Odeku St, Victoria Island, Lagos');
  const [settingsHours, setSettingsHours] = useState('Mon–Sat: 08:00 - 18:00');
  const [settingsServices, setSettingsServices] = useState('General, Cardiology, Dermatology, Antenatal, Laboratory');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Physician');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [nEscalation, setNEscalation] = useState(true);
  const [nRecall, setNRecall] = useState(true);
  const [nNoShow, setNNoShow] = useState(false);
  const [nSummary, setNSummary] = useState(true);

  const getInitials = (name: string) =>
    name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const unreadCount = fx.notifications.filter((n) => !n.read).length;

  // Admin console renders its own full-screen shell (no sidebar/topbar).
  if (currentRoute === 'admin') {
    return <AdminConsole onExit={() => setCurrentRoute('dashboard')} />;
  }

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        needsReviewCount={3}
        adminName="Dr. Amina Bello"
        adminEmail="amina@gracemedical.ng"
        onLogout={noop}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-[260px] min-h-screen flex flex-col min-w-0">
        <Topbar
          clinicName={settingsClinicName}
          currentRoute={currentRoute}
          isNotificationsOpen={isNotifOpen}
          onToggleNotifications={() => setIsNotifOpen((v) => !v)}
          notifications={fx.notifications}
          unreadCount={unreadCount}
          onMarkAllRead={noop}
          onNotificationClick={noop}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        />

        <main className="p-4 md:p-8 flex-1 space-y-6 w-full max-w-full overflow-x-hidden">
          {currentRoute === 'dashboard' && (
            <DashboardPage
              clinicName={settingsClinicName}
              queue={fx.queue}
              appointments={fx.appointments}
              conversations={fx.conversations}
              dismissedAttentionIds={dismissedAttentionIds}
              setDismissedAttentionIds={setDismissedAttentionIds}
              openDropdownId={openDropdownId}
              setOpenDropdownId={setOpenDropdownId}
              onStatusChange={noop}
              onNavigate={setCurrentRoute}
              onSelectConversation={(id) => { setSelectedChatId(id); setCurrentRoute('zero-chat'); }}
              summary={fx.dashboardSummary}
            />
          )}

          {currentRoute === 'live-queue' && (
            <LiveQueuePage
              doctorOptions={fx.doctorOptions}
              queue={fx.queue}
              queueTab={queueTab}
              setQueueTab={setQueueTab}
              queueLoading={false}
              queueError={null}
              setQueueError={noop}
              loadQueue={async () => {}}
              patients={fx.patients}
              onSelectPatient={noop}
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
          )}

          {currentRoute === 'patients' && (
            <PatientsPage
              patients={fx.patients}
              recallPatients={fx.recallPatients}
              patientsTab={patientsTab}
              setPatientsTab={setPatientsTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              patientsLoading={false}
              recallLoading={false}
              patientsError={null}
              recallError={null}
              onRetryPatients={noop}
              onRetryRecall={noop}
              onSelectPatient={noop}
              onOpenAddPatientModal={noop}
              onExpandOutreach={noop}
            />
          )}

          {currentRoute === 'appointments' && (
            <AppointmentsPage
              doctorOptions={fx.doctorOptions}
              appointments={fx.appointments}
              appointmentsLoading={false}
              appointmentsError={null}
              onRetryAppointments={noop}
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
              onSelectAppointment={noop}
              onOpenNewAppointment={noop}
              getWeekDays={getWeekDays}
              formatDateString={formatDateString}
              formatRangeLabel={formatRangeLabel}
            />
          )}

          {currentRoute === 'zero-chat' && (
            <ZeroChatPage
              conversations={conversations}
              conversationsLoading={false}
              conversationsError={null}
              onRetryConversations={noop}
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
              threadLoading={false}
              expandedSections={expandedSections}
              setExpandedSections={setExpandedSections}
              getInitials={getInitials}
              onSelectPatient={noop}
              onTakeOver={noop}
              onResolve={noop}
              onReopen={noop}
            />
          )}

          {currentRoute === 'settings' && (
            <SettingsPage
              settingsClinicName={settingsClinicName}
              setSettingsClinicName={setSettingsClinicName}
              settingsAddress={settingsAddress}
              setSettingsAddress={setSettingsAddress}
              settingsHours={settingsHours}
              setSettingsHours={setSettingsHours}
              settingsServices={settingsServices}
              setSettingsServices={setSettingsServices}
              savedClinicName={settingsClinicName}
              savedAddress={settingsAddress}
              savedHours={settingsHours}
              savedServices={settingsServices}
              onSaveClinic={noop}
              staffList={fx.staffList}
              onAddStaff={noop}
              onRemoveStaff={noop}
              isAddStaffOpen={isAddStaffOpen}
              setIsAddStaffOpen={setIsAddStaffOpen}
              newStaffName={newStaffName}
              setNewStaffName={setNewStaffName}
              newStaffRole={newStaffRole}
              setNewStaffRole={setNewStaffRole}
              newStaffEmail={newStaffEmail}
              setNewStaffEmail={setNewStaffEmail}
              notificationEscalation={nEscalation}
              setNotificationEscalation={setNEscalation}
              notificationRecall={nRecall}
              setNotificationRecall={setNRecall}
              notificationNoShow={nNoShow}
              setNotificationNoShow={setNNoShow}
              notificationSummary={nSummary}
              setNotificationSummary={setNSummary}
            />
          )}
        </main>
      </div>

      {/* ── Overlay gallery — preview modals/drawers via ?overlay=<name> ── */}
      <AddPatientModal
        isOpen={overlay === 'add-patient'}
        onClose={() => setOverlay(null)}
        onSubmit={noop}
        addPatientError={null}
        addPatientLoading={false}
        addPatientName="" setAddPatientName={noop}
        addPatientPhone="" setAddPatientPhone={noop}
        addPatientEmail="" setAddPatientEmail={noop}
        addPatientDob="" setAddPatientDob={noop}
        addPatientGender="Female" setAddPatientGender={noop}
        addPatientDoctor={fx.doctorOptions[0]} setAddPatientDoctor={noop}
        addPatientRecallStatus="UP_TO_DATE" setAddPatientRecallStatus={noop}
        addPatientRecallReason="" setAddPatientRecallReason={noop}
        doctorOptions={fx.doctorOptions}
      />

      <NewAppointmentDrawer
        isOpen={overlay === 'new-appt'}
        onClose={() => setOverlay(null)}
        onSubmit={noop}
        patients={fx.patients}
        formPatientId={fx.patients[0].id} setFormPatientId={noop}
        formDate={new Date().toISOString().slice(0, 10)} setFormDate={noop}
        formTime="10:00 AM" setFormTime={noop}
        formDoctor={fx.doctorOptions[0]} setFormDoctor={noop}
        formDept="General" setFormDept={noop}
        formNotes="" setFormNotes={noop}
        newApptError={null}
        newApptLoading={false}
        doctorOptions={fx.doctorOptions}
      />

      {overlay === 'patient-detail' && (
        <PatientDetailDrawer
          selectedPatientId={fx.patients[0].id}
          selectedPatient={fx.patients[0]}
          patientDetailLoading={false}
          drawerTab={drawerTab}
          setDrawerTab={setDrawerTab}
          conversations={fx.conversations}
          activeConversation={null}
          threadLoading={false}
          onClose={() => setOverlay(null)}
          onSendMessage={noop}
        />
      )}

      {overlay === 'appt-detail' && (
        <AppointmentDetailDrawer
          selectedAppointmentId={fx.appointments[0].id}
          appointments={fx.appointments}
          isRescheduling={false}
          setIsRescheduling={noop}
          rescheduleDate="" setRescheduleDate={noop}
          rescheduleTime="" setRescheduleTime={noop}
          formatTime12h={(t) => t}
          convertTo24Hour={(t) => t}
          onClose={() => setOverlay(null)}
          onUpdated={async () => {}}
        />
      )}
    </div>
  );
}
