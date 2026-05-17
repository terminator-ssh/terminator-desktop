import { useQuery } from "@tanstack/react-query";
import { AuthService } from "../../bindings/terminator-desktop/backend/internal/services/auth";

export const USER_QUERY_KEY = ["currentUser"];

export function useCurrentUser() {
    return useQuery({
        queryKey: USER_QUERY_KEY,
        queryFn: () => AuthService.GetCurrentUser(),
    });
}