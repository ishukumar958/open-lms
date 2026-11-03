import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { FileUploader } from '../../../components/ui/FileUploader';
import { FileText, Plus, Trash2, ExternalLink } from 'lucide-react';
import { listResources, createResource, deleteResource } from '../../../lib/api/resourcesApi';

export function ResourcesTab({ courseId, course }) {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    fileUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchResources = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const data = await listResources(courseId);
      setResources(data || []);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResource.title.trim() || !newResource.fileUrl.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      await createResource(courseId, {
        title: newResource.title.trim(),
        description: newResource.description.trim() || null,
        fileUrl: newResource.fileUrl.trim(),
      });
      setIsAddModalOpen(false);
      setNewResource({ title: '', description: '', fileUrl: '' });
      await fetchResources();
    } catch (err) {
      setError(err.message || 'Failed to add resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete "${resource.title}"?`)) return;
    try {
      await deleteResource(resource.resourceId || resource.id);
      await fetchResources();
    } catch (err) {
      alert(err.message || 'Failed to delete resource');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-border p-6 shadow-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-ink">Course Resources ({resources.length})</h3>
          <p className="text-xs text-ink-muted">
            Upload and organize slide decks, syllabi, and lecture materials for students.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setError('');
            setIsAddModalOpen(true);
          }}
          className="font-bold text-xs"
        >
          Add resource
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-ink-muted">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="p-8 text-center text-xs text-ink-muted bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-ink">No resources uploaded yet.</p>
          <p className="text-[11px] text-slate-400">
            Click &quot;Add resource&quot; to publish reference materials or lecture links.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {resources.map((r) => (
            <div
              key={r.resourceId || r.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-ink">{r.title}</h4>
                    {r.fileUrl && (
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700"
                        title="Open URL"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-[11px] text-ink-muted mt-0.5">{r.description}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Uploaded {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="xs"
                icon={Trash2}
                onClick={() => handleDelete(r)}
                className="text-slate-400 hover:text-rose-600 hover:border-rose-200 text-xs self-start sm:self-auto"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Course Resource"
        description="Provide a title and link to the lecture slides, PDF, or documentation."
      >
        <form onSubmit={handleAddResource} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <Input
            label="Resource Title"
            placeholder="e.g. Lecture 1 Slides — Introduction"
            required
            value={newResource.title}
            onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Upload Document (Cloudinary)
            </label>
            <FileUploader
              folder="resources"
              label="Upload syllabus, slides, or reading material (up to 10MB)"
              onUploadSuccess={(res) => {
                setNewResource((prev) => ({
                  ...prev,
                  fileUrl: res.fileUrl || res.url,
                  title: prev.title || res.originalName || '',
                }));
              }}
            />
          </div>

          <Input
            label="File / Material URL"
            placeholder="https://..."
            required
            value={newResource.fileUrl}
            onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Summary or preparation notes..."
              value={newResource.description}
              onChange={(e) =>
                setNewResource({ ...newResource, description: e.target.value })
              }
              className="w-full bg-white border border-ink-border rounded-lg text-xs text-ink p-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="font-bold"
            >
              Add resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
