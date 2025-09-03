import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { ApiEndpointProvider } from "./contexts/ApiEndpointContext";
import { CameraProvider } from "./contexts/CameraContext";
import { PinAuthProvider } from "./contexts/PinAuthContext";
import { SplashProvider } from "./contexts/SplashContext";

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <ApiEndpointProvider>
      <CameraProvider>
        <PinAuthProvider>
          <SplashProvider>
            <HeroUIProvider navigate={navigate} useHref={useHref} locale="th-TH">
              {children}
            </HeroUIProvider>
          </SplashProvider>
        </PinAuthProvider>
      </CameraProvider>
    </ApiEndpointProvider>
  );
}
