import { Request, Response, NextFunction } from "express";
import SessionModel, { ISession, SessionStatus } from "../models/Session";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import PsychologistModel, { IPsychologist } from "../models/Psychologist";
import mongoose from "mongoose";

// Yeni Seans Oluşturma
export const createSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { psychologistId, startTime, endTime, sessionType } = req.body;
    const userId = req.user?.userId;

    // Gerekli alanların kontrolü
    if (!psychologistId || !startTime || !endTime || !sessionType) {
      return res.status(400).json({ message: "Eksik bilgi." });
    }

    // Seans oluşturma
    const newSession: ISession = new SessionModel({
      userId: new mongoose.Types.ObjectId(userId),
      psychologistId: new mongoose.Types.ObjectId(psychologistId),
      startTime,
      endTime,
      sessionType,
    });

    await newSession.save();

    return res
      .status(201)
      .json({
        message: "Seans başarıyla oluşturuldu.",
        sessionId: newSession._id,
      });
  } catch (error) {
    console.error("Seans oluşturma hatası:", error);
    next(error); // Hata yönetimi için next fonksiyonunu çağır
  }
};

// Psikologa göre seansları listeleme
export const getSessionsByPsychologist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { psychologistId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Kullanıcının rolünü kontrol et
    if (userRole !== "admin") {
      // Eğer kullanıcı 'admin' değilse, kendi ID'si ile istek yapılan psikolog ID'sini karşılaştır
      const psychologist = await PsychologistModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });
      if (!psychologist) {
        return res.status(404).json({ message: "Psikolog bulunamadı." });
      }
      if (psychologist._id.toString() !== psychologistId) {
        return res.status(403).json({
          message: "Bu psikoloğa ait seansları görme yetkiniz yok.",
        });
      }
    }

    const sessions = await SessionModel.find({
      psychologistId: new mongoose.Types.ObjectId(psychologistId),
    });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Seans listeleme hatası:", error);
    next(error); // Hata yönetimi için next fonksiyonunu çağır
  }
};

// Kullanıcıya göre seansları listeleme
export const getSessionsByUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { userId: paramUserId } = req.params;
    console.log("userRole : ", userRole, "userId : ", userId, "paramUserId : ", paramUserId);
    if (userRole !== 'admin' && (!userId || userId !== paramUserId)) {
      return res
        .status(403)
        .json({ message: "Bu kullanıcıya ait seansları görme yetkiniz yok." });
    }
   
    const sessions = await SessionModel.find({ userId: new mongoose.Types.ObjectId(userId) });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Seans listeleme hatası:", error);
    next(error); // Hata yönetimi için next fonksiyonunu çağır
  }
};

// Admin ve ilgili kullanıcılar için tüm seansları listeleme
export const getSessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Eğer kullanıcı 'admin' değilse, hata döndür
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Bu seansları görme yetkiniz yok." });
    }

    // Admin ise tüm seansları getir
    const sessions = await SessionModel.find();

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Seans listeleme hatası:", error);
    next(error); // Hata yönetimi için next fonksiyonunu çağır
  }
};

// Seans durumunu güncelleme
export const updateSessionStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!Object.values(SessionStatus).includes(status)) {
      return res.status(400).json({ message: "Geçersiz seans durumu." });
    }

    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Seans bulunamadı." });
    }

    // Kullanıcının rolünü kontrol et
    if (userRole !== "admin") {
      // Eğer kullanıcı 'admin' değilse, kendi ID'si ile seansın psikolog veya kullanıcı ID'sini karşılaştır
      const psychologist = (await PsychologistModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      })) as IPsychologist | null;
      if (!psychologist) {
        return res.status(404).json({ message: "Psikolog bulunamadı." });
      }
      if (
        psychologist._id.toString() !== session.psychologistId.toString() &&
        userId !== session.userId.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Bu seans durumunu güncelleme yetkiniz yok." });
      }
    }

    const updatedSession = await SessionModel.findByIdAndUpdate(
      sessionId,
      { status },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Seans durumu güncellendi.", session: updatedSession });
  } catch (error) {
    console.error("Seans durumu güncelleme hatası:", error);
    next(error); // Hata yönetimi için next fonksiyonunu çağır
  }
};

// Seans iptal etme
export const cancelSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Seans bulunamadı." });
    }

    // Kullanıcının rolünü kontrol et
    if (userRole !== "admin") {
      // Eğer kullanıcı 'admin' değilse, kendi ID'si ile seansın psikolog veya kullanıcı ID'sini karşılaştır
      const psychologist = (await PsychologistModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      })) as IPsychologist | null;
      if (!psychologist) {
        return res.status(404).json({ message: "Psikolog bulunamadı." });
      }
      if (
        psychologist._id.toString() !== session.psychologistId.toString() &&
        userId !== session.userId.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Bu seansı iptal etme yetkiniz yok." });
      }
    }

    const updatedSession = await SessionModel.findByIdAndUpdate(
      sessionId,
      { status: SessionStatus.CANCELLED },
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Seans iptal edildi.", session: updatedSession });
  } catch (error) {
    console.error("Seans iptal etme hatası:", error);
    next(error); // Hata yönetimi için next fonksiyonunu çağır
  }
};
