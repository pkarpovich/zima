import { spawn } from "node:child_process";
import express from "express";
import { writeM3U } from "@iptv/playlist";
import ogs from "open-graph-scraper";

enum StreamProvider {
    Twitch = "twitch",
}

const Config = {
    HOST: process.env.HOST || "localhost",
    PORT: Number(process.env.PORT) || 8080,
    PUBLIC_URL: process.env.PUBLIC_URL || "http://localhost:8080",
    TWITCH_OAUTH_TOKEN: process.env.TWITCH_OAUTH_TOKEN,
};

const app = express();

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/playlist/:providerName/:streamId", async (req, res) => {
    const { providerName, streamId } = req.params;
    const url = getStreamUrl(providerName, streamId);

    const { result } = await ogs({ url });

    const title = result.ogTitle ? `${result.ogTitle} - ${result.ogDescription}` : streamId;
    const playlist = writeM3U({
        channels: [
            {
                name: title,
                duration: -1,
                url: `${Config.PUBLIC_URL}/stream/${providerName}/${streamId}`,
            },
        ],
    });

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.send(playlist);
});

app.get("/stream/:providerName/:streamId", (req, res) => {
    const { providerName, streamId } = req.params;
    const streamUrl = getStreamUrl(providerName, streamId);

    const streamlinkProcess = spawn("streamlink", [
        `--stdout`,
        `--twitch-low-latency`,
        `--twitch-api-header=Authorization=OAuth ${Config.TWITCH_OAUTH_TOKEN}`,
        streamUrl,
        "best",
    ]);

    streamlinkProcess.stderr.on("data", (data) => {
        console.error(`streamlink: ${data}`);
    });

    streamlinkProcess.on("error", (error) => {
        console.error(`streamlink process error: ${error}`);
    });

    res.setHeader("Content-Type", "video/MP2T");
    streamlinkProcess.stdout.pipe(res);

    req.on("close", () => {
        console.log(`client closed the connection for stream: ${streamUrl}, stopping Streamlink`);
        streamlinkProcess.kill();
    });

    streamlinkProcess.on("exit", (code) => {
        console.log(`streamlink process for channel: ${streamUrl} exited with code ${code}`);
    });
});

function getStreamUrl(providerName: string, streamId: string): string {
    switch (providerName) {
        case StreamProvider.Twitch:
            return `twitch.tv/${streamId}`;
        default:
            throw new Error(`unknown stream provider: ${providerName}`);
    }
}

app.listen(Config.PORT, Config.HOST, () => {
    console.log(`server is running at http://${Config.HOST}:${Config.PORT}`);
});
