import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import CryptoJS from 'crypto-js';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isAdminConnected, setIsAdminConnected] = useState(false);
    const [typingNotification, setTypingNotification] = useState('');
    const clientRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        const encryptedUser = sessionStorage.getItem('user');
        if (!encryptedUser) {
            console.error('User not logged in.');
            return;
        }
        const decryptedUser = JSON.parse(
            CryptoJS.AES.decrypt(encryptedUser, 'your-secret-key').toString(CryptoJS.enc.Utf8)
        );
        const userId = decryptedUser.userId;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8083/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                setIsAdminConnected(true);

                const topic = `/topic/messages/${userId}`;
                client.subscribe(topic, (message) => {
                    const parsedMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, { ...parsedMessage }]);

                    // Mark the received message as seen immediately (when user is on chat page)
                    //markMessageAsSeen(parsedMessage);
                });

                client.subscribe(`/topic/typing/${userId}`, (message) => {
                    const typingStatus = message.body;
                    // If the typing message is from Admin, show it. Otherwise, ignore.
                    if (typingStatus.includes('Admin')) {
                        setTypingNotification(typingStatus);
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => {
                            setTypingNotification('');
                        }, 3000);
                    }
                });

                // Subscribe to seen notifications
                client.subscribe(`/topic/seen/${userId}`, (message) => {
                    const seenMessage = JSON.parse(message.body);
                    // Update local messages to reflect that admin has seen them
                    setMessages((prev) => {
                        return prev.map(msg => ({
                            ...msg,
                            seen: msg.senderId === userId ? true : msg.seen
                        }));
                    });
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                setIsAdminConnected(false);
            },
            debug: (str) => {
                console.log(str);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, []);

    const notifyTyping = (status) => {
        const encryptedUser = sessionStorage.getItem('user');
        if (!encryptedUser) return;

        const decryptedUser = JSON.parse(
            CryptoJS.AES.decrypt(encryptedUser, 'your-secret-key').toString(CryptoJS.enc.Utf8)
        );
        const message = {
            senderId: decryptedUser.userId,
            senderName: decryptedUser.name,
            receiverId: decryptedUser.userId, // Admin's UUID should be set correctly. If admin has a known UUID, replace here.
            content: status, // "typing" or "stopped"
        };

        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination: '/app/typing',
                body: JSON.stringify(message),
            });
        }
    };

    const sendMessage = () => {
        if (!isAdminConnected) {
            alert('Admin is not connected.');
            return;
        }

        const encryptedUser = sessionStorage.getItem('user');
        if (!encryptedUser) {
            console.error('User not logged in.');
            return;
        }

        const decryptedUser = JSON.parse(
            CryptoJS.AES.decrypt(encryptedUser, 'your-secret-key').toString(CryptoJS.enc.Utf8)
        );

        // Replace 'a16264c1-cc49-419b-830a-3f327b281fb1' with the admin's userId if known.
        const message = {
            senderId: decryptedUser.userId,
            senderName: decryptedUser.name,
            content: inputMessage,
            receiverId: 'a4e89ab0-cb10-4ffe-8102-e13b8c2a6b8a',
            role: decryptedUser.role,
            seen: false,
        };

        if (clientRef.current && clientRef.current.connected) {
            setMessages((prevMessages) => [...prevMessages, message]);

            clientRef.current.publish({
                destination: '/app/sendMessage',
                body: JSON.stringify(message),
            });

            setInputMessage('');
            notifyTyping('stopped');
        } else {
            console.error('STOMP client is not connected.');
        }
    };

    const markMessageAsSeen = (message) => {
        const encryptedUser = sessionStorage.getItem('user');
        if (!encryptedUser) return;

        const decryptedUser = JSON.parse(
            CryptoJS.AES.decrypt(encryptedUser, 'your-secret-key').toString(CryptoJS.enc.Utf8)
        );

        // Use the user's ID as senderId in seenMessage, not message.senderId (which is admin's ID).
        const seenMessage = {
            senderId: decryptedUser.userId, // The user's own ID
            receiverId: "admin",
            seen: true,
        };

        if (clientRef.current && clientRef.current.connected && message.senderId !== decryptedUser.userId) {
            clientRef.current.publish({
                destination: '/app/seen',
                body: JSON.stringify(seenMessage),
            });

            // Update local state
            setMessages((prev) => prev.map(msg =>
                msg === message ? { ...msg, seen: true } : msg
            ));
        }
    };


    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Chat with Admin</h1>
            {typingNotification && (
                <p style={{ color: 'green', fontStyle: 'italic' }}>{typingNotification}</p>
            )}
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
                height: '300px',
                overflowY: 'scroll',
                marginBottom: '10px',
            }}>
                {messages.length === 0 ? (
                    <p style={{ color: '#888' }}>No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} style={{ marginBottom: '5px' }}>
                            <strong>{msg.senderName}:</strong> {msg.content}
                            {msg.seen && <span style={{ color: 'blue', marginLeft: '10px' }}>(Seen)</span>}
                        </div>
                    ))
                )}
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
                <input
                    id="chatMessageInput"
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                        notifyTyping('typing');
                    }}
                    onFocus={() => {
                        // Iterate over all messages and mark unseen admin messages as seen
                        const encryptedUser = sessionStorage.getItem('user');
                        if (encryptedUser) {
                            const decryptedUser = JSON.parse(
                                CryptoJS.AES.decrypt(encryptedUser, 'your-secret-key').toString(CryptoJS.enc.Utf8)
                            );

                            messages.forEach((msg) => {
                                if (!msg.seen && msg.senderId !== decryptedUser.userId) {
                                    markMessageAsSeen(msg);
                                }
                            });
                        }
                    }}
                    onBlur={() => notifyTyping('stopped')}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                    }}
                />


                <button
                    onClick={sendMessage}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: '#007BFF',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
