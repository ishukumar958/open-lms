import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { listMyAssignments } from '../../lib/api/assignmentsApi';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export function StudentCalendarPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listMyAssignments()
      .then((data) => {
        if (mounted) {
          setAssignments(data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load assignments for calendar:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Group assignments by date string
  const groupedEvents = {};
  assignments.forEach((a) => {
    if (!a.dueDate) return;
    const d = new Date(a.dueDate);
    const dayKey = d.toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    if (!groupedEvents[dayKey]) {
      groupedEvents[dayKey] = [];
    }
    groupedEvents[dayKey].push({
      id: a.assignmentId,
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `${a.courseName ? a.courseName + ': ' : ''}${a.title}`,
      location: 'Online submission',
      type: 'assignment',
      status: a.studentStatus || a.myStatus || 'PENDING',
      points: a.maxMarks || 100,
    });
  });

  const eventDays = Object.entries(groupedEvents);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Calendar</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Assignment due dates and submission deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-ink-border text-xs font-semibold">
            <CalendarIcon className="w-4 h-4 text-brand-600" />
            <span>Semester Schedule</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-muted bg-white rounded-2xl border border-ink-border">
          Loading calendar events...
        </div>
      ) : eventDays.length === 0 ? (
        <div className="p-12 text-center text-xs text-ink-muted bg-white rounded-2xl border border-dashed border-ink-border">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          No upcoming deadlines scheduled on your calendar.
        </div>
      ) : (
        <div className="space-y-4">
          {eventDays.map(([day, items], idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-3">
              <h3 className="text-sm font-bold text-ink pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                {day}
              </h3>

              <div className="space-y-3 pt-1">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-3 h-3 rounded-full mt-1 shrink-0 bg-violet-500" />
                      <div>
                        <h4 className="text-xs font-bold text-ink">{it.title}</h4>
                        <p className="text-[11px] text-ink-muted flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{it.time}</span>
                          <span>•</span>
                          <span>{it.location}</span>
                          <span>•</span>
                          <span>{it.points} pts</span>
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        it.status === 'APPROVED'
                          ? 'success'
                          : it.status === 'SUBMITTED'
                          ? 'submitted'
                          : it.status === 'OVERDUE'
                          ? 'warning'
                          : 'default'
                      }
                      size="xs"
                    >
                      {it.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
