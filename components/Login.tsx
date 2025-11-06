import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    
    const [email, setEmail] = useState('ibrahim.diallo@example.com');
    const [password, setPassword] = useState('password');
    
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (email === 'ibrahim.diallo@example.com' && password === 'password') {
            onLogin();
        } else {
            setError('Email ou mot de passe incorrect.');
        }
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        alert(`Compte créé pour ${name} ! Vous pouvez maintenant vous connecter.`);
        setAuthMode('login');
        setName('');
        setConfirmPassword('');
        setPassword('');
    };

    const toggleAuthMode = () => {
        setError('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    };
    
    const inputStyle = "w-full p-3 mt-1 bg-gray-700 border-gray-600 rounded-lg text-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition";
    const buttonStyle = "w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-lg font-semibold transition duration-300 shadow-md";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-900">
        <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-lg p-8 space-y-6 shadow-2xl">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white">IBRA-COMPTA</h1>
                <p className="text-gray-400 mt-2">
                    {authMode === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte'}
                </p>
            </div>

            {authMode === 'login' ? (
                 <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-gray-400 block">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={inputStyle}
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
                            className={inputStyle}
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className={buttonStyle}
                        >
                            Connexion
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="text-sm font-bold text-gray-400 block">Nom complet</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-email" className="text-sm font-bold text-gray-400 block">Email</label>
                        <input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-password"  className="text-sm font-bold text-gray-400 block">Mot de passe</label>
                        <input
                            id="signup-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password"  className="text-sm font-bold text-gray-400 block">Confirmer le mot de passe</label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={inputStyle}
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className={`${buttonStyle} mt-2`}
                        >
                            Créer un compte
                        </button>
                    </div>
                </form>
            )}
            
            <div className="text-center pt-2">
                <button onClick={toggleAuthMode} className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
                    {authMode === 'login' ? "Vous n'avez pas de compte ? S'inscrire" : "Vous avez déjà un compte ? Se connecter"}
                </button>
            </div>

        </div>
    </div>
  );
};

export default Login;
