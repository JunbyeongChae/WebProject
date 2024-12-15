// models/user.js

class User {
  static async create(uid, email, username, passwordHash) {
    // DB 없이 무시
    return;
  }

  static async findByUid(uid) {
    return null;
  }

  static async findByEmail(email) {
    return null;
  }

  static async update(uid, updateData) {
    return;
  }

  static async delete(uid) {
    return;
  }
}

module.exports = User;
