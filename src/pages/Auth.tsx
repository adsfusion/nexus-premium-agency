import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { TerminalSquare, Mail, Lock, Loader2, LogIn } from 'lucide-react';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMSG, setErrorMSG] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMSG('');

        let finalEmail = email;
        let finalPassword = password;

        // Admin shortcut handling
        if (email.trim().toLowerCase() === 'admin' && password.trim().toLowerCase() === 'admin') {
            finalEmail = 'admin@nexus.com';
            finalPassword = 'admin123456';
        }

        try {
            if (isLogin) {
                const { data: authData, error } = await supabase.auth.signInWithPassword({ email: finalEmail, password: finalPassword });
                if (error) throw error;

                if (authData?.user) {
                    const { data: profileData } = await supabase.from('profiles').select('is_admin').eq('id', authData.user.id).single();
                    if (profileData?.is_admin) {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                }
            } else {
                const { error, data } = await supabase.auth.signUp({ email: finalEmail, password: finalPassword });
                if (error) throw error;
                if (data.user) {
                    navigate('/onboarding');
                }
            }
        } catch (error: any) {
            setErrorMSG(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7C3AED]/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                <Link to="/" className="flex items-center justify-center gap-2 mb-10 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <TerminalSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white drop-shadow-md">NEXUS<span className="text-[#06B6D4]">.</span></span>
                </Link>

                <div className="glass-card p-10 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]" />

                    <h2 className="text-3xl font-bold text-white mb-2 text-center drop-shadow-md">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-400 text-center mb-8">
                        {isLogin ? 'Sign in to manage your digital projects.' : 'Join to start building the future.'}
                    </p>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-[#06B6D4] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0F0F23]/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 focus:border-transparent transition-all"
                                    placeholder="name@company.com or 'Admin'"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-[#7C3AED] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0F0F23]/60 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {errorMSG && (
                            <div className="text-[#F43F5E] text-sm text-center bg-[#F43F5E]/10 py-2 rounded-lg border border-[#F43F5E]/20">
                                {errorMSG}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden rounded-xl bg-white/5 border border-white/10 p-1 transition-all hover:scale-[1.02]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-[#0F0F23] rounded-lg py-3 px-4 flex items-center justify-center gap-2 group-hover:bg-opacity-0 transition-all duration-300">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <>
                                        <span className="text-white font-medium">{isLogin ? 'Sign In' : 'Continue'}</span>
                                        <LogIn className="w-4 h-4 text-white" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-8 text-center flex flex-col gap-4">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                setEmail('admin');
                                setPassword('admin');
                                setIsLogin(true);
                                // A slight timeout to let state update, though handleAuth uses the state.
                                // It's better to just directly navigate or call the auth with admin credentials
                                setTimeout(() => {
                                    const formEvent = { preventDefault: () => { } } as React.FormEvent;
                                    handleAuth(formEvent);
                                }, 100);
                            }}
                            className="text-xs font-semibold text-[#06B6D4] hover:text-white transition-colors bg-[#06B6D4]/10 py-2 px-4 rounded-full border border-[#06B6D4]/20 mx-auto"
                        >
                            <TerminalSquare className="w-3 h-3 inline mr-1" />
                            Login as Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
