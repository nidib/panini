export const albumKeys = {
  all: ["albums"] as const,
  lists: () => [...albumKeys.all, "list"] as const,
  list: () => [...albumKeys.lists()] as const,
  details: () => [...albumKeys.all, "detail"] as const,
  detail: (id: string) => [...albumKeys.details(), id] as const,
  sync: (id: string) => [...albumKeys.detail(id), "sync"] as const,
};
