const { Schema, model } = require('mongoose');

const PermissionSchema = new Schema(
  {
    action: { 
        type: String, 
        required: true 

    },   // e.g. 'create', 'read', 'update', 'delete'
    resource: { 
        type: String, 
        required: true

     }, // e.g. 'quote', 'booking', 'user'
    // Optional, for ABAC-like conditions later
    conditions: { 
        type: Schema.Types.Mixed, 
        default: null 

    },
    description: String,
    isSystem: { 
        type: Boolean, 
        default: false 
    }, // lock core perms from UI changes if you want
  },
  { timestamps: true, 
    indexes: [{ 
        unique: true, 
        fields: { action: 1, resource: 1 } }] }
);



const Permission = model('Permission', PermissionSchema);

module.exports = Permission;
