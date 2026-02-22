import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    // add is_active column
    await this.client.queryArray(
      `alter table category add column is_active BOOLEAN;`,
    );

    // set all category as active by default
    await this.client.queryArray(
      `update category set is_active = true`,
    );

    // make is_active not nullable
    await this.client.queryArray(
      `alter table category alter column is_active set not null;`,
    );

    // add is_active column
    await this.client.queryArray(
      `alter table category add column description TEXT;`,
    );

    // set all category as active by default
    await this.client.queryArray(
      `update category set description = ''`,
    );

    // make description not nullable
    await this.client.queryArray(
      `alter table category alter column description set not null;`,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
