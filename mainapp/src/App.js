// App.js
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext'; // Adjust the path as needed
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import LoginForm from './LoginForm';  // Import LoginForm component
import AdminPage from './Admin/AdminPage';
import RegisterForm from './RegisterForm';
import ManageDevices from './ManageDevices';
import CryptoJS from 'crypto-js';
import LogoutRedirect from './LogoutRedirect';
import AllUsers from "./Admin/AllUsers";
import AddUserForm from "./Admin/AddUserForm";
import UpdateUserForm from "./Admin/UpdateUserForm";
import AllDevices from "./Admin/AllDevices";
import AddDeviceForm from "./Admin/AddDeviceForm";
import UpdateDeviceForm from "./Admin/UpdateDeviceForm";
import CreateConnectionNew from './Admin/CreateConnectionNew';
import AllConnections from './Admin/AllConnections';
import ConsumptionManager from "./ConsumptionManager";
import ChatPage from './ChatPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    try {
      // Check if user is stored in sessionStorage instead of localStorage
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        // Decrypt the AES-encrypted user data
        const decryptedBytes = CryptoJS.AES.decrypt(storedUser, 'your-secret-key');
        const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

        // Parse the decrypted JSON string
        const parsedUser = JSON.parse(decryptedData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error decrypting or parsing user from sessionStorage:', error);
      sessionStorage.removeItem('user'); // Clear invalid data if decryption or parsing fails
    } finally {
      setLoading(false);
    }
  }, []);



  // Centralized logout function
  const handleLogout = () => {
    sessionStorage.removeItem('user');  // Clear from sessionStorage
    setUser(null);
  };


  // Render a loading message or spinner while user data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
      <AuthContext.Provider value={{ user, setUser, handleLogout }}>
        <Router>
          <Routes>
            {/* Home page route with navbar and background */}
            <Route
                exact
                path="/"
                element={
                  <div style={styles.appContainer}>
                    {/* Navbar */}
                    <nav style={styles.navbar}>
                      <h1 style={styles.brand}>Device Manager App</h1>
                      <div style={styles.navLinks}>
                        <Link to="/" style={styles.navButton}>Home</Link>
                        <Link to="/about" style={styles.navButton}>About</Link>
                        {user ? (
                            <>
                              <span style={styles.navButton}>Welcome, {user.name}</span>

                              {/* Show "Administrate" button only for Admins */}
                              {user.role === 'Admin' && (
                                  <Link to="/admin" style={styles.navButton}>Administrate</Link>
                              )}

                              {/* Show "Manage Devices" button only for Users */}
                              {user.role === 'User' && (
                                  <Link to="/managedevices" style={styles.navButton}>Manage Devices</Link>

                              )}

                                {/* Show "Chat to Admin" button only for Users */}
                                {user.role === 'User' && (
                                    <Link to="/chattoadmin" style={styles.navButton}>Chat to Admin</Link>
                                )}

                              <button onClick={handleLogout} style={styles.navButton}>Logout</button>
                            </>
                        ) : (
                            <>
                              <Link to="/login" style={styles.navButton}>Login</Link>
                              <Link to="/register" style={styles.navButton}>Sign Up</Link>
                            </>
                        )}
                      </div>
                    </nav>

                    {/* Background Image Container */}
                    <div style={styles.pageContainer}>
                      <div style={styles.homeContent}>
                        <h1>Welcome to the Device Manager App</h1>
                        <p>Manage your devices with ease.</p>
                      </div>
                    </div>
                  </div>
                }
            />

            {/* Login page without navbar */}
            <Route exact path="/login" element={<LoginForm />} />
            <Route exact path="/register" element={<RegisterForm />} />

            {/* Admin page */}
            <Route
                path="/admin"
                element={
                  user && user.role === 'Admin' ? (
                      <AdminPage />
                  ) : (
                      <LogoutRedirect handleLogout={handleLogout} />
                  )
                }
            />

            <Route
                path="/managedevices"
                element={
                  user && user.role === 'User' ? (
                      <ManageDevices />
                  ) : (
                      <LogoutRedirect handleLogout={handleLogout} />
                  )
                }
            />

            <Route
                path="/admin/allusers"
                element={
                  user && user.role === 'Admin' ? (<AllUsers />
                  ) : (
                  <Navigate to="/" />  // Redirect to home if not an admin
                  )
                }
            />

            <Route
                path="/admin/allusers/insertuser"
                element={
                  user && user.role === 'Admin' ? (
                      <AddUserForm />
                  ) : (
                      <Navigate to="/" />  // Redirect to home if not an admin
                  )
                }
            />

            <Route
                path="/admin/allusers/updateuser"
                element={
                  user && user.role === 'Admin' ? (
                      <UpdateUserForm />
                  ) : (
                      <Navigate to="/" />  // Redirect to home if not an admin
                  )
                }
            />

            <Route
              path="admin/alldevices"
              element={
                user && user.role === 'Admin' ? (<AllDevices />
                ) : (
                    <Navigate to="/" />
                )
              }
            />

            <Route
                path="/admin/alldevices/insertdevice"
                element={
                  user && user.role === 'Admin' ? (
                      <AddDeviceForm />
                  ) : (
                      <Navigate to="/" />
                  )
                }
            />

            <Route
                path="/admin/alldevices/updatedevice"
                element={
                  user && user.role === 'Admin' ? (
                      <UpdateDeviceForm />
                  ) : (
                      <Navigate to="/" />
                  )
                }
            />

            <Route
                path="/admin/alldevices/createconnection"
                element={
                   user && user.role === 'Admin' ? (
                          <CreateConnectionNew />
                      ) : (
                          <Navigate to="/" />
                      )
                  }
              />

              <Route
                  path="/admin/allconnections"
                  element={
                      user && user.role === 'Admin' ? (
                          <AllConnections />
                      ) : (
                          <Navigate to="/" />
                      )
                  }
              />

              <Route
                  path="/managedevices/consumption-manager/:connectionId"
                  element={
                      user && user.role === 'User' ? (
                          <ConsumptionManager />
                      ) : (
                          <LogoutRedirect handleLogout={handleLogout} />
                      )
                  }
              />

              <Route
                  path="/chattoadmin"
                  element={
                      user && user.role === 'User' ? (
                          <ChatPage />
                      ) : (
                          <LogoutRedirect handleLogout={handleLogout} />
                      )
                  }
              />


            {/* Redirect all other paths to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
  );
}




const styles = {
  appContainer: {
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    backgroundColor: '#fff',
    height: 'auto',
    minHeight: '100vh',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: '10px 20px',
    color: '#fff',
    zIndex: 1,
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
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'calc(100vh - 60px)',  // Adjust height to exclude navbar height
    backgroundImage: 'url("https://www.rajstartup.com/productImage/Energy%20Management%20(1).jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  homeContent: {
    textAlign: 'center',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay to make text readable
    padding: '20px',
    borderRadius: '10px',
  },
};

export default App;
