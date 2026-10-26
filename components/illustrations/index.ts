// Region artwork, keyed by region id, with its tile tint. A region without an
// entry falls back to its icon. Swap these for real illustrations any time.

import { ComponentType } from 'react';
import { colors, tint } from '../../theme';
import BackArt from './BackArt';
import NeckArt from './NeckArt';

export const regionArt: Record<string, { Art: ComponentType<{ width?: number; height?: number }>; tileTint: string }> = {
  back: { Art: BackArt, tileTint: tint(colors.decoLavender, 0.12) },
  neck: { Art: NeckArt, tileTint: tint(colors.decoSky, 0.1) },
};
