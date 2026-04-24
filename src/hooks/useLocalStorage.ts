import { useState } from "react";
import { getItem, setItem } from "../utils/storage";

export function useLocalStorage(key: string, initialValue: string) {
  const [value, setValue] = useState(() => getItem(key) || initialValue);
  return { value };
}
