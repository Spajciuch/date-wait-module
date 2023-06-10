import * as timeService from "./index"

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