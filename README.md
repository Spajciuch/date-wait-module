# date-wait-module
It's an Node.js module that will inform you when specific date has come, you can set reminder aswell 

## Example Code
```ts
import * as timeService from "date-wait-module"

function AddMinutesToDate(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

const timeToRegister = AddMinutesToDate(new Date(Date.now()), 0.1)

const time = timeService.init({logs: true, local: true,})
const guard = time.guard

time.register_time(timeToRegister.getTime(), "test-time")
time.reminder(1000, "reminder-test")

console.log(time.readDatabase())

guard.on("time", id => {
    console.log(id)

    if(id == "test-time") {
        time.removeReminder("reminder-test")
    }
})
```

In this example there are used all functionalities of this module:      
- init()
- time.register_time -> for registering single point in future 
- time.reminder -> for registering reminder
- time.removeReminder -> for removing specific reminder  

## Usage

- `init({logs, local})` - `logs` is boolean (if true you'll get console.logs from this module), in this version leave `local` as true if you want your time-database to be saved locally
- `register_time(time, identificator)` - `time` is the timestamp and `identificator` is a string
- `reminder(interval, identificator)` - `interval` is interval time in ms, `identificator` is string
- `removeReminder(identificator)` - `identificator` is an id you passed earlier