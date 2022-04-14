/**
 * @file - Creates a set of consecutive monthly calendars that allows the user to select 
 * booking dates and calculates the price for the accommodation depending of the season-pricing
 * policy. Each month is contained in a table element. The amount of calendars depends
 * on the current date. The program is designed to fit 3 months, so depending on the current date it
 * may generate 3 to 5 calendars.
 * @author Guillermo Ortiz
 * @version 1.1
 */

//#region ********** CONSTANTS AND VARIABLES **********
// ---------- SEASON OBJECTS ----------
const LOW = Object.freeze({
    name: "LOW",
    price: 200,
    starts: "Jun 1, ",
    ends: "Dec 18, "
});
const MID = Object.freeze({
    name: "MID",
    price: 220,
    starts: "Feb 1, ",
    ends: "May 31, "
});
const HIGH = Object.freeze({
    name: "HIGH",
    price: 250,
    starts: "Dec 19, ",
    ends: "Jan 31, "
});

// --------- CHECK-IN CHECK-OUT ---------
// Check in and check out objects
const CHECKIN = { dayID: "", dayIDNum: 0, selected: false, name: "check-in-day", domstring: ".check-in-day", outputEl: "check-in" };
const CHECKOUT = { dayID: "", dayIDNum: 0, selected: false, name: "check-out-day", domstring: ".check-out-day", outputEl: "check-out" };
const DatePHolder = "Mmm dd, yyyy";
const TotalPholder = "$0.00"

// ---------TIME DATA ---------
const msxDay = 86400000; // milliseconds per day
// Current day and time values
var now = new Date();
var currYear = now.getFullYear();
var currMonth = now.getMonth();
var currDay = now.getDate();
// Today's Date object starting a 0:00:00.000
var today = new Date(currYear, currMonth, currDay);
// Date object for the first day of current Month
var firstDCurrM = new Date(currYear, currMonth);
// Date object for day 3 months from today
var todayPlus3m = new Date(currYear, currMonth + 3, currDay);
// Number of calendars to create
var numMonths = monthDiff(today, todayPlus3m);
var numValidDays = (todayPlus3m - today) / msxDay;
//#endregion

//#region ********** CALENDARS BUILDER ***********
// --------- CREATE CALENDAR TABLES ---------
// Depending of the current date the number of months calculated 
//to hold the 3 month can vary: from 3 up to 5 calendars can be created
createNCalendars("container", numMonths, currYear, currMonth);

// --------- SET UP CALENDARS ---------
var totalDays = NumberAllDays();
var todayID = MarkToday(today);
var lastDayID = MarkADay(firstDCurrM, todayPlus3m, "last-day");
var lastDayNum = parseInt(lastDayID.split("-")[1]);
markDaysOutOfRange(todayID, lastDayID, "td.day-date", "no-bookable", "day-date");
var firstDayIdNum = lastDayNum - HowManyElements(".day-date") + 1;
// Add the seasons for pricing
addSeasons(".day-date");

//--------- EVENT LISTENERS ---------
var listenerTracker = 0;
addListeners();
addHoveringListeners();
//#endregion

//#region ********** EVENT LISTENERS FUNCTIONS **********
// These functions work together to add Event handlers to the main
// calendar dates selection function

/**
 * Adds the "hover-in" class to the target element in the event.
 * 
 * @param {event} e - An object event.
 */
 function hoverDaysIn(e) {
    document.getElementById(e.target.id).classList.add("hover-in");
}

/**
 * Removes the "hover-in" class to the target element in the event
 * 
 * @param {event} e - An object event.
 */
function hoverDaysOut(e) {
    document.getElementById(e.target.id).classList.remove("hover-in");
}

/**
 * Adds the "hover-out" class to highlight possible checkout days
 * to change already selected checkout
 * 
@param {event} e - An object event.
 */
function addHoverDaysAfterChOut(e) {
    document.getElementById(e.target.id).classList.add("hover-out");
}

/**
 * Removes the "hover-out" class to highlight possible checkout days
 * to change already selected checkout
 * 
@param {event} e - An object event.
 */
function removeHoverDaysAfterChOut(e) {
    document.getElementById(e.target.id).classList.remove("hover-out");
}

