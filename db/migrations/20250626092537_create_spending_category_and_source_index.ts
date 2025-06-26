import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(
      `create index idx_category_id on spending (category_id)`,
    );

    await this.client.queryArray(
      `create index idx_source_id on spending (source_id)`,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
