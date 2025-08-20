import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(
      `CREATE TABLE IF NOT EXISTS spending_limit_snapshot (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            value INTEGER NOT NULL,
            category_id UUID REFERENCES category(id),
            source_id UUID REFERENCES source(id),
            used_value INTEGER NOT NULL,
            used_percentage INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
