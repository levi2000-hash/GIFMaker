import {getPool} from "./db"

export function addGifTask(task : GifTask)
{
    getPool().query(`INSERT INTO GifTask (id, userId, outputObjectId, featured)
    VALUES (NEXTVAL(gifseq), "${task.userId}" ,"${task.outputObjectId}", ${task.featured});`)
   
}

export function getAllFeaturedGifsFromUser(userId: string) : Promise<any>
{
    let val : Promise<any> = getPool().query(`SELECT outputObjectId FROM GifTask WHERE featured=1 AND userId="${userId}"`)
    return val
}

export interface GifTask{
    id?: number
    userId: string
    outputObjectId: string
    featured: boolean
}

