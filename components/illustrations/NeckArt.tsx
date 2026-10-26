// Placeholder illustration for the Neck region (from the design handoff):
// shoulders, neck and head. Meant to be replaced by real artwork.

import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../theme';

export default function NeckArt({ width = 150, height = 104 }: { width?: number; height?: number }) {
  const c = colors.decoSky;
  return (
    <Svg viewBox="0 0 160 110" width={width} height={height}>
      <Path d="M44 100 Q80 66 116 100" fill="none" stroke={c} strokeWidth={11} strokeLinecap="round" />
      <Path d="M80 78 L80 58" stroke={c} strokeWidth={9} strokeLinecap="round" />
      <Circle cx={88} cy={40} r={15} fill={c} />
    </Svg>
  );
}
