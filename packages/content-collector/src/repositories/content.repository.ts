import { type Database } from "../database/database.js";

export type Content = {
    id: string;
    title: string;
    artist: string;
    album: string;
    application: string;
    mediaType: string;
    createdAt: string;
    updatedAt: string;
};

export type Playback = {
    id: string;
    contentId: string;
    position: string;
    updatedAt: string;
};

export type ContentWithPlayback = {
    content: Content;
    playback: Playback[];
};

export class ContentRepository {
    constructor(private readonly db: Database) {}

    init() {
        this.db
            .prepare(
                `
            CREATE TABLE IF NOT EXISTS content (
                id TEXT PRIMARY KEY,
                title TEXT,
                artist TEXT,
                album TEXT,
                application TEXT,
                mediaType TEXT,
                createdAt TEXT
                updatedAt TEXT
            )
        `,
            )
            .run();

        this.db
            .prepare(
                `
            CREATE TABLE IF NOT EXISTS playback (
                id TEXT PRIMARY KEY,
                contentId TEXT,
                position TEXT,
                updatedAt TEXT,
                FOREIGN KEY(contentId) REFERENCES content(id)
            )
        `,
            )
            .run();
    }
    createOrReplaceContent(content: Content) {
        this.db
            .prepare(
                `
            INSERT INTO content (id, title, artist, album, application, mediaType, createdAt)
            VALUES (@id, @title, @artist, @album, @application, @mediaType, @createdAt)
            ON CONFLICT(id) DO UPDATE SET
                title = @title,
                artist = @artist,
                album = @album,
                application = @application,
                mediaType = @mediaType,
                createdAt = @createdAt
        `,
            )
            .run(content);
    }

    createPlayback(playback: Playback) {
        this.db
            .prepare(
                `
            INSERT INTO playback (id, contentId, position, updatedAt)
            VALUES (@id, @contentId, @position, @updatedAt)
            ON CONFLICT(id) DO UPDATE SET
                contentId = @contentId,
                position = @position,
                updatedAt = @updatedAt
        `,
            )
            .run(playback);
    }

    getAllContent(): Content[] {
        return this.db
            .prepare<any, Content>(
                `
            SELECT * FROM content
        `,
            )
            .all({});
    }

    getAllPlayback(): Playback[] {
        return this.db
            .prepare<any, Playback>(
                `
            SELECT * FROM playback
        `,
            )
            .all({});
    }

    getContentWithPlayback(): ContentWithPlayback[] {
        const contents = this.getAllContent();
        const playbacks = this.getAllPlayback();

        return contents.map((content) => ({
            content,
            playback: playbacks.filter((playback) => playback.contentId === content.id),
        }));
    }

    findByTitleAndArtist(title: string, artist: string): Content | null {
        return (
            this.db
                .prepare<[string, string], Content>(
                    `
            SELECT * FROM content WHERE title = ? AND artist = ?
        `,
                )
                .get(title, artist) || null
        );
    }
}
