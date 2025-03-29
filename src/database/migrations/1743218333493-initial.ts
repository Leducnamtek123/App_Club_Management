import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1743218333493 implements MigrationInterface {
    name = 'Initial1743218333493'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text, "leader_id" uuid, CONSTRAINT "UQ_8387ed27b3d4ca53ec3fc7b029c" UNIQUE ("name"), CONSTRAINT "REL_22033f88fea3650e66ac70556d" UNIQUE ("leader_id"), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TYPE "public"."users_salutation_enum" AS ENUM('Anh', 'Chị')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "email" character varying, "password" character varying, "phone" character varying, "avatar" character varying, "refresh_token" character varying, "zalo_id" character varying, "company_name" character varying, "address" character varying, "birth_date" date, "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending', "position" character varying NOT NULL, "salutation" "public"."users_salutation_enum" NOT NULL, "branch_id" uuid, "referrer_name" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "UQ_a18480c33ad73ffddd6d0cb4d4b" UNIQUE ("zalo_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."zalo-notifications_type_enum" AS ENUM('BROADCAST', 'REMIND_FEE', 'REMIND_BIRTHDAY')`);
        await queryRunner.query(`CREATE TABLE "zalo-notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."zalo-notifications_type_enum" NOT NULL, "message" text NOT NULL, CONSTRAINT "PK_9ac1ef241158493a0f6622847dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transaction_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text, CONSTRAINT "UQ_3f17bf489cd3ae4641ab3e27a9f" UNIQUE ("name"), CONSTRAINT "PK_bbd38b9174546b0ed4fe04689c7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL, "amount" numeric(15,2) NOT NULL, "description" text, "branch_id" uuid, "category_id" uuid, "created_by_id" uuid, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."events_status_enum" AS ENUM('Sắp diễn ra', 'Đang diễn ra', 'Đã kết thúc', 'Đã hủy')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying(255) NOT NULL, "description" text NOT NULL, "start_date" TIMESTAMP, "end_date" TIMESTAMP, "ticket_closing_date" TIMESTAMP, "location" character varying(255) NOT NULL, "branch_id" uuid, "status" "public"."events_status_enum" NOT NULL, "ticket_price" numeric(10,2) NOT NULL DEFAULT '0', "images" json, "created_by_id" uuid, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('PENDING', 'VALID', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'PENDING', "qr_code" character varying, "user_id" uuid NOT NULL, "event_id" uuid NOT NULL, CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sponsorship_tiers_name_enum" AS ENUM('Kim cương', 'Vàng', 'Bạc', 'Đồng')`);
        await queryRunner.query(`CREATE TABLE "sponsorship_tiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" "public"."sponsorship_tiers_name_enum" NOT NULL, "min_amount" numeric(15,2) NOT NULL, "event_id" uuid NOT NULL, CONSTRAINT "PK_1dca72c18ad6ace23ab00314e56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sponsorships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL, "amount" numeric(15,2) NOT NULL, "description" text, "branch_id" uuid, "note" text, "logo" character varying, "created_by_id" uuid, "sponsor_id" uuid NOT NULL, "event_id" uuid NOT NULL, "tier_id" uuid, CONSTRAINT "PK_393571b62d6dd0f63c6d3eb154b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."news_category_enum" AS ENUM('EVENT', 'ANNOUNCEMENT', 'GENERAL')`);
        await queryRunner.query(`CREATE TABLE "news" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "content" text NOT NULL, "thumbnail" character varying, "is_published" boolean NOT NULL DEFAULT false, "published_at" TIMESTAMP, "author_id" uuid NOT NULL, "category" "public"."news_category_enum" NOT NULL DEFAULT 'GENERAL', CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "membership_payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL DEFAULT 'income', "amount" numeric(15,2) NOT NULL, "description" text, "branch_id" uuid, "user_id" uuid NOT NULL, "year" integer NOT NULL, "created_by_id" uuid, CONSTRAINT "UQ_387d4d8269c131c08cd205931a1" UNIQUE ("user_id", "year"), CONSTRAINT "PK_52b7d19d02434346f8eaa6cdd04" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "membership_fees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "year" integer NOT NULL, "amount" numeric(15,2) NOT NULL, CONSTRAINT "UQ_b47d14dfa135266d50ce8eea286" UNIQUE ("year"), CONSTRAINT "UQ_b47d14dfa135266d50ce8eea286" UNIQUE ("year"), CONSTRAINT "PK_6d45a7c6c9a60f15672f3023536" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_recipients" ("zalo_notification_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_a918fbc24e1e96f05bd4fadac88" PRIMARY KEY ("zalo_notification_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0b87845ebab799e06f73fa8f43" ON "notification_recipients" ("zalo_notification_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3c1147687827d3dd27ebfb4a4a" ON "notification_recipients" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_22033f88fea3650e66ac70556df" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_5a58f726a41264c8b3e86d4a1de" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_f9d1859399e7f8dd36e4e10bd22" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_361b4545aafa33ae00d8630295c" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f" FOREIGN KEY ("category_id") REFERENCES "transaction_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_bf0862b475e824a7dc33acc40a1" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_08e606dc5182b142dc916e7abab" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_2e445270177206a97921e461710" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_bd5387c23fb40ae7e3526ad75ea" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sponsorship_tiers" ADD CONSTRAINT "FK_1f1563187c8d25e73eeb4df6b7f" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sponsorships" ADD CONSTRAINT "FK_9f0ea2557c7428b07881f94bd58" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sponsorships" ADD CONSTRAINT "FK_8e1ab13595f0faf9eb6698341ff" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sponsorships" ADD CONSTRAINT "FK_35ae20905a1fd68c529df865c23" FOREIGN KEY ("sponsor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sponsorships" ADD CONSTRAINT "FK_9fa0e8dc22784a152a9a3432b9c" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sponsorships" ADD CONSTRAINT "FK_9d39b747c314bd0e17e48e8bfbf" FOREIGN KEY ("tier_id") REFERENCES "sponsorship_tiers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "news" ADD CONSTRAINT "FK_173d93468ebf142bb3424c2fd63" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membership_payments" ADD CONSTRAINT "FK_e28d2239b82fd4ce879ced09821" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membership_payments" ADD CONSTRAINT "FK_c68513795342d2d3fef80ca2218" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membership_payments" ADD CONSTRAINT "FK_3f62cfe4a325bb39b2bae8b6b92" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_recipients" ADD CONSTRAINT "FK_0b87845ebab799e06f73fa8f435" FOREIGN KEY ("zalo_notification_id") REFERENCES "zalo-notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "notification_recipients" ADD CONSTRAINT "FK_3c1147687827d3dd27ebfb4a4af" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_recipients" DROP CONSTRAINT "FK_3c1147687827d3dd27ebfb4a4af"`);
        await queryRunner.query(`ALTER TABLE "notification_recipients" DROP CONSTRAINT "FK_0b87845ebab799e06f73fa8f435"`);
        await queryRunner.query(`ALTER TABLE "membership_payments" DROP CONSTRAINT "FK_3f62cfe4a325bb39b2bae8b6b92"`);
        await queryRunner.query(`ALTER TABLE "membership_payments" DROP CONSTRAINT "FK_c68513795342d2d3fef80ca2218"`);
        await queryRunner.query(`ALTER TABLE "membership_payments" DROP CONSTRAINT "FK_e28d2239b82fd4ce879ced09821"`);
        await queryRunner.query(`ALTER TABLE "news" DROP CONSTRAINT "FK_173d93468ebf142bb3424c2fd63"`);
        await queryRunner.query(`ALTER TABLE "sponsorships" DROP CONSTRAINT "FK_9d39b747c314bd0e17e48e8bfbf"`);
        await queryRunner.query(`ALTER TABLE "sponsorships" DROP CONSTRAINT "FK_9fa0e8dc22784a152a9a3432b9c"`);
        await queryRunner.query(`ALTER TABLE "sponsorships" DROP CONSTRAINT "FK_35ae20905a1fd68c529df865c23"`);
        await queryRunner.query(`ALTER TABLE "sponsorships" DROP CONSTRAINT "FK_8e1ab13595f0faf9eb6698341ff"`);
        await queryRunner.query(`ALTER TABLE "sponsorships" DROP CONSTRAINT "FK_9f0ea2557c7428b07881f94bd58"`);
        await queryRunner.query(`ALTER TABLE "sponsorship_tiers" DROP CONSTRAINT "FK_1f1563187c8d25e73eeb4df6b7f"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_bd5387c23fb40ae7e3526ad75ea"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_2e445270177206a97921e461710"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_08e606dc5182b142dc916e7abab"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_bf0862b475e824a7dc33acc40a1"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_c9e41213ca42d50132ed7ab2b0f"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_361b4545aafa33ae00d8630295c"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_f9d1859399e7f8dd36e4e10bd22"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_5a58f726a41264c8b3e86d4a1de"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_22033f88fea3650e66ac70556df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c1147687827d3dd27ebfb4a4a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0b87845ebab799e06f73fa8f43"`);
        await queryRunner.query(`DROP TABLE "notification_recipients"`);
        await queryRunner.query(`DROP TABLE "membership_fees"`);
        await queryRunner.query(`DROP TABLE "membership_payments"`);
        await queryRunner.query(`DROP TABLE "news"`);
        await queryRunner.query(`DROP TYPE "public"."news_category_enum"`);
        await queryRunner.query(`DROP TABLE "sponsorships"`);
        await queryRunner.query(`DROP TABLE "sponsorship_tiers"`);
        await queryRunner.query(`DROP TYPE "public"."sponsorship_tiers_name_enum"`);
        await queryRunner.query(`DROP TABLE "tickets"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_status_enum"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TABLE "transaction_categories"`);
        await queryRunner.query(`DROP TABLE "zalo-notifications"`);
        await queryRunner.query(`DROP TYPE "public"."zalo-notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_salutation_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "branches"`);
    }

}
