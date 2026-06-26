"use client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc, setDoc, getDoc, collection,
  addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { Devis, Transaction, Client, Artisan } from "@/types";

// ── AUTH ──────────────────────────────────────────────

export async function inscrire(email: string, password: string, profil: Omit<Artisan,"initiales"> & { initiales: string }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "artisans", cred.user.uid), {
    ...profil,
    email,
    createdAt: new Date().toISOString(),
  });
  return cred.user;
}

export async function connecter(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function deconnecter() {
  await signOut(auth);
}

export function onAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// ── PROFIL ARTISAN ────────────────────────────────────

export async function getProfil(uid: string): Promise<Artisan | null> {
  const snap = await getDoc(doc(db, "artisans", uid));
  return snap.exists() ? (snap.data() as Artisan) : null;
}

export async function updateProfil(uid: string, data: Partial<Artisan>) {
  await updateDoc(doc(db, "artisans", uid), data as any);
}

// ── DEVIS ─────────────────────────────────────────────

export async function getDevis(uid: string): Promise<Devis[]> {
  const q = query(collection(db, "artisans", uid, "devis"), orderBy("dateCreation", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Devis));
}

export async function addDevis(uid: string, devis: Omit<Devis, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "artisans", uid, "devis"), devis);
  return ref.id;
}

export async function updateDevis(uid: string, devis: Devis) {
  const { id, ...data } = devis;
  await updateDoc(doc(db, "artisans", uid, "devis", id), data as any);
}

export async function deleteDevis(uid: string, devisId: string) {
  await deleteDoc(doc(db, "artisans", uid, "devis", devisId));
}

// ── TRANSACTIONS ──────────────────────────────────────

export async function getTransactions(uid: string): Promise<Transaction[]> {
  const q = query(collection(db, "artisans", uid, "transactions"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
}

export async function addTransaction(uid: string, tx: Omit<Transaction, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "artisans", uid, "transactions"), tx);
  return ref.id;
}

export async function deleteTransaction(uid: string, txId: string) {
  await deleteDoc(doc(db, "artisans", uid, "transactions", txId));
}

// ── CLIENTS ───────────────────────────────────────────

export async function getClients(uid: string): Promise<Client[]> {
  const q = query(collection(db, "artisans", uid, "clients"), orderBy("dateCreation", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Client));
}

export async function addClient(uid: string, client: Omit<Client, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "artisans", uid, "clients"), client);
  return ref.id;
}

export async function updateClient(uid: string, client: Client) {
  const { id, ...data } = client;
  await updateDoc(doc(db, "artisans", uid, "clients", id), data as any);
}

export async function deleteClient(uid: string, clientId: string) {
  await deleteDoc(doc(db, "artisans", uid, "clients", clientId));
}
