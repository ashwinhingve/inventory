import mongoose from 'mongoose';

const DashboardSchema = new mongoose.Schema({
  // Business Overview metrics
  businessMetrics: {
    totalSales: {
      type: Number,
      default: 0
    },
    totalPurchase: {
      type: Number,
      default: 0
    },
    totalExpense: {
      type: Number,
      default: 0
    },
    totalProfit: {
      type: Number,
      default: 0
    },
    totalPaymentReceived: {
      type: Number,
      default: 0
    },
    totalPaymentPaid: {
      type: Number,
      default: 0
    },
    netCashFlow: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Party Overview metrics
  partyMetrics: {
    totalReceivable: {
      type: Number,
      default: 0
    },
    totalPayable: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Balance Overview metrics
  balanceMetrics: {
    totalCashBankBalance: {
      type: Number,
      default: 0
    },
    totalCashBalance: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Inventory Overview metrics
  inventoryMetrics: {
    totalStockValuePurchase: {
      type: Number,
      default: 0
    },
    totalStockValueSales: {
      type: Number,
      default: 0
    },
    totalItems: {
      type: Number,
      default: 0
    },
    lowStockItems: {
      type: Number,
      default: 0
    },
    zeroStockItems: {
      type: Number,
      default: 0
    },
    negativeStockItems: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Sales & Purchase Trends (last 7 days)
  salesPurchaseTrends: [{
    date: {
      type: Date,
      required: true
    },
    sales: {
      type: Number,
      default: 0
    },
    purchase: {
      type: Number,
      default: 0
    }
  }],
  
  // Top 5 Sales
  topSales: {
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
      },
      name: String,
      quantity: Number,
      amount: Number
    }],
    customers: [{
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party'
      },
      name: String,
      transactions: Number,
      amount: Number
    }],
    dates: [{
      date: Date,
      transactions: Number,
      amount: Number
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Top 5 Purchases
  topPurchases: {
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
      },
      name: String,
      quantity: Number,
      amount: Number
    }],
    suppliers: [{
      supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party'
      },
      name: String,
      transactions: Number,
      amount: Number
    }],
    dates: [{
      date: Date,
      transactions: Number,
      amount: Number
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // General store metadata
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
DashboardSchema.index({ storeId: 1, userId: 1 });
DashboardSchema.index({ 'businessMetrics.lastUpdated': -1 });
DashboardSchema.index({ 'salesPurchaseTrends.date': -1 });

export default mongoose.models.Dashboard || mongoose.model('Dashboard', DashboardSchema); 