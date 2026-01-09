// HeartSync 2.0 - SQLite Database Layer
// Simple file-based database for easy deployment
// Made with 💕 for Precious & Safari

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/heartsync.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // Better performance

// Create tables
db.exec(`
  -- Couples table
  CREATE TABLE IF NOT EXISTS couples (
    id TEXT PRIMARY KEY,
    invite_code TEXT UNIQUE NOT NULL,
    hearts INTEGER DEFAULT 0,
    trust_score INTEGER DEFAULT 50,
    streak INTEGER DEFAULT 0,
    last_interaction TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT,
    avatar_emojis TEXT DEFAULT '["💕"]',
    public_key TEXT NOT NULL,
    encrypted_private_key TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    push_subscription TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couples(id)
  );

  -- Messages table (encrypted)
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    nonce TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    reactions TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couples(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
  );

  -- Flags table
  CREATE TABLE IF NOT EXISTS flags (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    value INTEGER NOT NULL,
    context TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couples(id)
  );

  -- Love letters table
  CREATE TABLE IF NOT EXISTS letters (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    nonce TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couples(id)
  );

  -- Memories table
  CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    emoji TEXT DEFAULT '💕',
    image_url TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couples(id)
  );

  -- Calendar events table
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL,
    title TEXT NOT NULL,
    emoji TEXT DEFAULT '📅',
    date TEXT NOT NULL,
    is_countdown INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couples(id)
  );

  -- Heart taps table (for notifications)
  CREATE TABLE IF NOT EXISTS heart_taps (
    id TEXT PRIMARY KEY,
    couple_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    count INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (couple_id) REFERENCES couples(id)
  );

  -- Push subscriptions
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    subscription TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_users_couple ON users(couple_id);
  CREATE INDEX IF NOT EXISTS idx_messages_couple ON messages(couple_id);
  CREATE INDEX IF NOT EXISTS idx_flags_couple ON flags(couple_id);
`);

console.log('📦 Database initialized at:', DB_PATH);

// Database helper functions
export const database = {
    // Couples
    createCouple: db.prepare(`
    INSERT INTO couples (id, invite_code) VALUES (?, ?)
  `),

    getCoupleByInvite: db.prepare(`
    SELECT * FROM couples WHERE invite_code = ?
  `),

    getCoupleById: db.prepare(`
    SELECT * FROM couples WHERE id = ?
  `),

    updateCoupleHearts: db.prepare(`
    UPDATE couples SET hearts = hearts + ?, last_interaction = CURRENT_TIMESTAMP WHERE id = ?
  `),

    updateCoupleStats: db.prepare(`
    UPDATE couples SET hearts = ?, trust_score = ?, streak = ?, last_interaction = CURRENT_TIMESTAMP WHERE id = ?
  `),

    // Users
    createUser: db.prepare(`
    INSERT INTO users (id, couple_id, name, nickname, avatar_emojis, public_key, encrypted_private_key, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

    getUserById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `),

    getUserByNameAndCouple: db.prepare(`
    SELECT * FROM users WHERE name = ? AND couple_id = ?
  `),

    getUsersByCouple: db.prepare(`
    SELECT * FROM users WHERE couple_id = ?
  `),

    updatePushSubscription: db.prepare(`
    INSERT OR REPLACE INTO push_subscriptions (id, user_id, subscription) VALUES (?, ?, ?)
  `),

    getPushSubscription: db.prepare(`
    SELECT subscription FROM push_subscriptions WHERE user_id = ?
  `),

    // Messages
    createMessage: db.prepare(`
    INSERT INTO messages (id, couple_id, sender_id, encrypted_content, nonce)
    VALUES (?, ?, ?, ?, ?)
  `),

    getMessages: db.prepare(`
    SELECT * FROM messages WHERE couple_id = ? ORDER BY created_at DESC LIMIT ?
  `),

    markMessageRead: db.prepare(`
    UPDATE messages SET is_read = 1 WHERE id = ?
  `),

    // Flags
    createFlag: db.prepare(`
    INSERT INTO flags (id, couple_id, sender_id, value, context) VALUES (?, ?, ?, ?, ?)
  `),

    getFlags: db.prepare(`
    SELECT * FROM flags WHERE couple_id = ? ORDER BY created_at DESC LIMIT ?
  `),

    // Letters
    createLetter: db.prepare(`
    INSERT INTO letters (id, couple_id, sender_id, encrypted_content, nonce)
    VALUES (?, ?, ?, ?, ?)
  `),

    getLetters: db.prepare(`
    SELECT * FROM letters WHERE couple_id = ? ORDER BY created_at DESC
  `),

    // Memories
    createMemory: db.prepare(`
    INSERT INTO memories (id, couple_id, title, description, emoji, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

    getMemories: db.prepare(`
    SELECT * FROM memories WHERE couple_id = ? ORDER BY date DESC
  `),

    // Events
    createEvent: db.prepare(`
    INSERT INTO events (id, couple_id, title, emoji, date, is_countdown)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

    getEvents: db.prepare(`
    SELECT * FROM events WHERE couple_id = ? ORDER BY date ASC
  `),

    // Heart taps
    createHeartTap: db.prepare(`
    INSERT INTO heart_taps (id, couple_id, sender_id, count) VALUES (?, ?, ?, ?)
  `),

    getRecentHeartTaps: db.prepare(`
    SELECT * FROM heart_taps WHERE couple_id = ? ORDER BY created_at DESC LIMIT 10
  `),

    // Raw access for complex queries
    raw: db,
};

export default database;
