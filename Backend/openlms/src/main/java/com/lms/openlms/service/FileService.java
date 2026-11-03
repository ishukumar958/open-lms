package com.lms.openlms.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lms.openlms.dto.FileDto.FileUploadResponse;
import com.lms.openlms.exception.BadRequestException;
import com.lms.openlms.exception.ServiceUnavailableException;
import com.lms.openlms.exception.UnsupportedMediaTypeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class FileService {

    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_FOLDERS = Set.of("resources", "assignments", "submissions");

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "txt", "png", "jpg", "jpeg", "zip"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public FileService(@Autowired(required = false) Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public FileUploadResponse uploadFile(MultipartFile file, String folder) {
        if (cloudinary == null) {
            throw new ServiceUnavailableException("File storage not configured");
        }

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        if (folder == null || !ALLOWED_FOLDERS.contains(folder.trim().toLowerCase())) {
            throw new BadRequestException("Invalid folder; must be one of: resources, assignments, submissions");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new MaxUploadSizeExceededException(MAX_FILE_SIZE);
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "upload";
        }

        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < originalName.length() - 1) {
            extension = originalName.substring(dotIndex + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new UnsupportedMediaTypeException("Unsupported media type: " + extension);
        }

        String baseName = dotIndex >= 0 ? originalName.substring(0, dotIndex) : originalName;
        String sanitizedBase = baseName.replaceAll("[^a-zA-Z0-9_-]", "_");
        String publicId = sanitizedBase + "_" + UUID.randomUUID().toString().substring(0, 8);
        String targetFolder = "open_lms/" + folder.trim().toLowerCase();

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", targetFolder,
                            "public_id", publicId,
                            "resource_type", "auto"
                    )
            );

            String fileUrl = (String) uploadResult.get("secure_url");
            String fullPublicId = (String) uploadResult.get("public_id");
            Long bytes = uploadResult.get("bytes") instanceof Number n ? n.longValue() : file.getSize();
            String mimeType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

            return new FileUploadResponse(
                    fileUrl,
                    fullPublicId,
                    originalName,
                    mimeType,
                    bytes,
                    LocalDateTime.now()
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to storage: " + e.getMessage(), e);
        }
    }
}
