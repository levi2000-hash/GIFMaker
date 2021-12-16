CREATE SEQUENCE gifseq START WITH 1 INCREMENT BY 1;

CREATE TABLE GifTask(
    id int unique,
    userId varchar(255),
    outputObjectId varchar(255),
    featured boolean
);

-- Nieuwe giftask toevoegen
INSERT INTO GifTask (id, userId, outputObjectId, featured)
VALUES (NEXTVAL(gifseq), ... , ..., TRUE/FALSE);


-- Alle featured gifs 
SELECT outputObjectId FROM GifTask WHERE featured = TRUE AND userId=...