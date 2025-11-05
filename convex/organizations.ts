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

    // Get organizations where user is owner
    const ownedOrganizations = await ctx.db
      .query("organizations")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    // Get organizations where user is a member (via accepted invites)
    const acceptedInvites = await ctx.db
      .query("organizationInvites")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const memberOrganizationIds = acceptedInvites.map(
      (invite) => invite.organizationId
    );
    const memberOrganizations = await Promise.all(
      memberOrganizationIds.map((id) => ctx.db.get(id))
    );

    // Filter out nulls and combine with owned organizations
    const validMemberOrganizations = memberOrganizations.filter(
      (org) => org !== null
    );

    // Combine and deduplicate
    const allOrganizations = [
      ...ownedOrganizations,
      ...validMemberOrganizations,
    ];
    const uniqueOrganizations = allOrganizations.filter(
      (org, index, self) => index === self.findIndex((o) => o._id === org._id)
    );

    return uniqueOrganizations;
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
      .query("organizationInvites")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .filter((q) => q.eq(q.field("organizationId"), args.organizationId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .first();

    if (!isOwner && !isMember) throw new Error("Not authorized");

    // Get all accepted invites for this organization
    const acceptedInvites = await ctx.db
      .query("organizationInvites")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    // Get user details for each member
    const memberEmails = acceptedInvites.map((invite) => invite.email);
    const members = await Promise.all(
      memberEmails.map((email) =>
        ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first()
      )
    );

    // Filter out nulls and add owner
    const validMembers = members.filter((member) => member !== null);

    // Add owner to the list if not already included
    const owner = await ctx.db.get(user._id);
    if (owner && !validMembers.find((m) => m._id === owner._id)) {
      validMembers.unshift(owner);
    }

    return validMembers;
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

export const deleteOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
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

    // Delete all transactions associated with this organization
    const organizationTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    for (const transaction of organizationTransactions) {
      await ctx.db.delete(transaction._id);
    }

    // Delete all invites associated with this organization
    const organizationInvites = await ctx.db
      .query("organizationInvites")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    for (const invite of organizationInvites) {
      await ctx.db.delete(invite._id);
    }

    // Delete the organization
    await ctx.db.delete(args.organizationId);

    return args.organizationId;
  },
});
