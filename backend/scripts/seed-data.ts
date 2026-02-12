import dotenv from "dotenv";
import mongoose from "mongoose";
import { File } from "../models/File.js";
import { DownloadEvent } from "../models/DownloadEvent.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

// -------------------- CONFIG --------------------
const START_DATE = new Date("2026-01-01");
const END_DATE = new Date("2026-02-07");

// -------------------- HELPERS --------------------
const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]) => arr[rand(0, arr.length - 1)];

const weightedPick = <T extends { weight: number }>(arr: T[]) => {
    const sum = arr.reduce((a, b) => a + b.weight, 0);
    let r = Math.random() * sum;
    for (const el of arr) {
        if ((r -= el.weight) <= 0) return el;
    }
    return arr[0];
};

function humanDownloadTime(date: Date) {
    const d = new Date(date);

    const hourProfile = weightedPick([
        { weight: 5, hour: rand(0, 6) },
        { weight: 35, hour: rand(9, 12) },
        { weight: 40, hour: rand(13, 18) },
        { weight: 20, hour: rand(19, 23) },
    ]);

    d.setHours(hourProfile.hour, rand(0, 59), rand(0, 59), rand(0, 999));
    return d;
}

function realisticDuration(size: number) {
    const speed = rand(3, 12) * 1024 * 1024;
    return Math.max(300, Math.floor(size / speed * 1000));
}

function activityForDay(date: Date) {
    const weekend = [0, 6].includes(date.getDay());
    const base = weekend ? rand(0, 20) : rand(5, 45);
    return base === 0 ? 0 : rand(base * 0.5, base);
}

// -------------------- FILE TEMPLATES --------------------
const TEMPLATES = [
    { name: "Report.pdf", ext: "pdf", cat: "document", mime: "application/pdf", size: 2e6, domain: "drive.google.com", weight: 10 },
    { name: "Screenshot.png", ext: "png", cat: "image", mime: "image/png", size: 3e6, domain: "imgur.com", weight: 15 },
    { name: "Tutorial.mp4", ext: "mp4", cat: "video", mime: "video/mp4", size: 150e6, domain: "youtube.com", weight: 8 },
    { name: "Podcast.mp3", ext: "mp3", cat: "audio", mime: "audio/mpeg", size: 25e6, domain: "spotify.com", weight: 7 },
    { name: "Project.zip", ext: "zip", cat: "archive", mime: "application/zip", size: 80e6, domain: "github.com", weight: 9 },
    { name: "Installer.exe", ext: "exe", cat: "executable", mime: "application/x-msdownload", size: 60e6, domain: "download.com", weight: 6 },
];

// -------------------- SEED --------------------
async function seed(userId: string) {
    const userObj = new mongoose.Types.ObjectId(userId);

    console.log("Clearing old data...");
    await DownloadEvent.deleteMany({ userId: userObj });
    await File.deleteMany({ userId: userObj });

    const fileMap = new Map<string, any>();
    const events: any[] = [];

    let day = new Date(START_DATE);

    while (day <= END_DATE) {
        const downloads = activityForDay(day);

        for (let i = 0; i < downloads; i++) {
            const sessionBurst = rand(1, 4);

            for (let j = 0; j < sessionBurst; j++) {
                const template = weightedPick(TEMPLATES);

                let fileKey;
                let fileDoc;
                let isNew = false;

                if (Math.random() < 0.6 && fileMap.size > 0) {
                    fileKey = pick(Array.from(fileMap.keys()));
                    fileDoc = fileMap.get(fileKey);
                } else {
                    fileKey = `${template.name}_${fileMap.size}`;
                    fileDoc = {
                        userId: userObj,
                        hash: fileKey,
                        filename: fileKey,
                        url: `https://${template.domain}/${fileKey}`,
                        size: template.size,
                        fileExtension: template.ext,
                        fileCategory: template.cat,
                        mimeType: template.mime,
                        sourceDomain: template.domain,
                        firstDownloadedAt: day,
                    };

                    fileMap.set(fileKey, fileDoc);
                    isNew = true;
                }

                const downloadTime = humanDownloadTime(day);

                events.push({
                    userId: userObj,
                    hash: fileKey,
                    status: isNew ? "new" : "duplicate",
                    downloadedAt: downloadTime,
                    duration: realisticDuration(fileDoc.size),
                });
            }
        }

        day.setDate(day.getDate() + 1);
    }

    console.log("Inserting files...");
    const files = await File.insertMany(Array.from(fileMap.values()));

    const hashToId = new Map<string, any>();
    files.forEach(f => hashToId.set(f.hash, f._id));

    const finalEvents = events.map(e => ({
        userId: e.userId,
        fileId: hashToId.get(e.hash),
        status: e.status,
        downloadedAt: e.downloadedAt,
        duration: e.duration,
    }));

    console.log("Inserting events...");
    await DownloadEvent.insertMany(finalEvents);

    console.log("Seed completed!");
}

// -------------------- MAIN --------------------
(async () => {
    const userId = process.argv[2];
    if (!userId) {
        console.error("Usage: npm run seed <userId>");
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    await seed(userId);
    await mongoose.disconnect();
})();
