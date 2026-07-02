import { useAuditStore } from '@/store/useAuditStore';

/** Convenience selector hooks over the audit store. */
export const useSelection = () => useAuditStore((s) => s.selection);
export const useReport = () => useAuditStore((s) => s.report);
export const useExperience = () => useAuditStore((s) => s.experience);
export const useFrameImage = () => useAuditStore((s) => s.frameImage);
export const useSettings = () => useAuditStore((s) => s.settings);
export const useNav = () => useAuditStore((s) => s.nav);
export const useStatus = () => useAuditStore((s) => s.status);
export const useProgress = () => useAuditStore((s) => s.progress);
export const useAuditError = () => useAuditStore((s) => s.error);
