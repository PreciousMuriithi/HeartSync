// HeartSync 2.0 - Mobile App Root Layout
// Made with 💕 for Precious & Safari

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

// Theme colors
const colors = {
    background: '#0A0A0C',
    backgroundSecondary: '#121215',
    primary: '#E84057',
    text: '#FAFAFA',
    textMuted: '#6B6B70',
};

export default function RootLayout() {
    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor={colors.background} />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.backgroundSecondary,
                    },
                    headerTintColor: colors.text,
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                        title: 'HeartSync',
                    }}
                />
                <Stack.Screen
                    name="chat"
                    options={{
                        title: 'Chat',
                        headerBackTitle: 'Back',
                    }}
                />
                <Stack.Screen
                    name="login"
                    options={{
                        headerShown: false,
                        title: 'Login',
                    }}
                />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
