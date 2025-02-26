import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer {
  name: string;
  id: string;
}

export interface IGame extends Document {
  players: IPlayer[];
  gameType: string;
  endScore: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const PlayerSchema = new Schema<IPlayer>({
  name: { type: String, required: true },
  id: { type: String, required: true }
});

const GameSchema = new Schema<IGame>({
  players: [PlayerSchema],
  gameType: { type: String, required: true },
  endScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);
