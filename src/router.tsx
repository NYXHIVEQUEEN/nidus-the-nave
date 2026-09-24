import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({ routeTree, defaultErrorComponent: AppErrorComponent });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
