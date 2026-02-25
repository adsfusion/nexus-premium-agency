import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { TerminalSquare, LogOut, Clock, Plus, Loader2, FileCode2 } from 'lucide-react';

export default function Dashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
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

            if (profileRes.data) setProfile(profileRes.data);
            if (projectsRes.data) setProjects(projectsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="min-h-screen bg-[#0F0F23] text-white">
            {/* Top Navigation */}
            <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
                            <TerminalSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white hidden sm:block">NEXUS<span className="text-[#06B6D4]">.</span></span>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-sm text-slate-400 hidden sm:block">
                            {profile?.full_name} • <span className="text-white">{profile?.company}</span>
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Project Dashboard</h1>
                        <p className="text-slate-400">Track and manage your digital initiatives.</p>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] font-medium text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-[#7C3AED]/20 hover:scale-105 active:scale-95 duration-200">
                        <Plus className="w-5 h-5" />
                        New Request
                    </button>
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center glass-card rounded-3xl border border-dashed border-white/20">
                            <p className="text-slate-400">You haven't submitted any projects yet.</p>
                        </div>
                    ) : (
                        projects.map((project) => (
                            <div key={project.id} className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-white px-2 py-1 rounded bg-white/10 border border-white/20">
                                        ID: {project.id.split('-')[0]}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center">
                                        <FileCode2 className="w-5 h-5 text-[#7C3AED]" />
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
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${project.status === 'Pending Review' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                                project.status === 'Active' ? 'bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30' :
                                                    'bg-white/10 text-slate-300 border border-white/20'
                                            }`}>
                                            {project.status || 'Pending Review'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-slate-500 mb-1">Budget</span>
                                        <span className="text-sm font-medium">{project.budget_range}</span>
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
