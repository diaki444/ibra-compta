import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('ibrahim.diallo@example.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        if (email === 'ibrahim.diallo@example.com' && password === 'password') {
            onLogin();
        } else {
            setError('Email ou mot de passe incorrect.');
        }
    };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-8 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-red-500">IBRA-COMPTA</h1>
                <p className="text-gray-400 mt-2">Connectez-vous à votre espace</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="email" className="text-sm font-bold text-gray-400 block">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 mt-1 bg-gray-700 rounded-md border border-gray-600 focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                    />
                </div>
                <div>
                    <label htmlFor="password"  className="text-sm font-bold text-gray-400 block">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 mt-1 bg-gray-700 rounded-md border border-gray-600 focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                    />
                </div>
                 {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 rounded-md text-white text-lg font-semibold transition duration-300"
                    >
                        Connexion
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default Login;
