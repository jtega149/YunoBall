package com.example.backend.websocket;


import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;
import org.springframework.messaging.handler.annotation.*;

@Controller
public class ChatController {

    @MessageMapping("/handleMessage/{roomId}") // If message sent to /YunoBall/handleMessage/roomId, this method is triggered
    @SendTo("/topic/room/{roomId}") // Send to specific room that the user is in, could be dynamic based on message.roomId
    public ChatMessage handleMessage(ChatMessage message, @DestinationVariable String roomId) throws Exception { // Will handle incoming messages
        // Could add censorship, logging, etc. here later or whatever
        try {
            if (!roomId.equals(message.getRoomId())) {
                throw new IllegalArgumentException("Room ID in the path does not match room ID in the message");
            }
            String sanitizedContent = HtmlUtils.htmlEscape(message.getContent());
            return new ChatMessage(sanitizedContent, message.getSender(), message.getRoomId());
        } catch (Exception e) {
            // Handle exception (e.g., log it)
            System.err.println("Error handling message: " + e.getMessage());
            throw e; // Rethrow or handle accordingly
        }
    }
}
