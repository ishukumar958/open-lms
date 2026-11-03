import { apiRequest } from '../http';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export async function uploadFile(formData) {
  if (useMocks) {
    const file = formData.get('file');
    return {
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      publicId: 'mock-upload-' + Date.now(),
      fileName: file?.name || 'uploaded-file.pdf',
      bytes: file?.size || 102400,
      format: file?.name ? file.name.split('.').pop() : 'pdf',
    };
  }
  return apiRequest('/files/upload', {
    method: 'POST',
    body: formData,
  });
}
