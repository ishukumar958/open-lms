package com.lms.openlms.controller;

import com.lms.openlms.dto.FileDto.FileUploadResponse;
import com.lms.openlms.service.FileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // F1 — POST /files/upload (any authenticated) -> 201
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("folder") String folder) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fileService.uploadFile(file, folder));
    }
}
