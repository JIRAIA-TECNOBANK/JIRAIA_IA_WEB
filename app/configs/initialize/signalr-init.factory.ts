import { SignalrService } from "src/app/core/hub/signalr.service";

export function initializeSignalr(signalrService: SignalrService) {
    return () =>
        signalrService.init();
}