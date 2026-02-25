import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { TerminalSquare, LogOut, Clock, Plus, Loader2, FileCode2, Bell } from 'lucide-react';

export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();

        // Realtime Subscriptions
        const projectsSub = supabase.channel('public:projects')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
                fetchData();
            })
            .subscribe();

        const notifSub = supabase.channel('public:notifications')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(projectsSub);
            supabase.removeChannel(notifSub);
        };
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/auth');
                return;
            }

            const [profileRes, projectsRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            ]);

            if (profileRes.data) {
                setProfile(profileRes.data);
                fetchNotifications(user.id); // Fetch notifications correctly after getting user ID
            }
            if (projectsRes.data) setProjects(projectsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async (userIdStr?: string) => {
        const targetUserId = userIdStr || profile?.id;
        if (!targetUserId) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false })
            .limit(10);
        if (data) setNotifications(data);
    };

    const markNotifRead = async (id: string) => {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#06B6D4] animate-spin" />
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-[#0F0F23] text-white">
            {/* Top Navigation */}
            <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-white/10">
                            <TerminalSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white hidden sm:block">NEXUS<span className="text-[#06B6D4]">.</span></span>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
                            >
                                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-[#06B6D4] animate-pulse' : 'text-slate-300'}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-[#06B6D4] rounded-full border-2 border-[#0F0F23] shadow-[0_0_8px_#06B6D4]"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                        <h3 className="font-semibold text-white">Recent Updates</h3>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-slate-500 text-sm">No new notifications.</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markNotifRead(n.id)}
                                                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex items-start gap-3 ${!n.read ? 'bg-[#06B6D4]/5' : ''}`}
                                                >
                                                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${!n.read ? 'bg-[#06B6D4] shadow-[0_0_8px_#06B6D4]' : 'bg-transparent border border-slate-600'}`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-200">{n.message}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <span className="text-sm text-slate-400 hidden sm:block">
                            {profile?.full_name} <span className="text-white">({profile?.company})</span>
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4 text-slate-300" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Project Dashboard</h1>
                        <p className="text-slate-400">Track and manage your digital initiatives.</p>
                    </div>
                    <button onClick={() => navigate('/onboarding')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] font-medium text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-[#7C3AED]/20 hover:scale-105 active:scale-95 duration-200">
                        <Plus className="w-5 h-5" />
                        New Request
                    </button>
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center glass-card rounded-3xl border border-dashed border-white/20 animate-fade-in">
                            <p className="text-slate-400">You haven't submitted any projects yet.</p>
                        </div>
                    ) : (
                        projects.map((project, idx) => (
                            <div key={project.id}
                                className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden animate-fade-in-up"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-white px-2 py-1 rounded bg-white/10 border border-white/20">
                                        ID: {project.id.split('-')[0]}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center group-hover:bg-[#06B6D4]/20 group-hover:border-[#06B6D4]/30 transition-colors">
                                        <FileCode2 className="w-5 h-5 text-[#7C3AED] group-hover:text-[#06B6D4] transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{project.project_type}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-300 line-clamp-3 mb-6 relative z-10">
                                    {project.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto border-t border-white/10 pt-4 relative z-10">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 mb-1">Status</span>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${project.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
                                                project.status === 'Accepted' ? 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]' :
                                                    project.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
                                                        'bg-white/10 text-slate-300 border border-white/20'
                                            }`}>
                                            {project.status || 'Pending Review'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-slate-500 mb-1">Budget</span>
                                        <span className="text-sm font-medium text-slate-200">{project.budget_range}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