/**
 * Toggles the class "after-checkin" in the event targeted element.
 * This functions tracks the mouse movements while hovering over 
 * the days after the selected check-in day, by highlighting those days.
 * 
 * @param {event} e - An object event
 */
function hoverInAfterCheckin(e) {
    let targetNum = parseInt(e.target.id.split("-")[1]);
    if (targetNum > CHECKIN.dayIDNum) {
        if (listenerTracker == 0) {
            // add a class to all the elements between the current and checkin
            for (let i = CHECKIN.dayIDNum + 1; i <= targetNum; i++) {
                document.getElementById(`day-${i}`).classList.add("after-checkin");
                listenerTracker = i;
            }
        } else if (listenerTracker <= targetNum) { // if you moved right to a later date
            for (let i = listenerTracker; i <= targetNum; i++) {
                document.getElementById(`day-${i}`).classList.add("after-checkin");
                listenerTracker = i;
            }
        } else { // otherwise you moved to the left
            for (let i = listenerTracker; i > targetNum; i--) {
                document.getElementById(`day-${i}`).classList.remove("after-checkin");
                listenerTracker = i;
            }
        }
    }

}

/**
 * Adds an event listener to run the given function 
 * in the days within the given range
 * 
 * @param {string} event - the name of the event as a string, e.g. "mouseenter"
 * @param {function} func - the function to handle the event
 * @param {number} start - the number of the first day in range
 * @param {number} end - the number of the last day in the range
 * 
 * @example - All days in the calendar have an id in the format "day-<number>".
 * This function uses the number part as number, not string:
 * addHandlerToRange("mouseenter", hoverInAfterCheckin, 34, 38); 
 * Will  add a listener to run the function when the mouse enters 
 * the element for the days 35, 36 and 37.
 */
function addHandlerToRange(event, func, start, end) {
    for (let id = start + 1; id < end; id++) {
        let day = document.getElementById(`day-${id}`);
        day.addEventListener(event, func);
    }
}

/**
 * Removes an event listener from the days within the given range 
 * 
 * @param {string} event - the name of the event as a string, e.g. "mouseenter"
 * @param {function} func - the function to handle the event
 * @param {number} start - the number of the first day in range
 * @param {number} end - the number of the last day in the range
 */
function removeHandlerFromRange(event, func, start, end) {
    for (let id = start + 1; id < end; id++) {
        let day = document.getElementById(`day-${id}`);
        day.removeEventListener(event, func);
    }
}

/**
 * Removes an event listener from the days with the given class name
 * 
 @param {string} event - the name of the event as a string, e.g. "mouseenter"
 * @param {function} func - the function to handle the event
 * @param {string} selector - A valid CSS selector
 */
function removeHandler(event, func, selector) {
    let days = document.querySelectorAll(selector);
    days.forEach(day => {
        day.removeEventListener(event, func);
    });
}

/**
 * Adds event listeners to all valid days in the calendars.
 * The event is a "click" on a "day-date" element and will
 * run the check-in ann out functionality.
 */
 function addListeners() {
    let days = document.querySelectorAll(".day-date");
    days.forEach(day => {
        day.addEventListener("click", function () { CheckInNOut(day.id); });
    });
}

/**
 * Adds a hovering effect when the mouse enters or leaves a day element
 */
 function addHoveringListeners() {
    let days = document.querySelectorAll(".day-date");
    days.forEach(day => {
        day.addEventListener("mouseenter", hoverDaysIn);
        day.addEventListener("mouseleave", hoverDaysOut);
    });
}
//#endregion

//#region ********** CALENDAR BUILDER **********

