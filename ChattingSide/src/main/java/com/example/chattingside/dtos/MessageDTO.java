package com.example.chattingside.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {

    private String senderId; // Add senderId
    private String senderName;
    private String content;
    private String receiverId;
    private String role;
    private boolean seen;

    public String getSenderId() {
        return senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public String getContent() {
        return content;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public String getRole() {
        return role;
    }
}
