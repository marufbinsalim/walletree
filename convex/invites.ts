import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrganizationInvites = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if user is owner of the organization
    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.ownerId !== user._id) {
      throw new Error("Not authorized");
    }

    const invites = await ctx.db
      .query("organizationInvites")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return invites;
  },
});

export const createInvite = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("owner"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if user is owner of the organization
    const organization = await ctx.db.get(args.organizationId);
    if (!organization || organization.ownerId !== user._id) {
      throw new Error("Not authorized");
    }

    // Check if user is already invited
    const existingInvite = await ctx.db
      .query("organizationInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) throw new Error("User already invited");

    const inviteId = await ctx.db.insert("organizationInvites", {
      organizationId: args.organizationId,
      email: args.email,
      role: args.role,
      status: "pending",
      invitedBy: user._id,
      invitedAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return inviteId;
  },
});

export const acceptInvite = mutation({
  args: { inviteId: v.id("organizationInvites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");

    if (invite.status !== "pending") throw new Error("Invite not pending");

    if (invite.email !== user.email) throw new Error("Invite not for this user");

    if (Date.now() > invite.expiresAt) throw new Error("Invite expired");

    // Update invite status
    await ctx.db.patch(args.inviteId, { status: "accepted" });

    // Update user organization
    await ctx.db.patch(user._id, {
      organizationId: invite.organizationId,
      role: invite.role,
    });

    return args.inviteId;
  },
});

export const declineInvite = mutation({
  args: { inviteId: v.id("organizationInvites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");

    if (invite.status !== "pending") throw new Error("Invite not pending");

    if (invite.email !== user.email) throw new Error("Invite not for this user");

    await ctx.db.patch(args.inviteId, { status: "declined" });

    return args.inviteId;
  },
});

export const getPendingInvitesForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    const invites = await ctx.db
      .query("organizationInvites")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .collect();

    return invites;
  },
});