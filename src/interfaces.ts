export interface databaseStructure {
    times: Array<time>
}

export interface time {
    identificator: string,
    time: number
}

export interface configuration {
    logs: boolean,
    local: boolean
}