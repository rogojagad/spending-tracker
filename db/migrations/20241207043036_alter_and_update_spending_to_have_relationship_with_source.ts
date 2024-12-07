import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    // alter table `spending` to create `source_id` column
    await this.client.queryArray(
      `alter table spending add column source_id UUID;`,
    );

    // retrieve id for default source of `UNKNOWN`
    const { rows } = await this.client.queryObject<{ id: string }>(
      `select id from source where name = 'UNKNOWN'`,
    );

    const defaultSourceId = rows.pop()?.id;

    // update `spending` record whose `source_id` is NULL to above source id
    await this.client.queryArray(
      `update spending set source_id = '${defaultSourceId}' where source_id is NULL`,
    );

    // set `spending.source_id` to non-nullable
    await this.client.queryArray(
      `alter table spending alter column source_id set not null;`,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
