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
      return [];
    }

    const invites = await ctx.db
      .query("organizationInvites")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
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

    // Check if user exists in the system
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!existingUser) throw new Error("User does not exist in the system");

    // Check if user is trying to invite themselves
    if (existingUser._id === user._id)
      throw new Error("You cannot invite yourself");

    // Delete any existing invites for this user to this organization (regardless of status)
    const existingInvites = await ctx.db
      .query("organizationInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .collect();

    // Delete all existing invites for this user to this organization
    for (const invite of existingInvites) {
      await ctx.db.delete(invite._id);
    }

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

    if (invite.email !== user.email)
      throw new Error("Invite not for this user");

    if (Date.now() > invite.expiresAt) throw new Error("Invite expired");

    // Update invite status
    await ctx.db.patch(args.inviteId, { status: "accepted" });

    // User is now a member via the accepted invite - no need to update user record
    // The membership is tracked through the accepted invite status

    return args.inviteId;
  },
});

export const revokeInvite = mutation({
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

    // Check if user is owner of the organization
    const organization = await ctx.db.get(invite.organizationId);
    if (!organization || organization.ownerId !== user._id) {
      throw new Error("Not authorized");
    }

    if (invite.status !== "pending") throw new Error("Invite not pending");

    await ctx.db.patch(args.inviteId, { status: "revoked" });

    return args.inviteId;
  },
});

export const kickMember = mutation({
  args: { userId: v.id("users"), organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Check if user is owner or member of the organization
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) throw new Error("Organization not found");

    const isOwner = organization.ownerId === user._id;

    // Check if user is a member via accepted invites
    const isMember = await ctx.db
      .query("organizationInvites")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first();

    if (!isOwner && !isMember) {
      throw new Error("Not authorized");
    }

    // Cannot kick yourself
    if (args.userId === user._id) throw new Error("Cannot kick yourself");

    // Get target user first
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    // Check if target user is a member of the organization via accepted invites
    const targetUserInvite = await ctx.db
      .query("organizationInvites")
      .withIndex("by_email", (q) => q.eq("email", targetUser.email))
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first();

    if (!targetUserInvite) {
      throw new Error("User is not a member of this organization");
    }

    // Remove user from organization by declining their invite
    await ctx.db.patch(targetUserInvite._id, { status: "declined" });

    return args.userId;
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

    if (invite.email !== user.email)
      throw new Error("Invite not for this user");

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
