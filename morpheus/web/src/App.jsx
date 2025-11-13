import { useState, useEffect } from 'react';
import reactLogo from '@/assets/react.svg';
import viteLogo from '/vite.svg';
import '@/App.css';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // The proxy is set up for '/api'. We are calling an endpoint on the safewalk server.
        // You might need to change '/api/hello' to an actual endpoint that exists on your safewalk server.
        fetch('/api/hello')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text(); // or response.json() if it returns JSON
            })
            .then((data) => {
                setMessage(data);
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                setMessage(`Error fetching data from safewalk: ${error.message}. Check the browser console and ensure the safewalk server has a GET endpoint at /hello.`);
            });
    }, []); // The empty dependency array ensures this effect runs only once when the component mounts.

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <h2>Message from Safewalk Backend:</h2>
                <p>{message || 'Loading...'}</p>
            </div>
            <p className="read-the-docs">
                This page is now fetching data from your safewalk backend via the Vite proxy.
            </p>
        </>
    );
}

export default App;