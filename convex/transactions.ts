import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserTransactions = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    let transactionsQuery = ctx.db.query("transactions");

    if (args.organizationId) {
      // Check if user is member of the organization
      const isMember = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
        .filter((q) => q.eq(q.field("_id"), user._id))
        .first();

      if (!isMember) throw new Error("Not authorized");

      transactionsQuery = transactionsQuery.filter((q) =>
        q.eq(q.field("organizationId"), args.organizationId)
      );
    } else {
      transactionsQuery = transactionsQuery.filter((q) =>
        q.eq(q.field("userId"), user._id)
      );
    }

    const transactions = await transactionsQuery.collect();
    return transactions.sort((a, b) => b.date - a.date);
  },
});

export const getMonthlyStats = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { totalSpent: 0, totalEarned: 0, transactionCount: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

    let transactionsQuery = ctx.db
      .query("transactions")
      .filter((q) => q.gte(q.field("date"), startOfMonth))
      .filter((q) => q.lte(q.field("date"), endOfMonth));

    if (args.organizationId) {
      const isMember = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
        .filter((q) => q.eq(q.field("_id"), user._id))
        .first();

      if (!isMember) throw new Error("Not authorized");

      transactionsQuery = transactionsQuery.filter((q) =>
        q.eq(q.field("organizationId"), args.organizationId)
      );
    } else {
      transactionsQuery = transactionsQuery.filter((q) =>
        q.eq(q.field("userId"), user._id)
      );
    }

    const transactions = await transactionsQuery.collect();

    const stats = {
      totalSpent: 0,
      totalEarned: 0,
      transactionCount: transactions.length,
    };

    transactions.forEach((transaction) => {
      if (transaction.type === "spending") {
        stats.totalSpent += transaction.amount;
      } else {
        stats.totalEarned += transaction.amount;
      }
    });

    return stats;
  },
});

export const createTransaction = mutation({
  args: {
    amount: v.number(),
    type: v.union(v.literal("earning"), v.literal("spending")),
    description: v.string(),
    tags: v.array(v.string()),
    date: v.number(),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    if (args.organizationId) {
      const isMember = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
        .filter((q) => q.eq(q.field("_id"), user._id))
        .first();

      if (!isMember) throw new Error("Not authorized");
    }

    const transactionId = await ctx.db.insert("transactions", {
      userId: user._id,
      organizationId: args.organizationId,
      amount: args.amount,
      type: args.type,
      description: args.description,
      tags: args.tags,
      date: args.date,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return transactionId;
  },
});

export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    amount: v.number(),
    type: v.union(v.literal("earning"), v.literal("spending")),
    description: v.string(),
    tags: v.array(v.string()),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) throw new Error("Transaction not found");

    // Check if user owns the transaction or is in the same organization
    const canEdit =
      transaction.userId === user._id ||
      (transaction.organizationId &&
        user.organizationId === transaction.organizationId);

    if (!canEdit) throw new Error("Not authorized");

    await ctx.db.patch(args.transactionId, {
      amount: args.amount,
      type: args.type,
      description: args.description,
      tags: args.tags,
      date: args.date,
      updatedAt: Date.now(),
    });

    return args.transactionId;
  },
});

export const deleteTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) throw new Error("Transaction not found");

    // Check if user owns the transaction or is in the same organization
    const canDelete =
      transaction.userId === user._id ||
      (transaction.organizationId &&
        user.organizationId === transaction.organizationId);

    if (!canDelete) throw new Error("Not authorized");

    await ctx.db.delete(args.transactionId);

    return args.transactionId;
  },
});