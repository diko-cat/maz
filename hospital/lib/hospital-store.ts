"use client";

import { useSyncExternalStore } from "react";
import { localDate, seedPatients } from "./data";
import { HOSPITAL_STORAGE_KEY, readHospitalStorage, writeHospitalStorage } from "./storage";
import type { HospitalData, HospitalSnapshot } from "./types";

const serverSnapshot: HospitalSnapshot = {
  patients: seedPatients,
  appointments: [],
  today: "",
  ready: false,
  storageWarning: "",
};

const listeners = new Set<() => void>();
const getBrowserStorage = () => window.localStorage;
const getServerSnapshot = () => serverSnapshot;
let snapshot = serverSnapshot;
let initialized = false;

function getSnapshot(): HospitalSnapshot {
  return snapshot;
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function refreshFromStorage(): void {
  snapshot = readHospitalStorage(localDate(), getBrowserStorage);
}

function handleStorageChange(event: StorageEvent): void {
  if (event.key !== HOSPITAL_STORAGE_KEY && event.key !== null) return;

  refreshFromStorage();
  notifyListeners();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("storage", handleStorageChange);
  }
  if (!initialized) {
    initialized = true;
    refreshFromStorage();
    notifyListeners();
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

export function useHospitalStore(): HospitalSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function updateHospital(data: HospitalData): void {
  const storageWarning = writeHospitalStorage(data, getBrowserStorage);
  snapshot = { ...snapshot, ...data, storageWarning };
  notifyListeners();
}
