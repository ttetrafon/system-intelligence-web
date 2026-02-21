// Extend the auto-generated Cloudflare env types with secrets
// Secrets are set via `wrangler secret put` and aren't in wrangler.jsonc

declare namespace Cloudflare {
	interface Env {
		SESSION_SECRET: string;
	}
	interface StagingEnv {
		SESSION_SECRET: string;
	}
	interface ProductionEnv {
		SESSION_SECRET: string;
	}
}
