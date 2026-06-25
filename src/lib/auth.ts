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

const KEY = "kazidevis_auth";

export function getUser(): UserAuth | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}

export function saveUser(u: UserAuth) {
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function logout() {
  localStorage.removeItem(KEY);
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
