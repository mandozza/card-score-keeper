import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Game from "@/lib/db/models/game";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { players, gameType, endScore } = body;

    if (!players || !gameType || !endScore) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newGame = await Game.create({
      players,
      gameType,
      endScore,
      isActive: true,
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const games = await Game.find({ isActive: true }).sort({ createdAt: -1 });

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
