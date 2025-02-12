import { spawn } from 'child_process';
import { writeFile, unlink, readdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const data = await req.formData();
        const file = data.get('file');
        const accounts = JSON.parse(data.get('accounts') || '[]');

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded', success: false }, { status: 400 });
        }

        const imagesDir = path.join(process.cwd(), 'public', 'images');
        const userImageDir = path.join(process.cwd(), 'public', 'userImage');
        const userImagePath = path.join(userImageDir, 'userImage.jpg');

        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
        if (!fs.existsSync(userImageDir)) fs.mkdirSync(userImageDir, { recursive: true });

        let index = 0;

        for (const user of accounts) {
            const imageUrl = user.image?.uri || user?.profile_pic_url || user.image;
            if (!imageUrl) continue;

            try {
                const response = await fetch(imageUrl);
                if (!response.ok) continue;

                const arrayBuffer = await response.arrayBuffer();
                const userImageBuffer = Buffer.from(arrayBuffer);
                const imagePath = path.join(imagesDir, `${index}.jpg`);
                await writeFile(imagePath, userImageBuffer);

                index++;
            } catch (error) {
                console.error(`Failed to fetch image for index ${index}:`, error);
            }
        }

        const uploadedBytes = await file.arrayBuffer();
        const uploadedBuffer = Buffer.from(uploadedBytes);
        await writeFile(userImagePath, uploadedBuffer);

        const scriptPath = path.join(process.cwd(), 'scripts', 'facenet_match.py');

        const result = await new Promise((resolve, reject) => {
            const pythonProcess = spawn('python', [scriptPath]);

            let scriptOutput = '';
            let scriptError = '';

            pythonProcess.stdout.on('data', (data) => {
                scriptOutput += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                scriptError += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python script exited with code ${code}: ${scriptError}`));
                } else {
                    try {
                        resolve(JSON.parse(scriptOutput));
                    } catch (parseError) {
                        reject(new Error(`Parse Error: ${parseError.message}`));
                    }
                }
            });
        });

        const files = await readdir(imagesDir);
        for (const file of files) {
            await unlink(path.join(imagesDir, file));
        }

        if (fs.existsSync(userImagePath)) {
            await unlink(userImagePath);
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error in face matching API:', error);
        return NextResponse.json({ message: 'An error occurred', success: false }, { status: 500 });
    }
}
