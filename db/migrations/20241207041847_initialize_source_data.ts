import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    await this.client.queryArray(
      /**
       * `UNKNOWN` is for old data that cannot be mapped to correct source appropriately.
       * rest of data will be inserted manually, because i don't feel like exposing my financial arrangement on a public repository LOL
       */
      `INSERT INTO source (name) VALUES ('UNKNOWN');`,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
  }
}
