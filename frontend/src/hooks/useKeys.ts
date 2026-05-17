import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyService } from "../../bindings/terminator-desktop/backend/internal/services/blob";
import { SavedKey } from "../../bindings/terminator-desktop/backend/internal/services/blob";
import { handleAppError } from "@/lib/error";

export const KEYS_QUERY_KEY = ["keys"];

export function useKeys() {
    return useQuery<SavedKey[], Error>({
        queryKey: KEYS_QUERY_KEY,
        queryFn: async () => KeyService.GetAll()
    });
}

export function useSaveKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (key: SavedKey) => {
            await KeyService.Save(key)
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: KEYS_QUERY_KEY}),
        onError: (error) => {
            handleAppError(error);
        },
    });
}

export function useDeleteKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await KeyService.Delete(id)
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: KEYS_QUERY_KEY}),
        onError: (error) => {
            handleAppError(error);
        },
    });
}