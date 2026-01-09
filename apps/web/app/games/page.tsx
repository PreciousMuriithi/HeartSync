// HeartSync 2.0 - Games Hub
// Made with 💕 for Precious & Safari

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Game prompts
const truthOrDarePrompts = {
    truth: [
        "What's your favorite thing about me?",
        "What's your most romantic dream about us?",
        "What's something you've never told me?",
        "What's the first thing you noticed about me?",
        "What's your favorite memory of us?",
        "What do you find most attractive about me?",
    ],
    dare: [
        "Send me a voice note saying 'I love you' in a funny accent",
        "Change my contact name to something romantic",
        "Tell me your favorite thing about my appearance",
        "Send me a selfie making your cutest face",
        "Write me a 2-line poem right now",
        "Give me 3 compliments in a row",
    ],
};

const wouldYouRatherPrompts = [
    { a: "Spend a day at the beach with me", b: "Spend a day in the mountains with me" },
    { a: "Have a movie night", b: "Have a game night" },
    { a: "Get breakfast in bed", b: "Get a romantic dinner" },
    { a: "Travel the world with me", b: "Build our dream home together" },
    { a: "Know all my secrets", b: "Have me know all yours" },
    { a: "Always hold my hand", b: "Always hug me" },
];

const loveQuizQuestions = [
    { question: "What's my favorite color?", options: ["Red", "Blue", "Pink", "Black"] },
    { question: "What's my dream vacation?", options: ["Paris", "Beach Resort", "Mountain Cabin", "Road Trip"] },
    { question: "What's my love language?", options: ["Words", "Touch", "Gifts", "Quality Time"] },
    { question: "What's my comfort food?", options: ["Pizza", "Ice Cream", "Pasta", "Tacos"] },
];

type GameType = 'menu' | 'truth-or-dare' | 'would-you-rather' | 'love-quiz' | 'drawing';

