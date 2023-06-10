import * as EventEmitter from "events"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as chalk from "chalk"

import { databaseStructure, configuration, time } from "./interfaces"

// ========== Przykład użycia

// ==========

dotenv.config()

const db_name = "time_database.json"

export function init(configuration: configuration) { // initialize module
    if (configuration.logs) console.log(chalk.green("[dw mod] Initialized"))

    let database: databaseStructure = { times: [] } // dummy database
    const guard = new EventEmitter()

    if (configuration.local) { // Reading local database
        let db_raw
        if (fs.existsSync(`./${db_name}`)) {
            db_raw = fs.readFileSync(`./${db_name}`)
        } else {
            db_raw = fs.readFileSync(`./node_modules/date-wait-module/${db_name}`)
        }

        database = JSON.parse(db_raw.toString())
    }

    database.times.forEach(timeObj => {
        const time = timeObj.time
        const identificator = timeObj.identificator

        let timeToExec = time - Date.now()
        if (timeToExec <= 0) timeToExec = 0

        setTimeout(function () { // removing not necessary time object from database
            unregisterTime(timeObj)
            guard.emit("time", identificator)
        }, timeToExec)
    })

    const intervals: { interval: NodeJS.Timer; identificator: string; }[] = []

    function register_time(time: number, identificator: string) {
        const newEntry = { time: time, identificator: identificator }
        database.times.push(newEntry) // adding time object to database just in case
        updateDatabase()

        if (configuration.logs) console.log(chalk.yellow("[dw mod] Registered new time:", identificator))

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

        if (configuration.logs) console.log(chalk.yellow("[dw mod] Unregistered time:", timeObject.identificator))
    }

    function reminder(interval: number, identificator: string) {
        const newInterval = setInterval(function () {
            guard.emit("time", identificator)
        }, interval)

        intervals.push({ interval: newInterval, identificator })

        if (configuration.logs) console.log(chalk.yellow("[dw mod] Registered new reminder:", identificator))
    }

    function removeReminder(identificator: string) {
        const interval = intervals.find(i => i.identificator == identificator).interval
        clearInterval(interval)

        if (configuration.logs) console.log(chalk.yellow("[dw mod] Removed reminder:", identificator))
    }

    function readDatabase() { // Debug only
        return database
    }

    function updateDatabase() {
        if (configuration.local) {
            if (fs.existsSync(`./${db_name}`)) {
                fs.writeFileSync(`./${db_name}`, JSON.stringify(database))
            } else {
                fs.writeFileSync(`./node_modules/date-wait-module/${db_name}`, JSON.stringify(database))
            }
        }
    }

    return { register_time, guard, readDatabase, reminder, removeReminder }
}



/*
 -> time.register(czas)
 -> time.reminder(co ile)
 -> guard.on("time", id => {})
*/