package com.lms.openlms.controller;

import com.lms.openlms.dto.ChatDtos;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;

    public ChatWebSocketController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/chat.sendMessage/{groupId}")
    public void handleSendMessage(
            @DestinationVariable Long groupId,
            @Payload ChatDtos.SendMessageRequest request,
            Principal principal) {
        AuthUser authUser = extractAuthUser(principal);
        if (authUser != null) {
            chatService.sendMessage(groupId, authUser, request);
        }
    }

    @MessageMapping("/chat.typing/{groupId}")
    public void handleTyping(
            @DestinationVariable Long groupId,
            @Payload ChatDtos.TypingNotification payload,
            Principal principal) {
        AuthUser authUser = extractAuthUser(principal);
        if (authUser != null) {
            chatService.broadcastTyping(groupId, authUser, payload.isTyping());
        }
    }

    private AuthUser extractAuthUser(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth &&
                auth.getPrincipal() instanceof AuthUser authUser) {
            return authUser;
        }
        return null;
    }
}
