import mongoose, { Schema, Document, Types } from 'mongoose';

// Uzmanlık alanları için tipler (enum)
export enum ExpertiseArea {
    ANXIETY = 'anxiety',
    DEPRESSION = 'depression',
    RELATIONSHIP_ISSUES = 'relationshipIssues',
    TRAUMA = 'trauma',
    // ... diğer uzmanlık alanlarını ekleyebilirsiniz
}

// Psikolog arayüzü
export interface IPsychologist extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId; // Kullanıcı modeline referans
    firstName: string;
    lastName: string;
    expertiseAreas: ExpertiseArea[];
    bio: string;
    education: string;
    experience: string;
    isApproved: boolean; // Admin onayı için
    ratings: {
        _id?: mongoose.Schema.Types.ObjectId; // _id alanı opsiyonel
        userId: mongoose.Schema.Types.ObjectId;
        rating: number;
        comment: string;
    }[];
    averageRating: number;
}

// Psikolog şeması
const PsychologistSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Kullanıcı modeliyle ilişkilendir
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    expertiseAreas: [{ type: String, enum: Object.values(ExpertiseArea), required: true }],
    bio: { type: String, required: true },
    education: { type: String, required: true },
    experience: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    ratings: [{
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // _id alanı eklendi ve otomatik oluşturulacak
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true },
        comment: { type: String, required: true }
    }],
    averageRating: { type: Number, default: 0 }
},
    { timestamps: true });

// Psikolog modeli
const PsychologistModel = mongoose.model<IPsychologist & Document>('Psychologist', PsychologistSchema);

export default PsychologistModel;