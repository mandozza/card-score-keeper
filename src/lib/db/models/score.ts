import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerScore {
  playerId: string;
  score: number;
}

export interface IRound {
  roundNumber: number;
  playerScores: IPlayerScore[];
  notes?: string;
}

export interface IScore extends Document {
  gameId: mongoose.Types.ObjectId;
  rounds: IRound[];
  notes: string[];
  winner?: string;
}

const PlayerScoreSchema = new Schema<IPlayerScore>({
  playerId: { type: String, required: true },
  score: { type: Number, required: true }
});

const RoundSchema = new Schema<IRound>({
  roundNumber: { type: Number, required: true },
  playerScores: [PlayerScoreSchema],
  notes: { type: String }
});

const ScoreSchema = new Schema<IScore>({
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  rounds: [RoundSchema],
  notes: [{ type: String }],
  winner: { type: String }
});

export default mongoose.models.Score || mongoose.model<IScore>('Score', ScoreSchema);
