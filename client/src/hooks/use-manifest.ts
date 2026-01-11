import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useManifest() {
  return useQuery({
    queryKey: [api.addon.manifest.path],
    queryFn: async () => {
      const res = await fetch(api.addon.manifest.path);
      if (!res.ok) throw new Error("Failed to fetch manifest");
      // Validate with schema from api definition
      return api.addon.manifest.responses[200].parse(await res.json());
    },
  });
}
