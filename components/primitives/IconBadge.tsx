// A rounded, softly tinted tile holding one icon — the recurring "widget" motif
// (doctor screens, offers, gentle day, settings rows). `solid` fills the tile
// with the tone colour itself (e.g. the urgent doctor panel).

import { View } from 'react-native';
import { Tone, colors, tones } from '../../theme';
import Icon, { IconName } from './Icon';

export default function IconBadge({
  name,
  tone = 'primary',
  size = 44,
  solid = false,
}: {
  name: IconName;
  tone?: Tone;
  size?: number;
  solid?: boolean;
}) {
  const t = tones[tone];
  const fg = solid ? (tone === 'caution' ? colors.onCaution : colors.onPrimary) : t.fg;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size / 3),
        backgroundColor: solid ? t.fg : t.soft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={name} color={fg} size={Math.round(size * 0.45)} />
    </View>
  );
}
