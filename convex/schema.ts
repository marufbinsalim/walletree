import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    role: v.optional(v.union(v.literal("owner"), v.literal("member"))),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_organization", ["organizationId"]),

  organizations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"]),

  organizationInvites: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.optional(v.union(v.literal("owner"), v.literal("member"))),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    invitedBy: v.id("users"),
    invitedAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  transactions: defineTable({
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),
    amount: v.number(),
    type: v.union(v.literal("earning"), v.literal("spending")),
    description: v.string(),
    tags: v.array(v.string()),
    date: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_date", ["date"])
    .index("by_type", ["type"]),
});