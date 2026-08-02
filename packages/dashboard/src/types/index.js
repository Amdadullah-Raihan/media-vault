// ---------------------------------------------------------------------------
// MediaVault Dashboard – Core Types
// ---------------------------------------------------------------------------
export var FileVisibility;
(function (FileVisibility) {
    FileVisibility["Private"] = "private";
    FileVisibility["Public"] = "public";
})(FileVisibility || (FileVisibility = {}));
export var MimeCategory;
(function (MimeCategory) {
    MimeCategory["Image"] = "image";
    MimeCategory["Video"] = "video";
    MimeCategory["Audio"] = "audio";
    MimeCategory["Document"] = "document";
    MimeCategory["Archive"] = "archive";
    MimeCategory["Other"] = "other";
})(MimeCategory || (MimeCategory = {}));
// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export var UserStatus;
(function (UserStatus) {
    UserStatus["Pending"] = "pending";
    UserStatus["Active"] = "active";
    UserStatus["Locked"] = "locked";
    UserStatus["Suspended"] = "suspended";
    UserStatus["Disabled"] = "disabled";
    UserStatus["Archived"] = "archived";
    UserStatus["Deleted"] = "deleted";
})(UserStatus || (UserStatus = {}));
//# sourceMappingURL=index.js.map