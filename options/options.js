//TODO: Add restore defaults
//TODO: Clean up variable names
//TODO: Override 'enter' button function for 'Add' website
//TODO: Add Whitelist options and switch for blacklist/whitelist
//TODO: Enforce integer for timer length


// Get the document ids
var workLengthInput   = document.querySelector("#workLength");
var restLengthInput   = document.querySelector("#restLength");
var longRestLengthInput = document.querySelector("#longRestLength");
var addSiteBtn    = document.getElementById('addSite');
var removeSiteBtn = document.getElementById('removeSite');
var websiteSelect = document.getElementById('blockPatterns');
var websiteInput  = document.getElementById('websiteInput');

const SECONDS = 1000;
const MINUTES = 60*SECONDS;
// Set up defaults.
var workLengthDefault = 25*MINUTES/SECONDS;
var restLengthDefault = 5*MINUTES/SECONDS;
var longRestLengthDefault = 25*MINUTES/SECONDS;
var blockPatternDefault = ["*://www.reddit.com/*", "*://www.facebook.com/*"];

/**********************************************************************
* EVENT LISTENERS
***********************************************************************/

// Restore settings to UI when document elements done loading.
document.addEventListener("DOMContentLoaded", restoreOptions);

// Sets up listener for options save button.
document.querySelector("form").addEventListener("submit", saveOptions);

// Sets up listener that adds a website to the blocking list on click
addSiteBtn.addEventListener("click", ()=> {
    var siteToAdd = websiteInput.value;
    var last = websiteSelect.options.length;

    //TODO: Some regexrep magic to turn any website entry into a standard *://www.something.something/* format

    websiteSelect.options[last] = new Option(siteToAdd,last);
    websiteInput.value = null;
});

// Sets up a listener that removes selected websites from the list.
removeSiteBtn.addEventListener("click", ()=> {
    var elementsToRemove = Array.apply(null, websiteSelect.selectedOptions).map(function(el) { return el.index; });
    //console.log(elementsToRemove);
    for(var idx = elementsToRemove.length-1; idx >=0 ; idx--){
        //console.log(elementsToRemove[idx]);
        websiteSelect.remove(elementsToRemove[idx]);
    }
});

// Error checking for working minutes
workLengthInput.addEventListener("input", ()=> {
    if (isNaN(workLengthInput.value)) {
        var workLengthErrMsg = "Please enter a number."; 
        formatForErr(workLengthInput);
        displayInputErr('workErr', workLengthErrMsg);
    } else { 
        clearErrFormat(workLengthInput);
        clearErrText('workErr');
    }
})

/**********************************************************************
* HELPER FUNCTIONS
***********************************************************************/

/**********************************************************************
* Description: Saves the user settings to local storage
* Parameters: None 
* Returns: None 
***********************************************************************/
function saveOptions(event) {
    event.preventDefault(); 
    
    //console.log(Array.apply(null, websiteSelect.options).map(function(el) { return el.text; }));

    //Save the settings in local storage
    browser.storage.local.set({
        workLength: workLengthInput.value*MINUTES/SECONDS,
        restLength: restLengthInput.value*MINUTES/SECONDS,
        longRestLength: longRestLengthInput.value*MINUTES/SECONDS,
        blockPattern: Array.apply(null, websiteSelect.options).map(function(el) { return el.text; }) // this crap is needed because HTMLSelectElement.Option returns stupid stuff
    });
}

/**********************************************************************
* Description: Restores settings from local storage when options page
*               is loaded. Uses defaults 
* Parameters: None 
* Returns: None 
***********************************************************************/
function restoreOptions() {

    function onError(error) {
        console.log(`Error: ${error}`);
    }
  
    // Actually does the restoring
    function updateUI(restoredSettings) {
        // Update the timer value 
        workLengthInput.value       = restoredSettings.workLength*SECONDS/MINUTES     || workLengthDefault*SECONDS/MINUTES;
        restLengthInput.value       = restoredSettings.restLength*SECONDS/MINUTES     || restLengthDefault*SECONDS/MINUTES;
        longRestLengthInput.value   = restoredSettings.longRestLength*SECONDS/MINUTES || longRestLengthDefault*SECONDS/MINUTES;

        // If stored settings for blocked websites are found, use those.
        if(restoredSettings.blockPattern) {
            var websiteList = restoredSettings.blockPattern;
        } else {
            var websiteList = blockPatternDefault;
        }

        // Add the websites to the list box
        for(var idx in websiteList) {
            websiteSelect.options[websiteSelect.options.length] = new Option(websiteList[idx],idx);
        }
    }
  
    // Grabs the settings, then tells it to update input field w that data
    var gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(updateUI, onError);
}

/**********************************************************************
* formatForErr
* Description: Formats a specified DOM Element to have a red background
*               and red border
* Parameters: The DOM element to format
* Returns: None
***********************************************************************/
function formatForErr(domElement) {
    var errorColor = "#f59797";
    var errorBorder = "solid red 1px";

    domElement.style.backgroundColor = errorColor;
    domElement.style.border = errorBorder;
}

/**********************************************************************
* clearErrFormat
* Description: Sets a DOM element's background color to white and
*               border to none
* Parameters: The DOM element to format
* Returns: None
***********************************************************************/
function clearErrFormat(domElement) {
    domElement.style.backgroundColor = 'white';
    domElement.style.border = 'none';
}

/**********************************************************************
* displayInputErr
* Description: Display an error message by inserting text into a 
*               specified DOM element
* Parameters: The DOM element ID to insert the message, a string with the
*               error message.
* Returns: None 
***********************************************************************/
function displayInputErr(domId, errMsg) {
    var errorElement = document.getElementById(domId);
    errorElement.textContent = errMsg;
}

/**********************************************************************
* clearErrText
* Description: Clears text content of a specified DOM element
* Parameters: The DOM element ID to be cleared 
* Returns: None 
***********************************************************************/
function clearErrText(domId) {
    var clearThisElement = document.getElementById(domId);
    clearThisElement.textContent = " ";
}