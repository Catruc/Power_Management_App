import React, { useState, useEffect } from 'react';
import CryptoJS from "crypto-js";

function AllConnections() {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch connections from the backend when the component mounts
        const fetchConnections = async () => {
            try {
                // Retrieve and decrypt the JWT token
                const encryptedData = sessionStorage.getItem('user');
                if (!encryptedData) {
                    setError('No authentication token found.');
                    return;
                }

                const decryptedData = JSON.parse(
                    CryptoJS.AES.decrypt(encryptedData, 'your-secret-key').toString(CryptoJS.enc.Utf8)
                );

                const token = decryptedData.jwtToken;

                // Make the API call with the Authorization header
                const response = await fetch('http://localhost:8081/connections/all', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the token
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setConnections(data);
                } else {
                    setError('Failed to fetch connections.');
                }
            } catch (err) {
                console.error('Error occurred while fetching connections:', err);
                setError('Error occurred while fetching connections.');
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, []);


    // Function to delete a connection
    const deleteConnection = async (id) => {
        try {
            // Retrieve and decrypt the JWT token
            const encryptedData = sessionStorage.getItem('user');
            if (!encryptedData) {
                setError('No authentication token found.');
                return;
            }

            const decryptedData = JSON.parse(
                CryptoJS.AES.decrypt(encryptedData, 'your-secret-key').toString(CryptoJS.enc.Utf8)
            );

            const token = decryptedData.jwtToken;

            // Make the DELETE API call with the Authorization header
            const response = await fetch(`http://localhost:8081/connections/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Remove the connection from the state after successful deletion
                setConnections(connections.filter(connection => connection.id !== id));
            } else {
                setError('Failed to delete the connection.');
            }
        } catch (err) {
            console.error('Error occurred while deleting the connection:', err);
            setError('Error occurred while deleting the connection.');
        }
    };


    if (loading) {
        return <p>Loading connections...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>All Connections</h1>
            <table border="1" style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                <tr>
                    <th>Connection ID</th>
                    <th>User ID</th>
                    <th>Device ID</th>
                    <th>Description</th>
                    <th>Address</th>
                    <th>Consumption</th>
                    <th>Actions</th>
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
                            <button onClick={() => deleteConnection(connection.id)}>
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AllConnections;
