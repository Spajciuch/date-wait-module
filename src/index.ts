import * as EventEmitter from "events"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as chalk from "chalk"

import { databaseStructure, configuration, time } from "./interfaces"

// ========== Przykład użycia

// ==========

dotenv.config()

export function init(configuration: configuration) { // initialize module
    if(configuration.logs) console.log(chalk.green("[dw mod] Initialized"))
    
    let database: databaseStructure = { times: [] } // dummy database
    const guard = new EventEmitter()

    if (configuration.local) { // Reading local database
        const db_raw = fs.readFileSync("./database.json")
        database = JSON.parse(db_raw.toString())
    }

    const intervals: { interval: NodeJS.Timer; identificator: string; }[] = []

    function register_time(time: number, identificator: string) {
        const newEntry = { time: time, identificator: identificator }
        database.times.push(newEntry) // adding time object to database just in case
        updateDatabase()

        if(configuration.logs) console.log(chalk.yellow("[dw mod] Registered new time:", identificator))

        // starting timeout right after registering

        const timeToExec = time - Date.now()

        setTimeout(function () { // removing not necessary time object from database
            unregisterTime(newEntry)
            guard.emit("time", identificator)
        }, timeToExec)
    }
    
    function unregisterTime(timeObject: time) {
        database.times = database.times.filter(obj => obj !== timeObject)
        updateDatabase()
    }

    function reminder(interval: number, identificator: string) {
        const newInterval = setInterval(function() {
            guard.emit("time", identificator)
        }, interval)

        intervals.push({interval: newInterval, identificator})

        if(configuration.logs) console.log(chalk.yellow("[dw mod] Registered new reminder:", identificator))
    }

    function removeReminder(identificator: string) {
        const interval = intervals.find(i => i.identificator == identificator).interval
        clearInterval(interval)

        if(configuration.logs) console.log(chalk.yellow("[dw mod] Removed reminder:", identificator))
    }

    function readDatabase() { // Debug only
        return database
    }

    function updateDatabase() {
        if (configuration.local) fs.writeFileSync("./database.json", JSON.stringify(database))
    }

    return { register_time, guard, readDatabase, reminder, removeReminder }
}



/*
 -> time.register(czas)
 -> time.reminder(co ile)
 -> guard.on("time", id => {})
*/