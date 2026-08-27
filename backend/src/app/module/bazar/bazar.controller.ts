import { Request, Response } from 'express';

import { uploadReceipt } from './bazar.service';
import { catchAsync } from '../../utils/catchAsync';
import { prisma } from '../../lib/prisma';
import { sendCreated, sendPaginated } from '../../utils/response';
import { getPaginationMeta, parsePagination } from '../../utils/pagination';


export const addBazar = catchAsync(async (req: Request, res: Response) => {
  const { messId, date, totalAmount, category, description, items } = req.body;
  
  let receiptUrl = null;
  if (req.file) {
    try {
      receiptUrl = await uploadReceipt(req.file.buffer);
    } catch (uploadError) {
      console.error("Cloudinary Upload Error:", uploadError);
      // Optional: continue without receipt or throw error depending on your preference
    }
  }

  // Parse items safely if it's sent as a JSON string from form-data
  let parsedItems = [];
  if (items) {
    try {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch (e) {
      parsedItems = [];
    }
  }

  const bazar = await prisma.bazar.create({
    data: { 
      messId, 
      addedBy: req.user!.id, 
      date: new Date(date), 
      totalAmount: Number(totalAmount), 
      category, 
      description, 
      receiptUrl,
      items: parsedItems.length > 0 ? { 
        create: parsedItems.map((item: any) => ({
          itemName: item.itemName,
          quantity: Number(item.quantity),
          unit: item.unit,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        })) 
      } : undefined
    }, 
    include: { items: true }
  });

  sendCreated(res, bazar, 'Bazar added successfully');
});

export const getBazars = catchAsync(async (req: Request, res: Response) => {
  const { messId, category } = req.query;
  const { page, limit, skip } = parsePagination(req.query);
  const where = { messId: messId as string, ...(category && { category: category as any }) };
  const [data, total] = await Promise.all([
    prisma.bazar.findMany({ where, skip, take: limit, orderBy: { date: 'desc' }, include: { addedByUser: { select: { fullName: true } } } }),
    prisma.bazar.count({ where })
  ]);
  sendPaginated(res, data, getPaginationMeta(total, page, limit));
});