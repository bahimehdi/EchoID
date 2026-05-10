import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, radius } from '../lib/theme';

export default function Avatar({
  name,
  size = 36,
  uri,
}: { name?: string; size?: number; uri?: string }) {
  const initials = (name ?? '')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
  return (
    <View style={[styles.root, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  text: { color: colors.primary, fontWeight: '800' },
});
