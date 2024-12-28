import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Import AuthContext to access global state

function AdminPage() {
    const navigate = useNavigate();
    const { handleLogout } = useContext(AuthContext); // Get handleLogout from AuthContext

    const handleLogoutClick = async () => {
        try {
            const response = await fetch('http://localhost:8080/clients/logout', {
                method: 'GET',
                credentials: 'include', // Send cookies with the request
            });
            if (response.ok) {
                handleLogout();
                navigate('/');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    console.log("AdminPage rendered"); // Debugging line

    return (
        <div style={styles.container}>
            <nav style={styles.navbar}>
                <h1 style={styles.brand}>Device Manager App</h1>
                <div style={styles.navLinks}>
                    <Link to="/" style={styles.navButton}>Home</Link>
                    <button onClick={handleLogoutClick} style={styles.navButton}>Log Out</button>
                </div>
            </nav>

            <div style={styles.innerContainer}>
                <h1 style={styles.title}>Admin Dashboard</h1>
                <div style={styles.buttonContainer}>
                    <Link to="/admin/alldevices" style={styles.button}>Manage Devices</Link>
                    <Link to="/admin/allusers" style={styles.button}>Manage Users</Link>
                    <Link to="/admin/allconnections" style={styles.button}>Manage Connections</Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
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
        border: 'none',
    },
    innerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        textAlign: 'center',
    },
    title: {
        fontSize: '2em',
        marginBottom: '20px',
    },
    buttonContainer: {
        display: 'flex',
        gap: '20px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '5px',
        fontSize: '1.2em',
        cursor: 'pointer',
    },
};

export default AdminPage;
