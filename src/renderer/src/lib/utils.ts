import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeApiUrl(input: string): string {
  let url = input.trim();

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }

  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }

  return url;
}
