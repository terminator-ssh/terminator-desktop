import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatServerUrl(inputUrl: string): string {
    let cleanUrl = inputUrl.trim();

    if (!cleanUrl.startsWith("http://")) {
        cleanUrl = `https://${cleanUrl}`;
    }

    if (!cleanUrl.endsWith("/api/v1")) {
        cleanUrl = `${cleanUrl.replace(/\/$/, "")}/api/v1`;
    }

    console.log(`${inputUrl} -> ${cleanUrl}`)

    return cleanUrl;
}

export function decodeBase64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    return Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
}