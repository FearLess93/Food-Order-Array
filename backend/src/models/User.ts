import pool from '../config/database';
import { User } from '../types';

export class UserModel {
  static async create(
    email: string,
    passwordHash: string,
    name: string,
    role: 'employee' | 'admin' = 'employee'
  ): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, is_verified as "isVerified", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [email, passwordHash, name, role]);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const query = `
      SELECT 
        id, email, password_hash as "passwordHash", name, role, 
        is_verified as "isVerified", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT 
        id, email, name, role, is_verified as "isVerified", 
        created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateVerificationCode(
    userId: string,
    code: string,
    expiresAt: Date
  ): Promise<void> {
    const query = `
      UPDATE users
      SET verification_code = $1, verification_code_expires = $2
      WHERE id = $3
    `;
    
    await pool.query(query, [code, expiresAt, userId]);
  }

  static async verifyEmail(userId: string): Promise<void> {
    const query = `
      UPDATE users
      SET is_verified = true, verification_code = NULL, verification_code_expires = NULL
      WHERE id = $1
    `;
    
    await pool.query(query, [userId]);
  }

  static async getVerificationCode(userId: string): Promise<{ code: string; expires: Date } | null> {
    const query = `
      SELECT verification_code as code, verification_code_expires as expires
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async isEmailTaken(email: string): Promise<boolean> {
    const query = 'SELECT id FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }
}
