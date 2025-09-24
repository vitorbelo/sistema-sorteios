// Sistema de autenticação simples (para produção, use NextAuth.js)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function setAdminSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('admin_authenticated', 'true');
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  }
  return false;
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('admin_authenticated');
  }
}