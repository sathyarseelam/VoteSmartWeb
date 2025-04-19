import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import Header from "@/components/header";
const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard'); // Redirect to dashboard or desired page
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="text-center">
            <Header />
            <br />
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">

          <h2 className="text-2xl font-bold mb-2">Log In</h2>
          <div className="mb-6 text-left">
            <label htmlFor="firstName" className="block mb-2 font-medium">First Name</label>
            <Input
            type="email"
            id="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="mb-6 text-left">
            <label htmlFor="firstName" className="block mb-2 font-medium">First Name</label>
            <Input
            type="password"
            id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <br />
          <button
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-white rounded"
            >
                Login
            </button>
          </div>

        </div>
      );

};

export default Login;