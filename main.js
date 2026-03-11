const fs = require("fs");

function timeToSeconds(timeStr) {
    let parts = timeStr.trim().split(" ")
    let timePart = parts[0]
    let modifier = parts[1].toLowerCase()
    let colon1 = timePart.indexOf(":")
    let colon2 = timePart.lastIndexOf(":")
    let hours = parseInt(timePart.substring(0, colon1))
    let minutes = parseInt(timePart.substring(colon1+1, colon2))
    let seconds = parseInt(timePart.substring(colon2+1))
    if (modifier === "pm" && hours !== 12) hours += 12
    if (modifier === "am" && hours === 12) hours = 0
    return hours*3600 + minutes*60 + seconds
}

function secondsToHMS(totalSeconds) {
    let hours = Math.floor(totalSeconds/3600)
    let minutes = Math.floor((totalSeconds%3600)/60)
    let seconds = totalSeconds % 60
    let str = hours + ":"
    str += (minutes < 10 ? "0" + minutes : minutes) + ":"
    str += (seconds < 10 ? "0" + seconds : seconds)
    return str
}

function hmsToSeconds(hms) {
    let colon1 = hms.indexOf(":")
    let colon2 = hms.lastIndexOf(":")
    let hours = parseInt(hms.substring(0, colon1))
    let minutes = parseInt(hms.substring(colon1+1, colon2))
    let seconds = parseInt(hms.substring(colon2+1))
    return hours*3600 + minutes*60 + seconds
}



// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
     let startSec = timeToSeconds(startTime)
    let endSec = timeToSeconds(endTime)
    let deliveryStart = 8*3600
    let deliveryEnd = 22*3600
    let idle = 0
    if (startSec < deliveryStart) idle += deliveryStart - startSec
    if (endSec > deliveryEnd) idle += endSec - deliveryEnd
    return secondsToHMS(idle)
}


// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function
let startSec = timeToSeconds(startTime)
    let endSec = timeToSeconds(endTime)
    let deliveryStart = 8*3600
    let deliveryEnd = 22*3600
    let idle = 0
    if (startSec < deliveryStart) idle += deliveryStart - startSec
    if (endSec > deliveryEnd) idle += endSec - deliveryEnd
    return secondsToHMS(idle)
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement this function
      let startSec = timeToSeconds(startTime)
    let endSec = timeToSeconds(endTime)
    let deliveryStart = 8*3600
    let deliveryEnd = 22*3600
    let idle = 0
    if (startSec < deliveryStart) idle += deliveryStart - startSec
    if (endSec > deliveryEnd) idle += endSec - deliveryEnd
    return secondsToHMS(idle)
}


// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function
let y = parseInt(date.substring(0,4))
    let m = parseInt(date.substring(5,7))
    let d = parseInt(date.substring(8,10))
    let eidStart = {y:2025, m:4, d:10}
    let eidEnd = {y:2025, m:4, d:30}
    let quotaSec = 0
    if ((y>eidStart.y || (y===eidStart.y && m>eidStart.m) || (y===eidStart.y && m===eidStart.m && d>=eidStart.d)) &&
        (y<eidEnd.y || (y===eidEnd.y && m<eidEnd.m) || (y===eidEnd.y && m===eidEnd.m && d<=eidEnd.d))) {
        quotaSec = 6*3600
    } else {
        quotaSec = 8*3600 + 24*60
    }
    let activeSec = hmsToSeconds(activeTime)
    return activeSec >= quotaSec
}


// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
     let content = fs.readFileSync(textFile,)
    let lines = content.split("\n")
    for (let i=0;i<lines.length;i++){
        let cols = lines[i].split(",")
        if (cols[0]===shiftObj.driverID && cols[2]===shiftObj.date) return {}
    }
    let dur = getShiftDuration(shiftObj.startTime, shiftObj.endTime)
    let idle = getIdleTime(shiftObj.startTime, shiftObj.endTime)
    let active = getActiveTime(dur, idle)
    let quota = metQuota(shiftObj.date, active)
    let record = shiftObj.driverID+","+shiftObj.driverName+","+shiftObj.date+","+shiftObj.startTime+","+shiftObj.endTime+","+dur+","+idle+","+active+","+quota+","+false
    lines.push(record)
    fs.writeFileSync(textFile, lines.join(""), )
    return {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: dur,
        idleTime: idle,
        activeTime: active,
        metQuota: quota,
        hasBonus: false
    }
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
    let content = fs.readFileSync(textFile,"utf8")
    let lines = content.split("\n")
    for (let i=0;i<lines.length;i++){
        let cols = lines[i].split(",")
        if (cols[0]===driverID && cols[2]===date){
            cols[9] = newValue
            lines[i] = cols.join(",")
            break
        }
    }
    fs.writeFileSync(textFile, lines.join("\n"), "utf8")
}

    
// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
let content = fs.readFileSync(textFile,"utf8")
    let lines = content.split("\n")
    let count = 0
    let found = false
    for (let i=0;i<lines.length;i++){
        let cols = lines[i].split(",")
        if (cols[0]===driverID){
            found = true
            let lineMonth = parseInt(cols[2].substring(5,7))
            if (lineMonth === parseInt(month) && cols[9]==="true") count++
        }
    }
    if (!found) return -1
    return count
}





// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
   let content = fs.readFileSync(textFile,"utf8")
    let lines = content.split("\n")
    let totalSec = 0
    for (let i=0;i<lines.length;i++){
        let cols = lines[i].split(",")
        if (cols[0]===driverID && parseInt(cols[2].substring(5,7))===month){
            totalSec += hmsToSeconds(cols[7])
        }
    }
    return secondsToHMS(totalSec)
}



// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
    let rateContent = fs.readFileSync(rateFile,"utf8")
    let rateLines = rateContent.split("\n")
    let rateHours = 0
    for (let i=0;i<rateLines.length;i++){
        let cols = rateLines[i].split(",")
        if (cols[0]===driverID){
            rateHours = parseInt(cols[1])
            break
        }
    }
    let requiredSec = rateHours*3600 - bonusCount*3600
    return secondsToHMS(requiredSec)
}



// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
     let rateContent = fs.readFileSync(rateFile,"utf8")
    let rateLines = rateContent.split("\n")
    let payPerHour = 0
    for (let i=0;i<rateLines.length;i++){
        let cols = rateLines[i].split(",")
        if (cols[0]===driverID){
            payPerHour = parseInt(cols[2])
            break
        }
    }
    let actualSec = hmsToSeconds(actualHours)
    let requiredSec = hmsToSeconds(requiredHours)
    let hoursWorked = Math.floor(actualSec/3600)
    let hoursRequired = Math.floor(requiredSec/3600)
    let netPay = hoursWorked * payPerHour
    return netPay
}



module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
