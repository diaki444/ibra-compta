import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
  onSignUp: (name: string, email: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignUp }) => {
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = onLogin(email, password);
        if (!success) {
            setError('Email ou mot de passe incorrect.');
        }
    };

    const handleSignUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (!name.trim()) {
            setError('Le nom est requis.');
            return;
        }
        const success = onSignUp(name, email, password);
        if (success) {
            alert(`Compte créé pour ${name} ! Vous pouvez maintenant vous connecter.`);
            toggleAuthMode();
        } else {
            setError('Un compte avec cet email existe déjà.');
        }
    };

    const toggleAuthMode = () => {
        setError('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setEmail('');
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
                 <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-gray-400 block">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="votre@email.com"
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
                            placeholder="••••••••"
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
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="text-sm font-bold text-gray-400 block">Nom complet</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Ibrahim Diallo"
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
                            placeholder="votre@email.com"
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
                            placeholder="••••••••"
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
                            placeholder="••••••••"
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
