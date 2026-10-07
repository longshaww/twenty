import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const TYPE_FIELDS_CHECK_WITHOUT_SECTION = `("type" = 'FOLDER') OR ("type" = 'OBJECT' AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'VIEW' AND "viewId" IS NOT NULL) OR ("type" = 'RECORD' AND "targetRecordId" IS NOT NULL AND "targetObjectMetadataId" IS NOT NULL) OR ("type" = 'LINK' AND "link" IS NOT NULL) OR ("type" = 'PAGE_LAYOUT' AND "pageLayoutId" IS NOT NULL)`;

// The enum is recreated rather than extended with ADD VALUE, because a value
// added by ADD VALUE cannot be used by the check below in the same transaction.
@RegisteredInstanceCommand('2.45.0', 1790900000000)
export class AddSectionNavigationMenuItemTypeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"navigationMenuItem_type_enum\" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT', 'SECTION')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::"text"::"core"."navigationMenuItem_type_enum"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (${TYPE_FIELDS_CHECK_WITHOUT_SECTION} OR ("type" = 'SECTION' AND "name" IS NOT NULL AND "folderId" IS NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP CONSTRAINT IF EXISTS "CHK_navigation_menu_item_type_fields"',
    );
    await queryRunner.query(
      'DELETE FROM "core"."navigationMenuItem" WHERE "type" = \'SECTION\'',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."navigationMenuItem_type_enum" RENAME TO "navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"navigationMenuItem_type_enum\" AS ENUM('VIEW', 'FOLDER', 'LINK', 'OBJECT', 'RECORD', 'PAGE_LAYOUT')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "type" TYPE "core"."navigationMenuItem_type_enum" USING "type"::"text"::"core"."navigationMenuItem_type_enum"',
    );
    await queryRunner.query(
      'DROP TYPE "core"."navigationMenuItem_type_enum_old"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD CONSTRAINT "CHK_navigation_menu_item_type_fields" CHECK (${TYPE_FIELDS_CHECK_WITHOUT_SECTION})`,
    );
  }
}
