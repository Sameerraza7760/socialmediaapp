import { NextResponse } from "next/server";
import { searchFollowers } from "@/actions/user.action";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";
        const users = await searchFollowers(q);
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error searching followers:", error);
        return NextResponse.json([], { status: 500 });

    }
}