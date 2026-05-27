import Database from "better-sqlite3";

import { type CheckResult, type ProviderConfig, redactObject } from "@llm-ping/shared";

type PayloadRow = { payload: string };

export class Store {
  private readonly db: Database.Database;

  constructor(path = "llm-ping.db") {
    this.db = new Database(path);
    this.db.pragma("journal_mode = WAL");
    this.migrate();
  }

  listProviders(): ProviderConfig[] {
    return this.db
      .prepare("select payload from providers order by name")
      .all()
      .map((row) => JSON.parse((row as PayloadRow).payload));
  }

  upsertProvider(provider: ProviderConfig): ProviderConfig {
    this.db
      .prepare("insert into providers (id, name, payload) values (?, ?, ?) on conflict(id) do update set name=excluded.name, payload=excluded.payload")
      .run(provider.id, provider.name, JSON.stringify(provider));
    return provider;
  }

  deleteProvider(id: string): void {
    this.db.prepare("delete from providers where id = ?").run(id);
  }

  saveResult(result: CheckResult): void {
    this.db
      .prepare("insert into check_results (id, provider_id, status, created_at, payload) values (?, ?, ?, ?, ?)")
      .run(result.id, result.providerId, result.status, result.finishedAt, JSON.stringify(redactObject(result)));
  }

  listResults(limit = 200): CheckResult[] {
    return this.db
      .prepare("select payload from check_results order by created_at desc limit ?")
      .all(limit)
      .map((row) => JSON.parse((row as PayloadRow).payload));
  }

  private migrate(): void {
    this.db.exec(`
      create table if not exists providers (
        id text primary key,
        name text not null,
        payload text not null
      );
      create table if not exists check_results (
        id text primary key,
        provider_id text not null,
        status text not null,
        created_at text not null,
        payload text not null
      );
    `);
  }
}
