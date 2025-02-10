import { spawn } from "child_process";
import { writeFile, unlink, readdir } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";

export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get("file");
        const accounts = JSON.parse(data.get("accounts") || "[]");

        if (!file) return NextResponse.json({ message: "No file uploaded" });

        // Save uploaded image temporarily
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadPath = path.join(process.cwd(), "public", "images", file.name);
        await writeFile(uploadPath, buffer);

        // Ensure images directory exists
        const imagesDir = path.join(process.cwd(), "public", "images");
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

        // Download and save profile images
        const imagePaths = [];

        let index = 0;
        for (const user of accounts) {
            const imageUrl = user.image?.uri || user?.user?.profile_pic_url;
            if (!imageUrl) continue;

            try {
                const response = await fetch(imageUrl);
                if (!response.ok) continue;

                const arrayBuffer = await response.arrayBuffer();
                const userImageBuffer = Buffer.from(arrayBuffer);
                const imagePath = path.join(imagesDir, `${index}.jpg`);
                await writeFile(imagePath, userImageBuffer);
                imagePaths.push(imagePath);

                index++;
            } catch (error) {
                console.error(`Failed to fetch image for ${index}:`, error);
            }
        }

        const result = await new Promise((resolve) => {
            const pythonProcess = spawn("python", ["scripts/facenet_match.py", uploadPath]);

            let output = "";
            pythonProcess.stdout.on("data", (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error(`Python Error: ${data}`);
            });

            pythonProcess.on("close", () => {
                const trimmedOutput = output.trim();
                if (trimmedOutput === "No match found") {
                    resolve({ success: false, message: "No match found" });
                } else {
                    resolve({ success: true, username: trimmedOutput });
                }
            });
        });


        // Cleanup: Delete all downloaded images
        /*
        try {
            const files = await readdir(imagesDir);
            for (const file of files) {
                await unlink(path.join(imagesDir, file));
            }
        } catch (error) {
            console.error("Error cleaning up images:", error);
        }
            */

        return NextResponse.json({ message: result });
    } catch (error) {
        console.error("Error in face matching API:", error);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}
