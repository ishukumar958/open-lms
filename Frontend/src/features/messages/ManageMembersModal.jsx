import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Search, UserPlus, UserMinus, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getGroupMembers, getCourseEnrolledStudents, addMembers, removeMember } from '../../lib/api/chatApi';

export function ManageMembersModal({ isOpen, onClose, group, onMembersChanged, initialTab = 'current' }) {
  const [members, setMembers] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab || 'current'); // 'current' | 'add'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (group && isOpen) {
      loadData();
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [group, isOpen, initialTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      const [membersData, courseStudents] = await Promise.all([
        getGroupMembers(group.groupId),
        getCourseEnrolledStudents(group.courseId),
      ]);

      const currentList = Array.isArray(membersData) ? membersData : [];
      setMembers(currentList);

      // Available to add: enrolled in course but not currently member
      const memberUserIds = new Set(currentList.map((m) => m.userId));
      const notInGroup = (Array.isArray(courseStudents) ? courseStudents : []).filter(
        (s) => !memberUserIds.has(s.userId)
      );
      setAvailableStudents(notInGroup);
      setSelectedToAdd([]);
    } catch (err) {
      setError(err.message || 'Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  const handleRemove = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this group?`)) return;

    try {
      setActionLoading(true);
      setError(null);
      await removeMember(group.groupId, studentId);
      setSuccessMsg(`${studentName} removed from the group`);
      await loadData();
      if (onMembersChanged) onMembersChanged();
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSelected = async () => {
    if (selectedToAdd.length === 0) return;

    try {
      setActionLoading(true);
      setError(null);
      await addMembers(group.groupId, selectedToAdd);
      setSuccessMsg(`Added ${selectedToAdd.length} student(s) to the group`);
      setSelectedToAdd([]);
      await loadData();
      setActiveTab('current');
      if (onMembersChanged) onMembersChanged();
    } catch (err) {
      setError(err.message || 'Failed to add members');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectStudent = (id) => {
    setSelectedToAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredMembers = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAvailable = availableStudents.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Group Members"
      description={`Add or remove students for ${group.groupName}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 mt-2">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-ink-border">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'current'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Current Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'add'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            Add Enrolled Students ({availableStudents.length} available)
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" />
          <input
            type="text"
            placeholder={activeTab === 'current' ? 'Search group members...' : 'Search available enrolled students...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-ink-border rounded-lg text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Tab 1: Current Members */}
        {activeTab === 'current' && (
          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-ink-muted">Loading members...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-muted">No members found matching query.</div>
            ) : (
              filteredMembers.map((m) => {
                const isMemTeacher = Boolean(m.isTeacher || m.teacher || m.role === 'PROFESSOR' || m.role === 'FACULTY');
                return (
                  <div
                    key={m.userId}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-ink-border/60 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={m.name} size="sm" color={isMemTeacher ? 'brand' : 'sky'} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-ink truncate">{m.name}</p>
                          {isMemTeacher && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                              <ShieldCheck className="w-3 h-3 text-indigo-600" />
                              Instructor / Owner
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-muted truncate">{m.email}</p>
                      </div>
                    </div>

                    {!isMemTeacher && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleRemove(m.userId, m.name)}
                        title="Remove student from group"
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Add Students */}
        {activeTab === 'add' && (
          <div className="space-y-3">
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {loading ? (
                <div className="py-8 text-center text-xs text-ink-muted">Loading available students...</div>
              ) : filteredAvailable.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-muted">
                  All enrolled students in {group.courseCode || 'this course'} are already in this group.
                </div>
              ) : (
                filteredAvailable.map((s) => {
                  const isChecked = selectedToAdd.includes(s.userId);
                  return (
                    <div
                      key={s.userId}
                      onClick={() => toggleSelectStudent(s.userId)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isChecked ? 'bg-brand-50 border border-brand-300' : 'bg-white border border-ink-border/60 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                        />
                        <Avatar name={s.name} size="xs" color="sky" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ink truncate">{s.name}</p>
                          <p className="text-[11px] text-ink-muted truncate">{s.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Enrolled
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {availableStudents.length > 0 && (
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={actionLoading}
                  disabled={selectedToAdd.length === 0 || actionLoading}
                  onClick={handleAddSelected}
                  icon={UserPlus}
                >
                  Add {selectedToAdd.length} Student{selectedToAdd.length === 1 ? '' : 's'}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-ink-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
