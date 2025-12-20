import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Dashboard from '@/models/Dashboard';
import Item from '@/models/item';
import Invoice from '@/models/invoice';
import Party from '@/models/party';
import { format, subDays } from 'date-fns';
import { authenticateUser } from '@/app/api/middleware';

// Type definitions for dashboard data
interface DashboardDocument {
  _id: string;
  userId: string;
  storeId?: string | null;
  businessMetrics: {
    totalSales: number;
    totalPurchase: number;
    totalExpense: number;
    totalProfit: number;
    totalPaymentReceived: number;
    totalPaymentPaid: number;
    netCashFlow: number;
  };
  partyMetrics: {
    totalReceivable: number;
    totalPayable: number;
  };
  balanceMetrics: {
    totalCashBankBalance: number;
    totalCashBalance: number;
  };
  inventoryMetrics: {
    totalStockValuePurchase: number;
    totalStockValueSales: number;
    totalItems: number;
    lowStockItems: number;
    zeroStockItems: number;
    negativeStockItems: number;
  };
  salesPurchaseTrends: Array<{
    date: Date;
    sales: number;
    purchase: number;
    lastUpdated?: Date;
  }>;
  topSales: {
    items: unknown[];
    customers: unknown[];
    dates: unknown[];
  };
  topPurchases: {
    items: unknown[];
    suppliers: unknown[];
    dates: unknown[];
  };
}

/**
 * GET handler for fetching dashboard statistics
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user using custom JWT middleware
    const auth = await authenticateUser(req);
    if (auth.error || !auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized' },
        { status: auth.status || 401 }
      );
    }

    const userId = auth.user.id;

    // Get query parameters
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'week';
    const storeId = url.searchParams.get('storeId');

    // Connect to the database
    await connectToDatabase();

    // Find the user's dashboard data
    const dashboardData = await Dashboard.findOne({
      userId,
      storeId
    }).lean() as DashboardDocument | null;

    if (!dashboardData) {
      // If no dashboard data exists, generate it
      await generateDashboardData(userId, storeId);

      // Return a simplified initial data set
      return NextResponse.json({
        success: true,
        data: {
          businessMetrics: {
            totalSales: 0,
            totalPurchase: 0,
            totalExpense: 0,
            totalProfit: 0,
            totalPaymentReceived: 0,
            totalPaymentPaid: 0,
            netCashFlow: 0
          },
          partyMetrics: {
            totalReceivable: 0,
            totalPayable: 0
          },
          balanceMetrics: {
            totalCashBankBalance: 0,
            totalCashBalance: 0
          },
          inventoryMetrics: {
            totalStockValuePurchase: 0,
            totalStockValueSales: 0,
            totalItems: 0,
            lowStockItems: 0,
            zeroStockItems: 0,
            negativeStockItems: 0
          },
          salesPurchaseTrends: generateEmptyTrends(period),
          topSales: { items: [], customers: [], dates: [] },
          topPurchases: { items: [], suppliers: [], dates: [] }
        }
      });
    }

    // If trends data is outdated or doesn't match requested period, regenerate it
    const today = new Date();
    const lastUpdated = new Date(dashboardData.salesPurchaseTrends?.[0]?.lastUpdated || 0);
    const isOutdated = today.getDate() !== lastUpdated.getDate();

    if (isOutdated) {
      // Refresh trends data only
      const trends = await generateTrendsData(userId, storeId, period);
      dashboardData.salesPurchaseTrends = trends;

      // Save updated trends
      await Dashboard.findByIdAndUpdate(dashboardData._id, {
        salesPurchaseTrends: trends
      });
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate empty trends data based on the specified period
 */
function generateEmptyTrends(period: string) {
  const today = new Date();
  let days = 7;

  switch (period) {
    case 'week':
      days = 7;
      break;
    case 'month':
      days = 30;
      break;
    case 'quarter':
      days = 90;
      break;
    case 'year':
      days = 365;
      break;
  }

  const trends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    trends.push({
      date,
      sales: 0,
      purchase: 0
    });
  }

  return trends;
}

/**
 * Generate complete dashboard data
 */
