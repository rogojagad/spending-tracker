import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(`CREATE TABLE payday (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        note TEXT NOT NULL,
        payday_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    await this.client.queryArray(`
        -- Add indexes for performance
        CREATE INDEX idx_payday_date ON payday(payday_date);
    `);
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
    await this.client.queryArray(`DROP TABLE IF EXISTS payday;`);
  }
}