/**
 * Creates a table representing a calendar for a given month
 * on a given year
 * @param {string} container - An id of a DOM element to contain the calendar
 * @param {number} year
 * @param {number} month - 0 to 11 (January is 0)
 * 
 * @example - creates a calendar for May, 2021 in an element.id = container
 * 
 * createCalendar("container", 2021, 4);
 */
 function createCalendar(container, year, month) {
    // arrays for date related names
    const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", 'Sep', "Oct", "Nov", "Dec"];

    // create a Date object for a given month,
    // if day is not specified, default date is: year/month/1 
    let d = new Date(year, month);

    // create a table element for the calendar
    let table = document.createElement('table');
    table.classList.add('month');
    table.id = `${months[month]}`;

    // Create a row for header with month and year
    let rowMonthYear = document.createElement('tr');
    rowMonthYear.className = 'month-header';
    let header = document.createElement('th');
    header.colSpan = 7;
    header.textContent = `${months[month]}, ${year}`;
    header.id = `${months[month]}-${year}`; // for building a date string
    // Append header to table
    rowMonthYear.appendChild(header);
    table.appendChild(rowMonthYear);

    // Create the row for the day names
    let rowDay = document.createElement('tr'); rowDay.className = 'r-day';
    // Create column headers with day names
    dayNames.forEach(day => {
        let dayName = document.createElement('th');
        rowDay.appendChild(dayName);
        dayName.textContent = day;
    });
    // Append the day names row to table
    table.appendChild(rowDay);

    // Append table(month) to the container element
    document.getElementById(container).appendChild(table);

    // Week counter
    let weekCount = 0;

    //Add first week row
    let rowWeek = document.createElement('tr');
    rowWeek.className = 'week-row'; rowWeek.id = `week${weekCount}-${month}`;
    table.appendChild(rowWeek);

    // Create empty <td> element for empty days
    let noDay = document.createElement('td');
    noDay.className = 'no-day';

    // create a dateDay element for calendar days
    let dayDate = document.createElement('td');
    dayDate.className = 'day-date';

    // Add empty days in the first row from Monday till first day of the month
    for (let index = 0; index < getDay(d); index++) {
        rowWeek.appendChild(noDay.cloneNode(false));
    }

    // Add <td> elements with actual days
    // While we are still in the month
    while (d.getMonth() == month) {
        let currWeek = document.getElementById(`week${weekCount}-${month}`);
        currWeek.append(dayDate.cloneNode(false));
        currWeek.lastElementChild.textContent = `${d.getDate()}`;
        if (getDay(d) % 7 == 6) { // if is Sunday, a new row is needed
            weekCount++;
            rowWeek = rowWeek.cloneNode(false);
            rowWeek.id = `week${weekCount}-${month}`;
            table.appendChild(rowWeek);
        }
        d.setDate(d.getDate() + 1);
    }

    // Add empty days for the last days of the month
    // if the month does not end in Sunday
    if (getDay(d) != 0) {
        for (let index = getDay(d); index < 7; index++) {
            table.lastChild.appendChild(noDay.cloneNode(false));
        }
    }
}

/**
 * Converts the built-in number of the week from 0-6 starting on Sunday
 * to 1-7 starting on Monday.
 * 
 * @param {Date} date - a Date object
 * @returns {number} - day of week as number 0 to 6 starting Monday
 */
 function getDay(date) { // get day number from 0 (monday) to 6 (sunday)
    let day = date.getDay();
    if (day == 0) day = 7; // make Sunday (0) the last day
    return day - 1;
}

/**
 * Calculates the difference of months between
 * two dates without considering the days
 * 
 * @param {Date} dateFrom - Date object for the earliest date
 * @param {Date} dateTo - Date object for the latest date
 * @returns {number} - Months difference between two dates
 * 
 * @example - Even though there are a few days difference between
 * this two dates, the function will return 1 because they
 * are in different months:
 * 
 *  let d1 = new Date(2021, 4, 31);
 *  let d2 = new Date(2021, 5, 1);
 *  console.log(monthDiff(d1,d2));
 *  >> 1
 */
 function monthDiff(dateFrom, dateTo) {
    let months = dateTo.getMonth() - dateFrom.getMonth();
    // year difference adjustment
    // if the dates are in different years add 12 months per year difference
    months += 12 * (dateTo.getFullYear() - dateFrom.getFullYear());
    return months;
}

