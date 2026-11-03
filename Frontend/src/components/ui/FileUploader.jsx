import React, { useState, useRef } from 'react';
import { uploadFile } from '../../lib/api/filesApi';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function FileUploader({
  folder = 'resources',
  onUploadSuccess,
  onUploadError,
  allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg', 'zip'],
  maxSizeMB = 10,
  label = 'Upload attachment or file',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file) => {
    setErrorMessage(null);

    // Validation: Size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const err = `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed size of ${maxSizeMB}MB.`;
      setErrorMessage(err);
      if (onUploadError) onUploadError(err);
      return;
    }

    // Validation: Extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedTypes.includes(ext)) {
      const err = `File extension .${ext || 'unknown'} is not allowed. Allowed types: ${allowedTypes.join(', ')}.`;
      setErrorMessage(err);
      if (onUploadError) onUploadError(err);
      return;
    }

    // Start upload
    setUploading(true);
    setProgress(30);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      setProgress(60);
      const res = await uploadFile(formData);
      setProgress(100);
      setUploadedFile({
        name: file.name,
        size: file.size,
        url: res.fileUrl || res.url,
        publicId: res.publicId,
      });
      if (onUploadSuccess) {
        onUploadSuccess(res);
      }
    } catch (err) {
      console.error('File upload failed:', err);
      const msg = err.message || 'Failed to upload file. Please try again.';
      setErrorMessage(msg);
      if (onUploadError) onUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setUploadedFile(null);
    setErrorMessage(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUploadSuccess) {
      onUploadSuccess(null);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-semibold text-ink">{label}</label>}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {uploadedFile ? (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink truncate">{uploadedFile.name}</p>
              <p className="text-[10px] text-ink-muted">
                {(uploadedFile.size / 1024).toFixed(1)} KB · Uploaded successfully
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            'p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group',
            isDragging
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/50 bg-white',
            uploading && 'pointer-events-none opacity-80'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept={allowedTypes.map((t) => `.${t}`).join(',')}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs font-bold text-ink">Uploading file...</p>
              <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 group-hover:text-brand-600 text-slate-500 flex items-center justify-center mb-2 transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-ink">
                Drag and drop your file here, or{' '}
                <span className="text-brand-600 underline">browse</span>
              </p>
              <p className="text-[10px] text-ink-muted mt-1">
                Max {maxSizeMB}MB · Supports {allowedTypes.slice(0, 5).join(', ').toUpperCase()}...
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
