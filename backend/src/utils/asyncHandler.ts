import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// ... asyncHandler fonksiyonu (aynen kalabilir)

// Promise<Response> döndüren fonksiyonlar için
export const asyncHandlerResponse = <P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs>(
    fn: (
        req: Request<P, ResBody, ReqBody, ReqQuery>,
        res: Response<ResBody>,
        next: NextFunction
    ) => Promise<Response<ResBody>>
) => {
    return async (
        req: Request<P, ResBody, ReqBody, ReqQuery>,
        res: Response<ResBody>,
        next: NextFunction
    ): Promise<void> => { // Geri dönüş tipini Promise<void> olarak değiştirin
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};