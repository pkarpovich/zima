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
    playback?: Playback[];
    metadata?: Metadata | null;
};

export type Playback = {
    id: string;
    contentId: string;
    position: string;
    updatedAt: string;
};

export type Metadata = {
    id: string;
    contentId: string;
    contentUrl: string;
    posterLink: string;
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

        this.db
            .prepare(
                `
            CREATE TABLE IF NOT EXISTS metadata (
                id TEXT PRIMARY KEY,
                contentId TEXT,
                contentUrl TEXT,
                posterLink TEXT,
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

    createOrReplaceMetadata(metadata: Metadata) {
        this.db
            .prepare(
                `
            INSERT INTO metadata (id, contentId, contentUrl, posterLink)
            VALUES (@id, @contentId, @contentUrl, @posterLink)
            ON CONFLICT(id) DO UPDATE SET
                contentUrl = @contentUrl,
                posterLink = @posterLink
        `,
            )
            .run(metadata);
    }

    getAllContent(applicationName?: string): Content[] {
        if (applicationName) {
            return this.db
                .prepare<any, Content>(
                    `
                SELECT * FROM content WHERE application = ? ORDER BY createdAt DESC
            `,
                )
                .all(applicationName);
        }

        return this.db
            .prepare<any, Content>(
                `
            SELECT * FROM content ORDER BY createdAt DESC
        `,
            )
            .all({});
    }

    getAllPlayback(): Playback[] {
        return this.db
            .prepare<any, Playback>(
                `
            SELECT * FROM playback ORDER BY updatedAt DESC LIMIT 1
        `,
            )
            .all({});
    }

    getAllMetadata(): Metadata[] {
        return this.db
            .prepare<any, Metadata>(
                `
            SELECT * FROM metadata
        `,
            )
            .all({});
    }

    getContentWithPlayback(applicationName?: string): Content[] {
        const contents = this.getAllContent(applicationName);
        const playbacks = this.getAllPlayback();
        const metadata = this.getAllMetadata();

        return contents.map<Content>((content) => ({
            ...content,
            playback: playbacks.filter((playback) => playback.contentId === content.id) || [],
            metadata: metadata.find((metadata) => metadata.contentId === content.id) || null,
        }));
    }

    findByTitleAndArtist(title: string, artist: string): Content | null {
        const content =
            this.db
                .prepare<[string, string], Content>(
                    `
            SELECT * FROM content WHERE title = ? AND artist = ?
        `,
                )
                .get(title, artist) || null;

        if (!content) {
            return null;
        }

        const metadata = this.db
            .prepare<[string], Metadata>(`SELECT * FROM metadata WHERE contentId = ?`)
            .get(content.id);

        return {
            ...content,
            metadata,
        };
    }
}
