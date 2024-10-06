import { spawn, exec, ChildProcess } from "node:child_process";
import express from "express";
import type { Request, Response } from "express";
import { writeM3U } from "@iptv/playlist";
import ogs from "open-graph-scraper";

const Config = {
    HOST: process.env.HOST || "localhost",
    PORT: Number(process.env.PORT) || 8080,
    PUBLIC_URL: process.env.PUBLIC_URL || "http://localhost:8080",
    TWITCH_OAUTH_TOKEN: process.env.TWITCH_OAUTH_TOKEN,
    COOKIES_FILE_PATH: process.env.COOKIES_FILE_PATH || "./cookies.txt",
};

enum ForwarderMethod {
    STREAMLINK = "streamlink",
    YTDLP = "yt-dlp",
}

const app = express();

app.get("/health", (_, res: Response) => {
    res.json({ status: "ok" });
});

app.get("/playlist", async (req: Request, res: Response) => {
    const { url } = req.query;

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
        return res.status(400).send("Missing or invalid URL");
    }

    const title = await generateTitle(url);
    const playlist = writeM3U({
        channels: [
            {
                name: title,
                duration: -1,
                url: `${Config.PUBLIC_URL}/stream?url=${encodeURIComponent(url)}`,
            },
        ],
    });

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.send(playlist);
});

app.get("/stream", (req: Request, res: Response) => {
    const { url } = req.query;

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
        return res.status(400).send("Missing or invalid URL");
    }

    const method = determineForwarderMethod(url);

    let childProcess;
    let contentType = "video/MP2T";

    switch (method) {
        case ForwarderMethod.STREAMLINK: {
            childProcess = spawn("streamlink", [
                `--stdout`,
                `--twitch-low-latency`,
                `--twitch-api-header=Authorization=OAuth ${Config.TWITCH_OAUTH_TOKEN}`,
                url,
                "best",
            ]);
            break;
        }
        case ForwarderMethod.YTDLP: {
            childProcess = spawn("yt-dlp", [
                "--hls-use-mpegts",
                "--part",
                "--cookies",
                Config.COOKIES_FILE_PATH,
                "-o",
                "-",
                url,
            ]);
            contentType = "video/mp4";
            break;
        }
        default: {
            res.status(400).json({ error: "Invalid method parameter" });
            return;
        }
    }

    res.setHeader("Content-Type", contentType);
    childProcess.stdout.pipe(res);

    handleProcessEvents(childProcess, url, req);
});

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

function determineForwarderMethod(url: string): ForwarderMethod {
    const streamlinkRegex = /^(?:https?:\/\/)?(?:www\.)?(twitch\.tv|kick\.com)\//;

    return streamlinkRegex.test(url) ? ForwarderMethod.STREAMLINK : ForwarderMethod.YTDLP;
}

async function generateTitle(url: string): Promise<string> {
    let title = "Stream";

    try {
        const { result } = await ogs({ url });
        if (result.ogTitle) {
            return `${result.ogTitle} - ${result.ogDescription || ""}`.trim();
        }
    } catch (error) {
        console.log("OGS error:", error);
    }

    try {
        const ytDlpCmd = `yt-dlp --get-title ${url} --cookies ${Config.COOKIES_FILE_PATH}`;
        const execPromise = new Promise<string>((resolve, reject) => {
            exec(ytDlpCmd, (error, stdout, stderr) => {
                if (error) {
                    reject(`yt-dlp error: ${stderr}`);
                } else {
                    resolve(stdout.trim());
                }
            });
        });

        title = await execPromise;
    } catch (ytDlpError) {
        console.error("yt-dlp error:", ytDlpError);
    }

    return title;
}

function handleProcessEvents(childProcess: ChildProcess, url: string, req: Request) {
    childProcess.stderr?.on("data", (data) => {
        console.error(`Process error: ${data}`);
    });

    childProcess.on("error", (error) => {
        console.error(`Process error: ${error}`);
    });

    childProcess.on("exit", (code) => {
        console.log(`Process for channel: ${url} exited with code ${code}`);
    });

    req.on("close", () => {
        console.log(`Client closed the connection for stream: ${url}, stopping process`);
        childProcess.kill();
    });
}

app.listen(Config.PORT, Config.HOST, () => {
    console.log(`server is running at http://${Config.HOST}:${Config.PORT}`);
});
