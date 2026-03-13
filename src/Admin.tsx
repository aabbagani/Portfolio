import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Trash2,
    Save,
    Briefcase,
    Code,
    Layout,
    FileText,
    ChevronUp,
    ChevronDown,
    X,
    Upload,
    Link,
    Image,
    File,
    GraduationCap,
    Award,
    GripVertical,
    AlertCircle,
    Lock,
    LogIn,
    LogOut
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';

const API_URL = '/api';

// --- Shared Components ---

function ImageUpload({ label, value, onChange, token }: { label: string, value: string, onChange: (v: string) => void, token: string | null }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Uploading to:', `${API_URL}/upload`);
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Upload failed: ${res.status} ${errText}`);
            }

            const data = await res.json();
            console.log('Upload success:', data);
            if (data.url) {
                onChange(data.url);
            } else {
                throw new Error('No URL returned from server');
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            setError(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">{label}</label>
                {error && <span className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1"><AlertCircle size={10} /> {error}</span>}
            </div>
            <div className="flex gap-4">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-background border border-border border-dashed rounded-2xl flex items-center justify-center p-4 cursor-pointer hover:border-primary/50 transition-all group overflow-hidden relative min-h-[100px]"
                >
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin text-primary"><Upload size={20} /></div>
                            <span className="text-[8px] font-black uppercase text-primary animate-pulse tracking-widest">Uploading...</span>
                        </div>
                    ) : value ? (
                        <>
                            <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity" />
                            <div className="relative z-10 flex flex-col items-center">
                                <Image size={20} className="text-white mb-2" />
                                <span className="text-[9px] font-black uppercase text-white bg-black/50 px-2 py-1 rounded">Update Photo</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <Upload size={20} className="mx-auto mb-2 text-slate-500 group-hover:text-primary" />
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Upload Photo</span>
                        </div>
                    )}
                </div>
                {value && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all self-center"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Admin() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'projects' | 'experience' | 'skills' | 'content' | 'education'>('projects');
    const [data, setData] = useState<any>({
        projects: [],
        experiences: [],
        skills: [],
        content: {},
        education: [],
        certifications: []
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ type: string, id: number, title: string } | null>(null);

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm)
            });
            if (res.ok) {
                const { token: receivedToken } = await res.json();
                setToken(receivedToken);
                localStorage.setItem('admin_token', receivedToken);
            } else {
                setLoginError('Invalid username or password');
            }
        } catch (error) {
            setLoginError('Server error. Please try again later.');
        }
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('admin_token');
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projRes, expRes, skillRes, contentRes, eduRes, certRes] = await Promise.all([
                fetch(`${API_URL}/projects`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/experiences`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/skills`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/content`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/education`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/certifications`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (projRes.status === 401 || projRes.status === 403) {
                handleLogout();
                return;
            }

            setData({
                projects: await projRes.json(),
                experiences: await expRes.json(),
                skills: await skillRes.json(),
                content: await contentRes.json(),
                education: await eduRes.json(),
                certifications: await certRes.json()
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleCreate = async (type: string, payload: any) => {
        try {
            const res = await fetch(`${API_URL}/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showMessage(`Added to ${type}`, 'success');
                fetchData();
            }
        } catch (error) {
            showMessage('Create failed', 'error');
        }
    };

    const handleUpdate = async (type: string, id: any, payload: any) => {
        try {
            const endpoint = type === 'content' ? type : `${type}/${id}`;
            const res = await fetch(`${API_URL}/${endpoint}`, {
                method: type === 'content' ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showMessage('Updated successfully', 'success');
                fetchData();
            }
        } catch (error) {
            showMessage('Update failed', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        const { type, id } = deleteModal;
        try {
            const res = await fetch(`${API_URL}/${type}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showMessage('Deleted successfully', 'success');
                fetchData();
            } else {
                showMessage('Server responded with error', 'error');
            }
        } catch (error) {
            showMessage('Delete failed', 'error');
        } finally {
            setDeleteModal(null);
        }
    };

    const handleReorder = async (type: string, orders: any[]) => {
        try {
            const res = await fetch(`${API_URL}/${type}/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orders })
            });
            if (res.ok) {
                showMessage('Order updated', 'success');
                fetchData();
            }
        } catch (e) {
            showMessage('Reorder failed', 'error');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-surface border border-white/5 p-12 rounded-[40px] shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-8 border border-white/5">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-center tracking-tighter mb-2">RESTRICTED SPACE</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase text-center tracking-[0.3em] mb-10">Identity verification required</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Terminal ID</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-background/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary focus:bg-background outline-none transition-all placeholder:text-slate-800"
                                    placeholder="Username"
                                    value={loginForm.username}
                                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Access Token</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-background/50 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:border-primary focus:bg-background outline-none transition-all placeholder:text-slate-800"
                                    placeholder="••••••••••••"
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                />
                            </div>

                            {loginError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase"
                                >
                                    <AlertCircle size={14} />
                                    {loginError}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-primary py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.3em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <LogIn size={18} />
                                Enter Dashboard
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin text-primary"><Code size={40} /></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-white font-sans p-8">
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-[200] px-6 py-3 rounded-lg shadow-2xl font-black uppercase text-[10px] tracking-widest ${message.type === 'success' ? 'bg-primary text-white' : 'bg-red-500 text-white'}`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex items-center justify-between border-b border-border pb-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter">PORTFOLIO <span className="text-primary">ADMIN</span></h1>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-2">v2.2 Advanced Content Suite</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => window.location.href = '/'} className="px-6 py-3 border border-border rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors">Terminal View</button>
                        <button onClick={handleLogout} className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2">
                            <LogOut size={14} /> Exit
                        </button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-12">
                    <aside className="lg:col-span-3 space-y-2">
                        {[
                            { id: 'projects', label: 'Artifacts', icon: Layout },
                            { id: 'experience', label: 'Experience', icon: Briefcase },
                            { id: 'skills', label: 'Capabilities', icon: Code },
                            { id: 'education', label: 'Education & Certs', icon: GraduationCap },
                            { id: 'content', label: 'Global Setup', icon: FileText },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-black uppercase text-[11px] tracking-widest ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-white/5'}`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </aside>

                    <main className="lg:col-span-9 bg-surface/20 border border-border p-8 rounded-3xl min-h-[700px]">
                        {activeTab === 'projects' && (
                            <ProjectManager
                                data={data.projects}
                                onCreate={(p: any) => handleCreate('projects', p)}
                                onUpdate={(id: any, p: any) => handleUpdate('projects', id, p)}
                                onDelete={(id: number) => setDeleteModal({ type: 'projects', id, title: data.projects.find((p: any) => p.id === id)?.title || 'Artifact' })}
                                onReorder={(orders: any) => handleReorder('projects', orders)}
                                token={token}
                            />
                        )}
                        {activeTab === 'experience' && (
                            <ExperienceManager
                                data={data.experiences}
                                onCreate={(e: any) => handleCreate('experiences', e)}
                                onUpdate={(id: any, e: any) => handleUpdate('experiences', id, e)}
                                onDelete={(id: number) => setDeleteModal({ type: 'experiences', id, title: data.experiences.find((e: any) => e.id === id)?.role || 'Experience' })}
                                onReorder={(orders: any) => handleReorder('experiences', orders)}
                                token={token}
                            />
                        )}
                        {activeTab === 'skills' && (
                            <SkillManager
                                data={data.skills}
                                onCreate={(s: any) => handleCreate('skills', s)}
                                onDelete={(id: number) => setDeleteModal({ type: 'skills', id, title: data.skills.find((s: any) => s.id === id)?.name || 'Capability' })}
                                token={token}
                            />
                        )}
                        {activeTab === 'education' && (
                            <EducationCertManager
                                education={data.education}
                                certifications={data.certifications}
                                onEduCreate={(e: any) => handleCreate('education', e)}
                                onEduUpdate={(id: any, e: any) => handleUpdate('education', id, e)}
                                onEduDelete={(id: number) => setDeleteModal({ type: 'education', id, title: data.education.find((e: any) => e.id === id)?.school || 'Education' })}
                                onCertCreate={(c: any) => handleCreate('certifications', c)}
                                onCertUpdate={(id: any, c: any) => handleUpdate('certifications', id, c)}
                                onCertDelete={(id: number) => setDeleteModal({ type: 'certifications', id, title: data.certifications.find((c: any) => c.id === id)?.name || 'Certification' })}
                                token={token}
                            />
                        )}
                        {activeTab === 'content' && (
                            <ContentManager
                                data={data.content}
                                onSave={(key: string, value: string) => handleCreate('content', { key, value })}
                                token={token}
                            />
                        )}
                    </main>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/90 backdrop-blur-md"
                            onClick={() => setDeleteModal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-surface border border-red-500/30 rounded-[32px] overflow-hidden shadow-2xl p-10 text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-3">CONFIRM DELETION</h3>
                            <p className="text-slate-400 text-sm font-bold mb-8 leading-relaxed">
                                You are about to permanently delete <span className="text-white">"{deleteModal.title}"</span>. This action is irreversible.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    className="flex-1 px-6 py-3 border border-border rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                                >
                                    Execute
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Managers ---

const smartReorder = (data: any[], targetId: number, newOrder: number) => {
    // Sort current data by sortOrder to ensure a consistent base
    const sorted = [...data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const targetItem = sorted.find(item => item.id === targetId);
    if (!targetItem) return [];

    const oldOrder = targetItem.sortOrder || 0;

    // Create new array with shifted orders
    return sorted.map(item => {
        if (item.id === targetId) {
            return { id: item.id, sortOrder: newOrder };
        }

        // If moving down (1 -> 3), items between (2, 3) shift up (-1)
        if (newOrder > oldOrder) {
            if ((item.sortOrder || 0) > oldOrder && (item.sortOrder || 0) <= newOrder) {
                return { id: item.id, sortOrder: (item.sortOrder || 0) - 1 };
            }
        }
        // If moving up (3 -> 1), items between (1, 2) shift down (+1)
        else if (newOrder < oldOrder) {
            if ((item.sortOrder || 0) < oldOrder && (item.sortOrder || 0) >= newOrder) {
                return { id: item.id, sortOrder: (item.sortOrder || 0) + 1 };
            }
        }

        return { id: item.id, sortOrder: item.sortOrder || 0 };
    });
};

function ProjectManager({ data, onCreate, onUpdate, onDelete, onReorder, token }: any) {
    const [editItem, setEditItem] = useState<any>(null);
    const empty = { title: '', category: '', description: '', image: '', tags: [], link: '', media: [], sortOrder: 0 };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight uppercase">Project Artifact Library</h2>
                <button onClick={() => setEditItem(empty)} className="bg-primary px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95"><Plus size={16} /> New Artifact</button>
            </div>

            <div className="space-y-4">
                {data.map((p: any) => (
                    <div
                        key={p.id}
                        className="p-8 border border-border rounded-3xl group hover:border-primary/50 transition-all bg-background/40 relative flex gap-8 items-center"
                    >
                        <div className="flex flex-col items-center gap-2 shrink-0">
                            <span className="text-[8px] font-black uppercase text-slate-600">Order</span>
                            <input
                                type="number"
                                className="w-12 bg-white/5 border border-border rounded-lg text-center text-[10px] font-black py-2 outline-none focus:border-primary"
                                defaultValue={p.sortOrder}
                                onBlur={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val !== p.sortOrder) {
                                        const newOrders = smartReorder(data, p.id, val);
                                        onReorder(newOrders);
                                    }
                                }}
                            />
                        </div>

                        <div className="w-20 h-20 bg-primary/10 rounded-2xl overflow-hidden flex items-center justify-center text-primary font-black text-2xl italic shadow-inner shrink-0 border border-white/5">
                            {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : p.title[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{p.category}</span>
                                    <h3 className="text-xl font-black mt-1 leading-none truncate">{p.title}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setEditItem(p); }} className="p-2 text-slate-500 hover:text-white transition-colors"><Layout size={18} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-1 mb-3">{p.description}</p>
                            {p.media?.length > 0 && (
                                <div className="flex gap-2">
                                    {p.media.slice(0, 3).map((m: any, i: number) => (
                                        <div key={i} className="px-2 py-1 bg-white/5 border border-border rounded-lg text-[8px] font-black text-slate-500 uppercase flex items-center gap-2">
                                            {m.type === 'image' && <Image size={8} />}
                                            {m.type === 'link' && <Link size={8} />}
                                            {m.type === 'file' && <File size={8} />}
                                            {m.label}
                                        </div>
                                    ))}
                                    {p.media.length > 3 && <span className="text-[8px] text-slate-600 font-black">+{p.media.length - 3} MORE</span>}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {editItem && (
                <Modal title={editItem.id ? 'Modify Artifact' : 'New Artifact'} onClose={() => setEditItem(null)}>
                    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-4 scrollbar-hide">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Artifact Title" value={editItem.title} onChange={(v) => setEditItem({ ...editItem, title: v })} />
                            <Input label="Category (e.g. AI Strategy)" value={editItem.category} onChange={(v) => setEditItem({ ...editItem, category: v })} />
                        </div>
                        <TextArea label="Narrative Description" value={editItem.description} onChange={(v) => setEditItem({ ...editItem, description: v })} />

                        <ImageUpload label="Primary Display Image" value={editItem.image} onChange={(v) => setEditItem({ ...editItem, image: v })} token={token} />

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Primary CTA Label" value={editItem.link} onChange={(v) => setEditItem({ ...editItem, link: v })} />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Multimedia Attachments</label>
                                <button
                                    onClick={() => setEditItem({ ...editItem, media: [...editItem.media, { type: 'link', url: '', label: '' }] })}
                                    className="text-primary text-[9px] font-black uppercase border border-primary/20 px-3 py-1 rounded-full hover:bg-primary/5"
                                >
                                    + Add Item
                                </button>
                            </div>
                            <div className="space-y-3">
                                {editItem.media.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-3 bg-background/50 p-4 rounded-2xl border border-border group/media">
                                        <select
                                            className="bg-surface border border-border rounded-lg px-2 text-[10px] font-black uppercase outline-none"
                                            value={item.type}
                                            onChange={(e) => {
                                                const newMedia = [...editItem.media];
                                                newMedia[i].type = e.target.value;
                                                setEditItem({ ...editItem, media: newMedia });
                                            }}
                                        >
                                            <option value="link">Link</option>
                                            <option value="image">Image</option>
                                            <option value="file">File</option>
                                        </select>
                                        <input
                                            placeholder="Label"
                                            className="w-24 bg-transparent border-b border-border text-[10px] font-black uppercase py-1 outline-none focus:border-primary"
                                            value={item.label}
                                            onChange={(e) => {
                                                const newMedia = [...editItem.media];
                                                newMedia[i].label = e.target.value;
                                                setEditItem({ ...editItem, media: newMedia });
                                            }}
                                        />
                                        <input
                                            placeholder="URL / Source"
                                            className="flex-1 bg-transparent border-b border-border text-[10px] font-black py-1 outline-none focus:border-primary"
                                            value={item.url}
                                            onChange={(e) => {
                                                const newMedia = [...editItem.media];
                                                newMedia[i].url = e.target.value;
                                                setEditItem({ ...editItem, media: newMedia });
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                const newMedia = editItem.media.filter((_: any, idx: number) => idx !== i);
                                                setEditItem({ ...editItem, media: newMedia });
                                            }}
                                            className="p-1 text-slate-700 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (editItem.id) onUpdate(editItem.id, editItem);
                                else onCreate(editItem);
                                setEditItem(null);
                            }}
                            className="w-full bg-primary py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6"
                        >
                            Commit Artifact Changes
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function ExperienceManager({ data, onCreate, onUpdate, onDelete, onReorder, token }: any) {
    const [editItem, setEditItem] = useState<any>(null);
    const [tagsString, setTagsString] = useState('');
    const empty = { role: '', company: '', period: '', location: '', summary: '', wins: [], tags: [], behindTheResume: '', showImage: 1, image: '', imageCaption: '', sortOrder: 0 };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight uppercase">Professional Narrative Log</h2>
                <button onClick={() => { setEditItem(empty); setTagsString(''); }} className="bg-primary px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all"><Plus size={16} /> New Experience</button>
            </div>

            <div className="space-y-4">
                {data.map((e: any) => (
                    <div
                        key={e.id}
                        className="p-8 border border-border rounded-3xl group hover:border-primary/50 transition-all bg-background/40 flex justify-between items-center shadow-sm"
                    >
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col items-center gap-1 shrink-0">
                                <span className="text-[8px] font-black uppercase text-slate-600">Order</span>
                                <input
                                    type="number"
                                    className="w-10 bg-white/5 border border-border rounded-lg text-center text-[10px] font-black py-1 outline-none focus:border-primary"
                                    defaultValue={e.sortOrder}
                                    onBlur={(val) => {
                                        const v = parseInt(val.target.value);
                                        if (!isNaN(v) && v !== e.sortOrder) {
                                            const newOrders = smartReorder(data, e.id, v);
                                            onReorder(newOrders);
                                        }
                                    }}
                                />
                            </div>
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl overflow-hidden flex items-center justify-center text-primary font-black text-2xl italic shadow-inner border border-white/5">
                                {e.image ? <img src={e.image} className="w-full h-full object-cover" /> : e.company[0]}
                            </div>
                            <div>
                                <h3 className="text-xl font-black leading-none">{e.role}</h3>
                                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-2">{e.company} • {e.period}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="hidden md:flex gap-2">
                                {e.tags?.slice(0, 2).map((t: string, j: number) => (
                                    <span key={j} className="px-3 py-1 bg-surface border border-border rounded-lg text-[8px] font-black uppercase text-slate-500">{t}</span>
                                ))}
                            </div>
                            <button onClick={(event) => { event.stopPropagation(); setEditItem(e); setTagsString(e.tags?.join(', ') || ''); }} className="px-5 py-2.5 border border-border rounded-xl text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all hover:bg-white/5">Modify</button>
                            <button onClick={(event) => { event.stopPropagation(); onDelete(e.id); }} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {editItem && (
                <Modal title={editItem.id ? 'Edit Professional Record' : 'Create New Record'} onClose={() => setEditItem(null)}>
                    <div className="space-y-6 max-h-[75vh] overflow-y-auto px-2 scrollbar-hide">
                        <div className="grid grid-cols-2 gap-6">
                            <Input label="Professional Role" value={editItem.role} onChange={(v) => setEditItem({ ...editItem, role: v })} />
                            <Input label="Organization" value={editItem.company} onChange={(v) => setEditItem({ ...editItem, company: v })} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Input label="Active Period (e.g. SEP 2025 – PRESENT)" value={editItem.period} onChange={(v) => setEditItem({ ...editItem, period: v })} />
                            <Input label="Geographic Location" value={editItem.location} onChange={(v) => setEditItem({ ...editItem, location: v })} />
                        </div>
                        <TextArea label="Executive Summary" value={editItem.summary} onChange={(v) => setEditItem({ ...editItem, summary: v })} />
                        <TextArea label="Behind the Resume (Strategic Notes)" value={editItem.behindTheResume} onChange={(v) => setEditItem({ ...editItem, behindTheResume: v })} />

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Core Deliverables & Wins (One per line)</label>
                            <textarea
                                className="w-full bg-background border border-border rounded-2xl p-6 text-sm font-medium focus:border-primary outline-none min-h-[150px] transition-all"
                                value={editItem.wins.join('\n')}
                                onChange={(e) => setEditItem({ ...editItem, wins: e.target.value.split('\n') })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Skills & Keywords (Comma separated)</label>
                            <input
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
                                value={tagsString}
                                onChange={(e) => {
                                    setTagsString(e.target.value);
                                    setEditItem({ ...editItem, tags: e.target.value.split(',').map(s => s.trim()).filter(s => s) });
                                }}
                            />
                        </div>

                        <div className="pt-4 border-t border-border space-y-6">
                            <ImageUpload label="Milestone Photo" value={editItem.image} onChange={(v) => setEditItem({ ...editItem, image: v })} token={token} />
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Image Caption" value={editItem.imageCaption} onChange={(v) => setEditItem({ ...editItem, imageCaption: v })} />
                                <div className="flex items-center gap-4">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Show Milestone Photo</label>
                                    <button
                                        onClick={() => setEditItem({ ...editItem, showImage: editItem.showImage ? 0 : 1 })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${editItem.showImage ? 'bg-primary' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editItem.showImage ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
                            <Input label="Presentation Link" value={editItem.presentationLink || ''} onChange={(v) => setEditItem({ ...editItem, presentationLink: v })} />
                        </div>

                        <button
                            onClick={() => {
                                if (editItem.id) onUpdate(editItem.id, editItem);
                                else onCreate(editItem);
                                setEditItem(null);
                            }}
                            className="w-full bg-primary py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] mt-6"
                        >
                            Publish Activity Update
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function SkillManager({ data, onCreate, onDelete, token }: any) {
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'technical' | 'soft'>('technical');

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-black tracking-tight mb-8">CAPABILITY STACK</h2>
                <div className="flex gap-4 bg-background/60 p-8 rounded-3xl border border-border shadow-inner">
                    <input
                        placeholder="Define Capability (e.g. LLM Strategy)"
                        className="flex-1 bg-transparent text-sm font-black uppercase tracking-widest outline-none border-b border-border focus:border-primary px-3 py-2 transition-all placeholder:text-slate-700"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <select
                        className="bg-background border border-border px-6 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                    >
                        <option value="technical">Technical</option>
                        <option value="soft">Intelligence / Soft</option>
                    </select>
                    <button
                        onClick={() => {
                            if (!newName) return;
                            onCreate({ name: newName, type: newType });
                            setNewName('');
                        }}
                        className="bg-primary px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        Register
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16">
                {['technical', 'soft'].map((type) => (
                    <div key={type} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mb-8 flex items-center gap-4">
                            <span className={`w-10 h-[2px] ${type === 'technical' ? 'bg-primary' : 'bg-accent'}`}></span>
                            {type === 'technical' ? 'HARD ARCHITECTURE' : 'SOFT INTELLIGENCE'}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {data.filter((s: any) => s.type === type).map((s: any) => (
                                <div key={s.id} className="group relative">
                                    <span className="inline-block px-5 py-3 bg-surface border border-border text-[10px] font-black uppercase tracking-[0.2em] rounded-lg cursor-default group-hover:border-primary transition-colors">
                                        {s.name}
                                    </span>
                                    <button
                                        onClick={() => onDelete(s.id)}
                                        className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EducationCertManager({ education, certifications, onEduCreate, onEduUpdate, onEduDelete, onCertCreate, onCertUpdate, onCertDelete, token }: any) {
    const [editEdu, setEditEdu] = useState<any>(null);
    const [editCert, setEditCert] = useState<any>(null);
    const [newCert, setNewCert] = useState({ name: '', issuer: '', date: '', link: '', image: '', showImage: 1 });

    const emptyEdu = { school: '', degree: '', field: '', location: '', period: '', gpa: '', details: '', image: '', showImage: 1, sortOrder: 0 };

    return (
        <div className="space-y-12">
            <section>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-4">
                        <GraduationCap className="text-primary" /> Academic Foundation
                    </h2>
                    <button onClick={() => setEditEdu(emptyEdu)} className="bg-primary px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest"><Plus size={16} /></button>
                </div>
                <div className="space-y-4">
                    {education.map((e: any) => (
                        <div key={e.id} className="p-8 border border-border rounded-3xl bg-background/40 flex justify-between items-center group">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl overflow-hidden flex items-center justify-center text-primary font-black text-xl italic shadow-inner shrink-0 border border-white/5">
                                    {e.image ? <img src={e.image} className="w-full h-full object-cover" /> : e.school[0]}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black">{e.school}</h3>
                                    <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1">{e.degree} in {e.field}</p>
                                    <p className="text-slate-500 text-[9px] font-black uppercase mt-2">{e.location} • {e.period} • GPA: {e.gpa}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditEdu(e)} className="p-2 text-slate-500 hover:text-white transition-colors"><Layout size={18} /></button>
                                <button onClick={() => onEduDelete(e.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="pt-8 border-t border-border">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-4">
                        <Award className="text-accent" /> Certifications
                    </h2>
                </div>
                <div className="bg-background/40 p-6 rounded-2xl border border-border mb-8 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input className="bg-transparent border-b border-border text-[10px] font-black uppercase outline-none focus:border-primary px-2 py-4" placeholder="Certification Name" value={newCert.name} onChange={e => setNewCert({ ...newCert, name: e.target.value })} />
                        <input className="bg-transparent border-b border-border text-[10px] font-black uppercase outline-none focus:border-primary px-2 py-4" placeholder="Issuer" value={newCert.issuer} onChange={e => setNewCert({ ...newCert, issuer: e.target.value })} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input className="bg-transparent border-b border-border text-[10px] font-black uppercase outline-none focus:border-primary px-2 py-4" placeholder="Date Acquired" value={newCert.date} onChange={e => setNewCert({ ...newCert, date: e.target.value })} />
                        <input className="bg-transparent border-b border-border text-[10px] font-black uppercase outline-none focus:border-primary px-2 py-4" placeholder="Certificate Verification URL" value={newCert.link} onChange={e => setNewCert({ ...newCert, link: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-6 items-end">
                        <div className="flex-1">
                            <ImageUpload label="Certification Logo / Photo" value={newCert.image} onChange={v => setNewCert({ ...newCert, image: v })} token={token} />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 py-2 border-t border-border">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Show Cert Photo</label>
                                <button
                                    onClick={() => setNewCert({ ...newCert, showImage: newCert.showImage ? 0 : 1 })}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${newCert.showImage ? 'bg-primary' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${newCert.showImage ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            <button onClick={() => { onCertCreate(newCert); setNewCert({ name: '', issuer: '', date: '', link: '', image: '', showImage: 1 }); }} className="h-12 px-10 bg-accent text-black font-black text-[10px] uppercase rounded-xl transition-transform active:scale-95">Register</button>
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {certifications.map((c: any) => (
                        <div key={c.id} className="p-6 border border-border rounded-2xl bg-background/20 flex justify-between items-center group transition-all hover:border-accent/40">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-accent/10 rounded-xl overflow-hidden flex items-center justify-center text-accent font-black text-xl italic shadow-inner shrink-0 border border-white/5">
                                    {c.showImage && c.image ? <img src={c.image} className="w-full h-full object-cover" /> : <Award size={24} />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">{c.name}</h4>
                                    <p className="text-accent text-[8px] font-black uppercase mt-1">{c.issuer} • {c.date}</p>
                                    {c.link && <p className="text-slate-600 text-[8px] font-black uppercase mt-1 truncate max-w-[150px]">{c.link}</p>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditCert(c)} className="p-2 text-slate-500 hover:text-white"><Layout size={16} /></button>
                                <button onClick={() => onCertDelete(c.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {editEdu && (
                <Modal title="Academic Record" onClose={() => setEditEdu(null)}>
                    <div className="space-y-4">
                        <Input label="Institution" value={editEdu.school} onChange={v => setEditEdu({ ...editEdu, school: v })} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Degree" value={editEdu.degree} onChange={v => setEditEdu({ ...editEdu, degree: v })} />
                            <Input label="Major/Field" value={editEdu.field} onChange={v => setEditEdu({ ...editEdu, field: v })} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Input label="Location" value={editEdu.location} onChange={v => setEditEdu({ ...editEdu, location: v })} />
                            <Input label="Period" value={editEdu.period} onChange={v => setEditEdu({ ...editEdu, period: v })} />
                            <Input label="GPA" value={editEdu.gpa} onChange={v => setEditEdu({ ...editEdu, gpa: v })} />
                        </div>
                        <Input label="Academic Achievements" value={editEdu.details} onChange={v => setEditEdu({ ...editEdu, details: v })} />
                        <ImageUpload label="Institution Logo / Photo" value={editEdu.image} onChange={v => setEditEdu({ ...editEdu, image: v })} token={token} />
                        <div className="flex items-center gap-4 py-2 border-t border-border mt-4">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Show Institution Photo</label>
                            <button
                                onClick={() => setEditEdu({ ...editEdu, showImage: editEdu.showImage ? 0 : 1 })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${editEdu.showImage ? 'bg-primary' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editEdu.showImage ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <button onClick={() => { if (editEdu.id) onEduUpdate(editEdu.id, editEdu); else onEduCreate(editEdu); setEditEdu(null); }} className="w-full bg-primary py-5 rounded-[24px] font-black uppercase text-[12px] tracking-[0.3em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] mt-6">Save Academic Record</button>
                    </div>
                </Modal>
            )
            }

            {
                editCert && (
                    <Modal title="Certification Record" onClose={() => setEditCert(null)}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Certification Name" value={editCert.name} onChange={v => setEditCert({ ...editCert, name: v })} />
                                <Input label="Issuer" value={editCert.issuer} onChange={v => setEditCert({ ...editCert, issuer: v })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Date Acquired" value={editCert.date} onChange={v => setEditCert({ ...editCert, date: v })} />
                                <Input label="URL" value={editCert.link} onChange={v => setEditCert({ ...editCert, link: v })} />
                            </div>
                            <ImageUpload label="Certification Logo / Photo" value={editCert.image} onChange={v => setEditCert({ ...editCert, image: v })} token={token} />
                            <div className="flex items-center gap-4 py-2 border-t border-border mt-4">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Show Cert Photo</label>
                                <button
                                    onClick={() => setEditCert({ ...editCert, showImage: editCert.showImage ? 0 : 1 })}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${editCert.showImage ? 'bg-primary' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editCert.showImage ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                            <button onClick={() => { onCertUpdate(editCert.id, editCert); setEditCert(null); }} className="w-full bg-accent py-5 rounded-[24px] text-black font-black uppercase text-[12px] tracking-[0.3em] shadow-xl shadow-accent/20 transition-all hover:scale-[1.01] active:scale-[0.99] mt-6">Save Certification Record</button>
                        </div>
                    </Modal>
                )
            }
        </div>
    );
}

function ContentManager({ data, onSave, token }: any) {
    const keys = [
        { key: 'hero_title_1', label: 'Hero Title Line 1' },
        { key: 'hero_title_2', label: 'Hero Title Line 2' },
        { key: 'hero_title_3', label: 'Hero Title Line 3' },
        { key: 'hero_description', label: 'Hero Sub-text' },
        { key: 'hero_photo_url', label: 'Profile Photo', isPhoto: true },
        { key: 'manifesto', label: 'Product Manifesto' },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black tracking-tight uppercase">Global System Configuration</h2>
            <div className="space-y-10">
                {keys.map((item) => (
                    <div key={item.key} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em]">{item.label}</label>
                            <span className="text-[8px] font-mono text-slate-700 bg-white/5 px-2 py-1 rounded">{item.key}</span>
                        </div>
                        {item.isPhoto ? (
                            <ImageUpload label="" value={data[item.key] || ''} onChange={(v) => onSave(item.key, v)} token={token} />
                        ) : (
                            <div className="relative group">
                                <textarea
                                    className="w-full bg-background/50 border border-border rounded-2xl p-6 text-sm font-medium focus:border-primary outline-none min-h-[100px] transition-all group-hover:bg-background/80 shadow-inner"
                                    defaultValue={data[item.key] || ''}
                                    onBlur={(e) => onSave(item.key, e.target.value)}
                                />
                                <div className="absolute bottom-4 right-6 text-[9px] font-black uppercase text-primary opacity-0 group-hover:opacity-100 flex items-center gap-2 pointer-events-none transition-opacity">
                                    <Save size={12} className="animate-pulse" /> Live committed on blur
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- UI Components ---

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-surface border border-border rounded-[48px] shadow-2xl overflow-hidden"
            >
                <div className="p-10 border-b border-border flex justify-between items-center bg-white/5">
                    <h3 className="text-2xl font-black tracking-tighter uppercase text-primary italic">{title}</h3>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-500"><X size={24} /></button>
                </div>
                <div className="p-10 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

function Input({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">{label}</label>
            <input
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-sm font-medium focus:border-primary outline-none transition-all shadow-inner"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function TextArea({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">{label}</label>
            <textarea
                className="w-full bg-background border border-border rounded-2xl p-6 text-sm font-medium focus:border-primary outline-none min-h-[140px] transition-all shadow-inner"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
