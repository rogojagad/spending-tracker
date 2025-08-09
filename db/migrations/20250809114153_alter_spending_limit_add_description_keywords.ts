import {
  AbstractMigration,
  ClientPostgreSQL,
  Info,
} from "https://deno.land/x/nessie@2.0.11/mod.ts";

export default class extends AbstractMigration<ClientPostgreSQL> {
  /** Runs on migrate */
  async up(info: Info): Promise<void> {
    // create description_keywords column
    await this.client.queryArray(
      `ALTER TABLE spending_limit ADD COLUMN description_keywords TEXT[] IF NOT EXISTS;`,
    );

    // drop the constraint that requires category_id or source_id to be not null
    await this.client.queryArray(
      `ALTER TABLE spending_limit DROP CONSTRAINT limits_require_category_or_source_check`,
    );

    // ensure that either description_keywords, category_id, or source_id is not null
    await this.client.queryArray(
      `
      ALTER TABLE spending_limit ADD CONSTRAINT limits_require_category_or_source_check_or_description_keywords
      CHECK (description_keywords IS NOT NULL  OR category_id IS NOT NULL OR source_id IS NOT NULL)
      `,
    );
  }

  /** Runs on rollback */
  async down(info: Info): Promise<void> {
    await this.client.queryArray(
      `ALTER TABLE spending_limit DROP CONSTRAINT limits_require_category_or_source_check_or_description_keywords;`,
    );

    await this.client.queryArray(
      `ALTER TABLE spending_limit CREATE CONSTRAINT limits_require_category_or_source_check CHECK (
          category_id IS NOT NULL OR source_id IS NOT NULL
        );`,
    );

    await this.client.queryArray(
      `ALTER TABLE spending_limit DROP COLUMN description_keywords;`,
    );
  }
}
