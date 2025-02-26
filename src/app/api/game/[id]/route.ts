import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import Game from "@/lib/db/models/game";
import Score from "@/lib/db/models/score";
import mongoose from "mongoose";

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

    const game = await Game.findById(id);

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Get scores for this game
    const scores = await Score.findOne({ gameId: id });

    return NextResponse.json({ game, scores });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid game ID" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const game = await Game.findById(id);

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Update game
    const updatedGame = await Game.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const game = await Game.findById(id);

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Delete game
    await Game.findByIdAndDelete(id);

    // Delete associated scores
    await Score.deleteOne({ gameId: id });

    return NextResponse.json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Failed to delete game" },
      { status: 500 }
    );
  }
}
