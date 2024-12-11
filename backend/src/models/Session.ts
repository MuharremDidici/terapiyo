import mongoose, { Schema, Document, Types } from 'mongoose';

export enum SessionStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

export interface ISession extends Document {
    psychologistId: Types.ObjectId;
    userId: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    status: SessionStatus;
    sessionType: string; // 'online' veya 'yüz yüze'
    sessionSummary?: string;
    sessionNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SessionSchema: Schema = new Schema({
    psychologistId: { type: Schema.Types.ObjectId, ref: 'Psychologist', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: Object.values(SessionStatus), default: SessionStatus.SCHEDULED },
    sessionType: { type: String, required: true },
    sessionSummary: { type: String },
    sessionNotes: { type: String },
}, { timestamps: true });

const SessionModel = mongoose.model<ISession>('Session', SessionSchema);

export default SessionModel;