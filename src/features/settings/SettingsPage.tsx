import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '../../components/shared/Toast';
import { WhatsAppConnectPanel } from '../whatsapp/WhatsAppConnectPanel';

export interface StaffListItem {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
}

interface SettingsPageProps {
  settingsClinicName: string;
  setSettingsClinicName: (v: string) => void;
  settingsAddress: string;
  setSettingsAddress: (v: string) => void;
  settingsHours: string;
  setSettingsHours: (v: string) => void;
  settingsServices: string;
  setSettingsServices: (v: string) => void;

  savedClinicName: string;
  savedAddress: string;
  savedHours: string;
  savedServices: string;
  onSaveClinic: (name: string, address: string, hours: string, services: string) => void;

  staffList: StaffListItem[];
  onAddStaff: (fullName: string, email: string, title: string) => void;
  onRemoveStaff: (id: string) => void;
  isAddStaffOpen: boolean;
  setIsAddStaffOpen: (v: boolean) => void;
  newStaffName: string;
  setNewStaffName: (v: string) => void;
  newStaffRole: string;
  setNewStaffRole: (v: string) => void;
  newStaffEmail: string;
  setNewStaffEmail: (v: string) => void;

  notificationEscalation: boolean;
  setNotificationEscalation: (v: boolean) => void;
  notificationRecall: boolean;
  setNotificationRecall: (v: boolean) => void;
  notificationNoShow: boolean;
  setNotificationNoShow: (v: boolean) => void;
  notificationSummary: boolean;
  setNotificationSummary: (v: boolean) => void;
}

export function SettingsPage({
  settingsClinicName, setSettingsClinicName,
  settingsAddress, setSettingsAddress,
  settingsHours, setSettingsHours,
  settingsServices, setSettingsServices,
  savedClinicName,
  savedAddress,
  savedHours,
  savedServices,
  onSaveClinic,
  staffList,
  onAddStaff,
  onRemoveStaff,
  isAddStaffOpen, setIsAddStaffOpen,
  newStaffName, setNewStaffName,
  newStaffRole, setNewStaffRole,
  newStaffEmail, setNewStaffEmail,
  notificationEscalation, setNotificationEscalation,
  notificationRecall, setNotificationRecall,
  notificationNoShow, setNotificationNoShow,
  notificationSummary, setNotificationSummary,
}: SettingsPageProps) {
  const toast = useToast();
  const isDirty =
    settingsClinicName !== savedClinicName ||
    settingsAddress !== savedAddress ||
    settingsHours !== savedHours ||
    settingsServices !== savedServices;

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClinic(settingsClinicName, settingsAddress, settingsHours, settingsServices);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      toast.error("Please fill in Name and Email.");
      return;
    }
    onAddStaff(newStaffName.trim(), newStaffEmail.trim(), newStaffRole);
    setNewStaffName('');
    setNewStaffEmail('');
    setIsAddStaffOpen(false);
  };

  const handleRemoveStaff = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      onRemoveStaff(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in font-sans text-xs">
      {/* PAGE HEADER */}
      <div>
        <h2 className="text-[26px] font-bold text-text-primary leading-tight tracking-tighter2 font-sans">Settings</h2>
        <p className="text-[14px] text-text-secondary mt-1">
          Manage your clinic's configuration, connections, and team
        </p>
      </div>

      {/* SECTION 1: CLINIC INFO */}
      <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border p-6 space-y-5">
        <div className="border-b border-surface-border pb-4">
          <h3 className="text-[15px] font-bold text-text-primary tracking-tightish">Clinic Information</h3>
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
                className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Services Offered (Comma Separated)</label>
              <input
                type="text"
                value={settingsServices}
                onChange={(e) => setSettingsServices(e.target.value)}
                placeholder="e.g. Cardiology, Dermatology, Physiotherapy"
                className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
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
                className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
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
                className="p-3 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
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

      {/* SECTION 2: WHATSAPP CONNECTION — shared live panel */}
      <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border p-6 space-y-5">
        <div className="border-b border-surface-border pb-4">
          <h3 className="text-[15px] font-bold text-text-primary tracking-tightish">WhatsApp Business Connection</h3>
          <p className="text-text-secondary mt-0.5">Connect or manage your official WhatsApp business number</p>
        </div>
        {/* Reflects live status and lets the clinic connect, enter their code, or
            see it's live — the same flow as onboarding, available any time. */}
        <WhatsAppConnectPanel card={false} header={false} />
      </div>

      {/* SECTION 3: STAFF */}
      <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border p-6 space-y-5">
        <div className="border-b border-surface-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold text-text-primary tracking-tightish">Staff Management</h3>
            <p className="text-text-secondary mt-0.5">Configure access roles for clinic practitioners and admins</p>
          </div>

          <button
            onClick={() => setIsAddStaffOpen(!isAddStaffOpen)}
            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-brand-500 text-brand-500 hover:bg-brand-50 font-bold rounded-xl text-xs transition duration-150 self-start sm:self-auto"
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
                placeholder="Full Name *"
                required
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="p-2.5 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
              <input
                type="email"
                placeholder="Email Address *"
                required
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                className="p-2.5 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
                className="p-2.5 bg-surface-base border border-surface-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
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

        {/* Staff List — cards on mobile, table on tablet/desktop */}
        <div className="md:hidden space-y-2">
          {staffList.map((staff) => (
            <div key={staff.id} className="flex items-center gap-3 p-3 border border-surface-border/20 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 font-bold text-[11px] flex items-center justify-center ring-1 ring-brand-200/60 flex-shrink-0">
                {staff.initials}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-text-primary text-xs block truncate">{staff.name}</span>
                <span className="text-[10px] text-text-secondary block truncate">{staff.role} · {staff.email}</span>
              </div>
              <button
                onClick={() => handleRemoveStaff(staff.id)}
                className="p-1.5 text-text-muted hover:text-status-danger hover:bg-status-dangerBg/50 rounded-lg transition duration-150 flex-shrink-0"
                title="Remove Staff"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="hidden md:block border border-surface-border/20 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border text-left bg-surface-subtle">
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 font-bold text-[11px] flex items-center justify-center ring-1 ring-brand-200/60 flex-shrink-0">
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
      <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border p-6 space-y-5">
        <div className="border-b border-surface-border pb-4">
          <h3 className="text-[15px] font-bold text-text-primary tracking-tightish">Notifications</h3>
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
                notificationEscalation ? "bg-brand-500" : "bg-surface-muted"
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
                notificationRecall ? "bg-brand-500" : "bg-surface-muted"
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
                notificationNoShow ? "bg-brand-500" : "bg-surface-muted"
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
                notificationSummary ? "bg-brand-500" : "bg-surface-muted"
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
      <div className="bg-surface-base rounded-2xl shadow-card border border-surface-border p-6 space-y-5">
        <div className="border-b border-surface-border pb-4">
          <h3 className="text-[15px] font-bold text-text-primary tracking-tightish">Subscription & Billing</h3>
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
                onClick={() => toast.info("Billing management is in mockup mode (Stripe customer portal coming soon).")}
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
}
