import { NextResponse } from 'next/server';

const TESTING_MODE = false;
const APITOKEN = process.env.NEXT_PUBLIC_APITOKEN;

const search_by_face = async (image_file) => {
    if (TESTING_MODE) {
        console.log('****** TESTING MODE: Results may be inaccurate, but no credits are deducted ******');
    }

    const site = 'https://facecheck.id';
    const headers = {
        accept: 'application/json',
        Authorization: APITOKEN,
    };

    let form = new FormData();
    form.append('images', image_file);
    form.append('id_search', '');

    console.log('[LOG] Sending image to /api/upload_pic...');
    let response = await fetch(`${site}/api/upload_pic`, {
        method: 'POST',
        body: form,
        headers,
    });

    response = await response.json();
    console.log('[LOG] Upload response:', response);

    if (response.error) {
        console.error('[ERROR] Image upload failed:', response.error);
        return [`${response.error} (${response.code})`, null];
    }

    const id_search = response.id_search;
    console.log('[LOG] Search ID received:', id_search);

    const json_data = {
        id_search: id_search,
        with_progress: true,
        status_only: false,
        demo: TESTING_MODE,
    };

    while (true) {
        console.log('[LOG] Sending search request...');
        response = await fetch(`${site}/api/search`, {
            method: 'POST',
            body: JSON.stringify(json_data),
            headers: {
                'Content-Type': 'application/json',
                Authorization: APITOKEN,
            },
        });

        response = await response.json();
        console.log('[LOG] Search response:', response);

        if (response.error) {
            console.error('[ERROR] Face search failed:', response.error);
            return [`${response.error} (${response.code})`, null];
        }
        if (response.output) {
            console.log('[LOG] Search successful, returning results.');
            return [null, response.output.items];
        }

        console.log('[LOG] No results yet, retrying in 1s...');
        await new Promise((r) => setTimeout(r, 1000));
    }
};

export async function POST(req) {
    try {
        console.log('[LOG] Received POST request for face matching.');

        const formDataFile = await req.formData();
        const file = formDataFile.get('file');

        if (!file) {
            console.error('[ERROR] No file provided.');
            return NextResponse.json({ message: 'No file provided', success: false }, { status: 400 });
        }

        console.log('[LOG] File received:', file.name || 'Unknown file');

        const [error, urls_images] = await search_by_face(file);

        if (error) {
            console.error('[ERROR] Face search failed:', error);
            return NextResponse.json({ message: 'Face search failed!', success: false, error }, { status: 500 });
        }

        console.log('[LOG] Accounts found:', urls_images.length);

        let accounts = urls_images.map((im) => ({
            score: im.score,
            url: im.url,
            image: `data:image/jpeg;base64,${im.base64}`,
        }));

        return NextResponse.json({ message: 'Accounts found!', success: true, accounts }, { status: 200 });

    } catch (error) {
        console.error('[ERROR] Unexpected error in API:', error.message);
        return NextResponse.json({ message: 'An error occurred', success: false, error: error.message }, { status: 500 });
    }
}
