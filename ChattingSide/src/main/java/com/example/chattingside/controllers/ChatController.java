package com.example.chattingside.controllers;

import com.example.chattingside.dtos.MessageDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private static final Logger LOGGER = LoggerFactory.getLogger(ChatController.class);

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/sendMessage")
    public void sendMessage(MessageDTO message) {
        // Log the senderId and role for debugging
        LOGGER.info("Message received from senderId: {} with role: {}", message.getSenderId(), message.getRole());

        // Broadcast the message to the receiver's topic
        String receiverTopic = "/topic/messages/" + message.getReceiverId();
        messagingTemplate.convertAndSend(receiverTopic, message);

        // Send a notification only if the sender is not an admin
        if (!"Admin".equalsIgnoreCase(message.getRole())) {
            String notificationTopic = "/topic/notifications";
            messagingTemplate.convertAndSend(notificationTopic,
                    String.format("New message from %s with %s ID: %s", message.getSenderName(), message.getSenderId(), message.getContent()));
        }

        LOGGER.info("Message sent: {}", message.getContent());
    }

    @MessageMapping("/typing")
    public void userTyping(MessageDTO message) {
        LOGGER.info("User typing status from senderId: {} to receiverId: {}", message.getSenderId(), message.getReceiverId());

        // Notify only the receiver about the typing status
        String typingTopic = "/topic/typing/" + message.getReceiverId();
        String typingStatus = String.format("%s is %s...", message.getSenderName(), message.getContent()); // e.g., "Admin is typing..."

        messagingTemplate.convertAndSend(typingTopic, typingStatus);

        // Do NOT send the typing status back to the sender
    }


    @MessageMapping("/seen")
    public void messageSeen(MessageDTO message) {

        LOGGER.info("Message seen by receiverId {}", message.getReceiverId());
        String seenTopic = "/topic/seen/" + message.getSenderId();
        messagingTemplate.convertAndSend(seenTopic, message);
    }


}
