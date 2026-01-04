import React, { useState } from 'react';
import { Mail, X, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthView = 'select' | 'signin' | 'signup';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { signInWithGoogle, loginWithEmail, signupWithEmail, error, setError, loading } = useAuth();
    const [view, setView] = useState<AuthView>('select');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        setError(null);
        setView('select');
        setEmail('');
        setPassword('');
        onClose();
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            handleClose();
        } catch (e) {
            // Error handled in context
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (view === 'signin') {
                await loginWithEmail(email, password);
            } else {
                await signupWithEmail(email, password);
            }
            handleClose();
        } catch (e) {
            // Error handled in context
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            ></div>

            <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8] opacity-5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {view === 'select' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-slate-400">Choose your preferred sign in method</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleGoogleSignIn}
                                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-slate-100 transition-transform active:scale-[0.98]"
                            >
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </button>

                            <button
                                onClick={() => setView('signin')}
                                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-transform active:scale-[0.98]"
                            >
                                <Mail className="w-5 h-5" />
                                <span>Continue with Email</span>
                            </button>
                        </div>
                    </div>
                )}

                {(view === 'signin' || view === 'signup') && (
                    <form onSubmit={handleEmailAuth} className="space-y-6 animate-fade-in">
                        <div className="flex items-center mb-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setView('select');
                                    setError(null);
                                }}
                                className="mr-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-bold text-white">
                                {view === 'signin' ? 'Sign In' : 'Create Account'}
                            </h2>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex items-start gap-2">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent transition-all"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent transition-all"
                                    placeholder="Enter your password"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#38BDF8] text-[#020712] rounded-xl font-bold hover:bg-[#0EA5E9] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <span>{view === 'signin' ? 'Sign In' : 'Create Account'}</span>
                            )}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setView(view === 'signin' ? 'signup' : 'signin');
                                    setError(null);
                                }}
                                className="text-sm text-slate-400 hover:text-[#38BDF8] transition-colors"
                            >
                                {view === 'signin' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
