package com.lms.openlms.dto;

import java.time.LocalDateTime;

public class FileDto {
    
    public record FileUploadResponse(
            String fileUrl,
            String publicId,
            String originalName,
            String mimeType,
            Long sizeBytes,
            LocalDateTime uploadedAt
    ) {}
}