/**
 * Builds a given number (months) of calendars in a given element
 * starting in a given month for the given year.
 * 
 * @param {string} container - An id of a DOM element to contain the calendars
 * @param {num} months - Number of months
 * @param {num} year - The year of the first month
 * @param {num} startMonth - The starting month (format 0-11, e.g. January is 0)
 */
 function createNCalendars(container, months, startYear, startMonth) {
    let month = startMonth;
    let year = startYear;

    for (let i = 0; i <= months; i++) {
        let calendar = document.createElement('div');
        calendar.id = `calendar${i + 1}`; calendar.className = "month-cal";
        document.getElementById(container).appendChild(calendar);
        // if month > 11 you are in a new year and month is 0 (Jan)
        if (month > 11) {
            month = 0;
            year++;
            createCalendar(calendar.id, year, month++);
        } else {
            createCalendar(calendar.id, year, month++);
        }
    }
}

/**
 * Adds an Id to every day element in the calendar.
 * The id consists of the word 'day', a dash '-' and
 * a number corresponding to the global number of the day 
 * regardless of the month.
 * 
 * @returns {number} The total number of days in the calendars
 * 
 * @example For a calendar where the first month has 31 days
 * the id for the first day of the next month will be:
 * 
 * 'day-32'
 */
 function NumberAllDays() {
    let days = document.querySelectorAll(".day-date");
    for (let i = 0; i < days.length; i++) {
        days[i].id = `day-${i + 1}`;
    }
    return days.length;
}

/**
 * Adds the class name 'today' to the corresponding
 * day passed as a Date of the first month.
 * 
 * @param {Date} date - The Date object for the current day.
 * 
 * @returns {string} - The id for today's element in the calendar
 */
 function MarkToday(date) {
    let dayID = `day-${date.getDate()}`;
    let today = document.getElementById(`day-${date.getDate()}`);
    today.classList.add('today');
    return dayID;
}

/**
 * Marks in the calendar a passed Date with the passed
 * class Name.
 * 
 * @param {Date} dateFirstDay - Date object for the first valid day of the set of calendars
 * @param {Date} dateToMark - Date object for the day to be marked
 * @param {string} className - The class name to be assigned
 * 
 * @returns {string} - The id of the marked element
 */
 function MarkADay(dateFirstDay, dateToMark, className) {
    let dayNum = (dateToMark.getTime() - dateFirstDay.getTime()) / msxDay;
    let dayId = `day-${Math.round(dayNum) + 1}`;
    let day = document.getElementById(dayId);
    day.classList.add(className);
    return dayId;
}

/**
 * Adds a passed class name to a group of day elements
 * that fall outside a given time range.
 * 
 * @param {string} day1ID - Earliest day element id in format "day-8"
 * @param {string} day2ID - Latest day element id 
 * @param {string} selector - A DOMString containing one or more selectors to match against
 * @param {string} newClass - The name of the class to be assigned
 * @param {string} [oldClass=undefined] - The name of the class to be removed
 */
 function markDaysOutOfRange(day1ID, day2ID, selector, newClass, oldClass = undefined) {
    let firstDayNum = parseInt(day1ID.split("-")[1]);
    let lastDayNum = parseInt(day2ID.split("-")[1]);
    let days = document.querySelectorAll(selector);
    days.forEach(dayEl => {
        let elNum = parseInt(dayEl.id.split("-")[1]);
        if (elNum < firstDayNum || elNum > lastDayNum) {
            dayEl.classList.add(newClass);
            dayEl.classList.remove(oldClass);
        }
    });
}

/**
 * Adds a passed class name to a group of day elements
 * that fall inside a given time range.
 * 
 * @param {number} day1IDNum - Earliest day element id in format "day-8"
 * @param {number} day2IDNum - Latest day element id 
 * @param {string} className - The name of the class to be assigned
 */
 function markDaysInRange(day1IDNum, day2IDNum, className) {
    for (let day = day1IDNum + 1; day < day2IDNum; day++) {
        let dayID = `day-${day}`;
        document.getElementById(dayID).classList.add(className);
    }
}

/**
 * Adds a class to the calendar day elements to identify 
 * in which season of the year each day falls
 * 
 * @param {string} dayClassName - A valid CSS selector of the class name for calendar days
 */
 function addSeasons(dayClassName) {
    var days = document.querySelectorAll(dayClassName);
    days.forEach(day => {
        let dayDate = new Date(getDateString(day.id));
        let year = dayDate.getFullYear();
        let lowStarts = new Date(LOW.starts + year);
        let lowEnds = new Date(LOW.ends + year);
        let midStarts = new Date(MID.starts + year);
        let midEnds = new Date(MID.ends + year);
        if ((dayDate >= lowStarts) && (dayDate <= lowEnds)) {
            day.classList.add(LOW.name);
        } else if ((dayDate >= midStarts) && (dayDate <= midEnds)) {
            day.classList.add(MID.name);
        } else {
            day.classList.add(HIGH.name);
        }
    });
}

