import React from "react";
import "./App.css";

function App() {
    return (
        <div className="container">
            <img
                src="https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=400&q=80"

                alt="Laptop with Tea"
                className="hero-image"
            />
            <h1>🚀 Application Successfully Deployed on Amazon EKS</h1>
            <p>
                This React frontend is containerized using Docker and deployed on
                Kubernetes (Amazon EKS).
            </p>
            <p>
                The backend uses PostgreSQL deployed via Helm with persistent storage.
            </p>
        </div>
    );
}

export default App;
