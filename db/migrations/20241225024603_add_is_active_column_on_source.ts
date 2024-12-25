import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(
      `alter table source add column is_active boolean`,
    );

    const { rows } = await this.client.queryObject<{ id: string }>(
      `select id from source where name = 'UNKNOWN'`,
    );

    const unknownSourceId = rows.pop()?.id;

    // update `UNKNOWN` source to inactive
    await this.client.queryArray(
      `update source set is_active = FALSE where id = '${unknownSourceId}'`,
    );

    // update rest of the sources to active
    await this.client.queryArray(
      `update source set is_active = TRUE where id != '${unknownSourceId}'`,
    );

    // update is_active to non-nullable
    await this.client.queryArray(
      `alter table source alter column is_active set not null;`,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
