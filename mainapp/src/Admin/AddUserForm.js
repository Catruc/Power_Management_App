import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";

function AddUserForm() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        role: 'User',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
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
            const response = await fetch('http://localhost:8080/clients/insert', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const message = await response.text();
                alert(message); // Display the success message from the backend

                if (message.includes("Could not add the user in the other microservice")) {
                    // If the message contains the warning, handle it here
                    alert("The user was added, but there was an issue with the other microservice. Sync will be done later.");
                }

                navigate('/admin/allusers'); // Redirect to All Users page after successful insertion

            } else {
                const errorMessages = await response.json(); // Expecting an array of error messages
                setErrorMessages(errorMessages);
            }
        } catch (error) {
            console.error('Error during client insertion request:', error);
            setErrorMessages(['An error occurred. Please try again.']);
        }
    };



    return (
        <div style={styles.appContainer}>
            <h1 style={styles.formTitle}>Insert New User</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Role Selection */}
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        style={styles.input}
                        required // Add required attribute to enforce selection
                    >
                        <option value="">Select a role</option>
                        {/* Prompt user to select */}
                        <option value="User">User</option>
                    </select>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Date of Birth</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
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

                <button type="submit" style={styles.button}>Insert User</button>
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

export default AddUserForm;
