CREATE SEQUENCE gifseq START WITH 1 INCREMENT BY 1;

CREATE TABLE GifTask(
    id int unique,
    userId varchar(255),
    outputObjectId varchar(255),
    featured boolean
);

-- Nieuwe giftask toevoegen
-- INSERT INTO GifTask (id, userId, outputObjectId, featured) VALUES (gifseq.nextval,  , ..., 1(true)/0(false) );


-- Alle featured gifs 
-- SELECT outputObjectId FROM GifTask WHERE featured = TRUE AND userId=...


SELECT * from GifTask;

DELETE FROM GifTask;

CREATE USER 'gifApiUser'@localhost IDENTIFIED BY 'gifapi123';

SELECT User FROM mysql.user;

DROP USER 'gifApiUser'@localhost;

RENAME USER admin to gifapi;

GRANT ALL PRIVILEGES ON gifmakerdb.* TO 'gifApiUser'@ocalhost IDENTIFIED BY 'gifapi123';