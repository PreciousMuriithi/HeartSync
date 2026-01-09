// HeartSync 2.0 - Login Page
// Beautiful, simple authentication
// Made with 💕 for Precious & Safari

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

type AuthMode = 'welcome' | 'create' | 'join' | 'login';

const emojiOptions = ['💕', '🧚', '💚', '🌸', '🖤', '⛓️', '🧛', '🦋', '🌹', '✨', '🔥', '💜'];

export default function LoginPage() {
    const router = useRouter();
    const { login, createCouple, joinCouple } = useAuth();

    const [mode, setMode] = useState<AuthMode>('welcome');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');

    // Form data
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [selectedEmojis, setSelectedEmojis] = useState<string[]>(['💕']);
    const [coupleCode, setCoupleCode] = useState('');

    const handleEmojiToggle = (emoji: string) => {
        setSelectedEmojis(prev => {
            if (prev.includes(emoji)) {
                return prev.filter(e => e !== emoji);
            }
            if (prev.length >= 3) {
                return [...prev.slice(1), emoji];
            }
            return [...prev, emoji];
        });
    };

    const handleCreateCouple = async () => {
        if (!name || !password) {
            setError('Please fill in all fields');
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await createCouple(name, nickname || name, selectedEmojis, password);

        if (result.success && result.inviteCode) {
            setGeneratedCode(result.inviteCode);
        } else {
            setError(result.error || 'Failed to create couple');
        }

        setIsLoading(false);
    };

    const handleJoinCouple = async () => {
        if (!inviteCode || !name || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await joinCouple(inviteCode, name, nickname || name, selectedEmojis, password);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error || 'Failed to join couple');
        }

        setIsLoading(false);
    };

    const handleLogin = async () => {
        if (!coupleCode || !name || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await login(coupleCode, name, password);

        if (result.success) {
            router.push('/');
        } else {
            setError(result.error || 'Login failed');
        }

        setIsLoading(false);
    };

    const goToDashboard = () => {
        router.push('/');
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">

                {/* Welcome Screen */}
                {mode === 'welcome' && (
                    <div className="text-center space-y-6">
                        <div className="text-6xl mb-4">💕</div>
                        <h1 className="text-2xl font-bold text-text-primary">HeartSync</h1>
                        <p className="text-text-muted">Your private couples sanctuary</p>

                        <div className="space-y-3 pt-4">
                            <button
                                onClick={() => setMode('create')}
                                className="w-full btn-primary"
                            >
                                ✨ Create New Couple
                            </button>
                            <button
                                onClick={() => setMode('join')}
                                className="w-full btn-secondary"
                            >
                                💝 Join with Invite Code
                            </button>
                            <button
                                onClick={() => setMode('login')}
                                className="w-full btn-ghost"
                            >
                                Already have an account? Sign in
                            </button>
                        </div>

                        <p className="text-xs text-text-muted pt-4">
                            Made with 💕 for Precious & Safari
                        </p>
                    </div>
                )}

                {/* Create Couple */}
                {mode === 'create' && !generatedCode && (
                    <div className="space-y-4">
                        <button onClick={() => setMode('welcome')} className="btn-ghost">
                            ← Back
                        </button>

                        <h2 className="text-xl font-bold text-text-primary">Create Your Space</h2>

                        {error && (
                            <div className="p-3 bg-error/20 border border-error/30 rounded-lg text-sm text-error">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Your Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Tavi"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Nickname (optional)</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g. Mi Amor"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Pick Your Emojis (up to 3)</label>
                            <div className="flex flex-wrap gap-2">
                                {emojiOptions.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleEmojiToggle(emoji)}
                                        className={`text-2xl p-2 rounded-lg transition-all ${selectedEmojis.includes(emoji)
                                                ? 'bg-primary/30 ring-2 ring-primary'
                                                : 'bg-surface hover:bg-surface-hover'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-text-muted mt-1">Selected: {selectedEmojis.join('')}</p>
                        </div>

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Choose a password"
                                className="input"
                            />
                        </div>

                        <button
                            onClick={handleCreateCouple}
                            disabled={isLoading}
                            className="w-full btn-primary disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Create Couple 💕'}
                        </button>
                    </div>
                )}

                {/* Invite Code Generated */}
                {mode === 'create' && generatedCode && (
                    <div className="text-center space-y-6">
                        <div className="text-4xl">🎉</div>
                        <h2 className="text-xl font-bold text-text-primary">You're All Set!</h2>
                        <p className="text-text-secondary">Share this code with your partner:</p>

                        <div className="glass-card p-4">
                            <p className="text-3xl font-mono font-bold text-primary tracking-wider">
                                {generatedCode}
                            </p>
                        </div>

                        <button
                            onClick={() => navigator.clipboard.writeText(generatedCode)}
                            className="btn-secondary"
                        >
                            📋 Copy Code
                        </button>

                        <button onClick={goToDashboard} className="w-full btn-primary">
                            Go to Dashboard →
                        </button>
                    </div>
                )}

                {/* Join Couple */}
                {mode === 'join' && (
                    <div className="space-y-4">
                        <button onClick={() => setMode('welcome')} className="btn-ghost">
                            ← Back
                        </button>

                        <h2 className="text-xl font-bold text-text-primary">Join Your Partner</h2>

                        {error && (
                            <div className="p-3 bg-error/20 border border-error/30 rounded-lg text-sm text-error">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Invite Code</label>
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                placeholder="ABCD1234"
                                className="input font-mono text-center text-lg tracking-wider"
                                maxLength={8}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Your Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Safari"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Nickname (optional)</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g. My Love"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Pick Your Emojis (up to 3)</label>
                            <div className="flex flex-wrap gap-2">
                                {emojiOptions.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleEmojiToggle(emoji)}
                                        className={`text-2xl p-2 rounded-lg transition-all ${selectedEmojis.includes(emoji)
                                                ? 'bg-primary/30 ring-2 ring-primary'
                                                : 'bg-surface hover:bg-surface-hover'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Choose a password"
                                className="input"
                            />
                        </div>

                        <button
                            onClick={handleJoinCouple}
                            disabled={isLoading}
                            className="w-full btn-primary disabled:opacity-50"
                        >
                            {isLoading ? 'Joining...' : 'Join Partner 💝'}
                        </button>
                    </div>
                )}

                {/* Login */}
                {mode === 'login' && (
                    <div className="space-y-4">
                        <button onClick={() => setMode('welcome')} className="btn-ghost">
                            ← Back
                        </button>

                        <h2 className="text-xl font-bold text-text-primary">Welcome Back</h2>

                        {error && (
                            <div className="p-3 bg-error/20 border border-error/30 rounded-lg text-sm text-error">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Couple Code</label>
                            <input
                                type="text"
                                value={coupleCode}
                                onChange={(e) => setCoupleCode(e.target.value.toUpperCase())}
                                placeholder="ABCD1234"
                                className="input font-mono text-center tracking-wider"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Your Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tavi"
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-text-secondary mb-1 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                className="input"
                            />
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full btn-primary disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In 💕'}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
