
"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import axios from "axios";

export function useFollowers(initialUsers: any[], search: string) {
  const [debouncedSearch] = useDebounce(search, 400);

  return useQuery({
    queryKey: ["followers", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return initialUsers;

      const res = await axios.get(`/api/search-followers?q=${debouncedSearch}`);
      return res.data;
    },
    placeholderData: initialUsers, 
  });
}
