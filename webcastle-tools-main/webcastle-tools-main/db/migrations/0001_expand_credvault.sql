CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "color" text DEFAULT '#6366f1' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "color" text DEFAULT '#6366f1' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tool_tags" (
  "tool_id" uuid NOT NULL,
  "tag_id" uuid NOT NULL,
  CONSTRAINT "tool_tags_pk" PRIMARY KEY("tool_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "type" text DEFAULT 'tool' NOT NULL;
--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "url" text;
--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "instructions" text;
--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "category_id" uuid;
--> statement-breakpoint
ALTER TABLE "credentials" ALTER COLUMN "username" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "credentials" ALTER COLUMN "password_enc" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "tool_tags" ADD CONSTRAINT "tool_tags_tool_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tool_tags" ADD CONSTRAINT "tool_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
