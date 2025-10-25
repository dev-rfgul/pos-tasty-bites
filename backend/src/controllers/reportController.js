import Order from '../models/Order.js';
import mongoose from 'mongoose';

// GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function salesReport(req, res, next) {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'Missing tenant' });

    const fromQuery = req.query.from;
    const toQuery = req.query.to;

    const from = fromQuery ? new Date(String(fromQuery)) : new Date(new Date().setHours(0, 0, 0, 0));
    // make to end of day if just a date string
    let to = toQuery ? new Date(String(toQuery)) : new Date();
    // if toQuery provided without time, set to end of that day
    if (toQuery && String(toQuery).length === 10) {
      to = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999);
    }

    const matchStage = {
      $match: {
        tenant: new mongoose.Types.ObjectId(tenantId),
        status: 'open',
        createdAt: { $gte: from, $lte: to },
      },
    };

    const pipeline = [
      matchStage,
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$_id',
          orderTotal: { $sum: { $multiply: ['$orderItems.unitPrice', '$orderItems.qty'] } },
          orderCost: { $sum: { $multiply: ['$orderItems.cost', '$orderItems.qty'] } },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$orderTotal' },
          totalCost: { $sum: '$orderCost' },
          ordersCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalSales: { $ifNull: ['$totalSales', 0] },
          totalCost: { $ifNull: ['$totalCost', 0] },
          profit: { $subtract: [{ $ifNull: ['$totalSales', 0] }, { $ifNull: ['$totalCost', 0] }] },
          ordersCount: { $ifNull: ['$ordersCount', 0] },
        },
      },
    ];

    const [result] = await Order.aggregate(pipeline);
    if (!result) {
      return res.json({ totalSales: 0, totalCost: 0, profit: 0, ordersCount: 0 });
    }
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export default { salesReport };
