-- Up
CREATE TABLE `playing` (
  `playingID` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `playingString` varchar(64) NOT NULL
);
INSERT INTO playing VALUES(1,'with your emotions');
INSERT INTO playing VALUES(2,'with fire');
INSERT INTO playing VALUES(3,'with myself');
INSERT INTO playing VALUES(4,'God');
INSERT INTO playing VALUES(5,'with your mind');
INSERT INTO playing VALUES(6,'with code');
INSERT INTO playing VALUES(7,'cards');
INSERT INTO playing VALUES(8,'for keeps');
INSERT INTO playing VALUES(9,'Gangnam Style');
INSERT INTO playing VALUES(10,'Knifey-Spoony');
INSERT INTO playing VALUES(11,'Half-Life 3');
INSERT INTO playing VALUES(12,'with magnets');


CREATE TABLE `soundboard` (
  `soundID` integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  `alias` varchar(16) NOT NULL
,  `description` varchar(64) NOT NULL
,  `path` varchar(64) NOT NULL
);
INSERT INTO soundboard VALUES(1,'bennyhill','Hilarity Ensues','bennyHill.mp3');
INSERT INTO soundboard VALUES(2,'skype','You have a call waiting','skype.mp3');
INSERT INTO soundboard VALUES(3,'techdiff','We are currently experiencing some technical difficulties','techdiff.mp3');
INSERT INTO soundboard VALUES(4,'gamenight','What is it?','gamenight.mp3');
INSERT INTO soundboard VALUES(5,'fffkk','For arguments','fightfightfight.mp3');
INSERT INTO soundboard VALUES(7,'ateamplan','I love it when a plan comes together','plancomestogether.mp3');
INSERT INTO soundboard VALUES(11,'birdnoise','How does Gavin even make this sound?','birdnoise.mp3');
INSERT INTO soundboard VALUES(13,'freeserver','They are giving them away!','freeserver.mp3');
INSERT INTO soundboard VALUES(14,'freeserverfull','Epsilon Not Included :(','freeserverfull.mp3');
INSERT INTO soundboard VALUES(15,'freshprince','Now, this is a story all about how...','freshprince.mp3');

CREATE TABLE IF NOT EXISTS "pickgame" (
  'gameId' integer NOT NULL PRIMARY KEY AUTOINCREMENT
, 'gameName' varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS "reminders" (
   'reminderId' integer NOT NULL PRIMARY KEY AUTOINCREMENT
,  'channelId' varchar(64) NOT NULL
,  'remindee' varchar(64) NOT NULL
,  'message' varchar(64) NOT NULL
,  'timestamp' varchar(64) NOT NULL 
);

-- Down
DROP TABLE playing;
DROP TABLE soundboard;
DROP TABLE pickgame;
DROP TABLE reminders
