package com.example.backend.websocket;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.example.backend.dto.DebateClientEvent;
import com.example.backend.service.DebateSessionService;

@Controller
public class DebateStompController {

    private final DebateSessionService debateSessionService;

    public DebateStompController(DebateSessionService debateSessionService) {
        this.debateSessionService = debateSessionService;
    }

    @MessageMapping("/debate/{roomId}/event")
    public void debateEvent(@DestinationVariable String roomId, @Payload DebateClientEvent event) {
        debateSessionService.handleEvent(roomId, event);
    }
}
