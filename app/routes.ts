import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("laptops/:uuid", "routes/laptop.tsx"),
  route("channels/:id", "routes/channel.tsx"),
] satisfies RouteConfig;
