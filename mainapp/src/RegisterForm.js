import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterForm() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        role: 'User', // Default role set to "User"
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
            const response = await fetch('http://localhost:8080/clients/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const message = await response.text();
                alert(message);
                navigate('/login'); // Redirect to login page upon successful registration
            } else {
                const errorMessages = await response.json(); // Expecting an array of error messages
                setErrorMessages(errorMessages);
            }
        } catch (error) {
            setErrorMessages(['An error occurred. Please try again.']);
        }
    };

    return (
        <div style={styles.appContainer}>
            {/* Navbar */}
            <nav style={styles.navbar}>
                <h1 style={styles.brand}>Device Manager App</h1>
                <div style={styles.navLinks}>
                    <Link to="/" style={styles.navButton}>Home</Link>
                    <Link to="/about" style={styles.navButton}>About</Link>
                    <Link to="/login" style={styles.navButton}>Login</Link>
                </div>
            </nav>

            <div style={styles.formContainer}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <h1 style={styles.formTitle}>Register</h1>

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

                    {/* Error Messages */}
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

                    <button type="submit" style={styles.button}>Register</button>
                </form>
            </div>
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
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: '10px 20px',
        color: '#fff',
    },
    brand: {
        fontSize: '1.5em',
        fontWeight: 'bold',
    },
    navLinks: {
        display: 'flex',
        gap: '20px',
    },
    navButton: {
        textDecoration: 'none',
        color: '#fff',
        fontSize: '1em',
        padding: '10px 20px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '5px',
        transition: 'background-color 0.3s ease',
        cursor: 'pointer',
    },
    formContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 60px)', // Exclude navbar height
        backgroundColor: '#f4f4f4',
    },
    form: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
        width: '400px',
        textAlign: 'center',
    },
    formTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: '#333',
    },
    inputGroup: {
        marginBottom: '20px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '14px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        outline: 'none',
        backgroundColor: '#f9f9f9',
    },
    errorMessageContainer: {
        color: 'red',
        marginBottom: '20px',
        textAlign: 'left',
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
        transition: 'background-color 0.3s ease',
    },
};

export default RegisterForm;