/**
 *
 * Gets all the elements in the document with the given
 * selector and returns the count.
 * 
 * @param {string} selector - A DOMString containing one selector
 * @returns {number} 
 */
 function HowManyElements(selector) {
    let days = document.querySelectorAll(selector);
    return days.length;
}
//#endregion

//#region ********** MAIN CHECKIN AND OUT FUNCTIONALITY **********

/**
 * Allows the user to select or deselect the check-in and check-out
 * dates and displays the selected dates and corresponding
 * price depending of th season. Works in conjunction with
 * an EventListener.
 * 
 * @param {string} dayID - Day element id in format "day-8"
 * @param {string} className - The name of the check-in class to be assigned
 */
 function CheckInNOut(dayID) {
    let day = document.getElementById(dayID);
    let dayIDNum = parseInt(dayID.split("-")[1]);

//CASE 1 - Nothing is selected 
    if (!CHECKIN.selected) {
        day.classList.toggle(CHECKIN.name);
        CHECKIN.dayID = dayID;
        CHECKIN.dayIDNum = dayIDNum;
        CHECKIN.selected = true;
        // Update CHECKIN output elements
        document.getElementById(CHECKIN.outputEl).textContent = (getDateString(CHECKIN.dayID));
        document.getElementById(CHECKIN.outputEl).classList.add("selected");
        // Remove highlighter on hover handler
        removeHandlerFromRange("mouseenter", hoverDaysIn, CHECKIN.dayIDNum - 1, lastDayNum);
        removeHandlerFromRange("mouseleave", hoverDaysOut, CHECKIN.dayIDNum - 1, lastDayNum);
        // removeHandler("mouseenter", hoverDaysIn, ".day-date");
        // removeHandler("mouseleave", hoverDaysOut, ".day-date");
        document.getElementById(CHECKIN.dayID).classList.remove("hover-in");
        // TODO Make following dates mouseover sensitive
        // Add an event listener on all the day elements after checkin
        addHandlerToRange("mouseenter", hoverInAfterCheckin, CHECKIN.dayIDNum, lastDayNum);
    }
//CASE 2 - Only CHECKIN already selected 
    else if (CHECKIN.selected && !CHECKOUT.selected) {
        // if click on a day before currently selected => Set new day as CHECKIN
        if (dayIDNum < CHECKIN.dayIDNum) {
            // Remove previous hoverInAfterCheckin handler
            removeHandlerFromRange("mouseenter", hoverInAfterCheckin, CHECKIN.dayIDNum, lastDayNum);
            listenerTracker = 0;
            //Remove previous hovering marker
            removeClassMarker(".day-date", "after-checkin");
            // new CHECKIN
            document.getElementById(CHECKIN.dayID).classList.toggle(CHECKIN.name);
            day.classList.toggle(CHECKIN.name); // Select day clicked as new Check in
            CHECKIN.dayID = dayID;
            CHECKIN.dayIDNum = dayIDNum;
            removeClassMarker(".day-date", "hover-in");
            // Update CHECKIN output element
            document.getElementById(CHECKIN.outputEl).textContent = (getDateString(CHECKIN.dayID));
            // Add new handlers
            removeHandlerFromRange("mouseenter", hoverDaysIn, CHECKIN.dayIDNum - 1, lastDayNum);
            removeHandlerFromRange("mouseleave", hoverDaysOut, CHECKIN.dayIDNum - 1, lastDayNum);
            addHandlerToRange("mouseenter", hoverInAfterCheckin, CHECKIN.dayIDNum, lastDayNum);
        }
        // if click on a day after selected CHECKIN
        else if (dayIDNum > CHECKIN.dayIDNum) { // BINGO! Means this is the check-out day
            // Remove previous hoverInAfterCheckin handler
            removeHandlerFromRange("mouseenter", hoverInAfterCheckin, CHECKIN.dayIDNum, lastDayNum);
            listenerTracker = 0;
            // Remove hovering marker from checkout date
            day.classList.remove("after-checkin");
            // Set CHECKOUT
            day.classList.toggle(CHECKOUT.name);
            CHECKOUT.dayID = dayID;
            CHECKOUT.dayIDNum = dayIDNum;
            CHECKOUT.selected = true;
            // Highlight elements between the two days (bug fix)
            markDaysInRange(CHECKIN.dayIDNum, CHECKOUT.dayIDNum, "after-checkin");
            // Update CHECKOUT output element
            document.getElementById(CHECKOUT.outputEl).textContent = (getDateString(CHECKOUT.dayID));
            document.getElementById(CHECKOUT.outputEl).classList.add("selected");
            // Get number of nights and update corresponding <b></b> element in label
            document.getElementById("nights").textContent = `${CHECKOUT.dayIDNum - CHECKIN.dayIDNum}`;
            // Calculate price and update total element box
            document.getElementById("total").textContent = totalPrice(CHECKIN.dayIDNum, CHECKOUT.dayIDNum);
            document.getElementById("total").classList.add("selected");
            // Add after checkout hovering marker
            addHandlerToRange("mouseenter", addHoverDaysAfterChOut, CHECKOUT.dayIDNum, lastDayNum);
            addHandlerToRange("mouseleave", removeHoverDaysAfterChOut, CHECKOUT.dayIDNum, lastDayNum);
        }
        // if Clicked on the same day => reset
        else {
            // Remove previous hoverInAfterCheckin handler
            removeHandlerFromRange("mouseenter", hoverInAfterCheckin, CHECKIN.dayIDNum, lastDayNum);
            listenerTracker = 0;
            //Remove previous hovering markers
            removeClassMarker(".day-date", "after-checkin");
            // Update Checkin element to not selected
            day.classList.toggle(CHECKIN.name);
            CHECKIN.dayID = "";
            CHECKIN.dayIDNum = 0;
            CHECKIN.selected = false;
            // Update CHECKIN output element
            document.getElementById(CHECKIN.outputEl).textContent = DatePHolder;
            document.getElementById(CHECKIN.outputEl).classList.remove("selected");
            // Reload the event handlers for hovering
            addHoveringListeners();
        }
    }
//CASE 3 - CHECKIN & CHECKOUT selected
    else if (CHECKIN.selected && CHECKOUT.selected) {
        // if click on a different day later than Check in => new Check out
        if ((dayIDNum > CHECKIN.dayIDNum) && (dayIDNum != CHECKOUT.dayIDNum)) {
            document.getElementById(CHECKOUT.dayID).classList.toggle(CHECKOUT.name); // Remove previous check out
            day.classList.toggle(CHECKOUT.name);
            // Remove previous listeners after checkout hovering marker
            removeHandlerFromRange("mouseenter", addHoverDaysAfterChOut, CHECKOUT.dayIDNum, lastDayNum);
            // removeHandlerFromRange("mouseleave", removeHoverDaysAfterChOut, CHECKOUT.dayIDNum, lastDayNum);
            // Update CHECKOUT
            CHECKOUT.dayID = dayID;
            CHECKOUT.dayIDNum = dayIDNum;
            // Update CHECKOUT output element
            document.getElementById(CHECKOUT.outputEl).textContent = (getDateString(CHECKOUT.dayID));
            // Remove previous selection
            removeClassMarker(".day-date", "hover-out");
            removeClassMarker(".day-date", "after-checkin");
            // Highlight elements between the two days
            markDaysInRange(CHECKIN.dayIDNum, CHECKOUT.dayIDNum, "after-checkin");
            // Get number of nights and update corresponding <b></b> element in label
            document.getElementById("nights").textContent = `${CHECKOUT.dayIDNum - CHECKIN.dayIDNum}`;
            // Calculate price and update total element box
            document.getElementById("total").textContent = totalPrice(CHECKIN.dayIDNum, CHECKOUT.dayIDNum);
            document.getElementById("total").classList.add("selected");
            // Add new listeners after checkout hovering marker
            addHandlerToRange("mouseenter", addHoverDaysAfterChOut, CHECKOUT.dayIDNum, lastDayNum);
            addHandlerToRange("mouseleave", removeHoverDaysAfterChOut, CHECKOUT.dayIDNum, lastDayNum);
        }
        // if click before check in, set new check in, erase check out
        else if (dayIDNum < CHECKIN.dayIDNum) {
            // CHECKIN element
            document.getElementById(CHECKIN.dayID).classList.toggle(CHECKIN.name);
            day.classList.toggle(CHECKIN.name);
            CHECKIN.dayID = dayID;
            CHECKIN.dayIDNum = dayIDNum;
            // Update CHECKIN output elements
            document.getElementById(CHECKIN.outputEl).textContent = (getDateString(CHECKIN.dayID));
            // CHECKOUT element
            // Remove previous listeners after checkout hovering marker
            removeHandlerFromRange("mouseenter", addHoverDaysAfterChOut, CHECKOUT.dayIDNum, lastDayNum);
            document.getElementById(CHECKOUT.dayID).classList.toggle(CHECKOUT.name);
            CHECKOUT.dayID = "";
            CHECKOUT.dayIDNum = 0;
            CHECKOUT.selected = false;
            removeClassMarker(".day-date", "hover-in");
            // Update CHECKOUT output element
            document.getElementById(CHECKOUT.outputEl).textContent = DatePHolder;
            document.getElementById(CHECKOUT.outputEl).classList.remove("selected");
            // Update nights in <b></b> element in label
            document.getElementById("nights").textContent = "";
            // Update TOTAL 
            document.getElementById("total").textContent = TotalPholder;
            document.getElementById("total").classList.remove("selected");
            // Remove previously selected days
            removeClassMarker(".day-date", "after-checkin");
            // Reload the event handlers for hovering
            removeHandlerFromRange("mouseenter", hoverDaysIn, CHECKIN.dayIDNum - 1, lastDayNum);
            removeHandlerFromRange("mouseenter", hoverDaysOut, CHECKIN.dayIDNum - 1, lastDayNum);
            addHandlerToRange("mouseenter", hoverInAfterCheckin, CHECKIN.dayIDNum, lastDayNum);
        }
        // if click on an already selected check out date, erase check out
        else if (dayIDNum == CHECKOUT.dayIDNum) {
            day.classList.toggle(CHECKOUT.name);
            // Remove previous listeners after checkout hovering marker
            removeHandlerFromRange("mouseenter", addHoverDaysAfterChOut, CHECKOUT.dayIDNum, lastDayNum);
            CHECKOUT.dayID = "";
            CHECKOUT.dayIDNum = 0;
            CHECKOUT.selected = false;
            // Update CHECKOUT output element
            document.getElementById(CHECKOUT.outputEl).textContent = DatePHolder;
            document.getElementById(CHECKOUT.outputEl).classList.remove("selected");
            // Update nights in <b></b> element in label
            document.getElementById("nights").textContent = "";
            // Update TOTAL 
            document.getElementById("total").textContent = TotalPholder;
            document.getElementById("total").classList.remove("selected");
            // Remove previously selected days
            removeClassMarker(".day-date", "after-checkin");
            // Reload the event handlers for hovering
            addHandlerToRange("mouseenter", hoverInAfterCheckin, CHECKIN.dayIDNum, lastDayNum);
        }
        // if click in already selected check in => reset all
        else {
            // CHECKIN element
            day.classList.toggle(CHECKIN.name);
            CHECKIN.dayID = "";
            CHECKIN.dayIDNum = 0;
            CHECKIN.selected = false;
            document.getElementById(CHECKIN.outputEl).textContent = DatePHolder;
            document.getElementById(CHECKIN.outputEl).classList.remove("selected");
            // CHECKOUT element
            // Remove previous listeners after checkout hovering marker
            removeHandlerFromRange("mouseenter", addHoverDaysAfterChOut, CHECKOUT.dayIDNum, lastDayNum);
            document.getElementById(CHECKOUT.dayID).classList.toggle(CHECKOUT.name);
            CHECKOUT.dayID = "";
            CHECKOUT.dayIDNum = 0;
            CHECKOUT.selected = false;
            document.getElementById(CHECKOUT.outputEl).textContent = DatePHolder;
            document.getElementById(CHECKOUT.outputEl).classList.remove("selected");
             // Update nights in <b></b> element in label
             document.getElementById("nights").textContent = "";
             // Update TOTAL 
             document.getElementById("total").textContent = TotalPholder;
             document.getElementById("total").classList.remove("selected");
            // Remove previously selected days
            removeClassMarker(".day-date", "after-checkin");
            // Reload the event handlers for hovering
            addHoveringListeners();
        }
    }
}

