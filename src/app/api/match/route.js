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

        if (!file) return NextResponse.json({ message: "No file uploaded", success: false });

        // Define paths
        const imagesDir = path.join(process.cwd(), "public", "images");
        const userImageDir = path.join(process.cwd(), "public", "userImage");
        const userImagePath = path.join(userImageDir, "userImage.jpg");

        // Ensure directories exist
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
        if (!fs.existsSync(userImageDir)) fs.mkdirSync(userImageDir, { recursive: true });

        const imagePaths = [];
        let index = 0;

        // Download account images
        for (const user of accounts) {
            const imageUrl = user.image?.uri || user?.profile_pic_url;
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
                console.error(`Failed to fetch image for index ${index}:`, error);
            }
        }

        // Save uploaded image after processing account images
        const uploadedBytes = await file.arrayBuffer();
        const uploadedBuffer = Buffer.from(uploadedBytes);
        await writeFile(userImagePath, uploadedBuffer);

        console.log('Images Downloaded Succesfully!');

        // Call Python script
        const result = await new Promise((resolve) => {
            const pythonProcess = spawn("python", ["scripts/facenet_match.py"]);

            let output = "";
            pythonProcess.stdout.on("data", (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error(`Python Error: ${data}`);
            });

            pythonProcess.on("close", () => {
                const trimmedOutput = output.trim();

                console.log('Trimmed Output', trimmedOutput);

                if (trimmedOutput.startsWith("Success:")) {
                    const matchIndex = parseInt(trimmedOutput.match(/\d+/)?.[0] || "-1", 10);
                    resolve({ success: true, message: "Match found successfully!", index: matchIndex });
                } else if (trimmedOutput.startsWith("Error:")) {
                    resolve({ success: false, message: trimmedOutput.replace("Error: ", ""), index: null });
                } else {
                    resolve({ success: false, message: "Unknown error occurred", index: null });
                }
            });
        });

        // Cleanup: Delete all images in "images" folder + userImage.jpg
        try {
            const files = await readdir(imagesDir);
            for (const file of files) {
                await unlink(path.join(imagesDir, file));
            }

            if (fs.existsSync(userImagePath)) {
                await unlink(userImagePath);
                console.log("Deleted userImage.jpg");
            }
        } catch (error) {
            console.error("Error cleaning up images:", error);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in face matching API:", error);
        return NextResponse.json({ message: "An error occurred", success: false }, { status: 500 });
    }
}
