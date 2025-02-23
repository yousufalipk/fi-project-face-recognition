import { spawn } from "child_process";
import { writeFile, unlink, readdir } from "fs/promises";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { NextResponse } from "next/server";

export async function POST(req) {
    console.log("Received POST request for face matching.");

    try {
        const data = await req.formData();
        const file = data.get("file");
        const accounts = JSON.parse(data.get("accounts") || "[]");

        if (!file) {
            console.warn("No file uploaded.");
            return NextResponse.json({ message: "No file uploaded", success: false }, { status: 400 });
        }

        const baseDir = path.resolve(process.cwd(), "public");
        const imagesDir = path.join(baseDir, "images");
        const userImageDir = path.join(baseDir, "userImage");
        const userImagePath = path.join(userImageDir, "userImage.jpg");

        [imagesDir, userImageDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`Created directory: ${dir}`);
            }
        });

        let index = 0;
        for (const user of accounts) {
            let imageSrc = user.image?.uri || user?.profile_pic_url || user.image;
            if (!imageSrc) continue;

            try {
                const imagePath = path.join(imagesDir, `${index}.jpg`);
                console.log(`Fetching image ${index} from ${imageSrc}`);

                const response = await fetch(imageSrc);
                if (!response.ok) {
                    console.warn(`Skipping image at index ${index} due to fetch failure.`);
                    continue;
                }

                await writeFile(imagePath, Buffer.from(await response.arrayBuffer()));
                console.log(`Saved image to ${imagePath}`);
                index++;
            } catch (error) {
                console.error(`Skipping image at index ${index} due to error:`, error);
                continue;
            }
        }

        const uploadedBuffer = Buffer.from(await file.arrayBuffer());
        await writeFile(userImagePath, uploadedBuffer);
        console.log("User image uploaded successfully.");

        const scriptPath = path.join(process.cwd(), "scripts", "facenet_match.py");
        if (!fs.existsSync(scriptPath)) {
            console.error("Python script not found:", scriptPath);
            return NextResponse.json({ message: "Server error: Python script missing", success: false }, { status: 500 });
        }

        console.log("Executing Python script...");
        const result = await new Promise((resolve, reject) => {
            const pythonProcess = spawn("python", [scriptPath]);

            let scriptOutput = "";
            let scriptError = "";

            pythonProcess.stdout.on("data", (data) => {
                scriptOutput += data.toString();
                console.log("Python script output:", data.toString());
            });

            pythonProcess.stderr.on("data", (data) => {
                scriptError += data.toString();
                console.error("Python script error:", data.toString());
            });

            pythonProcess.on("close", (code) => {
                console.log("Raw Python Output:", scriptOutput);
                if (code !== 0) {
                    console.error(`Python script error: ${scriptError}`);
                    return reject(new Error(`Python script exited with code ${code}: ${scriptError}`));
                }
                try {
                    scriptOutput = scriptOutput.trim();
                    if (!scriptOutput.startsWith("{")) {
                        console.error("Unexpected Python output:", scriptOutput);
                        return reject(new Error("Invalid JSON output from Python script"));
                    }
                    resolve(JSON.parse(scriptOutput));
                } catch (parseError) {
                    console.error("JSON Parse Error:", parseError.message, "| Raw Output:", scriptOutput);
                    reject(new Error("Invalid JSON output from Python script"));
                }
            });
        });

        console.log("Cleaning up temporary images...");
        try {
            for (const file of await readdir(imagesDir)) {
                await unlink(path.join(imagesDir, file));
            }
            if (fs.existsSync(userImagePath)) {
                await unlink(userImagePath);
            }
        } catch (cleanupError) {
            console.error("Error during cleanup:", cleanupError);
        }

        console.log("Results =======> ", result);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Error in face matching API:", error);
        return NextResponse.json({ message: "An error occurred", success: false }, { status: 500 });
    }
}
