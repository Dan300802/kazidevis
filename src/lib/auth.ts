"use client";

export interface UserAuth {
  id: string;
  nom: string;
  telephone: string;
  metier: string;
  ville: string;
  initiales: string;
  createdAt: string;
}

// Storage sécurisé — fonctionne sur iOS Safari, mode privé, etc.
function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, val: string): void {
  try { localStorage.setItem(key, val); } catch {}
}
function safeRemove(key: string): void {
  try { localStorage.removeItem(key); } catch {}
}

const KEY = "kazidevis_auth";

export function getUser(): UserAuth | null {
  try {
    const raw = safeGet(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function saveUser(u: UserAuth) {
  safeSet(KEY, JSON.stringify(u));
  safeSet(`kazidevis_user_${u.telephone.replace(/\s/g,"")}`, JSON.stringify(u));
}

export function logout() {
  safeRemove(KEY);
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function getInitiales(nom: string): string {
  return nom.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export const METIERS = [
  "Maçonnerie","Couture / Tailleur","Électricité","Plomberie",
  "Menuiserie","Peinture","Carrelage","Soudure","Mécanique","Autre",
];
