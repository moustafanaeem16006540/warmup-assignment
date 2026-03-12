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

function secondsToHMS(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}



function hmsToSeconds(hms) {
    const parts = hms.split(":").map(Number);
    return parts[0]*3600 + parts[1]*60 + parts[2];
}

function monthToNumber(month) {
    const months = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, 
                     Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
    if (!isNaN(parseInt(month))) return parseInt(month); // if month is "4"
    return months[month] || 0; // if month is "Apr"
}



// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    let startSec = timeToSeconds(startTime);
    let endSec = timeToSeconds(endTime);

    if (endSec < startSec) endSec += 24*3600;

    let durationSec = endSec - startSec;
    return secondsToHMS(durationSec);
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
    let shiftSec = hmsToSeconds(shiftDuration);
    let idleSec = hmsToSeconds(idleTime);
    let activeSec = shiftSec - idleSec;
    return secondsToHMS(activeSec);
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
    let content = fs.readFileSync(textFile, "utf8")
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
    fs.writeFileSync(textFile, lines.join("\n"), "utf8")
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
    let content = fs.readFileSync(textFile,"utf8");
    let lines = content.split("\n");
    for (let i=0;i<lines.length;i++){
        let cols = lines[i].split(",");
        if (cols[0]===driverID && cols[2]===date){
            cols[9] = newValue.toString();  // <-- use string
            lines[i] = cols.join(",");
            break;
        }
    }
    fs.writeFileSync(textFile, lines.join("\n"), "utf8");
 }
    
// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    const content = fs.readFileSync(textFile,"utf8");
    const lines = content.split("\n");
    let count = 0;
    const targetMonth = monthToNumber(month); // converts "04" or "Apr" or 4 to number
    let found = false;

    for (let line of lines) {
        const cols = line.split(",");
        if (cols[0] === driverID) {
            found = true;
            const lineMonth = parseInt(cols[2].substring(5,7), 10);
            if (lineMonth === targetMonth && cols[9].trim() === "true") {
                count++;
            }
        }
    }
    return found ? count : -1; // -1 if driverID not found
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
    const content = fs.readFileSync(textFile, "utf8");
    const lines = content.split("\n");

    const targetMonth = monthToNumber(month); // converts "Apr", "04", 4 → 4
    let totalRequiredSec = 0;

    for (let i = 1; i < lines.length; i++) { // skip header
        if (!lines[i].trim()) continue;

        const cols = lines[i].split(",");

        if (cols[0].trim() === driverID.trim()) {
            const date = cols[2].trim();
            const lineMonth = parseInt(date.substring(5, 7), 10);

            if (lineMonth === targetMonth) {
                const y = parseInt(date.substring(0, 4), 10);
                const m = parseInt(date.substring(5, 7), 10);
                const d = parseInt(date.substring(8, 10), 10);

                let quotaSec = 0;

                // Eid period: Apr 10–30 → 6 hours/day
                if (y === 2025 && m === 4 && d >= 10 && d <= 30) {
                    quotaSec = 6 * 3600;
                } else {
                    quotaSec = 8 * 3600 + 24 * 60; // 8h 24min/day
                }

                totalRequiredSec += quotaSec;
            }
        }
    }

    // ensure bonusCount is numeric
    if (isNaN(bonusCount)) bonusCount = 0;

    // each bonus reduces 2 hours
    totalRequiredSec -= bonusCount * 2 * 3600;
    if (totalRequiredSec < 0) totalRequiredSec = 0;

    return secondsToHMS(totalRequiredSec);
 }
// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
     // TODO: Implement this function
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    const content = fs.readFileSync(rateFile, "utf8");
    const lines = content.split("\n");

    let basePay = 0;
    let tier = 0;

    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const cols = lines[i].split(",");
        if (cols[0].trim() === driverID.trim()) {
            basePay = parseInt(cols[2].trim(), 10) || 0;
            tier = parseInt(cols[3].trim(), 10) || 0;
            break;
        }
    }

    // allowance hours depending on tier
    let allowanceHours = 0;
    if (tier === 1) allowanceHours = 50;
    else if (tier === 2) allowanceHours = 20;
    else if (tier === 3) allowanceHours = 10;
    else if (tier === 4) allowanceHours = 3;

    const actualSec = hmsToSeconds(actualHours);
    const requiredSec = hmsToSeconds(requiredHours);

    if (actualSec >= requiredSec) return basePay;

    let missingHours = Math.floor((requiredSec - actualSec) / 3600);

    // if within allowed hours, no deduction
    if (missingHours <= allowanceHours) return basePay;

    const deductibleHours = missingHours - allowanceHours;

    // deduction per hour
    const deductionRatePerHour = Math.floor(basePay / 185);
    const salaryDeduction = deductibleHours * deductionRatePerHour;

    return basePay - salaryDeduction;
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
