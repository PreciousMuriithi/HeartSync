// HeartSync 2.0 - End-to-End Encryption
// Made with 💕 for Precious & Safari
//
// Uses TweetNaCl for proven, secure cryptography
// - X25519 for key exchange
// - XSalsa20-Poly1305 for encryption

import nacl from 'tweetnacl';
import util from 'tweetnacl-util';

// ============================================
// Key Generation
// ============================================

export interface KeyPair {
    publicKey: string;  // Base64 encoded
    secretKey: string;  // Base64 encoded
}

/**
 * Generate a new key pair for a user
 * The public key is shared, the secret key is stored encrypted
 */
export function generateKeyPair(): KeyPair {
    const keyPair = nacl.box.keyPair();
    return {
        publicKey: util.encodeBase64(keyPair.publicKey),
        secretKey: util.encodeBase64(keyPair.secretKey),
    };
}

// ============================================
// Encryption / Decryption
// ============================================

export interface EncryptedMessage {
    ciphertext: string;  // Base64 encoded
    nonce: string;       // Base64 encoded
}

/**
 * Encrypt a message for your partner
 * @param message - Plain text message
 * @param theirPublicKey - Partner's public key (base64)
 * @param mySecretKey - Your secret key (base64)
 */
export function encryptMessage(
    message: string,
    theirPublicKey: string,
    mySecretKey: string
): EncryptedMessage {
    const messageBytes = util.decodeUTF8(message);
    const theirPublicKeyBytes = util.decodeBase64(theirPublicKey);
    const mySecretKeyBytes = util.decodeBase64(mySecretKey);

    // Generate random nonce (24 bytes)
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    // Encrypt
    const ciphertext = nacl.box(
        messageBytes,
        nonce,
        theirPublicKeyBytes,
        mySecretKeyBytes
    );

    if (!ciphertext) {
        throw new Error('Encryption failed');
    }

    return {
        ciphertext: util.encodeBase64(ciphertext),
        nonce: util.encodeBase64(nonce),
    };
}

/**
 * Decrypt a message from your partner
 * @param encrypted - The encrypted message object
 * @param theirPublicKey - Partner's public key (base64)
 * @param mySecretKey - Your secret key (base64)
 */
export function decryptMessage(
    encrypted: EncryptedMessage,
    theirPublicKey: string,
    mySecretKey: string
): string {
    const ciphertext = util.decodeBase64(encrypted.ciphertext);
    const nonce = util.decodeBase64(encrypted.nonce);
    const theirPublicKeyBytes = util.decodeBase64(theirPublicKey);
    const mySecretKeyBytes = util.decodeBase64(mySecretKey);

    const decrypted = nacl.box.open(
        ciphertext,
        nonce,
        theirPublicKeyBytes,
        mySecretKeyBytes
    );

    if (!decrypted) {
        throw new Error('Decryption failed - message may be corrupted or keys incorrect');
    }

    return util.encodeUTF8(decrypted);
}

// ============================================
// Symmetric Encryption (for local storage)
// ============================================

/**
 * Derive a symmetric key from password (for encrypting secret key storage)
 * Uses simple hashing - in production, use Argon2 or scrypt
 */
export function deriveKeyFromPassword(password: string): Uint8Array {
    // Simple key derivation using SHA-256-like hash
    const passwordBytes = util.decodeUTF8(password);
    return nacl.hash(passwordBytes).slice(0, nacl.secretbox.keyLength);
}

/**
 * Encrypt secret key for local storage using password
 */
export function encryptSecretKey(
    secretKey: string,
    password: string
): EncryptedMessage {
    const key = deriveKeyFromPassword(password);
    const secretKeyBytes = util.decodeBase64(secretKey);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);

    const ciphertext = nacl.secretbox(secretKeyBytes, nonce, key);

    if (!ciphertext) {
        throw new Error('Failed to encrypt secret key');
    }

    return {
        ciphertext: util.encodeBase64(ciphertext),
        nonce: util.encodeBase64(nonce),
    };
}

/**
 * Decrypt secret key from local storage using password
 */
export function decryptSecretKey(
    encrypted: EncryptedMessage,
    password: string
): string {
    const key = deriveKeyFromPassword(password);
    const ciphertext = util.decodeBase64(encrypted.ciphertext);
    const nonce = util.decodeBase64(encrypted.nonce);

    const secretKeyBytes = nacl.secretbox.open(ciphertext, nonce, key);

    if (!secretKeyBytes) {
        throw new Error('Failed to decrypt secret key - wrong password?');
    }

    return util.encodeBase64(secretKeyBytes);
}

// ============================================
// Hashing
// ============================================

/**
 * Hash a password for storage (not for key derivation)
 */
export function hashPassword(password: string): string {
    const passwordBytes = util.decodeUTF8(password);
    const hash = nacl.hash(passwordBytes);
    return util.encodeBase64(hash);
}

/**
 * Verify a password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
    const newHash = hashPassword(password);
    return newHash === storedHash;
}

// ============================================
// Utilities
// ============================================

/**
 * Generate a random invite code for couples
 */
export function generateInviteCode(): string {
    const bytes = nacl.randomBytes(4);
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

/**
 * Generate a random ID
 */
export function generateId(): string {
    const bytes = nacl.randomBytes(16);
    return util.encodeBase64(bytes)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// Export types
export type { EncryptedMessage };
