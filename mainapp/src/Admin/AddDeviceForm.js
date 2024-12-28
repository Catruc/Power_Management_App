import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";

function AddDeviceForm() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        description: '',
        address: '',
        consumption: '',
    });

    const [errorMessages, setErrorMessages] = useState([]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Retrieve and decrypt the JWT token
            const encryptedData = sessionStorage.getItem('user');
            if (!encryptedData) {
                setErrorMessages(['No authentication token found.']);
                return;
            }

            const decryptedData = JSON.parse(
                CryptoJS.AES.decrypt(encryptedData, 'your-secret-key').toString(CryptoJS.enc.Utf8)
            );

            const token = decryptedData.jwtToken;

            // Make the API call with the Authorization header
            const response = await fetch('http://localhost:8081/devices/insert', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const message = await response.text();
                alert(message);
                navigate('/admin/alldevices'); // Redirect to All Devices page after successful insertion
            } else {
                const errorMessages = await response.json(); // Expecting an array of error messages
                setErrorMessages(errorMessages);
            }
        } catch (error) {
            console.error('Error during device insertion request:', error);
            setErrorMessages(['An error occurred. Please try again.']);
        }
    };


    return (
        <div style={styles.appContainer}>
            <h1 style={styles.formTitle}>Insert New Device</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Description Input */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Description</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                {/* Address Input */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                {/* Consumption Input */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Consumption</label>
                    <input
                        type="number"
                        name="consumption"
                        value={formData.consumption}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                {errorMessages.length > 0 && (
                    <div style={styles.errorMessageContainer}>
                        <ul>
                            {errorMessages.map((message, index) => (
                                <li key={index} style={styles.errorMessage}>
                                    {message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button type="submit" style={styles.button}>Insert Device</button>
            </form>
        </div>
    );
}

const styles = {
    appContainer: {
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        backgroundColor: '#fff',
        height: '100vh',
    },
    formTitle: {
        fontSize: '28px',
        marginBottom: '20px',
    },
    form: {
        padding: '40px',
        width: '400px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '5px',
        border: '1px solid #ddd',
    },
    errorMessageContainer: {
        color: 'red',
        marginBottom: '20px',
    },
    errorMessage: {
        fontSize: '14px',
        marginBottom: '5px',
    },
    button: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px',
    },
};

export default AddDeviceForm;
