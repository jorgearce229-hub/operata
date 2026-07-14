// Determina si el usuario tiene acceso Pro activo en este momento, considerando:
// 1. Plan Pro normal (suscripción de Stripe u OXXO con pro_expires_at)
// 2. Bono de días Pro ganados por el programa de referidos (bonus_pro_until),
//    que aplica incluso a usuarios en plan gratuito.
export function isProActive(profile) {
  if (!profile) return false
  if (profile.plan === 'pro') return true
  if (profile.bonus_pro_until && new Date(profile.bonus_pro_until) > new Date()) return true
  return false
}
