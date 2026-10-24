// Single icon entry point. Screens refer to icons by SEMANTIC name ("back",
// "home", "locked"); this file maps names to the current icon library (Lucide).
// Swapping libraries or restyling every icon = edit this one file.

import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleUserRound,
  Dumbbell,
  HeartHandshake,
  House,
  Info,
  Lock,
  LucideIcon,
  PartyPopper,
  PersonStanding,
  Play,
  Plus,
  Sparkles,
  Sprout,
  Stethoscope,
  Target,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { colors } from '../../theme';

const icons = {
  back: ChevronLeft,
  home: House,
  close: X,
  forward: ChevronRight,
  expand: ChevronDown,
  add: Plus,
  check: Check,
  done: CircleCheck,
  locked: Lock,
  play: Play,
  info: Info,
  sparkle: Sparkles,
  doctor: Stethoscope,
  calendar: CalendarDays,
  activity: Activity,
  target: Target,
  celebrate: PartyPopper,
  equipment: Dumbbell,
  support: HeartHandshake,
  growth: Sprout,
  trend: TrendingUp,
  regionBack: PersonStanding,
  regionNeck: CircleUserRound,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export default function Icon({
  name,
  size = 22,
  color = colors.textPrimary,
  strokeWidth = 2.1,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const Component = icons[name];
  return <Component size={size} color={color} strokeWidth={strokeWidth} />;
}
