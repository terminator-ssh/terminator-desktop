import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HostService } from "../../bindings/terminator-desktop/backend/internal/services/blob";
import { Host } from "../../bindings/terminator-desktop/backend/internal/services/blob/";
import { handleAppError } from "@/lib/error";

export const HOSTS_QUERY_KEY = ["hosts"];

export function useHosts() {
    return useQuery({
        queryKey: HOSTS_QUERY_KEY,
        queryFn: async () => HostService.GetAll(),
    });
}

export function useSaveHost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (host: Host) => HostService.Save(host),
        onSuccess: () => queryClient.invalidateQueries({queryKey: HOSTS_QUERY_KEY}),
        onError: (error) => {
            handleAppError(error);
        },
    });
}

export function useDeleteHost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => HostService.Delete(id),
        onSuccess: () => queryClient.invalidateQueries({queryKey: HOSTS_QUERY_KEY}),
        onError: (error) => {
            handleAppError(error);
        },
    });
}