// A rounded, softly tinted container holding one icon — the app's recurring
// "widget" motif (tiles, cards, moments). Colour comes from a meaning-based tone.

import { View } from 'react-native';
import { Tone, tones } from '../../theme';
import Icon, { IconName } from './Icon';

export default function IconBadge({
  name,
  tone = 'accent',
  size = 44,
}: {
  name: IconName;
  tone?: Tone;
  size?: number;
}) {
  const t = tones[tone];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.36,
        backgroundColor: t.soft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={name} color={t.fg} size={Math.round(size * 0.48)} />
    </View>
  );
}
