import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { listMyCourses } from '../../lib/api/coursesApi';
import { getCourseGradebook } from '../../lib/api/gradesApi';
import { Download, Search, BookOpen, AlertCircle, Users } from 'lucide-react';

export function ProfessorGradebookPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [gradebook, setGradebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load professor's courses
  useEffect(() => {
    listMyCourses()
      .then((data) => {
        if (data && data.length > 0) {
          setCourses(data);
          setSelectedCourseId(String(data[0].courseId));
        } else {
          setCourses([]);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load courses for gradebook:', err);
        setLoading(false);
      });
  }, []);

  // Load gradebook whenever selected course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    setLoading(true);
    setError(null);
    getCourseGradebook(selectedCourseId)
      .then((data) => {
        setGradebook(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load course gradebook:', err);
        setError(err.message || 'Failed to load gradebook');
        setLoading(false);
      });
  }, [selectedCourseId]);

  const assignments = gradebook?.assignments || [];
  const quizzes = gradebook?.quizzes || [];
  const rows = gradebook?.rows || [];

  const filteredRows = rows.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.studentName && r.studentName.toLowerCase().includes(q)) ||
      (r.studentEmail && r.studentEmail.toLowerCase().includes(q))
    );
  });

  const exportCSV = () => {
    if (!gradebook || rows.length === 0) return;
    const headers = [
      'Student ID',
      'Name',
      'Email',
      ...assignments.map((a) => `Assignment: ${a.title} (${a.maxMarks})`),
      ...quizzes.map((q) => `Quiz: ${q.title} (${q.totalMarks})`),
      'Total Points Obtained',
      'Total Points Max',
      'Overall Grade (%)',
    ];

    const csvRows = [headers.join(',')];

    rows.forEach((r) => {
      const rowData = [
        r.studentId,
        `"${r.studentName || ''}"`,
        `"${r.studentEmail || ''}"`,
        ...assignments.map((a) => r.assignmentMarks?.[String(a.assignmentId)] ?? ''),
        ...quizzes.map((q) => r.quizScores?.[String(q.quizId)] ?? ''),
        r.totalObtained ?? 0,
        r.totalMax ?? 0,
        r.percentage != null ? `${r.percentage}%` : 'N/A',
      ];
      csvRows.push(rowData.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `gradebook-course-${selectedCourseId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedCourse = courses.find((c) => String(c.courseId) === String(selectedCourseId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Gradebook</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            {selectedCourse
              ? `${selectedCourse.courseCode} · ${selectedCourse.courseName} Comprehensive Scores`
              : 'Select a course to inspect student evaluations'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-ink-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {courses.map((c) => (
              <option key={c.courseId} value={c.courseId}>
                {c.courseCode} · {c.courseName}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={exportCSV}
            disabled={!gradebook || rows.length === 0}
            className="bg-white"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-ink-muted bg-white rounded-2xl border border-ink-border">
          Loading gradebook records...
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-700 flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <span>{error}</span>
        </div>
      ) : rows.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-ink-border">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-ink">No students enrolled</h3>
          <p className="text-xs text-ink-muted mt-1">
            When students enroll in this course, their assignments and quiz scores will populate here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink-border shadow-soft overflow-hidden space-y-3">
          {/* Search bar */}
          <div className="p-3 border-b border-ink-border bg-slate-50/50 flex items-center justify-between">
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-ink-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <span className="text-xs text-ink-muted font-medium">
              {filteredRows.length} student{filteredRows.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-ink-border text-ink-muted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 min-w-44">Student</th>
                  {assignments.map((a) => (
                    <th key={`a-${a.assignmentId}`} className="py-3 px-3 text-center min-w-28">
                      <div className="truncate max-w-32">{a.title}</div>
                      <span className="text-[9px] text-ink-muted/80 font-normal">
                        ({a.maxMarks} pts)
                      </span>
                    </th>
                  ))}
                  {quizzes.map((q) => (
                    <th key={`q-${q.quizId}`} className="py-3 px-3 text-center min-w-28">
                      <div className="truncate max-w-32">{q.title}</div>
                      <span className="text-[9px] text-ink-muted/80 font-normal">
                        ({q.totalMarks} pts)
                      </span>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center min-w-24">Total Pts</th>
                  <th className="py-3 px-4 text-right min-w-24">Overall Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRows.map((st) => (
                  <tr key={st.studentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          initials={
                            st.studentName
                              ? st.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2)
                              : 'ST'
                          }
                          size="xs"
                          color="brand"
                        />
                        <div>
                          <p className="font-semibold text-ink leading-tight">{st.studentName}</p>
                          <p className="text-[10px] text-ink-muted">{st.studentEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Assignment scores */}
                    {assignments.map((a) => {
                      const score = st.assignmentMarks?.[String(a.assignmentId)];
                      return (
                        <td
                          key={`a-score-${a.assignmentId}`}
                          className="py-3 px-3 text-center font-mono"
                        >
                          {score != null ? (
                            <span className="text-ink font-semibold">{score}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Quiz scores */}
                    {quizzes.map((q) => {
                      const score = st.quizScores?.[String(q.quizId)];
                      return (
                        <td
                          key={`q-score-${q.quizId}`}
                          className="py-3 px-3 text-center font-mono"
                        >
                          {score != null ? (
                            <span className="text-ink font-semibold">{score}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total Points */}
                    <td className="py-3 px-3 text-center font-mono text-ink-muted">
                      {st.totalMax > 0 ? (
                        <span>
                          <strong className="text-ink font-semibold">{st.totalObtained}</strong> / {st.totalMax}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Overall Percentage */}
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 font-mono text-sm">
                      {st.percentage != null ? `${st.percentage}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
