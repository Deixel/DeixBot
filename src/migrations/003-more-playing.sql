-- Up
INSERT INTO playing (playingString) VALUES ('Grifball');
INSERT INTO playing (playingString) VALUES ('with the Relic of Creation');


-- Down
DELETE FROM playing WHERE playingString = 'Grifball';
DELETE FROM playing WHERE playingString = 'with the Relic of Creation';