import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import CryptoJS from 'crypto-js';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser, handleLogout } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Attempting login with API URL:", process.env.REACT_APP_USER_API_URL);
        try {
            const response = await fetch(`http://localhost:8080/clients/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text(); // Fetch any error details
                console.error("Login failed. Response:", errorText);
                setErrorMessage("Login failed. Please check your credentials.");
                return;
            }

            const data = await response.json();
            console.log('Login response data:', data);

            if (data.jwtToken) {
                // Save token and user data in sessionStorage
                const userData = {
                    userId: data.id,
                    name: data.name,
                    role: data.role,
                    jwtToken: data.jwtToken, // Include the token
                };

                // Encrypt the user data
                const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(userData), 'your-secret-key').toString();

                // Store in sessionStorage
                sessionStorage.setItem('user', encryptedData);

                // Update the global user state
                setUser(userData);

                // Navigate based on role
                data.role === 'Admin' ? navigate('/admin') : navigate('/');
            } else {
                setErrorMessage('JWT Token missing in response.');
            }
        } catch (error) {
            console.error("Error during login request:", error);
            setErrorMessage('An error occurred during login. Please try again.');
        }
    };






    return (
        <div style={styles.appContainer}>
            <nav style={styles.navbar}>
                <h1 style={styles.brand}>Device Manager App</h1>
                <div style={styles.navLinks}>
                    <Link to="/" style={styles.navButton}>Home</Link>
                    <Link to="/about" style={styles.navButton}>About</Link>
                    {user ? (
                        <>
                            <span style={styles.navButton}>Welcome, {user.name}</span>
                            <button onClick={handleLogout} style={styles.navButton}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            {location.pathname !== '/login' && (
                                <Link to="/login" style={styles.navButton}>
                                    Login
                                </Link>
                            )}
                            <Link to="/signup" style={styles.navButton}>Sign Up</Link>
                        </>
                    )}
                </div>
            </nav>

            {!user && (
                <div style={styles.container}>
                    <form onSubmit={handleLogin} style={styles.form}>
                        <h1 style={styles.formTitle}>LOGIN</h1>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        <button type="submit" style={styles.button}>Login</button>
                    </form>
                </div>
            )}
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
    },
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 60px)',  // Exclude the navbar height
        backgroundColor: '#fff',
    },
    form: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
        width: '350px',
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

export default LoginForm;
