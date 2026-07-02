import { useAuditStore } from '@/store/useAuditStore';

/** Read/toggle the expanded state of a collapsible section by id. */
export function useSectionExpansion(id: string): [boolean, () => void] {
  const expanded = useAuditStore((s) => Boolean(s.expandedSections[id]));
  const toggle = useAuditStore((s) => s.toggleSection);
  return [expanded, () => toggle(id)];
}
