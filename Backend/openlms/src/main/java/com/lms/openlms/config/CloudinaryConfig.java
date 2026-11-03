package com.lms.openlms.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:${CLOUDINARY_CLOUD_NAME:}}")
    private String cloudName;

    @Value("${cloudinary.api-key:${CLOUDINARY_API_KEY:}}")
    private String apiKey;

    @Value("${cloudinary.api-secret:${CLOUDINARY_API_SECRET:}}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudName == null || cloudName.isBlank() ||
            apiKey == null || apiKey.isBlank() ||
            apiSecret == null || apiSecret.isBlank()) {
            return null;
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName.trim(),
                "api_key", apiKey.trim(),
                "api_secret", apiSecret.trim(),
                "secure", true
        ));
    }
}
