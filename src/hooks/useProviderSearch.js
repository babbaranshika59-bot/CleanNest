import { useAsync } from "./useAsync.js";
import { providerService } from "../services/providerService.js";
import { serviceService } from "../services/serviceService.js";

// Provider search through the service layer (REST-style query params + pagination).
export function useProviderSearch({ q = "", location = "", category = "", sort = "", page = 1, pageSize = 6, onlyIds = null }) {
  return useAsync(
    () =>
      providerService.list({
        status: "active", // inactive providers are hidden from the public
        q: q.trim(),
        location: location.trim(),
        category,
        sort,
        page,
        pageSize,
        ids: onlyIds ? (onlyIds.length ? onlyIds.join(",") : "0") : undefined, // "0" matches nothing
      }),
    [q, location, category, sort, page, pageSize, onlyIds?.join(",")]
  );
}

export function useCategories() {
  const req = useAsync(() => serviceService.list(), []);
  return { ...req, categories: req.data?.items ?? [] };
}
