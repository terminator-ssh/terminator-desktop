import { toast } from "sonner";
import i18n from "@/i18n";
import { ErrorCode } from "@/lib/errorCodes";

export interface ApiErrorDetail {
    code: string;
    message: string;
}

export interface AppClientError {
    code: ErrorCode | string;
    message: string;
    detailsString?: string;
    detailsObject?: string;
    apiDetails?: ApiErrorDetail[];
    raw?: unknown;
}

export function parseAppError(error: unknown): AppClientError {
    console.debug(error)

    const fallback: AppClientError = {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Unknown error",
        raw: error,
    };

    if (!error) return fallback;

    const mapRawError = (rawCause: any, originalPayload: unknown): AppClientError => {
        if (rawCause.Code) { // app error
            return {
                code: rawCause.Code,
                message: rawCause.Message || "App Error",
                detailsString: rawCause.ErrorString,
                detailsObject: rawCause.Err,
                raw: originalPayload,
            };
        }
        if (rawCause.StatusCode) { // api error
            const details = Array.isArray(rawCause.Details)
                ? rawCause.Details as ApiErrorDetail[]
                : [];

            return {
                code: ErrorCode.API_ERROR,
                message: "API Error",
                apiDetails: details,
                raw: originalPayload,
            };
        }
        if (rawCause.error) { // emitter error
            return mapRawError(rawCause.error, originalPayload)
        }
        return fallback;
    };

    // we got this from an emitter
    if (typeof error === "object" && "error" in error) {
        return mapRawError(error, error);
    }

    // we got this from wails
    let errorString = "";
    if (typeof error === "string") {
        errorString = error;
    } else if (error instanceof Error) {
        errorString = error.message;
    }

    if (errorString) {
        try {
            const parsed = JSON.parse(errorString);
            if (parsed?.cause) {
                return mapRawError(parsed.cause, parsed);
            }
        } catch {
            if (error instanceof Error) {
                return { code: ErrorCode.RUNTIME_ERROR, message: error.message, raw: error };
            }
            return { code: ErrorCode.INTERNAL_ERROR, message: errorString, raw: error };
        }
    }

    return fallback;
}

export function handleAppError(rawError: unknown, fallbackCode: string = ErrorCode.UNKNOWN_ERROR) {
    const appError = parseAppError(rawError);

    const safeTitle = i18n.t(`errors:${appError.code}`, {
        defaultValue: i18n.t(`errors:${fallbackCode}`),
    });

    let description: string | undefined = undefined;

    if (appError.code === ErrorCode.API_ERROR && appError.apiDetails && appError.apiDetails.length > 0) {
        description = appError.apiDetails
            .map((detail) => i18n.t(`errors:${detail.code}`, { defaultValue: detail.code }))
            .join(" • ");
    } else if (appError.code === ErrorCode.API_ERROR) {
        description = i18n.t(`errors:${ErrorCode.INTERNAL_ERROR}`);
    } else if (appError.detailsString) {
        description = appError.detailsString;
    }

    toast.error(safeTitle, {
        description: description,
        duration: 5000,
    });

    console.error("App Error:", appError);
}