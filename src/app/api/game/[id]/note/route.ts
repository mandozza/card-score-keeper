import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Score from "@/lib/db/models/score";
import Game from "@/lib/db/models/game";
import mongoose from "mongoose";

// Add this type for the route context
type RouteContext = {
  params: { id: string }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const { note } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }

    if (!note) {
      return NextResponse.json(
        { error: "Note is required" },
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
        rounds: [],
        notes: [note],
      });
    } else {
      // Add note to existing score
      score.notes.push(note);
      await score.save();
    }

    return NextResponse.json(score, { status: 201 });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { error: "Failed to add note" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params;

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
        { error: "No notes found for this game" },
        { status: 404 }
      );
    }

    return NextResponse.json({ notes: score.notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
