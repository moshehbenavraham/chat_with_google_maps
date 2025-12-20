/**
 * Database Schema Tests
 *
 * Tests for schema table definitions, column constraints, and type inference.
 * These tests validate the schema structure without requiring database access.
 */

import { describe, it, expect } from 'vitest';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { users, sessions } from '../schema/index.ts';
import type { User, NewUser, Session, NewSession } from '../schema/index.ts';

describe('Users Schema', () => {
  const tableConfig = getTableConfig(users);

  describe('Table definition', () => {
    it('should have correct table name', () => {
      expect(tableConfig.name).toBe('users');
    });

    it('should have 7 columns', () => {
      expect(tableConfig.columns.length).toBe(7);
    });

    it('should have correct column names', () => {
      const columnNames = tableConfig.columns.map(c => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('email_verified');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('image');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });
  });

  describe('Column constraints', () => {
    it('should have id column defined', () => {
      const idColumn = tableConfig.columns.find(c => c.name === 'id');
      expect(idColumn).toBeDefined();
      expect(idColumn?.dataType).toBe('string');
    });

    it('should have email as not null', () => {
      const emailColumn = tableConfig.columns.find(c => c.name === 'email');
      expect(emailColumn?.notNull).toBe(true);
    });

    it('should have email as unique', () => {
      const emailColumn = tableConfig.columns.find(c => c.name === 'email');
      expect(emailColumn?.isUnique).toBe(true);
    });

    it('should have email_verified with default false', () => {
      const column = tableConfig.columns.find(c => c.name === 'email_verified');
      expect(column?.hasDefault).toBe(true);
    });

    it('should have name as nullable', () => {
      const nameColumn = tableConfig.columns.find(c => c.name === 'name');
      expect(nameColumn?.notNull).toBe(false);
    });

    it('should have image as nullable', () => {
      const imageColumn = tableConfig.columns.find(c => c.name === 'image');
      expect(imageColumn?.notNull).toBe(false);
    });

    it('should have created_at as not null with default', () => {
      const column = tableConfig.columns.find(c => c.name === 'created_at');
      expect(column?.notNull).toBe(true);
      expect(column?.hasDefault).toBe(true);
    });

    it('should have updated_at as not null with default', () => {
      const column = tableConfig.columns.find(c => c.name === 'updated_at');
      expect(column?.notNull).toBe(true);
      expect(column?.hasDefault).toBe(true);
    });
  });

  describe('Type inference', () => {
    it('should infer User type with correct shape', () => {
      // Type-level test: This would fail at compile time if types are wrong
      const user: User = {
        id: 'test-id',
        email: 'test@example.com',
        emailVerified: true,
        name: 'Test User',
        image: 'https://example.com/avatar.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.id).toBe('test-id');
      expect(user.email).toBe('test@example.com');
    });

    it('should allow nullable fields to be null in User type', () => {
      const user: User = {
        id: 'test-id',
        email: 'test@example.com',
        emailVerified: false,
        name: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(user.name).toBeNull();
      expect(user.image).toBeNull();
    });

    it('should allow NewUser without auto-generated fields', () => {
      // NewUser should not require createdAt/updatedAt (they have defaults)
      const newUser: NewUser = {
        id: 'new-user-id',
        email: 'new@example.com',
      };

      expect(newUser.id).toBe('new-user-id');
      expect(newUser.email).toBe('new@example.com');
    });
  });
});

describe('Sessions Schema', () => {
  const tableConfig = getTableConfig(sessions);

  describe('Table definition', () => {
    it('should have correct table name', () => {
      expect(tableConfig.name).toBe('sessions');
    });

    it('should have 8 columns', () => {
      expect(tableConfig.columns.length).toBe(8);
    });

    it('should have correct column names', () => {
      const columnNames = tableConfig.columns.map(c => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('token');
      expect(columnNames).toContain('user_id');
      expect(columnNames).toContain('expires_at');
      expect(columnNames).toContain('ip_address');
      expect(columnNames).toContain('user_agent');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });
  });

  describe('Column constraints', () => {
    it('should have id column defined', () => {
      const idColumn = tableConfig.columns.find(c => c.name === 'id');
      expect(idColumn).toBeDefined();
      expect(idColumn?.dataType).toBe('string');
    });

    it('should have token as not null and unique', () => {
      const column = tableConfig.columns.find(c => c.name === 'token');
      expect(column?.notNull).toBe(true);
      expect(column?.isUnique).toBe(true);
    });

    it('should have user_id as not null', () => {
      const column = tableConfig.columns.find(c => c.name === 'user_id');
      expect(column?.notNull).toBe(true);
    });

    it('should have expires_at as not null', () => {
      const column = tableConfig.columns.find(c => c.name === 'expires_at');
      expect(column?.notNull).toBe(true);
    });

    it('should have ip_address as nullable', () => {
      const column = tableConfig.columns.find(c => c.name === 'ip_address');
      expect(column?.notNull).toBe(false);
    });

    it('should have user_agent as nullable', () => {
      const column = tableConfig.columns.find(c => c.name === 'user_agent');
      expect(column?.notNull).toBe(false);
    });

    it('should have created_at as not null with default', () => {
      const column = tableConfig.columns.find(c => c.name === 'created_at');
      expect(column?.notNull).toBe(true);
      expect(column?.hasDefault).toBe(true);
    });

    it('should have updated_at as not null with default', () => {
      const column = tableConfig.columns.find(c => c.name === 'updated_at');
      expect(column?.notNull).toBe(true);
      expect(column?.hasDefault).toBe(true);
    });
  });

  describe('Foreign key relationship', () => {
    it('should have foreign key on user_id column', () => {
      expect(tableConfig.foreignKeys.length).toBe(1);
    });

    it('should reference users table', () => {
      const fk = tableConfig.foreignKeys[0];
      expect(fk?.reference().foreignTable).toBe(users);
    });

    it('should reference users.id column', () => {
      const fk = tableConfig.foreignKeys[0];
      const foreignColumns = fk?.reference().foreignColumns;
      expect(foreignColumns?.length).toBe(1);
      expect(foreignColumns?.[0]?.name).toBe('id');
    });
  });

  describe('Type inference', () => {
    it('should infer Session type with correct shape', () => {
      const session: Session = {
        id: 'session-id',
        token: 'session-token',
        userId: 'user-id',
        expiresAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(session.id).toBe('session-id');
      expect(session.userId).toBe('user-id');
    });

    it('should allow NewSession without auto-generated fields', () => {
      // NewSession should not require createdAt/updatedAt (they have defaults)
      // ipAddress and userAgent are nullable
      const newSession: NewSession = {
        id: 'new-session-id',
        token: 'new-session-token',
        userId: 'user-id',
        expiresAt: new Date(),
      };

      expect(newSession.id).toBe('new-session-id');
      expect(newSession.userId).toBe('user-id');
    });
  });
});
