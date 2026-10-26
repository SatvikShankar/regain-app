// The screen's ground: the plum background plus a soft radial "glow" of light
// near the top (or centre, for moments). Drawn with SVG so it renders the same
// on every platform; it's static, so it costs nothing per frame.

import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Glow, colors, glows } from '../../theme';

export default function ScreenBackground({ glow = 'plum' }: { glow?: Glow | 'none' }) {
  if (glow === 'none') return <View style={[StyleSheet.absoluteFill, styles.ground]} />;
  const g = glows[glow];
  return (
    <View style={[StyleSheet.absoluteFill, styles.ground]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient
            id={`glow-${glow}`}
            cx={g.cx}
            cy={g.cy}
            rx={g.rx}
            ry={g.ry}
            fx={g.cx}
            fy={g.cy}
            gradientUnits="objectBoundingBox"
          >
            <Stop offset={0} stopColor={g.color} stopOpacity={1} />
            <Stop offset={g.stop} stopColor={colors.bg} stopOpacity={1} />
            <Stop offset={1} stopColor={colors.bg} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#glow-${glow})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  ground: {
    backgroundColor: colors.bg,
  },
});
