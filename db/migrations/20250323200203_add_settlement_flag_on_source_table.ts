import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(`
        ALTER TABLE source ADD COLUMN is_settlement_needed BOOLEAN DEFAULT FALSE
    `);

    const { rows } = await this.client.queryObject<{ id: string }>(
      `SELECT id FROM source WHERE name LIKE '%Credit Card'`,
    );

    const creditCardSourceId = rows.pop()?.id;

    await this.client.queryArray(
      `UPDATE source SET is_settlement_needed = TRUE WHERE ID = '${creditCardSourceId}'`,
    );

    await this.client.queryArray(
      `ALTER TABLE source ALTER COLUMN is_settlement_needed SET NOT NULL`,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
