import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building2, User, ArrowRight, Loader2, UploadCloud, X, FileText } from 'lucide-react';

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState('');
    const [company, setCompany] = useState('');
    const [projectType, setProjectType] = useState('Web Engineering');
    const [budgetRange, setBudgetRange] = useState('$500 - $1,000');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/auth');
            } else {
                const { data } = await supabase.from('profiles').select('id').eq('id', session.user.id).single();
                if (data) {
                    navigate('/dashboard');
                }
            }
        };
        checkSession();
    }, [navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            if (fullName && company) setStep(2);
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Create Profile
            const { error: profileError } = await supabase.from('profiles').insert({
                id: user.id,
                full_name: fullName,
                company: company
            });
            if (profileError) throw profileError;

            // 2. Upload Files
            let uploadedUrls: string[] = [];
            if (files.length > 0) {
                for (const file of files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${user.id}/${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { error: uploadError, data } = await supabase.storage
                        .from('project-files')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;
                    if (data) {
                        const { data: { publicUrl } } = supabase.storage.from('project-files').getPublicUrl(fileName);
                        uploadedUrls.push(publicUrl);
                    }
                }
            }

            // 3. Create Initial Project
            const { error: projectError } = await supabase.from('projects').insert({
                user_id: user.id,
                project_type: projectType,
                budget_range: budgetRange,
                description: description,
                status: 'Pending Review',
                files_url: uploadedUrls.length > 0 ? uploadedUrls : null
            });
            if (projectError) throw projectError;

            // 4. Create Notification for Admin
            await supabase.from('notifications').insert({
                message: `New Project Request from ${fullName} (${company}) - ${projectType}`
            });

            navigate('/dashboard');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F23] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Glow Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#06B6D4]/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#7C3AED]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10 animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-white/10 mb-6">
                        <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                        <span className="text-sm font-medium text-slate-200">Welcome to Nexus Elite</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                        Let's build something <span className="neon-text">extraordinary.</span>
                    </h1>
                    <p className="text-slate-400">Tell us about yourself and your vision.</p>
                </div>

                {/* Multi-step Form Container */}
                <div className="glass-card p-10 rounded-3xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] transition-all duration-500 ease-out"
                        style={{ width: step === 1 ? '50%' : '100%' }} />

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {step === 1 ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#06B6D4] transition-colors" />
                                        <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-[#0F0F23]/60 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 transition-all placeholder:text-slate-600"
                                            placeholder="John Doe" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Company or Individual</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-[#7C3AED] transition-colors" />
                                        <input type="text" required value={company} onChange={(e) => setCompany(e.target.value)}
                                            className="w-full bg-[#0F0F23]/60 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition-all placeholder:text-slate-600"
                                            placeholder="Acme Corp or Freelancer" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Service Type</label>
                                        <select value={projectType} onChange={(e) => setProjectType(e.target.value)}
                                            className="w-full bg-[#0F0F23]/60 border border-white/10 rounded-xl py-4 px-4 text-white hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50 transition-all appearance-none cursor-pointer">
                                            <option value="Product Design">Product Design (UX/UI)</option>
                                            <option value="Web Engineering">Web Engineering</option>
                                            <option value="Mobile Apps">Mobile Apps</option>
                                            <option value="AI Integration">AI Integration</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Estimated Budget</label>
                                        <select value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}
                                            className="w-full bg-[#0F0F23]/60 border border-white/10 rounded-xl py-4 px-4 text-white hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition-all appearance-none cursor-pointer">
                                            <option value="$100 - $500">$100 - $500</option>
                                            <option value="$500 - $1,000">$500 - $1,000</option>
                                            <option value="$1k - $5k">$1k - $5k</option>
                                            <option value="$5k - $10k">$5k - $10k</option>
                                            <option value="$10k+">$10k+</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Project Details</label>
                                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                                        className="w-full bg-[#0F0F23]/60 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none placeholder:text-slate-600"
                                        placeholder="Tell us about the core objectives, timeline, and any specific requirements..." />
                                </div>

                                {/* File Upload Zone */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Attachments (Optional)</label>
                                    <div
                                        className="w-full border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 hover:border-[#06B6D4]/50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-[#06B6D4] transition-colors" />
                                        </div>
                                        <p className="text-sm text-slate-300 font-medium">Click to upload files</p>
                                        <p className="text-xs text-slate-500">PDF, PNG, JPG up to 10MB</p>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                    </div>

                                    {/* Uploaded Files Preview */}
                                    {files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <FileText className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                                                        <span className="text-sm text-slate-300 truncate">{file.name}</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeFile(index)} className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-[#F43F5E]">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            {step === 2 && (
                                <button type="button" onClick={() => setStep(1)} className="text-slate-400 hover:text-white transition-colors text-sm font-medium px-4 py-2">
                                    Back
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="ml-auto relative group overflow-hidden rounded-xl bg-white/5 border border-white/10 p-1 transition-all hover:scale-[1.02]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-[#0F0F23] rounded-lg py-3 px-8 flex items-center justify-center gap-2 group-hover:bg-opacity-0 transition-all duration-300">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-white font-medium">{step === 1 ? 'Continue' : 'Submit Project'}</span>
                                            <ArrowRight className="w-4 h-4 text-white" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
