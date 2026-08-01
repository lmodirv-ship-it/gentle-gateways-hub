export function money(value: number | null | undefined, currency = "USD") {
  const n = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("ar", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function num(value: number | null | undefined) {
  return new Intl.NumberFormat("ar").format(Number(value ?? 0));
}

export function date(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ar", { year: "numeric", month: "short", day: "numeric" });
}

export function dateTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" });
}

export const statusText: Record<string, string> = {
  paid: "مدفوع",
  pending: "قيد الانتظار",
  failed: "فشل",
  refunded: "مُسترجع",
  canceled: "ملغى",
  active: "نشط",
  trialing: "تجربة",
  past_due: "متأخر",
  expired: "منتهٍ",
  draft: "مسودة",
  open: "مفتوح",
  void: "ملغاة",
  overdue: "متأخرة",
  resolved: "تم الحل",
  closed: "مغلق",
  inactive: "غير نشط",
  lead: "مهتم",
  maintenance: "صيانة",
  suspended: "موقوف",
  connected: "مرتبط",
  disconnected: "غير مرتبط",
  credit: "إيداع",
  debit: "سحب",
  payout: "تحويل",
  refund: "استرجاع",
  fee: "عمولة",
  info: "معلومة",
  warning: "تحذير",
  critical: "حرج",
  success: "إيجابي",
  plan: "خطة",
  service: "خدمة",
  template: "قالب",
  physical: "منتج",
  digital: "رقمي",
  high: "عالية",
  normal: "عادية",
  low: "منخفضة",
};

export function tone(status: string | null | undefined) {
  switch (status) {
    case "paid":
    case "active":
    case "resolved":
    case "connected":
    case "success":
    case "credit":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "pending":
    case "open":
    case "trialing":
    case "draft":
    case "maintenance":
    case "info":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "failed":
    case "past_due":
    case "overdue":
    case "critical":
    case "suspended":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
