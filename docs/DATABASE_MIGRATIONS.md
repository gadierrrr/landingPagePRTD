# Database Migrations Guide

This guide explains how to manage database schema changes using Drizzle ORM migrations.

## Current State

The database schema is defined in `db/schema.ts` and the initial migration (`000_initial.sql`) has been applied to create all tables.

## Migration Workflow

### 1. Making Schema Changes

Edit the schema in `db/schema.ts`. For example, to add a new column:

```typescript
export const beaches = sqliteTable('beaches', {
  // ... existing columns
  newColumn: text('new_column'), // Add new column
});
```

### 2. Generate Migration

Run the migration generator:

```bash
npm run db:generate
```

This will:
- Compare your schema with the current database state
- Generate a new SQL migration file in `db/migrations/`
- Update the migration journal in `db/migrations/meta/_journal.json`

### 3. Review Migration

Check the generated SQL file in `db/migrations/` to ensure it's correct. Drizzle generates:
- `CREATE TABLE` for new tables
- `ALTER TABLE` for column changes
- `CREATE INDEX` for new indexes

### 4. Apply Migration

To apply migrations to your database:

```bash
npm run db:migrate
```

**Important**: This command reads migration files and applies them in order. Always review migrations before running in production.

### 5. Test Migration

After applying:

1. Test your application with the new schema
2. Verify data integrity
3. Check that all queries work as expected

## Migration Commands

```bash
# Generate a new migration from schema changes
npm run db:generate

# Apply pending migrations to database
npm run db:migrate

# Open Drizzle Studio to inspect database
npm run db:studio

# Seed data from JSON files
npm run db:seed:beaches
npm run db:seed:deals
npm run db:seed:events
```

## Best Practices

### Development Workflow

1. **Edit Schema** - Modify `db/schema.ts`
2. **Generate** - Run `npm run db:generate`
3. **Review** - Check the generated SQL
4. **Test** - Apply locally and test
5. **Commit** - Commit both schema and migration files

### Production Deployment

```bash
# 1. Pull latest code with migrations
git pull

# 2. Backup database (IMPORTANT!)
cp data/prtd.sqlite data/prtd.sqlite.backup

# 3. Run migrations
npm run db:migrate

# 4. Restart application
sudo systemctl restart prtd
```

### Rollback Strategy

Drizzle doesn't have automatic rollbacks. To rollback:

1. **Restore from backup**:
   ```bash
   cp data/prtd.sqlite.backup data/prtd.sqlite
   ```

2. **Or write manual rollback SQL** and apply it

Always test migrations in development first!

## Example: Adding a New Column

### 1. Edit Schema

```typescript
// db/schema.ts
export const beaches = sqliteTable('beaches', {
  // ... existing columns
  featured: integer('featured', { mode: 'boolean' }).default(false),
});
```

### 2. Generate Migration

```bash
npm run db:generate
```

Output:
```
✔ Loaded configuration from drizzle.config.ts
✔ Found 1 schema change
✔ Generated migration: 001_add_featured_column.sql
```

### 3. Generated SQL

Drizzle creates `db/migrations/001_add_featured_column.sql`:

```sql
ALTER TABLE beaches ADD COLUMN featured INTEGER DEFAULT 0;
```

### 4. Apply Migration

```bash
npm run db:migrate
```

### 5. Update Type Definitions

The TypeScript types automatically update from the schema, so your code is type-safe immediately.

## Migration Files

- `db/migrations/` - SQL migration files
- `db/migrations/meta/_journal.json` - Migration history
- `db/migrations/meta/*_snapshot.json` - Schema snapshots
- `db/schema.ts` - Source of truth for database schema

## Troubleshooting

### Migration Out of Sync

If migrations are out of sync with the database:

```bash
# Reset to known state (DESTRUCTIVE - use with caution)
rm -rf db/migrations/*
npm run db:generate  # Regenerate from current schema
```

### Manual SQL Needed

For complex migrations (data transformations, multi-step changes):

1. Create a custom migration file manually
2. Add it to the journal
3. Apply with `npm run db:migrate`

## Safety Checklist

Before running migrations in production:

- [ ] Migrations tested in development
- [ ] Database backup created
- [ ] Migration reviewed and approved
- [ ] Downtime window scheduled (if needed)
- [ ] Rollback plan documented
- [ ] Team notified of deployment

## Additional Resources

- [Drizzle Migrations Docs](https://orm.drizzle.team/docs/migrations)
- [SQLite ALTER TABLE Limitations](https://www.sqlite.org/lang_altertable.html)
- Project: `db/schema.ts` for current schema
