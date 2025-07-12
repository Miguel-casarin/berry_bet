import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Conta() {
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ username: '', name: '', email: '', phone: '', cpf: '', date_birth: '' });
    const [editing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [showAvatarInput, setShowAvatarInput] = useState(false);
    const [showAvatarPopup, setShowAvatarPopup] = useState(false);
    const [pendingSave, setPendingSave] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPasswordField, setNewPasswordField] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordChangeMsg, setPasswordChangeMsg] = useState('');
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' ou 'transactions'
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState(''); // Filtro por tipo
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [changedFields, setChangedFields] = useState(new Set());
    const navigate = useNavigate();

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        // Se a data já está no formato correto (YYYY-MM-DD), retorna como está
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        
        // Se a data está no formato brasileiro (DD/MM/YYYY), converte
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [day, month, year] = dateString.split('/');
            return `${year}-${month}-${day}`;
        }
        
        // Se a data está em outro formato, tenta converter
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (e) {
            console.error('Erro ao formatar data:', e);
            return '';
        }
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('pt-BR');
        } catch (e) {
            return '';
        }
    };

    const fetchTransactions = async (page = 1, filter = typeFilter) => {
        setTransactionsLoading(true);
        const token = localStorage.getItem('token');
        try {
            let url = `http://localhost:8080/api/transactions/me?page=${page}&limit=20`;
            if (filter) {
                url += `&type=${encodeURIComponent(filter)}`;
            }
            
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/', { replace: true });
                return;
            }
            if (!res.ok) throw new Error('Erro ao buscar transações');
            const data = await res.json();
            setTransactions(data.data || []);
            setCurrentPage(page);
        } catch (err) {
            console.error('Erro ao buscar transações:', err);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const handleFilterChange = (newFilter) => {
        setTypeFilter(newFilter);
        setCurrentPage(1);
        fetchTransactions(1, newFilter);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('pt-BR');
        } catch (e) {
            return dateString;
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Math.abs(amount));
    };

    const getTransactionTypeLabel = (type) => {
        const types = {
            'bet': 'Aposta',
            'win': 'Ganho',
            'deposit': 'Depósito',
            'withdrawal': 'Saque',
            'bonus': 'Bônus'
        };
        return types[type] || type;
    };

    const getTransactionColor = (type, amount) => {
        const typeColors = {
            'bet': '#ff6b6b',      // Vermelho para apostas
            'win': '#51F893',      // Verde para ganhos
            'deposit': '#4ecdc4',  // Azul-verde para depósitos
            'withdrawal': '#ffa726', // Laranja para saques
            'bonus': '#9c27b0'     // Roxo para bônus
        };
        
        return typeColors[type] || (amount > 0 ? '#51F893' : '#ff6b6b');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', { replace: true });
            window.location.reload();
            return;
        }
        fetch('http://localhost:8080/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/', { replace: true });
                    window.location.reload();
                    return;
                }
                if (!res.ok) throw new Error('Erro ao buscar usuário');
                const data = await res.json();
                setUser(data.data);
                const formattedDate = formatDateForInput(data.data.date_birth);
                setForm({
                    username: data.data.username || '',
                    name: data.data.name || '',
                    email: data.data.email || '',
                    phone: data.data.phone || '',
                    cpf: data.data.cpf || '',
                    date_birth: formattedDate,
                });
            })
            .catch(() => {
                localStorage.removeItem('token');
                setUser(null);
                navigate('/', { replace: true });
                window.location.reload();
            });
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        
        // Rastrear campos alterados
        const newChangedFields = new Set(changedFields);
        if (user && user[name] !== value) {
            newChangedFields.add(name);
        } else {
            newChangedFields.delete(name);
        }
        setChangedFields(newChangedFields);
    };

    // Definir quais campos são sensíveis e precisam de senha
    const sensitiveFields = new Set(['username', 'email']);
    
    const requiresPassword = () => {
        return Array.from(changedFields).some(field => sensitiveFields.has(field)) || 
               (newPassword && newPassword.length > 0);
    };

    const handleSaveClick = () => {
        // Verificar se há mudanças
        if (changedFields.size === 0 && (!newPassword || newPassword.length === 0)) {
            setMessage('Nenhuma alteração foi feita.');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Verificar se precisa de senha
        if (requiresPassword()) {
            setPendingSave(true);
            setShowPassword(true);
        } else {
            // Salvar diretamente campos não sensíveis
            handleDirectSave();
        }
    };

    const handleDirectSave = async () => {
        setLoading(true);
        setMessage('');
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch('http://localhost:8080/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            
            if (res.status === 401) {
                localStorage.removeItem('token');
                navigate('/', { replace: true });
                return;
            }
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erro ao atualizar perfil');
            }
            
            const data = await res.json();
            setUser(data.data);
            setEditing(false);
            setChangedFields(new Set());
            setMessage('Perfil atualizado com sucesso!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`Erro: ${err.message}`);
            setTimeout(() => setMessage(''), 5000);
        }
        
        setLoading(false);
    };

    const handlePasswordConfirm = async () => {
        setLoading(true);
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:8080/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...form, password }),
            });
            if (res.status === 401) {
                navigate('/');
                return;
            }
            if (!res.ok) {
                const err = await res.json();
                setMessage(err.message || 'Erro ao atualizar dados');
            } else {
                setMessage('Dados atualizados com sucesso!');
                setEditing(false);
                setShowPassword(false);
                setPassword('');
                setNewPassword('');
                // Atualiza user local
                setUser({ ...user, ...form });
            }
        } catch {
            setMessage('Erro ao atualizar dados');
        }
        setLoading(false);
        setPendingSave(false);
    };

    // Função para preview da imagem
    function onAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validações
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (file.size > maxSize) {
            setMessage('A imagem deve ter no máximo 5MB');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            setMessage('Formato de imagem não suportado. Use JPEG, PNG ou WebP');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
            setShowAvatarPopup(true);
        };
        reader.readAsDataURL(file);
    }

    // Função para upload da imagem com confirmação
    async function handleAvatarUpload() {
        if (!avatarFile) return;
        
        setAvatarUploading(true);
        const token = localStorage.getItem('token');
        
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            
            const res = await fetch('http://localhost:8080/api/users/avatar', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            
            if (res.ok) {
                const uploadResponse = await res.json();
                
                // Atualizar dados do usuário completos
                const userRes = await fetch('http://localhost:8080/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (userRes.ok) {
                    const userData = await userRes.json();
                    console.log('Dados do usuário após upload:', userData); // Debug
                    setUser(userData.data);
                    
                    // Forçar atualização do avatar no localStorage se existir
                    if (userData.data.avatar_url) {
                        localStorage.setItem('userAvatar', userData.data.avatar_url);
                        console.log('Avatar salvo no localStorage:', userData.data.avatar_url); // Debug
                    }
                    
                    // Disparar evento customizado para atualizar avatar em outras páginas
                    window.dispatchEvent(new CustomEvent('avatarUpdated', { 
                        detail: { avatarUrl: userData.data.avatar_url } 
                    }));
                    console.log('Evento avatarUpdated disparado:', userData.data.avatar_url); // Debug
                }
                
                // Limpar estados
                setAvatarFile(null);
                setAvatarPreview(null);
                setShowAvatarPopup(false);
                setShowAvatarInput(false);
                setMessage('Avatar atualizado com sucesso!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erro ao enviar foto');
            }
        } catch (err) {
            setMessage(`Erro: ${err.message}`);
            setTimeout(() => setMessage(''), 5000);
        }
        
        setAvatarUploading(false);
    }

    const cancelAvatarUpload = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setShowAvatarPopup(false);
        setShowAvatarInput(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordChangeMsg('');
        if (!currentPassword || !newPasswordField || !confirmNewPassword) {
            setPasswordChangeMsg('Preencha todos os campos.');
            return;
        }
        if (newPasswordField !== confirmNewPassword) {
            setPasswordChangeMsg('As novas senhas não coincidem.');
            return;
        }
        if (newPasswordField.length < 6) {
            setPasswordChangeMsg('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (currentPassword === newPasswordField) {
            setPasswordChangeMsg('A nova senha deve ser diferente da atual.');
            return;
        }
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:8080/api/users/change_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPasswordField }),
            });
            if (!res.ok) {
                const err = await res.json();
                setPasswordChangeMsg(err.message || 'Erro ao trocar senha');
            } else {
                setPasswordChangeMsg('Senha alterada com sucesso!');
                setShowPasswordChange(false);
                setCurrentPassword('');
                setNewPasswordField('');
                setConfirmNewPassword('');
            }
        } catch {
            setPasswordChangeMsg('Erro ao trocar senha');
        }
        setLoading(false);
    };

    if (user === null) {
        return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Não foi possível carregar os dados do usuário.</div>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            backgroundAttachment: 'fixed',
            padding: 0
        }}>
            <header
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 2rem',
                    background: '#111',
                    borderBottom: '1px solid #333',
                    height: 64,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div style={{ flex: 1 }}></div>
                <span
                    style={{
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: 32,
                        color: '#51F893',
                        letterSpacing: 1,
                        textShadow: '0 0 10px rgba(81, 248, 147, 0.7)',
                        userSelect: 'none',
                        transition: 'all 0.3s ease'
                    }}
                    onClick={() => navigate('/dashboard')}
                    onMouseEnter={(e) => {
                        e.target.style.textShadow = '0 0 15px rgba(81, 248, 147, 0.9)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.textShadow = '0 0 10px rgba(81, 248, 147, 0.7)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    Berry.Bet
                </span>
                <div style={{ flex: 1 }}></div>
            </header>
            <main style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 0 0 0', display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', minHeight: 600 }}>
                {/* Avatar e info */}
                <section style={{ background: '#111', borderRadius: 20, boxShadow: '0 4px 32px rgba(81, 248, 147, 0.3)', padding: 38, minWidth: 320, maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #51F893', position: 'relative' }}>
                    <div
                        style={{ width: 110, height: 110, borderRadius: '50%', border: '4px solid #51F893', overflow: 'hidden', marginBottom: 18, background: '#333', position: 'relative', cursor: editing ? 'pointer' : 'default', transition: 'box-shadow 0.2s' }}
                        onClick={() => editing && setShowAvatarPopup(true)}
                        title={editing ? 'Clique para trocar a foto' : ''}
                    >
                        {(() => {
                            const avatarSrc = avatarPreview || (user.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`);
                            console.log('Avatar src na conta.jsx:', avatarSrc, 'user.avatar_url:', user.avatar_url); // Debug
                            
                            return (
                                <img
                                    src={avatarSrc}
                                    alt="Avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: editing ? 'brightness(0.95)' : 'none', borderRadius: '50%' }}
                                />
                            );
                        })()}
                        {editing && (
                            <span style={{ position: 'absolute', bottom: 8, right: 8, background: '#51F893', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 16, boxShadow: '0 2px 8px rgba(81, 248, 147, 0.3)', zIndex: 2 }}>
                                ✏️
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4, textAlign: 'center', textShadow: '0 2px 8px rgba(81, 248, 147, 0.3)' }}>{user.username}</div>
                    <div style={{ color: '#b0b8c1', fontSize: 15, marginBottom: 8, textAlign: 'center' }}>{user.email}</div>
                    <div style={{ color: '#51F893', fontSize: 14, marginBottom: 0, textAlign: 'center', fontWeight: 700 }}>CPF: {user.cpf || '-'}</div>
                </section>
                {/* Formulário principal */}
                <section style={{ flex: 1, minWidth: 340, maxWidth: 600, background: '#111', borderRadius: 20, boxShadow: '0 4px 32px rgba(81, 248, 147, 0.3)', border: '2px solid #51F893', padding: '36px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', color: '#fff' }}>
                    {/* Abas */}
                    <div style={{ display: 'flex', marginBottom: 24, borderBottom: '1px solid #51F893' }}>
                        <button
                            onClick={() => setActiveTab('profile')}
                            style={{
                                padding: '12px 24px',
                                background: activeTab === 'profile' ? '#51F893' : 'transparent',
                                color: activeTab === 'profile' ? '#000' : '#fff',
                                border: 'none',
                                borderRadius: '10px 10px 0 0',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: 16,
                                transition: 'all 0.2s'
                            }}
                        >
                            Perfil
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('transactions');
                                if (transactions.length === 0) {
                                    fetchTransactions(1);
                                }
                            }}
                            style={{
                                padding: '12px 24px',
                                background: activeTab === 'transactions' ? '#51F893' : 'transparent',
                                color: activeTab === 'transactions' ? '#000' : '#fff',
                                border: 'none',
                                borderRadius: '10px 10px 0 0',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: 16,
                                transition: 'all 0.2s'
                            }}
                        >
                            Histórico
                        </button>
                    </div>
                    
                    {/* Conteúdo baseado na aba ativa */}
                    {activeTab === 'profile' && (
                    <form onSubmit={e => e.preventDefault()} style={{ width: '100%', marginTop: 0 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>Nome de usuário</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #51F893', marginTop: 4, fontSize: 16, background: editing ? '#333' : '#222', color: '#fff', transition: 'background 0.2s, border 0.2s' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>Nome completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #43e97b', marginTop: 4, fontSize: 16, background: '#181c1f', color: '#888', cursor: 'not-allowed' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #51F893', marginTop: 4, fontSize: 16, background: editing ? '#333' : '#222', color: '#fff', transition: 'background 0.2s, border 0.2s' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>Telefone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #51F893', marginTop: 4, fontSize: 16, background: editing ? '#333' : '#222', color: '#fff', transition: 'background 0.2s, border 0.2s' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>Data de nascimento</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <input
                                        type="date"
                                        name="date_birth"
                                        value={form.date_birth}
                                        onChange={handleChange}
                                        disabled
                                        style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #43e97b', fontSize: 16, background: '#181c1f', color: '#fff', cursor: 'not-allowed' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: '#fff' }}>CPF</label>
                                <input
                                    type="text"
                                    name="cpf"
                                    value={form.cpf}
                                    onChange={handleChange}
                                    disabled
                                    style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #43e97b', marginTop: 4, fontSize: 16, background: '#181c1f', color: '#888', cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>
                        {message && <div style={{ color: message.includes('sucesso') ? '#43e97b' : '#ff4b2b', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>{message}</div>}
                        
                        {/* Indicadores de campos alterados */}
                        {editing && changedFields.size > 0 && (
                            <div style={{ marginBottom: 16, padding: 12, background: '#43e97b22', borderRadius: 8, border: '1px solid #43e97b33' }}>
                                <div style={{ color: '#43e97b', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                                    Campos alterados:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {Array.from(changedFields).map(field => (
                                        <span 
                                            key={field}
                                            style={{ 
                                                background: sensitiveFields.has(field) ? '#ff6b6b22' : '#43e97b22',
                                                color: sensitiveFields.has(field) ? '#ff6b6b' : '#43e97b',
                                                padding: '4px 8px',
                                                borderRadius: 4,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                border: `1px solid ${sensitiveFields.has(field) ? '#ff6b6b33' : '#43e97b33'}`
                                            }}
                                        >
                                            {field === 'username' ? 'Nome de usuário' :
                                             field === 'name' ? 'Nome completo' :
                                             field === 'email' ? 'Email' :
                                             field === 'phone' ? 'Telefone' :
                                             field === 'date_birth' ? 'Data nascimento' : field}
                                            {sensitiveFields.has(field) && ' 🔒'}
                                        </span>
                                    ))}
                                </div>
                                {requiresPassword() && (
                                    <div style={{ color: '#ffa726', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                                        * Campos marcados com 🔒 requerem confirmação de senha
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                            <button
                                type="button"
                                onClick={editing ? handleSaveClick : () => setEditing(true)}
                                disabled={loading}
                                style={{ 
                                    background: editing ? (changedFields.size > 0 ? '#43e97b' : '#666') : '#2575fc', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: 8, 
                                    padding: '14px 48px', 
                                    fontWeight: 700, 
                                    fontSize: 18, 
                                    cursor: loading ? 'not-allowed' : 'pointer', 
                                    boxShadow: editing ? '0 2px 8px #43e97b22' : '0 2px 8px #2575fc22', 
                                    letterSpacing: 1, 
                                    transition: 'background 0.2s',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Salvando...' : editing ? 'Salvar' : 'Editar'}
                            </button>
                            {editing && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        setChangedFields(new Set());
                                        // Restaurar valores originais
                                        setForm({
                                            username: user.username || '',
                                            name: user.name || '',
                                            email: user.email || '',
                                            phone: user.phone || '',
                                            cpf: user.cpf || '',
                                            date_birth: formatDateForInput(user.date_birth),
                                        });
                                    }}
                                    disabled={loading}
                                    style={{ 
                                        background: '#666', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: 8, 
                                        padding: '14px 48px', 
                                        fontWeight: 700, 
                                        fontSize: 18, 
                                        cursor: loading ? 'not-allowed' : 'pointer', 
                                        boxShadow: '0 2px 8px #66622', 
                                        letterSpacing: 1, 
                                        transition: 'background 0.2s',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                    )}

                    {/* Aba de Histórico de Transações */}
                    {activeTab === 'transactions' && (
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 700 }}>Histórico de Transações</h3>
                                {typeFilter && (
                                    <div style={{ 
                                        fontSize: 12, 
                                        color: '#43e97b', 
                                        background: '#43e97b22', 
                                        padding: '4px 8px', 
                                        borderRadius: '12px',
                                        border: '1px solid #43e97b33'
                                    }}>
                                        Filtro: {getTransactionTypeLabel(typeFilter)}
                                    </div>
                                )}
                            </div>
                            
                            {/* Filtros */}
                            <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                <label style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Filtrar por tipo:</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => handleFilterChange(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #43e97b',
                                        background: '#23272b',
                                        color: '#fff',
                                        fontSize: 14,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">Todos os tipos</option>
                                    <option value="bet">Apostas</option>
                                    <option value="win">Ganhos</option>
                                    <option value="deposit">Depósitos</option>
                                    <option value="withdrawal">Saques</option>
                                    <option value="bonus">Bônus</option>
                                </select>
                                
                                {/* Botões de filtro rápido */}
                                <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                                    <button
                                        onClick={() => handleFilterChange('')}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            border: typeFilter === '' ? '2px solid #43e97b' : '1px solid #555',
                                            background: typeFilter === '' ? '#43e97b22' : 'transparent',
                                            color: typeFilter === '' ? '#43e97b' : '#aaa',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('bet')}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            border: typeFilter === 'bet' ? '2px solid #ff6b6b' : '1px solid #555',
                                            background: typeFilter === 'bet' ? '#ff6b6b22' : 'transparent',
                                            color: typeFilter === 'bet' ? '#ff6b6b' : '#aaa',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Apostas
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('win')}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            border: typeFilter === 'win' ? '2px solid #43e97b' : '1px solid #555',
                                            background: typeFilter === 'win' ? '#43e97b22' : 'transparent',
                                            color: typeFilter === 'win' ? '#43e97b' : '#aaa',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Ganhos
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('deposit')}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            border: typeFilter === 'deposit' ? '2px solid #4ecdc4' : '1px solid #555',
                                            background: typeFilter === 'deposit' ? '#4ecdc422' : 'transparent',
                                            color: typeFilter === 'deposit' ? '#4ecdc4' : '#aaa',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Depósitos
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('withdrawal')}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            border: typeFilter === 'withdrawal' ? '2px solid #ffa726' : '1px solid #555',
                                            background: typeFilter === 'withdrawal' ? '#ffa72622' : 'transparent',
                                            color: typeFilter === 'withdrawal' ? '#ffa726' : '#aaa',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Saques
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange('bonus')}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            border: typeFilter === 'bonus' ? '2px solid #9c27b0' : '1px solid #555',
                                            background: typeFilter === 'bonus' ? '#9c27b022' : 'transparent',
                                            color: typeFilter === 'bonus' ? '#9c27b0' : '#aaa',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Bônus
                                    </button>
                                </div>
                            </div>
                            
                            {transactionsLoading ? (
                                <div style={{ textAlign: 'center', color: '#fff', padding: 40 }}>
                                    Carregando transações...
                                </div>
                ) : transactions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>
                    {typeFilter ? (
                        <div>
                            <div style={{ fontSize: 18, marginBottom: 10 }}>🔍</div>
                            <div>Nenhuma transação do tipo <strong style={{ color: '#43e97b' }}>{getTransactionTypeLabel(typeFilter)}</strong> encontrada.</div>
                            <button
                                onClick={() => handleFilterChange('')}
                                style={{
                                    marginTop: 16,
                                    padding: '8px 16px',
                                    background: '#43e97b',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}
                            >
                                Ver todas as transações
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: 18, marginBottom: 10 }}>📊</div>
                            <div>Nenhuma transação encontrada.</div>
                        </div>
                    )}
                </div>
                            ) : (
                                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                    {transactions.map((transaction, index) => (
                                        <div
                                            key={transaction.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                padding: '16px',
                                                marginBottom: '12px',
                                                background: 'rgba(35, 39, 43, 0.8)',
                                                borderRadius: '10px',
                                                border: '1px solid #43e97b33',
                                                transition: 'background 0.2s',
                                                minHeight: '60px',
                                                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                                                gap: window.innerWidth <= 768 ? '8px' : '16px',
                                                width: '100%',
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                                                <div style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: 700, 
                                                    color: getTransactionColor(transaction.type, transaction.amount),
                                                    marginBottom: 4 
                                                }}>
                                                    {getTransactionTypeLabel(transaction.type)}
                                                </div>
                                                <div 
                                                    title={transaction.description}
                                                    style={{ 
                                                        fontSize: 14, 
                                                        color: '#bbb', 
                                                        marginBottom: 2,
                                                        wordWrap: 'break-word',
                                                        overflowWrap: 'anywhere',
                                                        whiteSpace: 'normal',
                                                        lineHeight: '1.4',
                                                        cursor: transaction.description.length > 50 ? 'help' : 'default',
                                                        width: '100%',
                                                        boxSizing: 'border-box',
                                                        maxWidth: 'none',
                                                        overflow: 'visible'
                                                    }}
                                                >
                                                    {transaction.description}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#888' }}>
                                                    {formatDate(transaction.created_at)}
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: 18,
                                                fontWeight: 700,
                                                color: getTransactionColor(transaction.type, transaction.amount),
                                                textAlign: window.innerWidth <= 768 ? 'left' : 'right',
                                                minWidth: window.innerWidth <= 768 ? 'auto' : '120px',
                                                flexShrink: 0
                                            }}>
                                                {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Paginação */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, gap: 10 }}>
                                <button
                                    onClick={() => fetchTransactions(currentPage - 1)}
                                    disabled={currentPage <= 1 || transactionsLoading}
                                    style={{
                                        padding: '10px 20px',
                                        background: currentPage <= 1 ? '#555' : '#43e97b',
                                        color: currentPage <= 1 ? '#888' : '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Anterior
                                </button>
                                <span style={{ color: '#fff', padding: '10px 20px', fontSize: 16 }}>
                                    Página {currentPage}
                                </span>
                                <button
                                    onClick={() => fetchTransactions(currentPage + 1)}
                                    disabled={transactions.length < 20 || transactionsLoading}
                                    style={{
                                        padding: '10px 20px',
                                        background: transactions.length < 20 ? '#555' : '#43e97b',
                                        color: transactions.length < 20 ? '#888' : '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: transactions.length < 20 ? 'not-allowed' : 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    )}

                    {showPassword && pendingSave && (
                        <div style={{ marginTop: 24, background: '#f5f6fa', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #0001', width: '100%' }}>
                            <div style={{ marginBottom: 12, fontWeight: 700, color: '#222' }}>Confirme sua senha para salvar as alterações:</div>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #bdbdbd', marginBottom: 12, fontSize: 16, background: '#fff' }}
                                autoFocus
                            />
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button onClick={handlePasswordConfirm} disabled={loading || !password} style={{ background: '#2575fc', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #2575fc22' }}>Confirmar</button>
                                <button onClick={() => { setShowPassword(false); setPassword(''); setPendingSave(false); }} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #aaa2' }}>Cancelar</button>
                            </div>
                        </div>
                    )}
                    {/* Botão para abrir modal de troca de senha */}
                    {editing && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                            <button
                                type="button"
                                onClick={() => setShowPasswordChange(true)}
                                style={{ background: '#2575fc', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #2575fc22', letterSpacing: 1 }}
                            >
                                Alterar senha
                            </button>
                        </div>
                    )}
                    {/* Modal de troca de senha */}
                    {showPasswordChange && (
                        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 60, paddingLeft: 0, paddingRight: 0 }}>
                            <form onSubmit={handlePasswordChange} style={{ background: 'linear-gradient(120deg, #23272b 60%, #181c1f 100%)', borderRadius: 18, boxShadow: '0 8px 32px #43e97b33', padding: 24, minWidth: 320, maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative', border: '2px solid #43e97b', color: '#fff' }}>
                                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: '#fff', textAlign: 'center' }}>Alterar senha</div>
                                <input
                                    type="password"
                                    placeholder="Senha atual"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #43e97b', fontSize: 15, background: '#23272b', color: '#fff', marginBottom: 4 }}
                                    autoFocus
                                />
                                <input
                                    type="password"
                                    placeholder="Nova senha"
                                    value={newPasswordField}
                                    onChange={e => setNewPasswordField(e.target.value)}
                                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #43e97b', fontSize: 15, background: '#23272b', color: '#fff', marginBottom: 4 }}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirmar nova senha"
                                    value={confirmNewPassword}
                                    onChange={e => setConfirmNewPassword(e.target.value)}
                                    style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #43e97b', fontSize: 15, background: '#23272b', color: '#fff', marginBottom: 4 }}
                                />
                                {passwordChangeMsg && <div style={{ color: passwordChangeMsg.includes('sucesso') ? '#43e97b' : '#ff4b2b', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{passwordChangeMsg}</div>}
                                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                    <button type="submit" disabled={loading} style={{ background: '#43e97b', color: '#181c1f', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px #43e97b22', transition: 'background 0.2s' }}>Salvar</button>
                                    <button type="button" onClick={() => { setShowPasswordChange(false); setCurrentPassword(''); setNewPasswordField(''); setConfirmNewPassword(''); setPasswordChangeMsg(''); }} style={{ background: '#23272b', color: '#fff', border: '1.5px solid #aaa', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px #aaa2', transition: 'background 0.2s, border 0.2s' }}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    )}
                </section>
            </main>
            {/* Modal de troca de avatar fora do fluxo principal para garantir sobreposição */}
            {showAvatarPopup && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(16,24,32,0.92)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        background: 'rgba(16,24,32,0.98)',
                        borderRadius: 20,
                        boxShadow: '0 4px 32px #00ff8577, 0 0 0 2px #fff70055',
                        padding: 38,
                        minWidth: 340,
                        maxWidth: 370,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        border: '2px solid #43e97b',
                        zIndex: 10000,
                        position: 'relative',
                        color: '#fff',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, color: '#fff', textAlign: 'center', letterSpacing: 1 }}>
                            {avatarPreview ? 'Confirmar nova foto?' : 'Trocar foto de perfil'}
                        </div>
                        <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '3px solid #fff700', marginBottom: 16, background: '#23272b', boxShadow: '0 0 16px #fff70033, 0 0 0 6px #43e97b33' }}>
                            <img
                                src={avatarPreview || (user.avatar_url ? `http://localhost:8080${user.avatar_url}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`)}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        </div>
                        {!avatarPreview && (
                            <input 
                                type="file" 
                                accept="image/jpeg,image/jpg,image/png,image/webp" 
                                onChange={onAvatarChange} 
                                style={{ 
                                    marginBottom: 16, 
                                    color: '#fff', 
                                    background: 'none', 
                                    border: '1.5px solid #43e97b', 
                                    borderRadius: 8, 
                                    padding: 8, 
                                    width: '100%' 
                                }} 
                            />
                        )}
                        <div style={{ display: 'flex', gap: 12, marginTop: 8, justifyContent: 'center' }}>
                            {avatarPreview ? (
                                <>
                                    <button 
                                        onClick={handleAvatarUpload} 
                                        disabled={avatarUploading}
                                        style={{ 
                                            background: avatarUploading ? '#666' : 'linear-gradient(90deg, #43e97b 0%, #fff700 100%)', 
                                            color: '#101820', 
                                            border: 'none', 
                                            borderRadius: 8, 
                                            padding: '10px 28px', 
                                            fontWeight: 800, 
                                            fontSize: 16, 
                                            cursor: avatarUploading ? 'not-allowed' : 'pointer', 
                                            boxShadow: '0 2px 8px #43e97b22', 
                                            letterSpacing: 1 
                                        }}
                                    >
                                        {avatarUploading ? 'Enviando...' : 'Confirmar'}
                                    </button>
                                    <button 
                                        onClick={cancelAvatarUpload} 
                                        disabled={avatarUploading}
                                        style={{ 
                                            background: '#23272b', 
                                            color: '#fff', 
                                            border: '1.5px solid #aaa', 
                                            borderRadius: 8, 
                                            padding: '10px 28px', 
                                            fontWeight: 700, 
                                            fontSize: 16, 
                                            cursor: avatarUploading ? 'not-allowed' : 'pointer', 
                                            boxShadow: '0 2px 8px #aaa2' 
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={cancelAvatarUpload} 
                                    style={{ 
                                        background: '#23272b', 
                                        color: '#fff', 
                                        border: '1.5px solid #aaa', 
                                        borderRadius: 8, 
                                        padding: '10px 28px', 
                                        fontWeight: 700, 
                                        fontSize: 16, 
                                        cursor: 'pointer', 
                                        boxShadow: '0 2px 8px #aaa2' 
                                    }}
                                >
                                    Fechar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Botão de voltar compacto no canto superior esquerdo */}
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    position: 'fixed',
                    top: -5,
                    left: 20,
                    zIndex: 1000,
                    background: '#51F893',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: 15,
                    border: 'none',
                    borderRadius: 7,
                    padding: '6px 16px 6px 12px',
                    minWidth: 0,
                    minHeight: 0,
                    height: 36,
                    lineHeight: '20px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(81, 248, 147, 0.5)',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    maxWidth: 120,
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#40E882';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = '#51F893';
                }}
            >
                <span style={{ fontSize: 18, fontWeight: 900, marginRight: 2 }}>←</span> Voltar
            </button>
        </div>
    );
}

export default Conta;
