import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { ApiEndpointProvider } from "./contexts/ApiEndpointContext";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <ApiEndpointProvider>
      <HeroUIProvider navigate={navigate} useHref={useHref} locale="th-TH">
        {children}
      </HeroUIProvider>
    </ApiEndpointProvider>
  );
}
