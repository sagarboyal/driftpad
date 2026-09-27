package com.driftpad.ws.controller;

import com.driftpad.ws.dto.DocumentEditMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class DocumentWebSocketController {

    /**
     * Receives an edit message sent to /app/document/{token}/edit
     * and broadcasts it directly to all subscribers at /topic/document/{token}.
     */
    @MessageMapping("/document/{token}/edit")
    @SendTo("/topic/document/{token}")
    public DocumentEditMessage broadcastEdit(
            @DestinationVariable String token,
            DocumentEditMessage message
    ) {
        if (message.getTimestamp() <= 0) {
            message.setTimestamp(System.currentTimeMillis());
        }
        return message;
    }
}
