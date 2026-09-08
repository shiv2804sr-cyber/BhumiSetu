import { Response } from "express";

export function successResponse<T>(res: Response, data: T, message?: string, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(res: Response, message: string, statusCode = 400, details?: any) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details,
  });
}

export function paginatedResponse<T>(res: Response, items: T[], total: number, page: number, limit: number) {
  return res.status(200).json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
