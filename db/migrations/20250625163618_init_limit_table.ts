import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(_info: Info): Promise<void> {
    await this.client.queryArray(`CREATE TABLE limit (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            value INTEGER NOT NULL,
            category_id UUID REFERENCES category(id),
            source_id UUID REFERENCES source(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

             -- Ensure at least one reference exists
            CONSTRAINT limits_require_category_or_source_check CHECK (
                category_id IS NOT NULL OR source_id IS NOT NULL
            )
          );`);

    await this.client.queryArray(`
        -- Add indexes for performance
        CREATE INDEX idx_limit_category_id ON limit(category_id) WHERE category_id IS NOT NULL;
        CREATE INDEX idx_limit_source_id ON limit(source_id) WHERE source_id IS NOT NULL;
    `);
  }

  /** Runs on rollback */
  async down(_info: Info): Promise<void> {
  }
}
