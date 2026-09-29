import { fetchRoadmapData } from "./roadmap";

export function roadmapApiRoutes() {
  return {
    "/api/training/roadmap": {
      GET: async () => {
        try {
          const data = await fetchRoadmapData();
          return Response.json(data);
        } catch {
          return Response.json({ error: "Failed to load the roadmap sheet" }, { status: 502 });
        }
      },
    },
  };
}
