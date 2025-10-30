import pool from '../config/database';

// Table to track which restaurants are available for voting on specific dates
export class DailyRestaurantModel {
  static async setDailyRestaurants(date: Date, restaurantIds: string[]): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete existing entries for this date
      await client.query('DELETE FROM daily_restaurants WHERE date = $1', [date]);
      
      // Insert new entries
      if (restaurantIds.length > 0) {
        const values: any[] = [];
        const placeholders: string[] = [];
        let paramCount = 1;
        
        restaurantIds.forEach((restaurantId) => {
          placeholders.push(`($${paramCount++}, $${paramCount++})`);
          values.push(date, restaurantId);
        });
        
        const query = `
          INSERT INTO daily_restaurants (date, restaurant_id)
          VALUES ${placeholders.join(', ')}
        `;
        
        await client.query(query, values);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getDailyRestaurants(date: Date): Promise<string[]> {
    const query = `
      SELECT restaurant_id as "restaurantId"
      FROM daily_restaurants
      WHERE date = $1
    `;
    
    const result = await pool.query(query, [date]);
    return result.rows.map(row => row.restaurantId);
  }

  static async hasDailyRestaurants(date: Date): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM daily_restaurants WHERE date = $1';
    const result = await pool.query(query, [date]);
    return parseInt(result.rows[0].count) > 0;
  }
}
