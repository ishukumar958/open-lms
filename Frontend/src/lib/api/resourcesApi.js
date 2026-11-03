import { apiRequest } from '../http';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export async function createResource(courseId, data) {
  if (useMocks) {
    return {
      resourceId: Date.now(),
      courseId: Number(courseId),
      title: data.title,
      fileUrl: data.fileUrl,
      uploadedAt: new Date().toISOString(),
    };
  }
  return apiRequest(`/courses/${courseId}/resources`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function listResources(courseId) {
  if (useMocks) {
    return [
      {
        resourceId: 101,
        courseId: Number(courseId),
        title: 'Lecture 9 Slides — Membrane Transport',
        fileUrl: 'https://example.com/slides-9.pdf',
        uploadedAt: '2026-10-15T10:00:00',
      },
      {
        resourceId: 102,
        courseId: Number(courseId),
        title: 'Syllabus & Lab Safety Protocols',
        fileUrl: 'https://example.com/syllabus.pdf',
        uploadedAt: '2026-09-01T09:00:00',
      },
    ];
  }
  return apiRequest(`/courses/${courseId}/resources`);
}

export async function deleteResource(resourceId) {
  if (useMocks) {
    return null;
  }
  return apiRequest(`/resources/${resourceId}`, {
    method: 'DELETE',
  });
}
