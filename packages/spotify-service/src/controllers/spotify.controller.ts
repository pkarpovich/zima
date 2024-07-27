import { Request, Response, Router, BaseController } from "shared/controllers";
import { LoggerService, HttpService } from "shared/services";

import { SpotifyService } from "../services/spotify-service.js";

export class SpotifyController implements BaseController {
    constructor(private readonly spotifyService: SpotifyService, private readonly logService: LoggerService) {
        spotifyService.init().catch(console.error);
    }

    getRoutes(): Router {
        const router = HttpService.newRouter();

        router.get("/callback", this.authCallback.bind(this));

        return router;
    }

    async authCallback(req: Request, res: Response): Promise<void> {
        const code = req.query.code as string;

        await this.spotifyService.authorizationCodeGrant(code);

        this.logService.success("Spotify authorization was successful");

        res.status(200).send("OK");
    }
}