/**
 * Creates a valid date string for a given day-id that 
 * can be passed to a Date() constructor.
 * 
 * @param {string} dayID - Day element id in format "day-8"
 * @returns {string} - A valid Date string in format "Apr 16, 1998"
 */
 function getDateString(dayID) {
    let day = document.getElementById(dayID);
    let yearMonth = day.closest(".month").firstChild.firstChild.id;
    let month = yearMonth.split("-")[0];
    let year = yearMonth.split("-")[1];
    let dateString = `${month} ${day.innerText}, ${year}`;
    return dateString;
}

/**
 * Gets an returns the price stored in a "Season" object:
 * "LOW", "MID", "HIGH".    
 * 
 * @param {string} dayId - Day element id in format "day-8"
 * @returns {number} - The price per night for the given day
 */
 function getPrice(dayId) {
    let dayEl = document.getElementById(dayId);
    if (dayEl.classList.contains("LOW")) {
        return LOW.price;
    } else if (dayEl.classList.contains("MID")) {
        return MID.price;
    } else {
        return HIGH.price;
    }
}


/**
 * Calculates and returns the total price for the selected stay
 * 
 * @param {number} checkinIDNum - The number part of the dayID for the Check-in day
 * @param {number} checkoutIDNum - The number part of the dayID for the Check-out day
 * @returns - A string with the total price of the stay in a currency format
 */
 function totalPrice(checkinIDNum, checkoutIDNum) {
    let total = 0;
    for (let i = checkinIDNum; i < checkoutIDNum; i++) {
        total += getPrice(`day-${i}`);
    }

    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', currencySign: 'accounting' }).format(total);
}

