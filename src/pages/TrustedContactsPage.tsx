import React, { useState } from 'react';
import { Users, Plus, Trash2, Phone, Check, ShieldCheck, HeartPulse, MapPin, Edit3, X, Save } from 'lucide-react';
import { INITIAL_TRUSTED_CONTACTS } from '../data/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { TrustedContact } from '../types';
import { useTranslation } from '../utils/i18n';

const CONTACTS_KEY = 'locura_trusted_contacts';

export const TrustedContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<TrustedContact[]>(
    loadFromStorage<TrustedContact[]>(CONTACTS_KEY, INITIAL_TRUSTED_CONTACTS)
  );

  // Add Contact Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState<TrustedContact['relationship']>('Mother');
  const [notifyOnSos, setNotifyOnSos] = useState(true);
  const [receiveLocation, setReceiveLocation] = useState(true);
  const [receiveMedicalSummary, setReceiveMedicalSummary] = useState(true);

  // Edit Contact Modal State
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRelationship, setEditRelationship] = useState<TrustedContact['relationship']>('Mother');
  const [editNotifyOnSos, setEditNotifyOnSos] = useState(true);
  const [editReceiveLocation, setEditReceiveLocation] = useState(true);
  const [editReceiveMedicalSummary, setEditReceiveMedicalSummary] = useState(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newContact: TrustedContact = {
      id: `tc-${Date.now()}`,
      name,
      phone,
      relationship,
      notifyOnSos,
      receiveLocation,
      receiveMedicalSummary
    };

    const updated = [...contacts, newContact];
    setContacts(updated);
    saveToStorage(CONTACTS_KEY, updated);

    setName('');
    setPhone('');
    setShowAddForm(false);
  };

  const handleOpenEdit = (c: TrustedContact) => {
    setEditingContact(c);
    setEditName(c.name);
    setEditPhone(c.phone);
    setEditRelationship(c.relationship);
    setEditNotifyOnSos(c.notifyOnSos);
    setEditReceiveLocation(c.receiveLocation);
    setEditReceiveMedicalSummary(c.receiveMedicalSummary);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact || !editName || !editPhone) return;

    const updated = contacts.map((c) => {
      if (c.id === editingContact.id) {
        return {
          ...c,
          name: editName,
          phone: editPhone,
          relationship: editRelationship,
          notifyOnSos: editNotifyOnSos,
          receiveLocation: editReceiveLocation,
          receiveMedicalSummary: editReceiveMedicalSummary
        };
      }
      return c;
    });

    setContacts(updated);
    saveToStorage(CONTACTS_KEY, updated);
    setEditingContact(null);
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveToStorage(CONTACTS_KEY, updated);
  };

  const toggleSetting = (id: string, field: 'notifyOnSos' | 'receiveLocation' | 'receiveMedicalSummary') => {
    const updated = contacts.map((c) => {
      if (c.id === id) {
        return { ...c, [field]: !c[field] };
      }
      return c;
    });
    setContacts(updated);
    saveToStorage(CONTACTS_KEY, updated);
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-[#1F497D] flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.trustedCircle}
            </h1>
            <p className="text-xs text-slate-500">
              {t.trustedCircleSubtext}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-[#1F497D] hover:bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t.addContact}
        </button>
      </div>

      {/* Add Contact Modal / Collapsible Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="font-extrabold text-sm text-slate-900">
            {t.addContact}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">{t.fullName}</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunita Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">{t.phone}</label>
              <input
                type="tel"
                required
                placeholder="+91 98490 11223"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">{t.relationship}</label>
              <select
                value={relationship}
                onChange={(e: any) => setRelationship(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-slate-50 rounded-xl border border-slate-200"
              >
                {['Mother', 'Father', 'Sibling', 'Friend', 'Partner', 'Doctor', 'Other'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnSos}
                onChange={(e) => setNotifyOnSos(e.target.checked)}
                className="rounded text-[#1F497D]"
              />
              <span>{t.notifyOnSos}</span>
            </label>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={receiveLocation}
                onChange={(e) => setReceiveLocation(e.target.checked)}
                className="rounded text-[#1F497D]"
              />
              <span>{t.receiveLocation}</span>
            </label>
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={receiveMedicalSummary}
                onChange={(e) => setReceiveMedicalSummary(e.target.checked)}
                className="rounded text-[#1F497D]"
              />
              <span>{t.receiveMedicalSummary}</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1F497D] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {t.saveContact}
            </button>
          </div>
        </form>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0B5563] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {t.editContact}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update phone, relationship, and emergency notification settings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingContact(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.relationship}
                </label>
                <select
                  value={editRelationship}
                  onChange={(e: any) => setEditRelationship(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                >
                  {['Mother', 'Father', 'Sibling', 'Friend', 'Partner', 'Doctor', 'Other'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Permissions & Alerts:
                </span>

                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer">
                  <span>Notify via Push & SMS on SOS</span>
                  <input
                    type="checkbox"
                    checked={editNotifyOnSos}
                    onChange={(e) => setEditNotifyOnSos(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F497D]"
                  />
                </label>

                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer">
                  <span>Stream Live GPS Tracking Coordinates</span>
                  <input
                    type="checkbox"
                    checked={editReceiveLocation}
                    onChange={(e) => setEditReceiveLocation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F497D]"
                  />
                </label>

                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer">
                  <span>Share Basic Medical Summary (Blood group / allergies)</span>
                  <input
                    type="checkbox"
                    checked={editReceiveMedicalSummary}
                    onChange={(e) => setEditReceiveMedicalSummary(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F497D]"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingContact(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1F497D] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {t.updateContact}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">{c.name}</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  {c.relationship}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {c.phone}
              </p>
            </div>

            {/* Permission Toggles & Actions */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <button
                onClick={() => toggleSetting(c.id, 'notifyOnSos')}
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1 border transition-all ${
                  c.notifyOnSos
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
                title="Toggle SOS Notification"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.notifyOnSos}</span>
              </button>

              <button
                onClick={() => toggleSetting(c.id, 'receiveLocation')}
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1 border transition-all ${
                  c.receiveLocation
                    ? 'bg-teal-50 border-teal-200 text-[#0B5563]'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
                title="Toggle Live GPS Sharing"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{t.receiveLocation}</span>
              </button>

              <button
                onClick={() => toggleSetting(c.id, 'receiveMedicalSummary')}
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1 border transition-all ${
                  c.receiveMedicalSummary
                    ? 'bg-rose-50 border-rose-200 text-[#C0392B]'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
                title="Toggle Medical Summary"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>{t.receiveMedicalSummary}</span>
              </button>

              {/* Edit Button (Addresses User Feedback: Editable Parent/Contact Details) */}
              <button
                onClick={() => handleOpenEdit(c)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 text-xs border border-slate-200 transition-colors ml-1"
                title="Edit Contact Details"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#1F497D]" />
                <span>{t.edit}</span>
              </button>

              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                aria-label="Delete Contact"
                title="Delete Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