export default function GamesPage() {
    const router = useRouter();
    const [currentGame, setCurrentGame] = useState<GameType>('menu');
    const [todChoice, setTodChoice] = useState<'truth' | 'dare' | null>(null);
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [wyrIndex, setWyrIndex] = useState(0);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);

    const startTruthOrDare = (choice: 'truth' | 'dare') => {
        setTodChoice(choice);
        const prompts = truthOrDarePrompts[choice];
        setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    };

    const nextWyr = () => {
        if (wyrIndex < wouldYouRatherPrompts.length - 1) {
            setWyrIndex(wyrIndex + 1);
        } else {
            setWyrIndex(0);
        }
    };

    const answerQuiz = (optionIndex: number) => {
        // In a real app, we'd check against the actual answer
        // For demo, just increment score sometimes
        if (optionIndex === 0) setQuizScore(quizScore + 1);

        if (quizIndex < loveQuizQuestions.length - 1) {
            setQuizIndex(quizIndex + 1);
        } else {
            setQuizComplete(true);
        }
    };

    const resetGame = () => {
        setCurrentGame('menu');
        setTodChoice(null);
        setCurrentPrompt('');
        setWyrIndex(0);
        setQuizIndex(0);
        setQuizScore(0);
        setQuizComplete(false);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-secondary/80 backdrop-blur-md border-b border-white/5 px-4 py-3 safe-top">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button
                        onClick={() => currentGame === 'menu' ? router.push('/') : resetGame()}
                        className="btn-ghost p-2"
                    >
                        ←
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-text-primary">🎮 Games</h1>
                        <p className="text-xs text-text-muted">Have fun together</p>
                    </div>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {/* Game Menu */}
                    {currentGame === 'menu' && (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <GameCard
                                emoji="🎲"
                                title="Truth or Dare"
                                description="Classic couples game"
                                onClick={() => setCurrentGame('truth-or-dare')}
                            />
                            <GameCard
                                emoji="🤔"
                                title="Would You Rather"
                                description="Make choices together"
                                onClick={() => setCurrentGame('would-you-rather')}
                            />
                            <GameCard
                                emoji="💝"
                                title="Love Quiz"
                                description="How well do you know me?"
                                onClick={() => setCurrentGame('love-quiz')}
                            />
                            <GameCard
                                emoji="🎨"
                                title="Draw Together"
                                description="Coming soon!"
                                onClick={() => { }}
                                disabled
                            />
                        </motion.div>
                    )}

                    {/* Truth or Dare */}
                    {currentGame === 'truth-or-dare' && (
                        <motion.div
                            key="tod"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            {!todChoice ? (
                                <div>
                                    <h2 className="text-2xl font-bold text-text-primary mb-8">Choose your fate! 🎲</h2>
                                    <div className="flex gap-4 justify-center">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => startTruthOrDare('truth')}
                                            className="glass-card p-8 flex flex-col items-center gap-3"
                                        >
                                            <span className="text-5xl">🤫</span>
                                            <span className="text-lg font-bold text-text-primary">Truth</span>
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => startTruthOrDare('dare')}
                                            className="glass-card p-8 flex flex-col items-center gap-3"
                                        >
                                            <span className="text-5xl">😈</span>
                                            <span className="text-lg font-bold text-text-primary">Dare</span>
                                        </motion.button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="glass-card p-8 mb-6"
                                    >
                                        <span className="text-4xl block mb-4">{todChoice === 'truth' ? '🤫' : '😈'}</span>
                                        <p className="text-xl text-text-primary">{currentPrompt}</p>
                                    </motion.div>
                                    <div className="flex gap-3 justify-center">
                                        <button onClick={() => setTodChoice(null)} className="btn-secondary">
                                            🔄 New Prompt
                                        </button>
                                        <button onClick={resetGame} className="btn-ghost">
                                            Back to Menu
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Would You Rather */}
                    {currentGame === 'would-you-rather' && (
                        <motion.div
                            key="wyr"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <h2 className="text-xl font-bold text-text-primary mb-6">Would You Rather... 🤔</h2>

                            <div className="space-y-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={nextWyr}
                                    className="w-full glass-card p-6 text-left"
                                >
                                    <span className="text-primary font-bold">A:</span>
                                    <p className="text-lg text-text-primary mt-1">{wouldYouRatherPrompts[wyrIndex].a}</p>
                                </motion.button>

                                <p className="text-text-muted">OR</p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={nextWyr}
                                    className="w-full glass-card p-6 text-left"
                                >
                                    <span className="text-secondary font-bold">B:</span>
                                    <p className="text-lg text-text-primary mt-1">{wouldYouRatherPrompts[wyrIndex].b}</p>
                                </motion.button>
                            </div>

                            <button onClick={nextWyr} className="btn-primary mt-6">
                                Next Question →
                            </button>
                        </motion.div>
                    )}

                    {/* Love Quiz */}
                    {currentGame === 'love-quiz' && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            {!quizComplete ? (
                                <div>
                                    <div className="flex justify-center gap-1 mb-6">
                                        {loveQuizQuestions.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-8 h-1 rounded-full ${i <= quizIndex ? 'bg-primary' : 'bg-surface'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <h2 className="text-xl font-bold text-text-primary mb-6">
                                        {loveQuizQuestions[quizIndex].question}
                                    </h2>

                                    <div className="grid grid-cols-2 gap-3">
                                        {loveQuizQuestions[quizIndex].options.map((option, i) => (
                                            <motion.button
                                                key={i}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => answerQuiz(i)}
                                                className="glass-card p-4 text-text-primary hover:bg-surface-hover"
                                            >
                                                {option}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <span className="text-6xl block mb-4">
                                        {quizScore >= 3 ? '🏆' : quizScore >= 2 ? '💕' : '❤️'}
                                    </span>
                                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                                        You scored {quizScore}/{loveQuizQuestions.length}!
                                    </h2>
                                    <p className="text-text-secondary mb-6">
                                        {quizScore >= 3
                                            ? "You know me so well! 💕"
                                            : quizScore >= 2
                                                ? "Not bad! Keep learning about me!"
                                                : "We have more to discover together!"}
                                    </p>
                                    <button onClick={resetGame} className="btn-primary">
                                        Play Again
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function GameCard({
    emoji,
    title,
    description,
    onClick,
    disabled = false
}: {
    emoji: string;
    title: string;
    description: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <motion.button
            whileHover={disabled ? {} : { scale: 1.03 }}
            whileTap={disabled ? {} : { scale: 0.97 }}
            onClick={onClick}
            disabled={disabled}
            className={`glass-card p-6 flex flex-col items-center gap-2 text-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
        >
            <span className="text-4xl">{emoji}</span>
            <h3 className="font-bold text-text-primary">{title}</h3>
            <p className="text-xs text-text-muted">{description}</p>
        </motion.button>
    );
}
