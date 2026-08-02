// ---------------------------------------------------------------------------
// MediaVault – Permission Catalog & Built-in Roles
//
// Every permission is a string. Roles are named collections of permissions.
// Never hardcode role logic — always check against the resolved permission set.
// ---------------------------------------------------------------------------

// =========================================================================
// Permission definitions
// =========================================================================

export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_INVITE: 'users.invite',

  // Projects
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_UPDATE: 'projects.update',
  PROJECTS_DELETE: 'projects.delete',

  // Files
  FILES_VIEW: 'files.view',
  FILES_UPLOAD: 'files.upload',
  FILES_RENAME: 'files.rename',
  FILES_DELETE: 'files.delete',
  FILES_MOVE: 'files.move',

  // Folders
  FOLDERS_CREATE: 'folders.create',
  FOLDERS_RENAME: 'folders.rename',
  FOLDERS_DELETE: 'folders.delete',

  // API Keys
  APIKEYS_VIEW: 'apikeys.view',
  APIKEYS_CREATE: 'apikeys.create',
  APIKEYS_ROTATE: 'apikeys.rotate',
  APIKEYS_DELETE: 'apikeys.delete',

  // Upload Rules
  UPLOADRULES_VIEW: 'uploadrules.view',
  UPLOADRULES_UPDATE: 'uploadrules.update',

  // Storage
  STORAGE_VIEW: 'storage.view',
  STORAGE_UPDATE: 'storage.update',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',

  // Audit Logs
  AUDIT_VIEW: 'audit.view',
  AUDIT_EXPORT: 'audit.export',

  // System
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  SYSTEM_UPGRADE: 'system.upgrade',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Ordered list of all permissions for UI display. */
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

// =========================================================================
// Built-in roles
// =========================================================================

export enum BuiltInRole {
  Owner = 'owner',
  Administrator = 'administrator',
  Manager = 'manager',
  Developer = 'developer',
  Viewer = 'viewer',
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Permission sets for each built-in role. */
const ALL = ALL_PERMISSIONS;

export const BUILT_IN_ROLE_PERMISSIONS: Record<BuiltInRole, Permission[]> = {
  [BuiltInRole.Owner]: ALL,

  [BuiltInRole.Administrator]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_INVITE,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.FILES_VIEW,
    PERMISSIONS.FILES_UPLOAD,
    PERMISSIONS.FILES_RENAME,
    PERMISSIONS.FILES_DELETE,
    PERMISSIONS.FILES_MOVE,
    PERMISSIONS.FOLDERS_CREATE,
    PERMISSIONS.FOLDERS_RENAME,
    PERMISSIONS.FOLDERS_DELETE,
    PERMISSIONS.APIKEYS_VIEW,
    PERMISSIONS.APIKEYS_CREATE,
    PERMISSIONS.APIKEYS_ROTATE,
    PERMISSIONS.APIKEYS_DELETE,
    PERMISSIONS.UPLOADRULES_VIEW,
    PERMISSIONS.UPLOADRULES_UPDATE,
    PERMISSIONS.STORAGE_VIEW,
    PERMISSIONS.STORAGE_UPDATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,
    PERMISSIONS.SYSTEM_BACKUP,
    PERMISSIONS.SYSTEM_RESTORE,
  ],

  [BuiltInRole.Manager]: [
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.FILES_VIEW,
    PERMISSIONS.FILES_UPLOAD,
    PERMISSIONS.FILES_RENAME,
    PERMISSIONS.FILES_DELETE,
    PERMISSIONS.FILES_MOVE,
    PERMISSIONS.FOLDERS_CREATE,
    PERMISSIONS.FOLDERS_RENAME,
    PERMISSIONS.FOLDERS_DELETE,
    PERMISSIONS.APIKEYS_VIEW,
    PERMISSIONS.APIKEYS_CREATE,
    PERMISSIONS.APIKEYS_ROTATE,
    PERMISSIONS.APIKEYS_DELETE,
    PERMISSIONS.UPLOADRULES_VIEW,
    PERMISSIONS.UPLOADRULES_UPDATE,
  ],

  [BuiltInRole.Developer]: [
    PERMISSIONS.FILES_VIEW,
    PERMISSIONS.FILES_UPLOAD,
    PERMISSIONS.FILES_RENAME,
    PERMISSIONS.FILES_DELETE,
    PERMISSIONS.FILES_MOVE,
    PERMISSIONS.FOLDERS_CREATE,
    PERMISSIONS.FOLDERS_RENAME,
    PERMISSIONS.FOLDERS_DELETE,
    PERMISSIONS.APIKEYS_VIEW,
    PERMISSIONS.APIKEYS_CREATE,
    PERMISSIONS.APIKEYS_ROTATE,
    PERMISSIONS.APIKEYS_DELETE,
    PERMISSIONS.AUDIT_VIEW,
  ],

  [BuiltInRole.Viewer]: [PERMISSIONS.FILES_VIEW, PERMISSIONS.PROJECTS_VIEW],
};

/** Check if a role ID is a built-in role. */
export function isBuiltInRole(roleId: string): roleId is BuiltInRole {
  return Object.values(BuiltInRole).includes(roleId as BuiltInRole);
}

/** Permission groups for UI organization. */
export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  {
    label: 'Users',
    permissions: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_INVITE,
    ],
  },
  {
    label: 'Projects',
    permissions: [
      PERMISSIONS.PROJECTS_VIEW,
      PERMISSIONS.PROJECTS_CREATE,
      PERMISSIONS.PROJECTS_UPDATE,
      PERMISSIONS.PROJECTS_DELETE,
    ],
  },
  {
    label: 'Files',
    permissions: [
      PERMISSIONS.FILES_VIEW,
      PERMISSIONS.FILES_UPLOAD,
      PERMISSIONS.FILES_RENAME,
      PERMISSIONS.FILES_DELETE,
      PERMISSIONS.FILES_MOVE,
    ],
  },
  {
    label: 'Folders',
    permissions: [
      PERMISSIONS.FOLDERS_CREATE,
      PERMISSIONS.FOLDERS_RENAME,
      PERMISSIONS.FOLDERS_DELETE,
    ],
  },
  {
    label: 'API Keys',
    permissions: [
      PERMISSIONS.APIKEYS_VIEW,
      PERMISSIONS.APIKEYS_CREATE,
      PERMISSIONS.APIKEYS_ROTATE,
      PERMISSIONS.APIKEYS_DELETE,
    ],
  },
  {
    label: 'Upload Rules',
    permissions: [PERMISSIONS.UPLOADRULES_VIEW, PERMISSIONS.UPLOADRULES_UPDATE],
  },
  { label: 'Storage', permissions: [PERMISSIONS.STORAGE_VIEW, PERMISSIONS.STORAGE_UPDATE] },
  { label: 'Settings', permissions: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_UPDATE] },
  { label: 'Audit Logs', permissions: [PERMISSIONS.AUDIT_VIEW, PERMISSIONS.AUDIT_EXPORT] },
  {
    label: 'System',
    permissions: [
      PERMISSIONS.SYSTEM_BACKUP,
      PERMISSIONS.SYSTEM_RESTORE,
      PERMISSIONS.SYSTEM_SHUTDOWN,
      PERMISSIONS.SYSTEM_UPGRADE,
    ],
  },
];
