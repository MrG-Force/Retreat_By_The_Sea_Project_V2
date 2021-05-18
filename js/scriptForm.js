/**
 * @file Validates the Contact Form data of the "Sorrento by the Sea" website.
 * @author Guillermo Ortiz <guillermo.ortizloza@studytafensw.edu.au>
 * @version 1.1
 * */
// 1. Assign input elements to constants for easy access
//#region FORM and its input ELEMENTS
const FORM = document.getElementById('form-to-validate'),
    FIRST = document.getElementById('first'),
    LAST = document.getElementById('last'),
    EMAIL = document.getElementById('email'),
    PHONE = document.getElementById('phone'),
    INFO = document.getElementById('info'),
    CHECK = document.getElementById('policy');
//#endregion

// 2. When page load make sure the form is clean
FORM.reset();

// 3. Set up variables
//#region Variables
var isFormValid = false;
var submitButton = document.getElementById("submit-btn");
var formElements = [FIRST, LAST, EMAIL, PHONE, INFO, CHECK]; // Array to iterate over the form objects
submitButton.disabled = true;
//#endregion

// 4. Create event listeners to keep track of changes in the field and validate them on the fly
//#region Event Listeners
// Adds listeners when page load
window.addEventListener('load', function () {addListeners(); });

/**
 * Adds event-listeners to all input elements for validation.
 */
function addListeners() {
    // adds a listener to validate corresponding element on input
    formElements.forEach(element => {
        element.addEventListener('input', function () { ValidateElement(element); })
        //console.log(`addListener added ValidateElement function to "${element.id}" on "input"`)
    });
    // adds a listener to validate corresponding element when looses focus
    formElements.forEach(element => {
        element.addEventListener('blur', function () { ValidateElement(element); })
        //console.log(`addListener added ValidateElement function to "${element.id}" on "blur"`)
    });
    // adds a listener to remove warning messages when element is on focus
    formElements.forEach(element => {
        element.addEventListener('focus', function () { ResetValid(element); })
    });
    // adds a listener to validate form on every input
    FORM.addEventListener('input', function () { ValidateForm(); });
    // adds a listener to count and display a character count under textarea
    INFO.addEventListener('keyup', countCharacters, false);
    CHECK.addEventListener('change', function () { ValidateForm(); });
    INFO.addEventListener('blur', function () { ValidateForm(); });

}
//#endregion

//5. Create functions to validate form
//#region Validation functions

// 6. Main Function. Validates each value from the input fields and provides feedback 
// via CSS using 'is-valid'|'is-invalid' pseudoclasses

/**
 * Checks that the passed element is valid and adds
 * corresponding validity pseudoclasses to the element
 * @param {Element} element An Element object describing the DOM element.
 */
function ValidateElement(element) {
    element.classList.remove('is-invalid');
    element.classList.remove('is-valid');
    switch (element.id) {
        case 'first':       // make sure some text was entered
            if (!element.value) {
                element.classList.add('is-invalid');
            } else {
                element.classList.add('is-valid');
            }
            break;
        case 'last':        // same as previous
            if (!element.value) {
                element.classList.add('is-invalid');
            } else {
                element.classList.add('is-valid');
            }
            break;
        case 'email':       // validate calling a function that uses a RegEx pattern
            if (!ValidEmail(element.value)) {
                element.classList.add('is-invalid');
            } else {
                element.classList.add('is-valid');
            }
            break;
        case 'phone':        // check that is a valid Aussie postcode
            if (!ValidPhone(element.value)) {
                element.classList.add('is-invalid');
            } else {
                element.classList.add('is-valid');
            }
            break;
        case 'info':        // check some text has been entered 
            if (!TextEntered(element.value)) {
                element.classList.add('is-invalid');
            } else {
                element.classList.add('is-valid');
            }
            break;
        case 'policy':        // make sure check box is checked
            if (!element.checked) {
                element.classList.add('is-invalid');
            } else {
                element.classList.add('is-valid');
            }
            break;
    }
}
// 7. Helper functions to break validation in smaller pieces

/**
 * Checks input against a valid email regular expression.
 * @param {string} email The email the user wrote.
 * @returns {boolean} 
 */
function ValidEmail(email) {
    let pattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
    return pattern.test(email);
}

/**
 * Checks that the phone number is valid
 * @param {number} phone A valid Australian phone number.
 * @returns {boolean}
 */
function ValidPhone(phone) {
    let pattern = new RegExp(/^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/);
    return pattern.test(phone);
}

/**
 * Checks that input is at least 10 characters long.
 * @param {string} info The required information about the enquiry.
 * @returns {boolean}
 */
function TextEntered(info) {
    if (info.length < 10) {
        return false;
    } else {
        return true;
    }
}

/**
 * Removes CSS validity pseudo-classes. 
 * @param {Element} element An Element object describing the DOM element.
 */
function ResetValid(element) {
    element.classList.remove('is-invalid');
    element.classList.remove('is-valid');
}

// 8. Check at the end that no invalid fields are left behind and set the form's validity variable to True or False

/**
 * Checks that the form doesn't have any invalid fields. Sets the isFormValid variable to true.
 * @returns {boolean}
 */
function ValidateForm() {
    let invalidEl = 0;
    for (let index = 0; index < formElements.length - 1; index++) { // Check all elements except Checkbox
        if (formElements[index].classList.contains("is-invalid")
            || formElements[index].value === "") {
            invalidEl++;
        }
    }
    console.log(`invalid elements = "${invalidEl}"`);
    // Checks that all the elements of the form are valid including the checkbox
    // Enables the submit button and sets form to valid if everything looks sweet
    if (!invalidEl && CHECK.checked) {
        submitButton.disabled = false;
        isFormValid = true;
        return true;
    } else {
        submitButton.disabled = true;
        isFormValid = false;
        return false;
    }
}
//#endregion

// 9. Function called when user submit the form: Hoooray!
function FormHasBeenValidated(){
    return isFormValid;
}

//#region A little extra something
/**
 * Counts the characters entered and display counter in the corresponding tag.
 * @param {Event} e An event object.
 */
function countCharacters(e) {
    let textEntered, countRemaining, counter;
    textEntered = INFO.value;
    counter = (textEntered.length);
    countRemaining = document.getElementById('counter');
    countRemaining.textContent = `${counter} / 500`;
}
//#endregion