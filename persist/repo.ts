import {pool} from "./db"

export function addGifTask(task : GifTask)
{
    pool.query("") //Insert into statements
}

export function getAllGifsFromUser(user: User)
{
    pool.query("") //Select output from GifTask G JOIN User S on S.id = G.userId where S.id == id

    
}

export interface GifTask{
    user: User
    images: StorageObject[]
    output: StorageObject
}

export interface User{
    id: string
}

export interface StorageObject{
    objectId: string
}