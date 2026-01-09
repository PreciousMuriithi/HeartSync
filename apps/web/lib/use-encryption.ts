// HeartSync 2.0 - Encryption Hook
// Made with 💕 for Precious & Safari

'use client';

import { useCallback } from 'react';
import { encryptMessage, decryptMessage, type EncryptedMessage } from '@heartsync/crypto';
import { useAuth } from './auth-context';

export function useEncryption() {
    const { privateKey, partner } = useAuth();

    const encrypt = useCallback((message: string): EncryptedMessage | null => {
        if (!privateKey || !partner?.publicKey) {
            console.warn('Cannot encrypt: missing keys');
            return null;
        }

        try {
            return encryptMessage(message, partner.publicKey, privateKey);
        } catch (e) {
            console.error('Encryption failed:', e);
            return null;
        }
    }, [privateKey, partner?.publicKey]);

    const decrypt = useCallback((encrypted: EncryptedMessage): string | null => {
        if (!privateKey || !partner?.publicKey) {
            console.warn('Cannot decrypt: missing keys');
            return null;
        }

        try {
            return decryptMessage(encrypted, partner.publicKey, privateKey);
        } catch (e) {
            console.error('Decryption failed:', e);
            return null;
        }
    }, [privateKey, partner?.publicKey]);

    const canEncrypt = Boolean(privateKey && partner?.publicKey);

    return { encrypt, decrypt, canEncrypt };
}
