import { spawn } from "child_process";
import { writeFile, unlink, readdir } from "fs/promises";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        console.log("==========> 111 ---[ Received POST request ]");

        const data = await req.formData();
        console.log("==========> 111 ---[ Extracted formData ]", data);

        const file = data.get("file");
        const accounts = JSON.parse(data.get("accounts") || "[]");

        if (!file) {
            console.log("==========> 111 ---[ No file uploaded ]");
            return NextResponse.json({ message: "No file uploaded", success: false }, { status: 400 });
        }

        const baseDir = path.resolve(process.cwd(), "public");
        const imagesDir = path.join(baseDir, "images");
        const userImageDir = path.join(baseDir, "userImage");
        const userImagePath = path.join(userImageDir, "userImage.jpg");

        console.log("==========> 111 ---[ Ensuring directories exist ]");

        for (const dir of [imagesDir, userImageDir]) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`==========> 111 ---[ Created directory: ${dir} ]`);
            }
        }

        let index = 0;

        for (const user of accounts) {
            let imageSrc = user.image?.uri || user?.profile_pic_url || user.image;
            if (!imageSrc) {
                console.log(`==========> 111 ---[ Skipping user ${index}, no image source ]`);
                continue;
            }

            try {
                const imagePath = path.join(imagesDir, `${index}.jpg`);
                console.log(`==========> 111 ---[ Processing image ${index} from ${imageSrc} ]`);

                if (imageSrc.startsWith("data:image")) {
                    const base64Data = imageSrc.split(",").pop();
                    if (!base64Data) continue;

                    const buffer = Buffer.from(base64Data, "base64");
                    await writeFile(imagePath, buffer);
                } else {
                    const response = await fetch(imageSrc);
                    if (!response.ok) {
                        console.log(`==========> 111 ---[ Failed to fetch image: ${imageSrc} ]`);
                        continue;
                    }

                    const arrayBuffer = await response.arrayBuffer();
                    const userImageBuffer = Buffer.from(arrayBuffer);
                    await writeFile(imagePath, userImageBuffer);
                }

                console.log(`==========> 111 ---[ Saved image ${index} ]`);
                index++;
            } catch (error) {
                console.error(`==========> 111 ---[ Failed to process image for index ${index} ]`, error);
            }
        }

        const uploadedBytes = await file.arrayBuffer();
        const uploadedBuffer = Buffer.from(uploadedBytes);
        await writeFile(userImagePath, uploadedBuffer);
        console.log("==========> 111 ---[ Saved uploaded user image ]");

        const scriptPath = path.join(process.cwd(), "scripts", "facenet_match.py");

        if (!fs.existsSync(scriptPath)) {
            console.error("==========> 111 ---[ Python script not found: ]", scriptPath);
            return NextResponse.json({ message: "Server error: Python script missing", success: false }, { status: 500 });
        }

        console.log("==========> 111 ---[ Running Python script ]");

        const result = await new Promise((resolve, reject) => {
            const pythonProcess = spawn("python", [scriptPath]);

            let scriptOutput = "";
            let scriptError = "";

            pythonProcess.stdout.on("data", (data) => {
                scriptOutput += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                scriptError += data.toString();
            });

            pythonProcess.on("close", (code) => {
                console.log(`==========> 111 ---[ Python process exited with code ${code} ]`);
                console.log(`==========> 111 ---[ Raw Python Output: ${scriptOutput} ]`);

                if (code !== 0) {
                    console.error(`==========> 111 ---[ Python script error: ${scriptError} ]`);
                    return reject(new Error(`Python script exited with code ${code}: ${scriptError}`));
                }

                try {
                    scriptOutput = scriptOutput.trim();
                    if (!scriptOutput.startsWith("{")) {
                        console.error("==========> 111 ---[ Unexpected Python output: ]", scriptOutput);
                        return reject(new Error("Invalid JSON output from Python script"));
                    }

                    console.log(`==========> 111 ---[ Parsed Python Output: ${scriptOutput} ]`);
                    resolve(JSON.parse(scriptOutput));
                } catch (parseError) {
                    console.error("==========> 111 ---[ JSON Parse Error: ]", parseError.message, "| Raw Output:", scriptOutput);
                    reject(new Error("Invalid JSON output from Python script"));
                }
            });
        });

        console.log("==========> 111 ---[ Cleaning up files ]");

        try {
            for (const file of await readdir(imagesDir)) {
                await unlink(path.join(imagesDir, file));
            }
            if (fs.existsSync(userImagePath)) {
                await unlink(userImagePath);
            }
            console.log("==========> 111 ---[ Cleanup successful ]");
        } catch (cleanupError) {
            console.error("==========> 111 ---[ Error during cleanup: ]", cleanupError);
        }

        console.log("==========> 111 ---[ Returning final response ]");
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("==========> 111 ---[ Error in face matching API: ]", error);
        return NextResponse.json({ message: "An error occurred", success: false }, { status: 500 });
    }
}
