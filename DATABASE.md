# Database

The service requires the following database tables to work:

```sql
CREATE TABLE `proposals` (
  `proposal` varchar(64) NOT NULL,
  `hashed_auth_password` varchar(64) NOT NULL,
  `version` tinyint unsigned NOT NULL DEFAULT 0,
  `partial_tx` MEDIUMTEXT NOT NULL,
  `signatures` TEXT,
  `history` LONGTEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`proposal`)
);
```
