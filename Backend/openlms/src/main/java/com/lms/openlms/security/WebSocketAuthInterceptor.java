package com.lms.openlms.security;

import com.lms.openlms.service.ChatService;
import io.jsonwebtoken.Claims;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;
import java.util.Locale;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final ChatService chatService;

    public WebSocketAuthInterceptor(JwtService jwtService, @Lazy ChatService chatService) {
        this.jwtService = jwtService;
        this.chatService = chatService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractToken(accessor);
            if (token != null && !token.isEmpty()) {
                try {
                    Claims claims = jwtService.parse(token);
                    Long userId = Long.valueOf(claims.getSubject());
                    String email = claims.get("email", String.class);
                    String role = claims.get("role", String.class);
                    if (role == null) {
                        role = "STUDENT";
                    }
                    role = role.toUpperCase(Locale.ROOT);

                    AuthUser principal = new AuthUser(userId, email, role);
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(principal, null, List.of(authority));

                    accessor.setUser(authentication);
                } catch (Exception ex) {
                    throw new IllegalArgumentException("WebSocket authentication failed: " + ex.getMessage());
                }
            } else {
                throw new IllegalArgumentException("Authorization header required for WebSocket connection");
            }
        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null && destination.startsWith("/topic/groups.")) {
                Principal userPrincipal = accessor.getUser();
                if (!(userPrincipal instanceof UsernamePasswordAuthenticationToken auth) ||
                        !(auth.getPrincipal() instanceof AuthUser authUser)) {
                    throw new IllegalArgumentException("Unauthorized subscription");
                }

                try {
                    // Extract groupId from /topic/groups.{groupId} or /topic/groups.{groupId}.typing
                    String rest = destination.substring("/topic/groups.".length());
                    int dotIdx = rest.indexOf('.');
                    String idStr = dotIdx > 0 ? rest.substring(0, dotIdx) : rest;
                    Long groupId = Long.valueOf(idStr);

                    // Ensure user is authorized to receive messages for this group
                    chatService.requireAccess(groupId, authUser);
                } catch (Exception ex) {
                    throw new IllegalArgumentException("Forbidden subscription to group topic: " + ex.getMessage());
                }
            }
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String header = authHeaders.get(0);
            if (header != null && header.startsWith("Bearer ")) {
                return header.substring(7).trim();
            }
        }

        List<String> tokenHeaders = accessor.getNativeHeader("token");
        if (tokenHeaders != null && !tokenHeaders.isEmpty()) {
            return tokenHeaders.get(0).trim();
        }

        return null;
    }
}
