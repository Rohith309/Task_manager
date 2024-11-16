import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';
import axios from 'axios';
import './App.css';


axios.defaults.baseURL = 'http://localhost:8000/api/users';
axios.defaults.withCredentials = true;

axios.interceptors.request.use(
    config => {
        if (!config.url.endsWith('/')) {
            config.url += '/';
        }
     
        const token = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
        if (token) {
            config.headers['X-CSRFToken'] = token.split('=')[1];
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthForm />} />
                <Route 
                    path="/home" 
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;