"use client";

import { useState } from "react";

import { getErrorMessage } from "@/helpers/errorMessageHandler";

/**
 * Custom hook to manage state with localStorage
 * @param key The key under which the value will be stored in localStorage
 * @param initialValue The initial value to use if there is no existing value in localStorage for the specified key
 * @returns A tuple containing the current value and a function to update it
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (err: unknown) {
      console.log(getErrorMessage(err));
      return initialValue;
    }
  });

  /**
   * Function to update the stored value
   * @param value The new value to store
   */
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err: unknown) {
      console.log(getErrorMessage(err));
    }
  };

  return [storedValue, setValue] as const;
}

/**
 * Gets a value from localStorage
 * @param key The key of the value to retrieve
 * @returns The value from localStorage or an object with an error message if the key does not exist or an error occurs
 */
export function getLocalStorageValue<T>(key: string): T | { error: string } {
  if (typeof window === "undefined") {
    return { error: "localStorage is not available" };
  }
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : { error: "Item not found" };
  } catch (err: unknown) {
    return { error: getErrorMessage(err) };
  }
}

export const getOrSaveFromStorage = ({ key, get }: { key: string; get: boolean }) => {
  if (get) {
    const value =
      getLocalStorageValue<{ chatId: string; count: number }[]>(key);
    return Array.isArray(value) ? value : [];
  } else {
    const defaultValue = [{ chatId: "", count: 0 }];
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
};
