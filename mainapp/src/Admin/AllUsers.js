import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function AllUsers() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [chatTabs, setChatTabs] = useState([]);
    const [messages, setMessages] = useState({});
    const clientRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        try {
            const encryptedData = sessionStorage.getItem('user');
            if (!encryptedData) {
                alert('No authentication token found.');
                return;
            }

            const decryptedData = JSON.parse(
                CryptoJS.AES.decrypt(encryptedData, 'your-secret-key').toString(CryptoJS.enc.Utf8)
            );

            const token = decryptedData.jwtToken;

            const response = await fetch(`http://localhost:8080/clients/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setClients((prev) => prev.filter(client => client.id !== id));
                alert('Client deleted successfully');
            } else {
                const errorText = await response.text();
                alert('Failed to delete client: ' + errorText);
            }
        } catch (err) {
            console.error('Error deleting client:', err);
            alert('An error occurred while deleting the client.');
        }
    };

    const handleUpdate = (client) => {
        navigate('/admin/allusers/updateuser', { state: { client } });
    };

    const handleChatOpen = (client) => {
        if (!chatTabs.find(tab => tab.id === client.id)) {
            setChatTabs((prev) => [...prev, client]);
            setMessages((prev) => ({
                ...prev,
                [client.id]: { input: '', chat: [], typingStatus: '' },
            }));
        }
    };

    const notifyTyping = (receiverId, status) => {
        const message = {
            senderId: 'admin',
            senderName: 'Admin',
            receiverId,
            content: status,
        };

        if (clientRef.current) {
            clientRef.current.publish({
                destination: '/app/typing',
                body: JSON.stringify(message),
            });
        }
    };

    const handleInputChange = (receiverId, value) => {
        setMessages((prev) => ({
            ...prev,
            [receiverId]: { ...prev[receiverId], input: value },
        }));

        notifyTyping(receiverId, "typing");

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            notifyTyping(receiverId, "stopped");
        }, 3000);
    };

    const handleSendMessage = (receiverId, senderName) => {
        const content = messages[receiverId]?.input || "";
        if (!content.trim()) return;

        const encryptedData = sessionStorage.getItem('user');
        if (!encryptedData) {
            alert('No authentication token found.');
            return;
        }

        const decryptedData = JSON.parse(
            CryptoJS.AES.decrypt(encryptedData, 'your-secret-key').toString(CryptoJS.enc.Utf8)
        );

        const role = decryptedData.role;

        const message = {
            senderId: "admin",
            senderName,
            content,
            receiverId,
            role,
            seen: false, // initially not seen
        };

        if (clientRef.current) {
            clientRef.current.publish({
                destination: "/app/sendMessage",
                body: JSON.stringify(message),
            });

            notifyTyping(receiverId, "stopped");
        }

        setMessages((prev) => ({
            ...prev,
            [receiverId]: {
                ...prev[receiverId],
                input: "",
                chat: [...(prev[receiverId]?.chat || []), { sender: senderName, content, seen: false }],
            },
        }));
    };

    const markMessagesAsSeen = (userId) => {
        // Admin viewing messages sent by userId. We notify them that we have seen their messages.
        // Typically, you'd know which messages you've just "seen" if you track message IDs.
        // Here, we'll assume all messages from that user are now seen.
        // We'll send a seen event for each message that isn't seen yet.
        const userMessages = messages[userId]?.chat || [];
        const unseenMessages = userMessages.filter(msg => !msg.seen && msg.sender !== 'Admin');

        if (unseenMessages.length > 0) {
            unseenMessages.forEach((msg) => {
                const seenMessage = {
                    senderId: userId,    // original sender of the message
                    receiverId: "admin", // admin is the receiver who just saw it
                    seen: true,
                    // If you had messageId, include it here.
                };

                if (clientRef.current && clientRef.current.connected) {
                    clientRef.current.publish({
                        destination: '/app/seen',
                        body: JSON.stringify(seenMessage),
                    });
                }
            });

            // Update the local state to reflect that these messages are now seen
            setMessages((prev) => ({
                ...prev,
                [userId]: {
                    ...prev[userId],
                    chat: userMessages.map(msg =>
                        msg.sender !== 'Admin' ? { ...msg, seen: true } : msg
                    ),
                },
            }));
        }
    };

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const encryptedData = sessionStorage.getItem('user');
                if (!encryptedData) {
                    setError('No authentication token found.');
                    return;
                }

                const decryptedData = JSON.parse(
                    CryptoJS.AES.decrypt(encryptedData, 'your-secret-key').toString(CryptoJS.enc.Utf8)
                );

                const token = decryptedData.jwtToken;

                const response = await fetch('http://localhost:8080/clients/all', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setClients(data);
                } else {
                    setError('Failed to fetch clients.');
                }
            } catch (err) {
                console.error('Error occurred while fetching clients:', err);
                setError('An error occurred while fetching clients.');
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8083/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket');

                client.subscribe('/topic/notifications', (message) => {
                    setNotifications((prev) => [...prev, message.body]);
                });

                const typingTimeouts = {}; // Object to hold typing timeout references

                clients.forEach((clientItem) => {
                    // Subscribe to messages from each client
                    client.subscribe(`/topic/messages/${clientItem.id}`, (message) => {
                        const parsedMessage = JSON.parse(message.body);

                        setMessages((prev) => ({
                            ...prev,
                            [parsedMessage.senderId]: {
                                ...prev[parsedMessage.senderId],
                                chat: [
                                    ...(prev[parsedMessage.senderId]?.chat || []),
                                    { sender: parsedMessage.senderName, content: parsedMessage.content, seen: parsedMessage.seen || false },
                                ],
                            },
                        }));

                        // Immediately mark them as seen if the chat tab is open (admin sees it right away)
                        // This can be refined based on actual user interactions.
                        if (chatTabs.find(tab => tab.id === parsedMessage.senderId)) {
                            markMessagesAsSeen(parsedMessage.senderId);
                        }
                    });

                    // Subscribe to typing notifications
                    client.subscribe(`/topic/typing/${clientItem.id}`, (message) => {
                        const typingStatus = message.body;

                        setMessages((prev) => ({
                            ...prev,
                            [clientItem.id]: {
                                ...prev[clientItem.id],
                                typingStatus: typingStatus.includes('Admin') ? '' : typingStatus,
                            },
                        }));

                        if (typingTimeouts[clientItem.id]) {
                            clearTimeout(typingTimeouts[clientItem.id]);
                        }

                        typingTimeouts[clientItem.id] = setTimeout(() => {
                            setMessages((prev) => ({
                                ...prev,
                                [clientItem.id]: {
                                    ...prev[clientItem.id],
                                    typingStatus: '',
                                },
                            }));
                        }, 3000);
                    });

                    // Subscribe to seen notifications
                    // Subscribe to seen notifications
                    // Subscribe to seen notifications
                    client.subscribe(`/topic/seen/${clientItem.id}`, (message) => {
                        const seenMessage = JSON.parse(message.body);
                        // Update the local state so that the corresponding messages are marked as seen
                        setMessages((prev) => {
                            const userChats = prev[seenMessage.senderId]?.chat || [];
                            return {
                                ...prev,
                                [seenMessage.senderId]: {
                                    ...prev[seenMessage.senderId],
                                    // Flip the condition here:
                                    chat: userChats.map(msg =>
                                        msg.sender === 'Admin' ? { ...msg, seen: true } : msg
                                    )
                                },
                            };
                        });
                    });
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
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
    }, [clients, chatTabs]);

    if (loading) {
        return <p>Loading clients...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>All Registered Clients</h1>
            <Link to="/admin/allusers/insertuser">
                <button style={styles.insertButton}>Insert User</button>
            </Link>

            <div style={styles.notifications}>
                <h2>Notifications</h2>
                <div style={styles.notificationsList}>
                    {notifications.length === 0 ? (
                        <p style={styles.noNotifications}>No notifications yet.</p>
                    ) : (
                        notifications.map((notif, index) => (
                            <div key={index} style={styles.notification}>
                                {notif}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <table border="1" style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                <tr>
                    <th>User ID</th>
                    <th>Role</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Date of Birth</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {clients.map((client) => (
                    <tr key={client.id}>
                        <td>{client.id}</td>
                        <td>{client.role}</td>
                        <td>{client.firstName}</td>
                        <td>{client.lastName}</td>
                        <td>{client.email}</td>
                        <td>{client.phoneNumber}</td>
                        <td>{client.dateOfBirth}</td>
                        <td>
                            <button onClick={() => handleUpdate(client)}>Update</button>
                            <button onClick={() => handleDelete(client.id)}>Delete</button>
                            <button onClick={() => handleChatOpen(client)}>Chat</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div style={styles.chatTabs}>
                {chatTabs.map((tab) => (
                    <div key={tab.id} style={styles.chatTab}>
                        <h3>Chat with {tab.firstName} {tab.lastName}</h3>
                        <div style={styles.chatMessages}>
                            {messages[tab.id]?.chat?.map((msg, index) => (
                                <div key={index} style={styles.chatMessage}>
                                    <strong>{msg.sender}:</strong> {msg.content}
                                    {msg.seen && <span style={{ color: 'blue', marginLeft: '10px' }}>(Seen)</span>}
                                </div>
                            ))}
                        </div>
                        {messages[tab.id]?.typingStatus && (
                            <p style={{ color: 'green', fontStyle: 'italic' }}>
                                {messages[tab.id]?.typingStatus}
                            </p>
                        )}
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={messages[tab.id]?.input || ""}
                            onChange={(e) => handleInputChange(tab.id, e.target.value)}
                            style={styles.chatInput}
                            onFocus={() => markMessagesAsSeen(tab.id)}
                        />
                        <button onClick={() => handleSendMessage(tab.id, "Admin")} style={styles.sendButton}>
                            Send
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    insertButton: {
        marginBottom: '20px',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    notifications: {
        margin: '20px 0',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
    },
    chatTabs: {
        marginTop: '20px',
    },
    chatTab: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f9f9f9',
    },
    chatMessages: {
        maxHeight: '200px',
        overflowY: 'scroll',
        marginBottom: '10px',
    },
    chatMessage: {
        marginBottom: '5px',
    },
    chatInput: {
        width: '80%',
        marginRight: '10px',
    },
    sendButton: {
        padding: '10px',
    },
};

export default AllUsers;
