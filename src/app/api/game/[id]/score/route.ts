import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Score, { IRound } from "@/lib/db/models/score";
import Game from "@/lib/db/models/game";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { round } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }

    if (!round) {
      return NextResponse.json(
        { error: "Round data is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if game exists
    const game = await Game.findById(id);

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Find or create score document for this game
    let score = await Score.findOne({ gameId: id });

    if (!score) {
      score = await Score.create({
        gameId: id,
        rounds: [round],
        notes: [],
      });
    } else {
      // Add round to existing score
      score.rounds.push(round);
      await score.save();
    }

    return NextResponse.json(score, { status: 201 });
  } catch (error) {
    console.error("Error adding score:", error);
    return NextResponse.json(
      { error: "Failed to add score" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const score = await Score.findOne({ gameId: id });

    if (!score) {
      return NextResponse.json(
        { error: "No scores found for this game" },
        { status: 404 }
      );
    }

    return NextResponse.json(score);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { roundNumber, updatedRound } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }

    if (!roundNumber || !updatedRound) {
      return NextResponse.json(
        { error: "Round number and updated round data are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const score = await Score.findOne({ gameId: id });

    if (!score) {
      return NextResponse.json(
        { error: "No scores found for this game" },
        { status: 404 }
      );
    }

    // Update the specific round
    const roundIndex = score.rounds.findIndex(
      (r: IRound) => r.roundNumber === roundNumber
    );

    if (roundIndex === -1) {
      return NextResponse.json(
        { error: "Round not found" },
        { status: 404 }
      );
    }

    score.rounds[roundIndex] = updatedRound;
    await score.save();

    return NextResponse.json(score);
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 }
    );
  }
}
