const { Schema, model } = require('mongoose');

const RoleSchema = new Schema(
  {
    name: { 
        type: String, 
        unique: true, 
        required: true 

    }, // 'admin', 'tester', 'user'
    description: String,
    permissions: [{ type: Schema.Types.ObjectId, 
        ref: 'Permission' }],
    inherits: [
        { 
        type: Schema.Types.ObjectId, 
        ref: 'Role' }], // hierarchical roles
    isSystem: { 
        type: Boolean, 
        default: false 

    },
  },
  { timestamps: true }
);



const Role = model('Role', RoleSchema);

module.exports = Role;
