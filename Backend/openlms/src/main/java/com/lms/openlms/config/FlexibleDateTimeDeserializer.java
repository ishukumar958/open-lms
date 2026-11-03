package com.lms.openlms.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class FlexibleDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.trim().isEmpty()) {
            return null;
        }
        text = text.trim();

        // 1. Try parsing standard ISO offset/Z format: e.g. "2026-10-29T02:43:00.000Z" or "+05:30"
        try {
            return OffsetDateTime.parse(text).toLocalDateTime();
        } catch (Exception ignored) {}

        // 2. Try parsing Instant: e.g. "2026-10-29T02:43:00Z"
        try {
            return Instant.parse(text).atZone(ZoneId.systemDefault()).toLocalDateTime();
        } catch (Exception ignored) {}

        // 3. Try parsing ISO local date time: e.g. "2026-10-29T02:43:00" or "2026-10-29T02:43"
        try {
            return LocalDateTime.parse(text, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception ignored) {}

        // 4. Try stripping timezone or milliseconds if present
        if (text.length() >= 19 && text.charAt(10) == 'T') {
            try {
                return LocalDateTime.parse(text.substring(0, 19), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception ignored) {}
        }

        throw new IllegalArgumentException("Unable to parse date/time value: " + text);
    }
}