async function generateDashboardData(userId: string, storeId: string | null) {
  try {
    // Get basic inventory stats
    const itemResults = await Item.aggregate([
      { $match: { userId, ...(storeId ? { storeId } : {}) } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalStockValuePurchase: { $sum: { $multiply: ['$purchasePrice', '$quantity'] } },
          totalStockValueSales: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
          lowStockItems: {
            $sum: {
              $cond: [
                { $lte: ['$quantity', '$lowStockAlert'] },
                1,
                0
              ]
            }
          },
          zeroStockItems: {
            $sum: {
              $cond: [
                { $eq: ['$quantity', 0] },
                1,
                0
              ]
            }
          },
          negativeStockItems: {
            $sum: {
              $cond: [
                { $lt: ['$quantity', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get sales and purchase totals
    const invoiceResults = await Invoice.aggregate([
      { $match: { userId, ...(storeId ? { storeId } : {}) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$total' },
          paid: { $sum: '$paidAmount' }
        }
      }
    ]);

    // Get party balances
    const partyResults = await Party.aggregate([
      { $match: { userId, ...(storeId ? { storeId } : {}) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$balance' }
        }
      }
    ]);

    // Calculate metrics
    const inventoryMetrics = itemResults[0] || {
      totalItems: 0,
      totalStockValuePurchase: 0,
      totalStockValueSales: 0,
      lowStockItems: 0,
      zeroStockItems: 0,
      negativeStockItems: 0
    };

    const totalSales = invoiceResults.find(r => r._id === 'sale')?.total || 0;
    const totalPurchase = invoiceResults.find(r => r._id === 'purchase')?.total || 0;
    const totalPaymentReceived = invoiceResults.find(r => r._id === 'sale')?.paid || 0;
    const totalPaymentPaid = invoiceResults.find(r => r._id === 'purchase')?.paid || 0;

    const totalReceivable = partyResults.find(r => r._id === 'customer')?.total || 0;
    const totalPayable = partyResults.find(r => r._id === 'supplier')?.total || 0;

    // Create dashboard document
    const dashboardData = new Dashboard({
      userId,
      storeId,
      businessMetrics: {
        totalSales,
        totalPurchase,
        totalExpense: 0, // Would need expense calculation
        totalProfit: totalSales - totalPurchase,
        totalPaymentReceived,
        totalPaymentPaid,
        netCashFlow: totalPaymentReceived - totalPaymentPaid
      },
      partyMetrics: {
        totalReceivable,
        totalPayable
      },
      balanceMetrics: {
        totalCashBankBalance: totalPaymentReceived - totalPaymentPaid,
        totalCashBalance: 0 // Would need cash transaction calculation
      },
      inventoryMetrics: {
        totalStockValuePurchase: inventoryMetrics.totalStockValuePurchase,
        totalStockValueSales: inventoryMetrics.totalStockValueSales,
        totalItems: inventoryMetrics.totalItems,
        lowStockItems: inventoryMetrics.lowStockItems,
        zeroStockItems: inventoryMetrics.zeroStockItems,
        negativeStockItems: inventoryMetrics.negativeStockItems
      },
      salesPurchaseTrends: await generateTrendsData(userId, storeId, 'week'),
      topSales: {
        items: [],
        customers: [],
        dates: []
      },
      topPurchases: {
        items: [],
        suppliers: [],
        dates: []
      }
    });

    await dashboardData.save();
    return dashboardData;
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    throw error;
  }
}

/**
 * Generate trends data for the specified period
 */
async function generateTrendsData(userId: string, storeId: string | null, period: string) {
  try {
    const today = new Date();
    let days = 7;

    switch (period) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'quarter':
        days = 90;
        break;
      case 'year':
        days = 365;
        break;
    }

    const startDate = subDays(today, days);

    // Get daily sales/purchase data
    const invoiceData = await Invoice.aggregate([
      {
        $match: {
          userId,
          ...(storeId ? { storeId } : {}),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type'
          },
          total: { $sum: '$total' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Build daily data structure
    const trendsMap = new Map();

    // Initialize with zeroes
    for (let i = 0; i < days; i++) {
      const date = subDays(today, days - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      trendsMap.set(dateStr, { date, sales: 0, purchase: 0 });
    }

    // Fill in actual data
    invoiceData.forEach(item => {
      const { date, type } = item._id;
      if (trendsMap.has(date)) {
        const entry = trendsMap.get(date);
        if (type === 'sale') {
          entry.sales = item.total;
        } else if (type === 'purchase') {
          entry.purchase = item.total;
        }
      }
    });

    return Array.from(trendsMap.values());
  } catch (error) {
    console.error('Error generating trends data:', error);
    return generateEmptyTrends(period);
  }
}