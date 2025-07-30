import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    // create application_period column
    await this.client.queryArray(
      `alter table spending_limit add column application_period text;`,
    );

    // update application period to `MONTHLY` by default
    await this.client.queryArray(
      `update spending_limit set application_period = 'MONTHLY'`,
    );

    // make application_period column non-nullable
    await this.client.queryArray(
      `alter table spending_limit alter column application_period set not null;`,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
