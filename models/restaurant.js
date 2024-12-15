// models/restaurant.js

class Restaurant {
  static async create(restaurantData) {
    return 'dummy_id';
  }

  static async findById(restaurantId) {
    return null;
  }

  static async update(restaurantId, updateData) {
    return;
  }

  static async delete(restaurantId) {
    return;
  }

  static async search(options) {
    return [];
  }
}

module.exports = Restaurant;
