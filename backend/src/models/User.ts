import mongoose, { Schema, Document } from 'mongoose';

// Kullanıcı rolü tipleri
export enum UserRole {
  ADMIN = 'admin',
  PSYCHOLOGIST = 'psychologist',
  USER = 'user',
}

// Kullanıcı arayüzü
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // _id alanını ekleyin
  email: string;
  password?: string;
  role: UserRole;
  isVerified?: boolean;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

// Kullanıcı şeması
const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: Object.values(UserRole), required: true },
    isVerified: { type: Boolean, default: false },
    firstName: { type: String },
    lastName: { type: String },
    profilePicture: { type: String },
  },
  { timestamps: true }
);

// Kullanıcı modeli
const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;