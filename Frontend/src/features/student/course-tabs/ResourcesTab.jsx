import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { listResources } from '../../../lib/api/resourcesApi';

export function ResourcesTab({ course, courseId }) {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const cId = courseId || course?.courseId || course?.id;

  useEffect(() => {
    if (!cId) return;
    setIsLoading(true);
    listResources(cId)
      .then((data) => setResources(data || []))
      .catch((err) => console.error('Failed to load resources:', err))
      .finally(() => setIsLoading(false));
  }, [cId]);

  return (
    <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-ink">Course Resources & Materials</h3>
          <p className="text-xs text-ink-muted">
            Lecture notes, syllabi, and reference files for {course?.courseName || course?.title || 'this course'}.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-ink-muted">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="p-8 text-center text-xs text-ink-muted bg-slate-50 rounded-xl border border-slate-100">
          No resources uploaded for this class yet.
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {resources.map((r) => (
            <div
              key={r.resourceId || r.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink">{r.title}</h4>
                  {r.description && (
                    <p className="text-xs text-ink-muted mt-0.5">{r.description}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Uploaded by {r.uploadedByName || 'Faculty'} ·{' '}
                    {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>

              {r.fileUrl && (
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-brand-700 shrink-0 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  Open resource
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
