import { BaseController, Request, Response, Router } from "shared/controllers";
import { HttpService, LoggerService } from "shared/services";
import { runFunctionWithRetry } from "shared/utils";

import { SpotifyService } from "../services/spotify-service.js";
import { ActionTypes } from "../constants/action-types.js";

const DefaultDeviceType = "TV";

export class CommandsController implements BaseController {
    constructor(private readonly spotifyService: SpotifyService, private readonly loggerService: LoggerService) {}

    getRoutes(): Router {
        const router = HttpService.newRouter();

        router.post("/execute", this.execute.bind(this));

        return router;
    }

    async execute(req: Request, resp: Response) {
        const { name, props, args } = req.body;
        const { deviceType } = args ?? {};

        const device = await this.getTargetDevice(deviceType);
        if (!device || !device.id) {
            return resp.status(404).json({ message: "No active device found" });
        }

        try {
            await runFunctionWithRetry(
                async () => this.handleAction(name, device, props),
                this.spotifyService.refreshAccess
            );

            return resp.status(200).json({ message: "OK" });
        } catch (e: any) {
            this.loggerService.error(e.message);
            return resp.status(500).json({ message: e.message });
        }
    }

    private async getTargetDevice(deviceType?: string): Promise<SpotifyApi.UserDevice | null> {
        const devices = await this.spotifyService.getDevices();
        if (deviceType) {
            return devices.find((d) => d.type === deviceType) ?? null;
        }

        const activeDevice = devices.find((d) => d.is_active);
        if (activeDevice) {
            return activeDevice;
        }

        return devices.find((d) => d.type === DefaultDeviceType) ?? null;
    }

    private async handleAction(name: string, device: SpotifyApi.UserDevice, props: { value: string }[]) {
        if (!device.id) {
            throw new Error("No active device found");
        }

        this.loggerService.log(`Executing action: ${name}`);

        switch (name) {
            case ActionTypes.Resume: {
                await this.spotifyService.resume(device.id);
                break;
            }
            case ActionTypes.Pause: {
                await this.spotifyService.pause(device.id);
                break;
            }
            case ActionTypes.NextTrack: {
                await this.spotifyService.nextTrack(device.id);
                break;
            }
            case ActionTypes.PrevTrack: {
                await this.spotifyService.prevTrack(device.id);
                break;
            }
            case ActionTypes.RestartTack: {
                await this.spotifyService.seekTrack(0, device.id);
                break;
            }
            case ActionTypes.PlayPlaylist: {
                await this.spotifyService.play(device.id, props[0].value);
                break;
            }
            case ActionTypes.EnableShuffle: {
                await this.spotifyService.setShuffle(device.id, true);
                break;
            }
            case ActionTypes.DisableShuffle: {
                await this.spotifyService.setShuffle(device.id, false);
                break;
            }
            case ActionTypes.ChangePlayback: {
                await this.spotifyService.changePlaybackDevice(device.id);
                break;
            }
            default: {
                throw new Error(`Unknown action type: ${name}`);
            }
        }
    }
}
