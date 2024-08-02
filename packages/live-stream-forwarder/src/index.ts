import { spawn } from "node:child_process";
import express from "express";

enum StreamProvider {
    Twitch = "twitch",
}

const app = express();
const port = Number(process.env.PORT) || 8080;

app.get("/stream/:providerName/:streamId", (req, res) => {
    const { providerName, streamId } = req.params;
    const streamUrl = getStreamUrl(providerName, streamId);

    const streamlinkProcess = spawn("streamlink", [`--stdout`, streamUrl, "best"]);

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

app.listen(port, "0.0.0.0", () => {
    console.log(`server is running at http://0.0.0.0:${port}`);
});
