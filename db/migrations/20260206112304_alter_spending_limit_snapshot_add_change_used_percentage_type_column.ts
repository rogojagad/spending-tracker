import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(
      `ALTER TABLE spending_limit_snapshot ALTER COLUMN used_percentage TYPE NUMERIC(7, 4);`, // store 7 digits with 4 digits of precision
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
