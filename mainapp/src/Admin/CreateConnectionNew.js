// CreateConnectionNew.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";

function CreateConnectionNew() {
    const location = useLocation();
    const navigate = useNavigate();
    const { deviceId } = location.state || {}; // Get deviceId from the navigation state

    const [copyUserId, setCopyUserId] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const connectionData = {
            copyUserId: copyUserId,
            deviceId: deviceId,
        };

        try {
            // Retrieve and decrypt the JWT token
            const encryptedData = sessionStorage.getItem('user');
            if (!encryptedData) {
                alert('No authentication token found.');
                return;
            }

            const decryptedData = JSON.parse(
                CryptoJS.AES.decrypt(encryptedData, 'your-secret-key').toString(CryptoJS.enc.Utf8)
            );

            const token = decryptedData.jwtToken;

            // Make the POST API call with the Authorization header
            const response = await fetch('http://localhost:8081/connections/insert', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(connectionData),
            });

            if (response.ok) {
                alert('Connection created successfully');
                navigate('/admin/alldevices'); // Navigate back to all devices page
            } else {
                alert('Failed to create connection');
            }
        } catch (error) {
            console.error('Error creating connection:', error);
            alert('An error occurred while creating the connection');
        }
    };


    return (
        <div>
            <h1>Create Connection</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Device ID:</label>
                    <input type="text" value={deviceId} readOnly />
                </div>
                <div>
                    <label>User ID:</label>
                    <input
                        type="text"
                        value={copyUserId}
                        onChange={(e) => setCopyUserId(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create Connection</button>
            </form>
        </div>
    );
}

export default CreateConnectionNew;
