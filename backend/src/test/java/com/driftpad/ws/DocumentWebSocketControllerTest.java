package com.driftpad.ws;

import com.driftpad.ws.controller.DocumentWebSocketController;
import com.driftpad.ws.dto.DocumentEditMessage;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DocumentWebSocketControllerTest {

    @Test
    void testBroadcastEditRelay() {
        DocumentWebSocketController controller = new DocumentWebSocketController();

        DocumentEditMessage input = DocumentEditMessage.builder()
                .text("Hello Driftpad!")
                .senderId("client-123")
                .timestamp(0)
                .build();

        DocumentEditMessage result = controller.broadcastEdit("test-doc", input);

        assertNotNull(result);
        assertEquals("Hello Driftpad!", result.getText());
        assertEquals("client-123", result.getSenderId());
        assertTrue(result.getTimestamp() > 0);
    }
}
