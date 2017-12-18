'use strict';

const patternDefault = "*://www.reddit.com/*";
const workLengthDefault = 25;
var original = BgReceiver();
// Listener for message from popup. 
browser.runtime.onMessage.addListener(original.decipher);

function onError(error) {
    console.log(`Error: ${error}`);
}

/**********************************************************************
* sendMenuMsg
* Description: Sends a message to the popup menu telling it
                whether to listen/block web requests or not.
* Parameters: minutes = number to display in popup menu
* Returns: None
***********************************************************************/
function sendMenuMsg(minutes) {
    browser.runtime.sendMessage({uMinutes: minutes});
}

/**********************************************************************
* Description: Sets up a listener for web requests and redirects sites on
*               list to blocked html page. 
* Parameters: None 
* Returns: None 
***********************************************************************/
function BgReceiver() {
    function decode(message) {
        // see what type of message it is
        // if block message, start blocking
        switch (message.action) {
            case 'block':
                if (!browser.webRequest.onBeforeRequest.hasListener(redirect)) {
                    // Get the stored block patterns and work session length and start blocking
                    browser.storage.local.get(["blockPattern", "workLength"]).then( (item) => {
                        blockPages( item.blockPattern || patternDefault );
                        var myCountdown = createTimer(item.workLength || workLengthDefault);
                        myCountdown.start();
                    },onError); // TODO: Stop timer if there's an error. Would the timer have started if we reach this error callback?
                }
                break;

            case 'unblock':
                unblockPages();
                break;
        
            case 'updateMins':
                
                break;

            default:

                break;
        }
    }

    /**********************************************************************
    * blockPages
    * Description: Sets up a listener for web requests and redirects sites
    *               on list to an extension html page.
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function blockPages(pattern) {
        browser.webRequest.onBeforeRequest.addListener(
            redirect,
            {urls: [pattern]}, 
            ["blocking"]
        );
    }

    /**********************************************************************
    * Description: Provides new URL to redirect requests to
    * Parameters: Request details object
    * Returns: Object with new URL
    ***********************************************************************/
    function redirect(reqDetails) {
        return {redirectUrl: browser.extension.getURL("redirect/blocked.html")};
    }

    /**********************************************************************
    * unblockPages
    * Description: Removes listener from web requests
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function unblockPages() {
        browser.webRequest.onBeforeRequest.removeListener(redirect);
    }

    /**********************************************************************
    * createTimer
    * Description: Creates a countdown timer
    * Parameters: length
    * Returns: A countdown timer object 
    ***********************************************************************/
    function createTimer(length) {
        var theCountdown = CountdownTimer();
        theCountdown.minutes(length);     
        theCountdown.cdFunc(unblockPages);
        theCountdown.dispFunc(sendMenuMsg);

        return theCountdown;
    }
    

    var publicAPI = {
        decipher: decode
    };

    return publicAPI;
}

/**********************************************************************
* CountdownTimer
* Description: Module representing a timer which counts down. 
* Interface: .minutes = sets minutes
*            .start = starts countdown
*            .cdFunc = assigns a function to be called when countdown
*                       ends
*            .dispFunc = assigns a function to be called at each tick
*                         of the countdown
* Parameters: None 
* Returns: Public interface to interact with CountdownTimer object 
***********************************************************************/
function CountdownTimer() {
    const ONE_MIN = 60000;
    var countdownMins = 0; // how many minutes to countdown from
    var timeoutIds = [];   // stores timeoutIDs to be cancelled if paused
    var countdownFunc = null;
    var displayFunc = null;

    /**********************************************************************
    * setMins
    * Description: Sets minutes to be counted down from
    * Parameters: mins = number of minutes to set
    * Returns: None
    ***********************************************************************/
    function setMins(mins) {
        countdownMins = mins;
    }

    /**********************************************************************
    * setCountdownFunc
    * Description: Sets a function to be called at the end of the 
    *               countdown. Optional.
    * Parameters:  theFunc = the function to be called at end of countdown
    * Returns: None
    ***********************************************************************/
    function setCountdownFunc(theFunc) {
        countdownFunc = theFunc;
    }

    /**********************************************************************
    * setDisplayFunc
    * Description: Sets a function to be called with the intent of updating
    *               a display as the countdown progresses
    * Parameters: dFunc = the function provided to the timer 
    * Returns: None 
    ***********************************************************************/
    function setDisplayFunc(dFunc) {
        displayFunc = dFunc;
    }
    
    /**********************************************************************
    * startTimer
    * Description: Starts timer countdown. 
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function startTimer() {
        var locCountdownMins = countdownMins;
        var totalDelay = (locCountdownMins * 1000 + 1000);

        // recursively calls setTimeout for each minute to countdown from
        // needed to be recursive because loops don't wait for setTimeout
        // stores timeoutIDs in array
        (function oneMinAction(minsRemaining) {
            if (minsRemaining != 0) {
                timeoutIds.push(
                    window.setTimeout(()=> {
                        minsRemaining--;

                        if (displayFunc != null) {
                            displayFunc(minsRemaining);
                        }

                        console.log(minsRemaining); // test
                        oneMinAction(minsRemaining);
                    }, 1000)
                );
            }
        })(locCountdownMins);
        // call function at end of countdown if it exists
        window.setTimeout(()=> {
            if (countdownFunc != null) {
                countdownFunc();
            }
        }, totalDelay);
    }


    var publicAPI = {
        minutes: setMins,
        start: startTimer,
        cdFunc: setCountdownFunc,
        dispFunc: setDisplayFunc
    };

    return publicAPI;
}



