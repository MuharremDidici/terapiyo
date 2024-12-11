import { Request, Response, NextFunction } from "express";
import PsychologistModel, { IPsychologist } from "../models/Psychologist";
import UserModel from "../models/User";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { asyncHandlerResponse } from "../utils/asyncHandler";

// Onay bekleyen psikologları getirme (sadece admin)
export const getPendingPsychologists = asyncHandlerResponse(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      // Sadece 'psychologist' rolüne sahip ve onayı bekleyen kullanıcıları bul
      const pendingPsychologists = await PsychologistModel.find({
        isApproved: false,
      }).populate({
        path: "userId",
        select: "firstName lastName email",
        match: { role: "psychologist" }, // Sadece psikolog rolündeki kullanıcıları getir
      });

      // Onay bekleyen psikolog bulunamazsa 404 hatası gönder
      if (!pendingPsychologists || pendingPsychologists.length === 0) {
        return res
          .status(404)
          .json({ message: "Onay bekleyen psikolog bulunamadı." });
      }

      return res.json(pendingPsychologists);
    } catch (error) {
      console.error(
        "Onay bekleyen psikologlar getirilirken hata oluştu:",
        error
      );
      return res.status(500).json({ message: "Sunucu hatası." });
    }
  }
);

// Psikolog profilini onaylama (sadece admin)
export const approvePsychologist = asyncHandlerResponse(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const { psychologistId } = req.params;

      // Psikolog profilini onayla
      const approvedPsychologist = await PsychologistModel.findByIdAndUpdate(
        psychologistId,
        { isApproved: true },
        { new: true }
      );

      if (!approvedPsychologist) {
        return res.status(404).json({ message: "Psikolog bulunamadı." });
      }

      // Kullanıcının rolünü 'psychologist' olarak güncelle (Zaten psikolog olarak kayıt olmuş olmalı)
      await UserModel.findByIdAndUpdate(approvedPsychologist.userId, {
        role: "psychologist",
      });

      return res.json({
        message: "Psikolog başarıyla onaylandı.",
        psychologist: approvedPsychologist,
      });
    } catch (error) {
      console.error("Psikolog onaylanırken hata oluştu:", error);
      return res.status(500).json({ message: "Sunucu hatası." });
    }
  }
);

// Psikolog profilini reddetme (sadece admin)
export const rejectPsychologist = asyncHandlerResponse(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    try {
      const { psychologistId } = req.params;

      // Reddedilen psikolog profilini sil
      const rejectedPsychologist = await PsychologistModel.findByIdAndDelete(
        psychologistId
      );
      if (!rejectedPsychologist) {
        return res.status(404).json({ message: "Psikolog bulunamadı." });
      }

      // İlgili kullanıcıyı bul ve sil
      const user = await UserModel.findById(rejectedPsychologist.userId);
      if (user) {
        await UserModel.findByIdAndDelete(user._id);
      }

      return res.json({ message: "Psikolog başarıyla reddedildi ve silindi." });
    } catch (error) {
      console.error("Psikolog reddedilirken hata oluştu:", error);
      return res.status(500).json({ message: "Sunucu hatası." });
    }
  }
);