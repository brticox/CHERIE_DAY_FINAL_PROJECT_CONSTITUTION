/**
 * PLACEHOLDER generated-types module.
 *
 * The real `Database` type is generated from the live schema, NOT hand-written.
 * After the migrations in /supabase/migrations are applied to a project, run:
 *
 *   # against a linked hosted project
 *   npx supabase gen types typescript --linked > lib/supabase/database.types.ts
 *
 *   # or against a local stack
 *   npx supabase gen types typescript --local > lib/supabase/database.types.ts
 *
 *   # or by project id
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts
 *
 * Until then this permissive placeholder keeps the app compiling. The Supabase
 * clients in this folder are typed as `Database` so swapping in the generated
 * file is a drop-in replacement.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Minimal shape so `createClient<Database>()` type-checks pre-generation.
export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, Json>; Insert: Record<string, Json>; Update: Record<string, Json> }>;
    Views: Record<string, { Row: Record<string, Json> }>;
    Functions: Record<string, unknown>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, unknown>;
  };
};
