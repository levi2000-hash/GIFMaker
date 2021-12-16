import {pool} from "./db"

export function addGifTask(task : GifTask)
{
    pool.query(`INSERT INTO GifTask (id, userId, outputObjectId, featured)
    VALUES (NEXTVAL(gifseq), "${task.userId}" ,"${task.outputObjectId}", ${task.featured});`) //Insert into statements
}

export function getAllFeaturedGifsFromUser(userId: string) : Promise<any>
{

    return pool.query(`SELECT outputObjectId FROM GifTask WHERE featured=TRUE AND userId=${userId}`) //Select output from GifTask G JOIN User S on S.id = G.userId where S.id == id

    
}

export interface GifTask{
    id?: number
    userId: string
    outputObjectId: string
    featured: boolean
}

