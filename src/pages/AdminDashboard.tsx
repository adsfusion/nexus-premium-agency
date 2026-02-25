import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { TerminalSquare, LogOut, Bell, Download, Settings, X } from 'lucide-react';

export default function AdminDashboard() {
    const [projects, setProjects] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAdminData();

        // Realtime Subscriptions
        const projectsSub = supabase.channel('public:projects')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
                fetchAdminData();
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

    const fetchAdminData = async () => {
        // Fetch projects with profiles using a join
        const { data: projectsData } = await supabase
            .from('projects')
            .select(`
        *,
        profiles (full_name, company, email)
      `)
            .order('created_at', { ascending: false });

        if (projectsData) setProjects(projectsData);
        fetchNotifications();
    };

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (data) setNotifications(data);
    };

    const updateStatus = async (projectId: string, newStatus: string) => {
        await supabase.from('projects').update({ status: newStatus }).eq('id', projectId);
    };

    const markNotifRead = async (id: string) => {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMsg('Updating...');
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            setPasswordMsg(error.message);
        } else {
            setPasswordMsg('Password updated successfully!');
            setNewPassword('');
            setTimeout(() => {
                setShowSettings(false);
                setPasswordMsg('');
            }, 2000);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-[#0F0F23] text-white">
            {/* Admin Navbar */}
            <nav className="border-b border-white/10 bg-[#0F0F23]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F43F5E] to-[#7C3AED] flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                            <TerminalSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">NEXUS<span className="text-[#F43F5E]">.Admin</span></span>
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
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-[#F43F5E] rounded-full border-2 border-[#0F0F23]"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                                    <div className="p-4 border-b border-white/10 bg-white/5">
                                        <h3 className="font-semibold">Recent Alerts</h3>
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

                        <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative">
                            <Settings className="w-5 h-5 text-slate-300 hover:text-[#06B6D4] transition-colors" />
                        </button>

                        <button onClick={handleSignOut} className="px-4 py-2 rounded-lg bg-[#F43F5E]/10 text-[#F43F5E] hover:bg-[#F43F5E]/20 transition-all text-sm font-medium flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Client Projects Overview</h1>

                <div className="glass-card rounded-3xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-sm uppercase tracking-wider text-slate-400">
                                <th className="p-6 font-medium">Client Info</th>
                                <th className="p-6 font-medium">Project Needs</th>
                                <th className="p-6 font-medium">Budget</th>
                                <th className="p-6 font-medium">Attachments</th>
                                <th className="p-6 font-medium">Status Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-6">
                                        <p className="font-semibold text-white">{project.profiles?.full_name}</p>
                                        <p className="text-sm text-slate-400">{project.profiles?.company}</p>
                                        {project.profiles?.email && <p className="text-xs text-[#06B6D4] mt-1 hover:text-white transition-colors">{project.profiles.email}</p>}
                                        <p className="text-xs text-slate-500 mt-1">{new Date(project.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-medium text-[#7C3AED]">{project.project_type}</p>
                                        <p className="text-sm text-slate-400 line-clamp-2 max-w-xs mt-1">{project.description}</p>
                                    </td>
                                    <td className="p-6 text-sm font-medium">
                                        {project.budget_range}
                                    </td>
                                    <td className="p-6">
                                        {project.files_url?.length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                {project.files_url.map((url: string, i: number) => (
                                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-[#06B6D4] hover:text-white transition-colors">
                                                        <Download className="w-3 h-3" /> File {i + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500">No files</span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <select
                                            value={project.status}
                                            onChange={(e) => updateStatus(project.id, e.target.value)}
                                            className="bg-[#0F0F23] border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                                        >
                                            <option value="Pending Review">Pending Review</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-500">
                                        No active projects found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F0F23]/80 backdrop-blur-sm p-4">
                    <div className="glass-card w-full max-w-md p-8 rounded-3xl relative animate-fade-in-up">
                        <button onClick={() => { setShowSettings(false); setPasswordMsg(''); setNewPassword(''); }} className="absolute top-4 right-4 text-slate-400 hover:text-[#F43F5E] transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-6">Admin Settings</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-2">Change Password (min 6 chars)</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-[#0F0F23]/60 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 transition-all placeholder:text-slate-600"
                                    placeholder="Enter new password"
                                />
                            </div>
                            {passwordMsg && <p className="text-sm text-[#06B6D4] font-medium">{passwordMsg}</p>}
                            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-medium hover:opacity-90 transition-opacity">
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