function removeClassMarker(selector, className) {
    let days = document.querySelectorAll(selector);
    days.forEach(day => {
        day.classList.remove(className);
    });
}
//#endregion

//#region DEBUGGING AND DEPRECATED FUNCTIONS
/**
 * Adds debugging event listeners to day elements in the calendar
 */
 function helperListeners() {
    let days = document.querySelectorAll("td.day-date");
    days.forEach(day => {
        //day.addEventListener("click", function () { daySelect(day.id, "selected-day"); });
        //day.addEventListener("mouseover", function () { daySelect(day.id, "selected-day"); });
        day.addEventListener("click", function () { console.log(`day-id: ${day.id}`); }); // just for testing
        day.addEventListener("click", function () { console.log(getDateString(day.id)); }); // just for testing
        day.addEventListener("click", function () { console.log(getPrice(day.id)); });  // just for testing
    });
}

// /**
//  * DEPRECATED
//  * Toggles a specified class name to the day with
//  * the passed id.
//  * 
//  * @param {string} dayID - Day element id in format "day-8"
//  * @param {string} className - The name of the class to be assigned
//  */
// function daySelect(dayID, className) {
//     let day = document.getElementById(dayID);
//     day.classList.toggle(className);
// }

// /**
//  * DEPRECATED
//  * Finds out if a given class name exists in a group of
//  * elements with the passed CSS selector
//  * 
//  * @param {string} classToSearch - The name of the class to search as a string
//  * @param {string} selector - A DOMString.  Must be a valid CSS selector string:
//  * @returns {boolean}
//  * 
//  * @example 
//  * Does the class name "HIGH" exists in at least one of the 
//  * elements with a class ".day-date":
//  * 
//  * elementsContain("HIGH", ".day-date");
//  * 
//  */
//  function elementsContain(classToSearch, selector) {
//     let elements = document.querySelectorAll(selector);
//     for (let i = 0; i < elements.length; i++) {
//         if (elements[i].classList.contains(classToSearch)) {
//             return true;
//         }
//     }
//     return false;
// }

//#endregion
