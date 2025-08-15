import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(
      `create index if not exists idx_created_at_and_category on spending (created_at, category_id)`,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
