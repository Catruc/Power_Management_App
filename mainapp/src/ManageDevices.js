import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import { useNavigate } from 'react-router-dom';

const ManageDevices = () => {
    const [connections, setConnections] = useState([]);
    const navigate = useNavigate();  // Assign useNavigate to a variable

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                // Retrieve and decrypt the user data from sessionStorage
                const storedUser = sessionStorage.getItem('user');
                if (!storedUser) {
                    console.error('No authentication token found.');
                    return;
                }

                const decryptedBytes = CryptoJS.AES.decrypt(storedUser, 'your-secret-key');
                const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
                const parsedUser = JSON.parse(decryptedData);

                console.log('Decrypted User Data:', parsedUser); // Log decrypted user data for debugging

                const token = parsedUser.jwtToken; // Extract the JWT token
                const userId = parsedUser.userId; // Extract the user ID

                if (!userId) {
                    console.error('User ID is undefined.');
                    return;
                }

                // Make the API call with the Authorization header
                const response = await fetch(`http://localhost:8082/connections/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setConnections(data); // Update state with the fetched connections data
                } else {
                    console.error('Error fetching connections:', response.status);
                }
            } catch (error) {
                console.error('An error occurred while fetching connections:', error);
            }
        };

        fetchConnections(); // Call the function to fetch connections when the component is mounted
    }, []);


    const handleCheckConsumption = (connectionId) => {
        navigate(`/managedevices/consumption-manager/${connectionId}`);  // Navigate to ConsumptionManager
    };

    return (
        <div>
            <h1>Manage Devices</h1>
            {connections.length > 0 ? (
                <table border="1" cellPadding="10" cellSpacing="0">
                    <thead>
                    <tr>
                        <th>Connection ID</th>
                        <th>User ID</th>
                        <th>Device ID</th>
                        <th>Description</th>
                        <th>Address</th>
                        <th>Consumption</th>
                    </tr>
                    </thead>
                    <tbody>
                    {connections.map((connection) => (
                        <tr key={connection.id}>
                            <td>{connection.id}</td>
                            <td>{connection.copyUserId}</td>
                            <td>{connection.deviceId}</td>
                            <td>{connection.description}</td>
                            <td>{connection.address}</td>
                            <td>{connection.consumption}</td>
                            <td>
                                <button onClick={() => handleCheckConsumption(connection.id)}>
                                    Check Consumption
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No devices found for this user.</p>
            )}
        </div>
    );
};

export default ManageDevices;
