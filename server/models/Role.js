const { Schema, model } = require('mongoose');

const RoleSchema = new Schema(
  {
    // Machine-friendly key, used in code: 'admin', 'tester', 'customer'
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Human-friendly label for UI: 'Administrator', 'Tester', 'Customer'
    label: {
      type: String,
    },

    description: {
      type: String,
    },

    // Direct permissions granted to this role
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],

    // Roles this role inherits from (e.g. 'admin' inherits 'staff')
    inherits: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],

    // If true, you probably don't want to delete or rename it casually
    isSystem: {
      type: Boolean,
      default: false,
    },

    // Optional: for ordering in UI (higher = more powerful)
    priority: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * Instance method:
 * Resolve effective permissions, including inherited roles.
 * NOTE: this resolves to an array of ObjectId (or populated docs if you populate).
 */
RoleSchema.methods.getEffectivePermissions = async function () {
  // Avoid infinite recursion on weird circular inheritance
  const visited = new Set();
  const permissions = new Set();

  const collect = async (roleId) => {
    if (!roleId) return;
    const key = roleId.toString();
    if (visited.has(key)) return;
    visited.add(key);

    const role = await this.model('Role')
      .findById(roleId)
      .select('permissions inherits')
      .lean();

    if (!role) return;

    (role.permissions || []).forEach((permId) =>
      permissions.add(permId.toString())
    );

    if (role.inherits && role.inherits.length) {
      for (const parentId of role.inherits) {
        await collect(parentId);
      }
    }
  };

  await collect(this._id);

  // Return as array of ObjectId strings or convert to ObjectId if needed
  return Array.from(permissions);
};

/**
 * Static helper:
 * Find a role by name (case-insensitive because of lowercase indexing)
 */
RoleSchema.statics.findByName = function (name) {
  if (!name) return null;
  return this.findOne({ name: name.toLowerCase().trim() });
};

const Role = model('Role', RoleSchema);

module.exports = Role;
