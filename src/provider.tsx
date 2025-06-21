import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { ApiEndpointProvider } from "./contexts/ApiEndpointContext";
import { CameraProvider } from "./contexts/CameraContext";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <ApiEndpointProvider>
      <CameraProvider>
        <HeroUIProvider navigate={navigate} useHref={useHref} locale="th-TH">
          {children}
        </HeroUIProvider>
      </CameraProvider>
    </ApiEndpointProvider>
  );
}
