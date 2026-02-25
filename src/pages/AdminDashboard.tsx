import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { TerminalSquare, LogOut, Bell, Download, Settings, X } from 'lucide-react';

export default function AdminDashboard() {
    const [projects, setProjects] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'projects' | 'clients'>('projects');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAdminData();
        fetchClients();

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

        const clientsSub = supabase.channel('public:profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchClients();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(projectsSub);
            supabase.removeChannel(notifSub);
            supabase.removeChannel(clientsSub);
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

    const fetchClients = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_admin', false)
            .order('created_at', { ascending: false });

        if (data) setClients(data);
    };

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
        if (data) setNotifications(data);
    };

    const updateStatus = async (projectId: string, newStatus: string, userId: string) => {
        await supabase.from('projects').update({ status: newStatus }).eq('id', projectId);

        // Notify the user about the status change
        await supabase.from('notifications').insert({
            user_id: userId,
            message: `Your project status has been updated to: ${newStatus}`
        });
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
        <div className="min-h-screen bg-[#0F0F23] text-white overflow-x-hidden w-full">
            {/* Admin Navbar */}
            <nav className="border-b border-white/10 bg-[#0F0F23]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F43F5E] to-[#7C3AED] flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                            <TerminalSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white hidden sm:block">NEXUS<span className="text-[#F43F5E]">.Admin</span></span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
                            >
                                <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${unreadCount > 0 ? 'text-[#06B6D4] animate-pulse' : 'text-slate-300'}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#F43F5E] rounded-full border-2 border-[#0F0F23]"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 sm:-right-4 mt-3 w-72 sm:w-80 glass-card rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                                    <div className="p-4 border-b border-white/10 bg-white/5">
                                        <h3 className="font-semibold text-sm sm:text-base">Recent Alerts</h3>
                                    </div>
                                    <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
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
                                                        <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setShowSettings(true)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative">
                            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 hover:text-[#06B6D4] transition-colors" />
                        </button>

                        <button onClick={handleSignOut} className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#F43F5E]/10 text-[#F43F5E] hover:bg-[#F43F5E]/20 transition-all text-sm font-medium flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">Admin Portal</h1>
                    <div className="flex bg-[#0F0F23] border border-white/10 rounded-xl p-1 gap-1">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'projects' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Project Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'clients' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            Registered Clients ({clients.length})
                        </button>
                    </div>
                </div>

                {activeTab === 'projects' ? (
                    <div className="glass-card rounded-2xl overflow-x-auto max-w-full border border-white/10 shadow-lg animate-fade-in">
                        <table className="w-full text-left border-collapse min-w-[800px] sm:min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-xs sm:text-sm uppercase tracking-wider text-slate-400">
                                    <th className="p-4 sm:p-6 font-medium">Client Info</th>
                                    <th className="p-4 sm:p-6 font-medium">Project Needs</th>
                                    <th className="p-4 sm:p-6 font-medium">Budget</th>
                                    <th className="p-4 sm:p-6 font-medium">Attachments</th>
                                    <th className="p-4 sm:p-6 font-medium">Status Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 sm:p-6">
                                            <p className="font-semibold text-white">{project.profiles?.full_name}</p>
                                            <p className="text-xs sm:text-sm text-slate-400">{project.profiles?.company}</p>
                                            {project.profiles?.email && <p className="text-[10px] sm:text-xs text-[#06B6D4] mt-1 hover:text-white transition-colors">{project.profiles.email}</p>}
                                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">{new Date(project.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="p-4 sm:p-6">
                                            <p className="font-medium text-[#7C3AED] text-sm">{project.project_type}</p>
                                            <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 max-w-[200px] sm:max-w-xs mt-1">{project.description}</p>
                                        </td>
                                        <td className="p-4 sm:p-6 text-xs sm:text-sm font-medium">
                                            {project.budget_range}
                                        </td>
                                        <td className="p-4 sm:p-6">
                                            {project.files_url?.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    {project.files_url.map((url: string, i: number) => (
                                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-[#06B6D4] hover:text-white transition-colors">
                                                            <Download className="w-3 h-3 flex-shrink-0" /> File {i + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500">No files</span>
                                            )}
                                        </td>
                                        <td className="p-4 sm:p-6">
                                            <select
                                                value={project.status}
                                                onChange={(e) => updateStatus(project.id, e.target.value, project.user_id)}
                                                className="bg-[#0F0F23] border border-white/20 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer min-w-[120px]"
                                            >
                                                <option value="Pending Review">Pending Review</option>
                                                <option value="Accepted">Accepted</option>
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
                ) : (
                    <div className="glass-card rounded-2xl overflow-x-auto max-w-full border border-white/10 shadow-lg animate-fade-in">
                        <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-xs sm:text-sm uppercase tracking-wider text-slate-400">
                                    <th className="p-4 sm:p-6 font-medium">Registered Client</th>
                                    <th className="p-4 sm:p-6 font-medium">Company</th>
                                    <th className="p-4 sm:p-6 font-medium">Contact Email</th>
                                    <th className="p-4 sm:p-6 font-medium">Join Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 sm:p-6">
                                            <p className="font-semibold text-white">{client.full_name}</p>
                                        </td>
                                        <td className="p-4 sm:p-6">
                                            <p className="text-sm text-slate-300">{client.company || 'N/A'}</p>
                                        </td>
                                        <td className="p-4 sm:p-6 text-sm">
                                            <a href={`mailto:${client.email}`} className="text-[#06B6D4] hover:text-white transition-colors">
                                                {client.email || 'N/A'}
                                            </a>
                                        </td>
                                        <td className="p-4 sm:p-6 text-xs text-slate-500">
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-slate-500">
                                            No clients registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
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
