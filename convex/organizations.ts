import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const organizations = await ctx.db
      .query("organizations")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return organizations;
  },
});

export const getOrganizationMembers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if user is owner or member of the organization
    const isOwner = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("_id"), args.organizationId))
      .filter((q) => q.eq(q.field("ownerId"), user._id))
      .first();

    const isMember = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .filter((q) => q.eq(q.field("_id"), user._id))
      .first();

    if (!isOwner && !isMember) throw new Error("Not authorized");

    const members = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return members;
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("Identity:", identity);
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      description: args.description,
      ownerId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user to be part of this organization
    await ctx.db.patch(user._id, {
      organizationId,
      role: "owner",
    });

    return organizationId;
  },
});

export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if user is the owner
    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.ownerId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.organizationId, {
      name: args.name,
      description: args.description,
      updatedAt: Date.now(),
    });

    return args.organizationId;
  },
});