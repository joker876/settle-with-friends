import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1763424000000 implements MigrationInterface {
  name = 'InitialSchema1763424000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`sessions\` (
      \`id\` varchar(255) NOT NULL,
      \`expiredAt\` bigint NOT NULL,
      \`json\` text NOT NULL,
      \`destroyedAt\` datetime(6) NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE INDEX \`IDX_sessions_expiredAt\` ON \`sessions\` (\`expiredAt\`)`);

    await queryRunner.query(`CREATE TABLE \`users\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`email\` varchar(255) NOT NULL,
      \`displayName\` varchar(255) NOT NULL,
      \`photo\` text NULL,
      \`registeredAt\` datetime NULL,
      \`deletedAt\` datetime(6) NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE INDEX \`IDX_users_email\` ON \`users\` (\`email\`)`);

    await queryRunner.query(`CREATE TABLE \`reckonings\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`archivedAt\` timestamp NULL,
      \`mainCurrency\` varchar(255) NOT NULL,
      \`helperCurrency\` varchar(255) NULL,
      \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      \`deletedDate\` datetime(6) NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE INDEX \`IDX_reckonings_name\` ON \`reckonings\` (\`name\`)`);

    await queryRunner.query(`CREATE TABLE \`reckonings_users\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`reckoningId\` int NOT NULL,
      \`userId\` int NOT NULL,
      \`role\` enum('owner','admin','member') NOT NULL DEFAULT 'member',
      \`pseudonym\` varchar(255) NULL,
      \`deleted_at\` timestamp NULL,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_reckonings_users_reckoning\` FOREIGN KEY (\`reckoningId\`) REFERENCES \`reckonings\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_reckonings_users_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB`);

    await queryRunner.query(`CREATE TABLE \`transactions\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`amount\` decimal(10,2) NOT NULL,
      \`currencyCode\` varchar(255) NOT NULL,
      \`currencyRate\` decimal(10,6) NULL,
      \`isCurrencyRateFromApi\` tinyint NULL,
      \`transactionDate\` date NOT NULL,
      \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      \`createdByUserId\` int NOT NULL,
      \`updatedByUserId\` int NOT NULL,
      \`reckoningId\` int NOT NULL,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_transactions_createdBy\` FOREIGN KEY (\`createdByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_transactions_updatedBy\` FOREIGN KEY (\`updatedByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_transactions_reckoning\` FOREIGN KEY (\`reckoningId\`) REFERENCES \`reckonings\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE INDEX \`IDX_transactions_name\` ON \`transactions\` (\`name\`)`);

    await queryRunner.query(`CREATE TABLE \`transaction_payers\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`userId\` int NOT NULL,
      \`amount\` decimal(10,2) NULL,
      \`transactionId\` int NOT NULL,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_transaction_payers_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_transaction_payers_transaction\` FOREIGN KEY (\`transactionId\`) REFERENCES \`transactions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB`);

    await queryRunner.query(`CREATE TABLE \`transaction_split_parts\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` tinytext NOT NULL,
      \`amount\` decimal(10,2) NULL,
      \`transactionId\` int NOT NULL,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_transaction_split_parts_transaction\` FOREIGN KEY (\`transactionId\`) REFERENCES \`transactions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB`);

    await queryRunner.query(`CREATE TABLE \`transaction_split_part_includees\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`userId\` int NOT NULL,
      \`splitPartId\` int NOT NULL,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_split_part_includees_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_split_part_includees_splitPart\` FOREIGN KEY (\`splitPartId\`) REFERENCES \`transaction_split_parts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB`);

    await queryRunner.query(`CREATE TABLE \`returns\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(255) NOT NULL,
      \`amount\` decimal(10,2) NOT NULL,
      \`currencyCode\` varchar(255) NOT NULL,
      \`currencyRate\` decimal(10,6) NULL,
      \`isCurrencyRateFromApi\` tinyint NULL,
      \`returnDate\` datetime NOT NULL,
      \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`updatedDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      \`returnedByUserId\` int NOT NULL,
      \`returnedToUserId\` int NOT NULL,
      \`createdByUserId\` int NOT NULL,
      \`updatedByUserId\` int NOT NULL,
      \`reckoningId\` int NOT NULL,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_returns_returnedBy\` FOREIGN KEY (\`returnedByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_returns_returnedTo\` FOREIGN KEY (\`returnedToUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_returns_createdBy\` FOREIGN KEY (\`createdByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_returns_updatedBy\` FOREIGN KEY (\`updatedByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_returns_reckoning\` FOREIGN KEY (\`reckoningId\`) REFERENCES \`reckonings\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB`);

    await queryRunner.query(`CREATE TABLE \`invite_links\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`token\` varchar(255) NOT NULL,
      \`expiresAt\` timestamp NOT NULL,
      \`uses\` int NOT NULL,
      \`usesLeft\` int NOT NULL,
      \`lastUsedAt\` timestamp NULL,
      \`reckoningId\` int NOT NULL,
      \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      \`createdByUserId\` int NOT NULL,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_invite_links_createdBy\` FOREIGN KEY (\`createdByUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`FK_invite_links_reckoning\` FOREIGN KEY (\`reckoningId\`) REFERENCES \`reckonings\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE INDEX \`IDX_invite_links_token\` ON \`invite_links\` (\`token\`)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`invite_links\``);
    await queryRunner.query(`DROP TABLE \`returns\``);
    await queryRunner.query(`DROP TABLE \`transaction_split_part_includees\``);
    await queryRunner.query(`DROP TABLE \`transaction_split_parts\``);
    await queryRunner.query(`DROP TABLE \`transaction_payers\``);
    await queryRunner.query(`DROP TABLE \`transactions\``);
    await queryRunner.query(`DROP TABLE \`reckonings_users\``);
    await queryRunner.query(`DROP TABLE \`reckonings\``);
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`sessions\``);
  }
}
