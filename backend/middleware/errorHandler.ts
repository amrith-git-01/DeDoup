import type {Request, Response, NextFunction} from 'express';
import {AppError} from '../utils/AppError';

export function errorHandler(
    err: Error|AppError,
    req: Request,
    res: Response,
    next: NextFunction
){
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success:false,
            message:err.message,
        })
    }

    if(err.name === 'ValidationError'){
        return res.status(400).json({
            success:false,
            message: "Validation error",
            errors: err.message
        })
    }

    if(err.name === 'JsonWebTokenError'){
        return res.status(401).json({
            success:false,
            message: "Unauthorized",
            errors: "Invalid token"
        })
    }

    if(err.name === 'MongoServerError' && (err as any).code === 11000){
        return res.status(409).json({
            success:false,
            message: "Duplicate key error",
        })
    }

    console.error("❌ Unhandled error: ", err);

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message,
      })
}