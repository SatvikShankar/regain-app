// Placeholder illustration for the Back region (from the design handoff): a
// soft figure arching on all fours. Meant to be replaced by real artwork.

import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../theme';

export default function BackArt({ width = 150, height = 104 }: { width?: number; height?: number }) {
  const c = colors.decoLavender;
  return (
    <Svg viewBox="0 0 160 110" width={width} height={height}>
      <Path d="M18 92 H142" stroke={c} strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
      <Path d="M54 58 Q86 22 118 58" fill="none" stroke={c} strokeWidth={11} strokeLinecap="round" />
      <Path d="M56 62 L52 89" stroke={c} strokeWidth={9} strokeLinecap="round" />
      <Path d="M116 62 L120 89" stroke={c} strokeWidth={9} strokeLinecap="round" />
      <Circle cx={42} cy={58} r={10} fill={colors.warm} />
    </Svg>
  );
}
