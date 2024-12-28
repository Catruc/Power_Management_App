import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Line, Bar } from 'react-chartjs-2';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import CryptoJS from "crypto-js";

// Register chart.js modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ConsumptionManager = () => {
    const { connectionId } = useParams();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hourlyData, setHourlyData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [chartType, setChartType] = useState('line');

    // WebSocket setup and alert handling
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8082/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                const topic = `/topic/alerts/${connectionId}`;
                client.subscribe(topic, (message) => {
                    setAlerts((prevAlerts) => [...prevAlerts, message.body]);
                });
            },
            debug: (str) => {
                console.log(str);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [connectionId]);


    // Fetch data function wrapped in useCallback
    const fetchData = useCallback(async () => {
        const formattedSelectedDate = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;

        try {
            // Retrieve and decrypt the JWT token
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

            // Make the API call with the Authorization header
            const response = await fetch(`http://localhost:8082/monitoring/date-monitoring`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    connectionId,
                    date: formattedSelectedDate,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Fetched hourly data:', data);
                setHourlyData(data);
            } else {
                console.error('Error fetching data:', response.status);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [selectedDate, connectionId]);


    // Fetch data initially and at regular intervals
    useEffect(() => {
        fetchData();

        const intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds
        return () => clearInterval(intervalId);
    }, [fetchData]);

    // Prepare data for chart
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const consumptionValues = hours.map(hour => {
        const record = hourlyData.find(data => new Date(`1970-01-01T${data.time}`).getHours() === hour);
        return record ? record.hourlyConsumption : 0;
    });

    const chartData = {
        labels: hours.map(hour => `${hour}:00`),
        datasets: [
            {
                label: 'Energy Consumption (kWh)',
                data: consumptionValues,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    return (
        <div>
            <h1>Consumption Details for Connection ID: {connectionId}</h1>
            <div>
                <label>Select Date: </label>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                />
            </div>
            <div style={{ marginTop: '20px' }}>
                <button onClick={() => setChartType('line')}>Line Chart</button>
                <button onClick={() => setChartType('bar')}>Bar Chart</button>
            </div>
            <div style={{ marginTop: '20px' }}>
                {chartType === 'line' ? (
                    <Line data={chartData} options={{ scales: { y: { beginAtZero: true } } }} />
                ) : (
                    <Bar data={chartData} options={{ scales: { y: { beginAtZero: true } } }} />
                )}
            </div>
            <div style={{ marginTop: '20px' }}>
                <h2>Alerts</h2>
                <ul>
                    {alerts.map((alert, index) => (
                        <li key={index}>{alert}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ConsumptionManager;
