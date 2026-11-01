import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import {
  AlertCircle,
  Trash2,
  Archive,
  Check,
  AlertTriangle,
  X,
  ShieldAlert,
} from 'lucide-react';
import { updateGroup, deleteGroup } from '../../lib/api/chatApi';

const PRESET_AVATARS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-500' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-500' },
];

// confirmMode: null | 'archive' | 'delete'
export function EditGroupModal({ isOpen, onClose, group, onGroupUpdated, onGroupDeleted }) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [selectedAvatar, setSelectedAvatar] = useState('indigo');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmMode, setConfirmMode] = useState(null); // 'archive' | 'delete'

  useEffect(() => {
    if (group && isOpen) {
      setGroupName(group.groupName || '');
      setDescription(group.description || '');
      setStatus(group.status || 'ACTIVE');
      setSelectedAvatar(group.groupImage || 'indigo');
      setError(null);
      setConfirmMode(null);
    }
  }, [group, isOpen]);

  if (!group) return null;

  const handleClose = () => {
    setConfirmMode(null);
    onClose();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Group name cannot be blank');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const updated = await updateGroup(group.groupId, {
        groupName: groupName.trim(),
        description: description.trim() || null,
        status,
        groupImage: selectedAvatar,
      });
      onGroupUpdated(updated);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to update group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    const isHardDelete = confirmMode === 'delete';
    try {
      setDeleting(true);
      setError(null);
      await deleteGroup(group.groupId, isHardDelete);
      onGroupDeleted(group.groupId);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to perform action');
      setDeleting(false);
    }
  };

  // ── Inline Danger Confirmation Panel ─────────────────────────────
  if (confirmMode) {
    const isDelete = confirmMode === 'delete';
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={isDelete ? 'Delete Group' : 'Archive Group'}
        maxWidth="max-w-md"
      >
        <div className="mt-2 space-y-5">
          {/* Warning Icon + Message */}
          <div
            className={`flex flex-col items-center text-center gap-3 p-5 rounded-2xl border-2 ${
              isDelete
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                isDelete ? 'bg-red-100' : 'bg-amber-100'
              }`}
            >
              {isDelete ? (
                <Trash2 className="w-7 h-7 text-red-600" />
              ) : (
                <Archive className="w-7 h-7 text-amber-600" />
              )}
            </div>

            <div>
              <p
                className={`text-sm font-extrabold mb-1 ${
                  isDelete ? 'text-red-800' : 'text-amber-800'
                }`}
              >
                {isDelete
                  ? `Permanently delete "${group.groupName}"?`
                  : `Archive "${group.groupName}"?`}
              </p>
              <p className={`text-xs leading-relaxed ${isDelete ? 'text-red-700' : 'text-amber-700'}`}>
                {isDelete
                  ? 'This action cannot be undone. All messages and group data will be permanently erased for everyone.'
                  : 'The group will become read-only. Students will no longer be able to send messages. You can restore it later.'}
              </p>
            </div>

            {isDelete && (
              <div className="w-full bg-red-100/70 border border-red-300 rounded-xl px-3 py-2 flex items-center gap-2 text-left">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-[11px] text-red-800 font-semibold">
                  This will delete all {group.memberCount || 0} member records and entire chat history permanently.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={() => setConfirmMode(null)}
              disabled={deleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmAction}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm active:scale-95 disabled:opacity-60 ${
                isDelete
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {deleting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {isDelete ? 'Deleting...' : 'Archiving...'}
                </>
              ) : (
                <>
                  {isDelete ? (
                    <Trash2 className="w-4 h-4" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  {isDelete ? 'Yes, Delete Group' : 'Yes, Archive Group'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Main Edit Form ────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Group Settings"
      description={`Manage settings for ${group.groupName}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSave} className="space-y-4 mt-3">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Group Name */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. CS-301 Study Group"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-ink-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white font-medium"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this group's purpose..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-ink-border rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white resize-none"
          />
        </div>

        {/* Color Badge */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Group Color Badge
          </label>
          <div className="flex items-center gap-2.5">
            {PRESET_AVATARS.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setSelectedAvatar(p.id)}
                className={`w-7 h-7 rounded-full ${p.bg} flex items-center justify-center transition-transform ${
                  selectedAvatar === p.id
                    ? 'ring-2 ring-offset-2 ring-brand-500 scale-110'
                    : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
              >
                {selectedAvatar === p.id && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-ink-border rounded-xl text-xs text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ACTIVE">ACTIVE — Students can chat</option>
            <option value="ARCHIVED">ARCHIVED — Read-only for all members</option>
          </select>
        </div>

        {/* ── Danger Zone ─────────────────────────────────────── */}
        <div className="pt-3 border-t border-ink-border space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Danger Zone</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Archive */}
            <button
              type="button"
              disabled={submitting || deleting || group.status === 'ARCHIVED'}
              onClick={() => setConfirmMode('archive')}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Archive className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              {group.status === 'ARCHIVED' ? 'Already Archived' : 'Archive Group'}
            </button>

            {/* Permanent Delete */}
            <button
              type="button"
              disabled={submitting || deleting}
              onClick={() => setConfirmMode('delete')}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-red-300 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 text-xs font-bold transition-all disabled:opacity-50 group"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Delete Group
            </button>
          </div>

          <p className="text-[10px] text-ink-muted leading-relaxed pt-1">
            <strong>Archive</strong> makes the group read-only and preserves history.{' '}
            <strong className="text-red-600">Delete</strong> permanently removes the group and all
            messages — this cannot be undone.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-border">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
