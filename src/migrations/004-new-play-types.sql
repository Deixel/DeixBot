-- Up
ALTER TABLE playing ADD COLUMN 'activityType' varchar(16) NOT NULL DEFAULT "PLAYING";
INSERT INTO playing (playingString, activityType) VALUES ("the Vytal Festival Tournament", "COMPETING"), ("RWBY", "WATCHING"), ("the RWBY Soundtrack", "LISTENING");

-- Down
BEGIN TRANSACTION;
DELETE FROM playing WHERE activityType != "PLAYING";
CREATE TABLE IF NOT EXISTS `new_playing` (
  `playingID` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `playingString` varchar(64) NOT NULL
);
INSERT INTO new_playing(playingString) SELECT playingString FROM playing;
DROP TABLE playing;
ALTER TABLE new_playing RENAME to playing;
COMMIT;