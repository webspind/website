const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database('./database.sqlite');
    this.init();
  }

  init() {
    // Create users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT UNIQUE,
        user_id TEXT UNIQUE,
        email TEXT,
        stripe_customer_id TEXT,
        plan TEXT DEFAULT 'free',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create credits table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS credits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_identifier TEXT NOT NULL,
        credits INTEGER DEFAULT 0,
        free_credits_used INTEGER DEFAULT 0,
        last_reset_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create transactions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_identifier TEXT NOT NULL,
        type TEXT NOT NULL, -- 'purchase', 'consume', 'reset'
        amount INTEGER NOT NULL,
        description TEXT,
        stripe_session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create subscriptions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_identifier TEXT NOT NULL,
        stripe_subscription_id TEXT UNIQUE,
        plan TEXT NOT NULL,
        status TEXT NOT NULL,
        current_period_start DATETIME,
        current_period_end DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized');
  }

  // User management
  createUser(deviceId, userId = null, email = null) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO users (device_id, user_id, email) 
        VALUES (?, ?, ?)
      `);
      stmt.run([deviceId, userId, email], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      stmt.finalize();
    });
  }

  getUserByIdentifier(identifier) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE device_id = ? OR user_id = ?',
        [identifier, identifier],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  updateUserPlan(identifier, plan) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET plan = ?, updated_at = CURRENT_TIMESTAMP WHERE device_id = ? OR user_id = ?',
        [plan, identifier, identifier],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Credits management
  getCredits(identifier) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM credits WHERE user_identifier = ?',
        [identifier],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  createCreditsRecord(identifier) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO credits (user_identifier, credits, free_credits_used, last_reset_date) 
        VALUES (?, 3, 0, DATE('now'))
      `);
      stmt.run([identifier], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      stmt.finalize();
    });
  }

  updateCredits(identifier, credits, freeCreditsUsed) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE credits SET credits = ?, free_credits_used = ?, updated_at = CURRENT_TIMESTAMP WHERE user_identifier = ?',
        [credits, freeCreditsUsed, identifier],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  resetDailyCredits(identifier, newCredits) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE credits SET credits = ?, free_credits_used = 0, last_reset_date = DATE("now"), updated_at = CURRENT_TIMESTAMP WHERE user_identifier = ?',
        [newCredits, identifier],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Transaction logging
  logTransaction(identifier, type, amount, description, stripeSessionId = null) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO transactions (user_identifier, type, amount, description, stripe_session_id) 
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run([identifier, type, amount, description, stripeSessionId], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      stmt.finalize();
    });
  }

  // Subscription management
  createSubscription(identifier, stripeSubscriptionId, plan, status, periodStart, periodEnd) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO subscriptions (user_identifier, stripe_subscription_id, plan, status, current_period_start, current_period_end) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run([identifier, stripeSubscriptionId, plan, status, periodStart, periodEnd], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      stmt.finalize();
    });
  }

  updateSubscriptionStatus(stripeSubscriptionId, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE stripe_subscription_id = ?',
        [status, stripeSubscriptionId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  getSubscription(identifier) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM subscriptions WHERE user_identifier = ? AND status = "active"',
        [identifier],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Analytics
  getTotalRevenue() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT SUM(amount) as total FROM transactions WHERE type = "purchase"',
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total || 0);
        }
      );
    });
  }

  getActiveUsers() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM users WHERE plan = "pro"',
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }
}

module.exports = new Database();
