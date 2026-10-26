// Single icon entry point. Screens refer to icons by SEMANTIC name ("back",
// "home", "locked"); this file maps names to the current icon library (Lucide).
// Swapping libraries or restyling every icon = edit this one file.

import {
  Activity,
  ArrowUp,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleUserRound,
  Download,
  Dumbbell,
  EllipsisVertical,
  HeartHandshake,
  House,
  Info,
  Leaf,
  Lock,
  LucideIcon,
  Moon,
  Package,
  PartyPopper,
  Pencil,
  PersonStanding,
  Play,
  Plus,
  Settings2,
  Sparkles,
  Sprout,
  Stethoscope,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  User,
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
  more: EllipsisVertical,
  settings: Settings2,
  leaf: Leaf,
  night: Moon,
  reminder: Bell,
  exportData: Download,
  importData: Upload,
  delete: Trash2,
  rename: Pencil,
  levelUp: ArrowUp,
  equipment: Package,
  person: User,
  sparkle: Sparkles,
  doctor: Stethoscope,
  calendar: CalendarDays,
  activity: Activity,
  target: Target,
  celebrate: PartyPopper,
  dumbbell: Dumbbell,
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
  color = colors.text1,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const Component = icons[name];
  return <Component size={size} color={color} strokeWidth={strokeWidth} />;
}
