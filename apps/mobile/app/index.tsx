// HeartSync 2.0 - Mobile Home Screen
// Made with 💕 for Precious & Safari

import { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Theme colors from the dark romantic theme
const colors = {
    background: '#0A0A0C',
    backgroundSecondary: '#121215',
    surface: '#1A1A1F',
    surfaceHover: '#252529',
    primary: '#E84057',
    primaryHover: '#FF5C72',
    secondary: '#9B5DE5',
    accent: '#FF85A2',
    text: '#FAFAFA',
    textSecondary: '#B8B8BC',
    textMuted: '#6B6B70',
    hearts: '#E84057',
    trust: '#9B5DE5',
    streak: '#FF9F43',
    success: '#7DD3A8',
};

interface CoupleStats {
    hearts: number;
    trustScore: number;
    streak: number;
}

interface User {
    name: string;
    nickname?: string;
    avatarEmojis: string[];
}

export default function HomeScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<User | null>(null);
    const [stats, setStats] = useState<CoupleStats>({ hearts: 0, trustScore: 50, streak: 0 });
    const [partnerOnline, setPartnerOnline] = useState(false);

    // Animated heart
    const heartScale = new Animated.Value(1);

    useEffect(() => {
        // Heart animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(heartScale, {
                    toValue: 1.1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(heartScale, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('heartsync_token');
            if (token) {
                // Load user data
                const userData = await SecureStore.getItemAsync('heartsync_user');
                const partnerData = await SecureStore.getItemAsync('heartsync_partner');
                const coupleData = await SecureStore.getItemAsync('heartsync_couple');

                if (userData) setUser(JSON.parse(userData));
                if (partnerData) setPartner(JSON.parse(partnerData));
                if (coupleData) setStats(JSON.parse(coupleData));

                setIsAuthenticated(true);
            }
        } catch (e) {
            console.error('Auth check failed:', e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Animated.Text style={[styles.loadingHeart, { transform: [{ scale: heartScale }] }]}>
                    💕
                </Animated.Text>
            </View>
        );
    }

    if (!isAuthenticated) {
        router.replace('/login');
        return null;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.logo}>💕</Text>
                    <Text style={styles.title}>HeartSync</Text>
                </View>
                <View style={styles.headerRight}>
                    {partner && (
                        <View style={styles.partnerStatus}>
                            <Text style={styles.partnerEmoji}>{partner.avatarEmojis[0]}</Text>
                            <View style={[styles.statusDot, partnerOnline && styles.statusOnline]} />
                        </View>
                    )}
                    <TouchableOpacity style={styles.settingsBtn}>
                        <Text style={styles.settingsIcon}>⚙️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Animated.Text style={[styles.statEmoji, { transform: [{ scale: heartScale }] }]}>
                        ❤️
                    </Animated.Text>
                    <Text style={[styles.statValue, { color: colors.hearts }]}>{stats.hearts}</Text>
                    <Text style={styles.statLabel}>Hearts</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>🛡️</Text>
                    <Text style={[styles.statValue, { color: colors.trust }]}>{stats.trustScore}</Text>
                    <Text style={styles.statLabel}>Trust</Text>
                </View>

                <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>🔥</Text>
                    <Text style={[styles.statValue, { color: colors.streak }]}>{stats.streak}</Text>
                    <Text style={styles.statLabel}>Streak</Text>
                </View>
            </View>

            {/* Couple Display */}
            <View style={styles.coupleCard}>
                <View style={styles.userDisplay}>
                    <Text style={styles.avatarEmojis}>{user?.avatarEmojis.join('')}</Text>
                    <Text style={styles.userName}>{user?.nickname || user?.name}</Text>
                </View>

                <Animated.Text style={[styles.heartCenter, { transform: [{ scale: heartScale }] }]}>
                    💕
                </Animated.Text>

                <View style={styles.userDisplay}>
                    {partner ? (
                        <>
                            <Text style={styles.avatarEmojis}>{partner.avatarEmojis.join('')}</Text>
                            <Text style={styles.userName}>{partner.nickname || partner.name}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.avatarEmojis}>❓</Text>
                            <Text style={styles.userNameMuted}>Waiting...</Text>
                        </>
                    )}
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <Link href="/chat" asChild>
                    <TouchableOpacity style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>💬 Chat</Text>
                    </TouchableOpacity>
                </Link>

                <TouchableOpacity style={styles.secondaryBtn}>
                    <Text style={styles.secondaryBtnText}>📡 Beacon</Text>
                </TouchableOpacity>
            </View>

            {/* Menu Grid */}
            <View style={styles.menuGrid}>
                <MenuCard icon="💌" label="Love Letters" />
                <MenuCard icon="🚩" label="Send Flag" />
                <MenuCard icon="📸" label="Memory Lane" />
                <MenuCard icon="📅" label="Calendar" />
                <MenuCard icon="🎁" label="Trust Store" />
                <MenuCard icon="🎮" label="Games" />
            </View>
        </ScrollView>
    );
}

function MenuCard({ icon, label }: { icon: string; label: string }) {
    return (
        <TouchableOpacity style={styles.menuCard}>
            <Text style={styles.menuIcon}>{icon}</Text>
            <Text style={styles.menuLabel}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 16,
        paddingTop: 48,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingHeart: {
        fontSize: 64,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logo: {
        fontSize: 28,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    partnerStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    partnerEmoji: {
        fontSize: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.textMuted,
    },
    statusOnline: {
        backgroundColor: colors.success,
    },
    settingsBtn: {
        padding: 8,
    },
    settingsIcon: {
        fontSize: 20,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statEmoji: {
        fontSize: 28,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        color: colors.textMuted,
    },

    // Couple display
    coupleCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    userDisplay: {
        alignItems: 'center',
        gap: 8,
    },
    avatarEmojis: {
        fontSize: 32,
    },
    userName: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    userNameMuted: {
        fontSize: 14,
        color: colors.textMuted,
    },
    heartCenter: {
        fontSize: 40,
    },

    // Quick actions
    quickActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryBtn: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    secondaryBtnText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },

    // Menu grid
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    menuCard: {
        width: '47%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    menuIcon: {
        fontSize: 32,
    },
    menuLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
