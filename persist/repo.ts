import {pool} from "./db"

let gifTasks: GifTask[] =[]

export function addGifTask(task : GifTask)
{
    pool.query(`INSERT INTO GifTask (id, userId, outputObjectId, featured)
    VALUES (NEXTVAL(gifseq), "${task.userId}" ,"${task.outputObjectId}", ${task.featured});`) //Insert into statements
}

export function getAllFeaturedGifsFromUser(userId: string) : Promise<any>
{

    return pool.query(`SELECT outputObjectId FROM GifTask WHERE featured=TRUE AND userId=${userId}`)
}

export function addGifTaskMemory(task : GifTask)
{
    gifTasks.push(task)
}

export function getAllFeaturedGifsFromUserMemory(userId: string) : Promise<any>
{
    return new Promise((resolve)=>{
        let featuredGifs = gifTasks.filter(gif => gif.featured && gif.userId == userId).map(gif => gif.outputObjectId)

        resolve(featuredGifs)
    })
}

export interface GifTask{
    id?: number
    userId: string
    outputObjectId: string
    featured: boolean
}

