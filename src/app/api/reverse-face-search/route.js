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

    let response = await fetch(`${site}/api/upload_pic`, {
        method: 'POST',
        body: form,
        headers,
    });

    response = await response.json();

    if (response.error) {
        return [`${response.error} (${response.code})`, null];
    }

    const id_search = response.id_search;

    const json_data = {
        id_search: id_search,
        with_progress: true,
        status_only: false,
        demo: TESTING_MODE,
    };

    while (true) {
        response = await fetch(`${site}/api/search`, {
            method: 'POST',
            body: JSON.stringify(json_data),
            headers: {
                'Content-Type': 'application/json',
                Authorization: APITOKEN,
            },
        });

        response = await response.json();

        if (response.error) {
            return [`${response.error} (${response.code})`, null];
        }
        if (response.output) {
            return [null, response.output.items];
        }
        await new Promise((r) => setTimeout(r, 1000));
    }
};

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ message: 'No file provided', success: false }, { status: 400 });
        }

        const [error, urls_images] = await search_by_face(file);

        if (error) {
            return NextResponse.json({ message: 'Face search failed!', success: false, error }, { status: 500 });
        }

        let accounts = urls_images.map((im) => ({
            score: im.score,
            url: im.url,
            image: `data:image/jpeg;base64,${im.base64}`,
        }));

        return NextResponse.json({ message: 'Accounts found!', success: true, accounts }, { status: 200 });

    } catch (error) {
        console.error('Error in face matching API:', error);
        return NextResponse.json({ message: 'An error occurred', success: false, error: error.message }, { status: 500 });
    }
}
