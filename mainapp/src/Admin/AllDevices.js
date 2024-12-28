import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";

function AllDevices() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch devices from the backend when the component mounts
        const fetchDevices = async () => {
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
                const response = await fetch('http://localhost:8081/devices/all', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                console.log('Request Headers:', {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                });
                console.log('Response Status:', response.status);


                if (response.ok) {
                    const data = await response.json();
                    setDevices(data);
                } else {
                    setError('Failed to fetch devices.');
                }
            } catch (err) {
                console.error('Error occurred while fetching devices:', err);
                setError('Error occurred while fetching devices.');
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);


    const handleDelete = async (id) => {
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

            // Make the DELETE API call with the Authorization header
            const response = await fetch(`http://localhost:8081/devices/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Remove the device from the state after successful deletion
                setDevices(devices.filter(device => device.id !== id));
                alert('Device deleted successfully');
            } else {
                alert('Failed to delete device');
            }
        } catch (err) {
            console.error('Error deleting device:', err);
            alert('An error occurred while deleting the device');
        }
    };


    const handleUpdate = (device) => {
        // Navigate to the update form with the selected device's data
        navigate('/admin/alldevices/updatedevice', { state: { device } });
    };

    const handleMakeConnection = (device) => {
        // Navigate to the create connection form with the selected device's id
        navigate('/admin/alldevices/createconnection', { state: { deviceId: device.id } });
    };

    if (loading) {
        return <p>Loading devices...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h1>All Registered Devices</h1>
            <Link to="/admin/alldevices/insertdevice">
                <button style={styles.insertButton}>Insert Device</button>
            </Link>
            <table border="1" style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                <tr>
                    <th>Description</th>
                    <th>Address</th>
                    <th>Consumption</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {devices.map((device) => (
                    <tr key={device.id}>
                        <td>{device.description}</td>
                        <td>{device.address}</td>
                        <td>{device.consumption}</td>
                        <td>
                            <button onClick={() => handleUpdate(device)}>Update</button>
                            <button onClick={() => handleDelete(device.id)}>Delete</button>
                            <button onClick={() => handleMakeConnection(device)}>Make Connection</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
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
    }
};

export default AllDevices;
