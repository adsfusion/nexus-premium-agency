import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin" />
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/auth" />;
    }

    return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
                if (data?.is_admin) {
                    setIsAdmin(true);
                }
            }
            setLoading(false);
        };
        checkAdmin();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin" />
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" />;
    }

    return <>{children}</>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={
                    <ProtectedRoute>
                        <Onboarding />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}
