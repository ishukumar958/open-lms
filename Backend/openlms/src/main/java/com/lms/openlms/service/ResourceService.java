package com.lms.openlms.service;

import com.lms.openlms.dto.ResourceDto;
import com.lms.openlms.entity.Course;
import com.lms.openlms.entity.Resource;
import com.lms.openlms.entity.User;
import com.lms.openlms.exception.ResourceNotFoundException;
import com.lms.openlms.repository.ResourceRepository;
import com.lms.openlms.repository.UserRepository;
import com.lms.openlms.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final CourseAccessService courseAccessService;

    public ResourceService(ResourceRepository resourceRepository,
                           UserRepository userRepository,
                           CourseAccessService courseAccessService) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.courseAccessService = courseAccessService;
    }

    public ResourceDto.ResourceResponse createResource(Long courseId, Long professorUserId, ResourceDto.CreateResourceRequest request) {
        Course course = courseAccessService.requireOwner(courseId, professorUserId);
        User professor = userRepository.findById(professorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Resource resource = new Resource();
        resource.setCourse(course);
        resource.setTitle(request.getTitle().trim());
        resource.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        resource.setFileUrl(request.getFileUrl().trim());
        resource.setUploadedBy(professor);
        resource.setUploadedAt(LocalDateTime.now());

        Resource saved = resourceRepository.save(resource);
        return toResourceResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ResourceDto.ResourceResponse> listResources(Long courseId, AuthUser user) {
        courseAccessService.requireMemberOrOwner(courseId, user);
        List<Resource> resources = resourceRepository.findByCourseCourseIdOrderByUploadedAtDesc(courseId);
        return resources.stream()
                .map(this::toResourceResponse)
                .toList();
    }

    public void deleteResource(Long resourceId, Long professorUserId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        courseAccessService.requireOwner(resource.getCourse().getCourseId(), professorUserId);
        resourceRepository.delete(resource);
    }

    private ResourceDto.ResourceResponse toResourceResponse(Resource r) {
        User uploader = r.getUploadedBy();
        return new ResourceDto.ResourceResponse(
                r.getResourceId(),
                r.getCourse().getCourseId(),
                r.getTitle(),
                r.getDescription(),
                r.getFileUrl(),
                uploader != null ? uploader.getUserId() : null,
                uploader != null ? uploader.getName() : null,
                r.getUploadedAt()
        );
    }
}
