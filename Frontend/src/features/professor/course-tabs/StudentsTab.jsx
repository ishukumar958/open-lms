import React, { useState, useEffect } from 'react';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Users, UserMinus, Search } from 'lucide-react';
import { listCourseStudents, removeStudent } from '../../../lib/api/coursesApi';

export function StudentsTab({ courseId, course }) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const data = await listCourseStudents(courseId);
      setStudents(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const handleRemove = async (student) => {
    if (!window.confirm(`Are you sure you want to remove ${student.name} from this course?`)) return;
    try {
      await removeStudent(courseId, student.userId);
      await fetchStudents();
    } catch (err) {
      alert(err.message || 'Failed to remove student');
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-ink">
            Enrolled Students ({students.length})
          </h3>
          <p className="text-xs text-ink-muted">
            Manage student roster and course enrollment.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-ink-muted" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs py-2 pl-8 pr-3 rounded-xl border border-ink-border focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-xs text-ink-muted">Loading roster...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-ink-muted bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-ink">No students enrolled yet.</p>
          <p className="text-[11px] text-slate-400">
            Share class code <span className="font-mono font-bold text-brand-600">{course?.courseCode || course?.code}</span> with your students.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.map((student) => {
            const initials = student.name
              ? student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'ST';

            return (
              <div
                key={student.userId}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={initials} size="sm" color="brand" />
                  <div>
                    <h4 className="text-xs font-bold text-ink">{student.name}</h4>
                    <p className="text-[11px] text-ink-muted">{student.email}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  icon={UserMinus}
                  onClick={() => handleRemove(student)}
                  className="text-slate-400 hover:text-rose-600 hover:border-rose-200 text-xs"
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
