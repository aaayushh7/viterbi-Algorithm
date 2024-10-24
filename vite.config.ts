import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export interface RemixFuture {
  v3_fetcherPersist: boolean;
  v3_relativeSplatPath: boolean;
  v3_throwAbortReason: boolean;
  v3_singleFetch: boolean;
  v3_lazyRouteDiscovery: boolean;
}

declare module "@remix-run/node" {
  interface Future extends RemixFuture {}
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
      "~": path.resolve(__dirname, "./app")
    }
  }
});