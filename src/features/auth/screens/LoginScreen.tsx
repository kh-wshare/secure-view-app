import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
import { PrimaryButton } from '@/components';
import { useAuth } from '@/core/auth/AuthContext';
import { ApiError } from '@/services/api/ApiError';
import type { AuthStackParamList } from '@/core/navigation/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const { colors, spacing, radii, fontFamily } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.xl,
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.xl,
        }}
      >
        <View style={{ gap: spacing.xs, alignItems: 'center' }}>
          <View
            style={[
              styles.logoWrap,
              { backgroundColor: colors.brandTint, borderRadius: radii.full },
            ]}
          >
            <Icon name="shieldCheck" size={26} color={colors.brand} />
          </View>
          <Text
            style={[
              styles.title,
              { fontFamily: fontFamily.displayBold, color: colors.textPrimary },
            ]}
          >
            Welcome back
          </Text>
          <Text
            style={[
              styles.subtitle,
              { fontFamily: fontFamily.bodyRegular, color: colors.textSecondary },
            ]}
          >
            Sign in to view your cameras and alerts.
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <Field
            label="Email"
            icon="atSymbol"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Password"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {error && (
            <Text style={[styles.error, { fontFamily: fontFamily.bodyMedium, color: colors.live }]}>
              {error}
            </Text>
          )}

          <PrimaryButton
            label="Sign in"
            onPress={handleSubmit}
            loading={loading}
            disabled={!email.trim() || !password}
          />
        </View>

        <Pressable onPress={() => navigation.navigate('Register')} style={{ alignItems: 'center' }}>
          <Text
            style={[
              styles.footerText,
              { fontFamily: fontFamily.bodyMedium, color: colors.textSecondary },
            ]}
          >
            Don't have an account?{' '}
            <Text style={{ fontFamily: fontFamily.bodySemibold, color: colors.brand }}>
              Create one
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  icon: 'atSymbol' | 'lock' | 'user';
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'words';
}) {
  const { colors, radii, fontFamily, spacing } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={[
          styles.fieldLabel,
          { fontFamily: fontFamily.bodySemibold, color: colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.bgElevated2,
            borderColor: colors.border,
            borderRadius: radii.md,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        <Icon name={icon} size={16} color={colors.textTertiary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          style={[styles.input, { color: colors.textPrimary, fontFamily: fontFamily.bodyRegular }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  logoWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, marginTop: 4 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  fieldLabel: { fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, height: '100%' },
  error: { fontSize: 12.5 },
  footerText: { fontSize: 13 },
});
