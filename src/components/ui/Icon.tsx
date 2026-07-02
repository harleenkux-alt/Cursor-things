import {
  Accessibility,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  Component,
  Contrast,
  Crosshair,
  Download,
  Eye,
  FileJson,
  FileText,
  Image,
  Info,
  LayoutDashboard,
  Lightbulb,
  MessagesSquare,
  MousePointerClick,
  Palette,
  Ruler,
  ScanLine,
  Settings,
  Sparkles,
  Type,
  Waves,
  Wrench,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

/** Curated icon registry so analyzers can reference icons by string name. */
const ICONS: Record<string, LucideIcon> = {
  Accessibility,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  Component,
  Contrast,
  Crosshair,
  Download,
  Eye,
  FileJson,
  FileText,
  Image,
  Info,
  LayoutDashboard,
  Lightbulb,
  MessagesSquare,
  MousePointerClick,
  Palette,
  Ruler,
  ScanLine,
  Settings,
  Sparkles,
  Type,
  Waves,
  Wrench,
  XCircle,
};

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? Info;
  return <Cmp size={size} className={className} />;
}
