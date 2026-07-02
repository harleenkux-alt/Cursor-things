import { useAuditStore } from '@/store/useAuditStore';

/** Convenience selector hooks over the audit store. */
export const useSelection = () => useAuditStore((s) => s.selection);
export const useReport = () => useAuditStore((s) => s.report);
export const useSettings = () => useAuditStore((s) => s.settings);
export const useView = () => useAuditStore((s) => s.view);
export const useProgress = () => useAuditStore((s) => s.progress);
export const useAuditError = () => useAuditStore((s) => s.error);
