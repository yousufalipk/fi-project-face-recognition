import { NextResponse } from "next/server";
import axios from "axios";

const apiKey1 = process.env.RAPIDAPI_KEY;
const apiKey2 = process.env.INSTAGRAM_KEY;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query") || "";

        if (!apiKey1 || !apiKey2) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
        }

        // Fetch Facebook Data
        const facebookResponse = await axios.get(
            `https://facebook-pages-scraper2.p.rapidapi.com/fetch_search_people?query=${query}`,
            {
                headers: {
                    "x-rapidapi-host": "facebook-pages-scraper2.p.rapidapi.com",
                    "x-rapidapi-key": apiKey1,
                },
            }
        );

        // Fetch Instagram Data
        const instagramResponse = await axios.get(
            `https://instagram-scraper-api2.p.rapidapi.com/v1/search_users?search_query=${query}`,
            {
                headers: {
                    "x-rapidapi-host": "social-api4.p.rapidapi.com",
                    "x-rapidapi-key": apiKey2,
                },
            }
        );

        const facebookUsers = facebookResponse.data?.data?.items || [];
        const instagramUsers = instagramResponse.data?.data?.items || [];

        return NextResponse.json({ facebookUsers, instagramUsers });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
