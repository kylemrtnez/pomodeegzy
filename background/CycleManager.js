/**********************************************************************
* CycleManager
* Description: A module which tracks Pomodoro cycles and can return the
*               current cycle. Handles logic for switching the cycles.
***********************************************************************/
function CycleManager() {
    var workCycleFlag = false;
    var cycleCount = 0;
    var longBreakFlag = false;
    var longBreakEvery = 4;

    /**********************************************************************
    * Public Interface
    * Description: toggle: toggles between work/break cycles
    *              reset:  resets cycleCount, effectively restarting the 
    *                       pomodoro cycle
    *              isWorking: returns true if cycle is a work cycle, false
    *                           if break cycle
    *              isLongBreak: returns true if break cycle should be a 
    *                            long break
    *              cycleNum: returns the current cycle number
    ***********************************************************************/
    var publicAPI = {
        toggle: updateCycle,
        reset: resetCycle,
        isWorking: isWorkCycle,
        isLongBreak: getLongBreak,
        cycleNum: getCycleNum
    }


    /**********************************************************************
    * updateCycle
    * Description: Updates cycle variables (isWorkCycle, cycleCount ,
    *              longBreakFlag) as necessary. Publically exposed.
    * Parameters: None 
    * Returns: None 
    ***********************************************************************/
    function updateCycle() {
        toggleCycle();
        updateCycleCount();
        updateLongBreak();

        function toggleCycle() {
            workCycleFlag = isWorkCycle() ? false : true;
        }
 
        function updateCycleCount() {
            // increase cycle count once for a work/rest pairing
            if (workCycleFlag) { incCycleCount(); }
        }
   }

    /**********************************************************************
    * checkLongBreak
    * Description: Sets the longBreakFlag if on a long break cycle.
    * Parameters: lbNum = a number representing how often to have a long break
    *                      ex. checkLongBreak(4) means every 4th break is long 
    * Returns: None 
    ***********************************************************************/
    function updateLongBreak() {
        longBreakFlag = checkLongBreak() ? true : false;

        function checkLongBreak() {
            frequency = longBreakEvery;
            return (cycleCount % frequency) == 0;
        }
    }

    /**********************************************************************
    * incCycleCount
    * Description: Increments cycleCount
    * Parameters: None
    * Returns: None
    ***********************************************************************/
    function incCycleCount() {
        cycleCount++;
    }

    /**********************************************************************
    * resetCycle
    * Description: Resets cycle count back to 0, effectively restarting the
    *               Pomodoro cycle.
    * Parameters: None 
    * Returns: None 
    ***********************************************************************/
    function resetCycle() {
        cycleCount = 0;
        workCycleFlag = false;
    }
    
    /**********************************************************************
    * getCycleNum
    * Description: Reports what cycle number we are on
    * Parameters: None
    * Returns: cycleCount member variable 
    ***********************************************************************/
    function getCycleNum() {
        const MAX_CYCLE_COUNT = 4;

        if (cycleCount <= MAX_CYCLE_COUNT) {
            return cycleCount;
        } else {
            return modifyCount();
        }

        function modifyCount() {
            var modifiedCount = cycleCount % MAX_CYCLE_COUNT;

            if (modifiedCount == 0) {
                return MAX_CYCLE_COUNT;
            }
            else {
                return modifiedCount;
            }
        }
    }

    /**********************************************************************
    * getWorkCycle
    * Description: Returns true/false depending on the current cycle
    * Parameters: None 
    * Returns: True if current cycle is a work cycle, false if break cycle
    ***********************************************************************/
    function isWorkCycle() {
        return workCycleFlag;
    }

    /**********************************************************************
    * getLongBreak
    * Description: Returns the status of the longBreakFlag member variable
    * Parameters: None 
    * Returns: True if long break, false if regular break 
    ***********************************************************************/
    function getLongBreak() {
        return longBreakFlag;
    } 

    return publicAPI;
}

