export type Lang = 'en' | 'ar'

const en = {
  ready: 'Khfagy is on',
  paneTitle: 'Activity',
  paneEmpty: 'No activity yet.',
  commandDesc: 'Open the Khfagy activity pane',
  opened: 'Activity pane opened.',
  noPane: 'This surface does not show panes.',
  lastTurn: (s: number, t: number, f: number) =>
    `Last turn ${s}s · ${t} tool${t === 1 ? '' : 's'}${f > 0 ? ` · ${f} failed` : ''}`,
  hide: 'Hide',
  status: (t: number, f: number) => `⚓ ${t} tools${f > 0 ? ` · ${f} failed` : ''}`,
  slow: (s: number) => `That turn took ${s}s`,
  blockedFile: (p: string) => `Blocked: ${p} is a protected secret file`,
  blockedCmd: (c: string) => `Blocked a destructive command: ${c}`,
  guardFailed: 'Khfagy guard failed, so the call was blocked.',
}

const ar: typeof en = {
  ready: 'Khfagy يعمل',
  paneTitle: 'النشاط',
  paneEmpty: 'لا يوجد نشاط بعد.',
  commandDesc: 'افتح لوحة نشاط Khfagy',
  opened: 'تم فتح لوحة النشاط.',
  noPane: 'هذه الواجهة لا تعرض اللوحات.',
  lastTurn: (s, t, f) => `آخر دور ${s} ث · ${t} أداة${f > 0 ? ` · ${f} فشل` : ''}`,
  hide: 'إخفاء',
  status: (t, f) => `⚓ ${t} أداة${f > 0 ? ` · ${f} فشل` : ''}`,
  slow: s => `استغرق هذا الدور ${s} ثانية`,
  blockedFile: p => `تم المنع: ${p} ملف سري محمي`,
  blockedCmd: c => `تم منع أمر خطير: ${c}`,
  guardFailed: 'فشلت حماية Khfagy فتم منع الاستدعاء.',
}

export const strings = (lang: Lang) => (lang === 'ar' ? ar : en)
