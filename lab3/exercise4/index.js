// Activity Log Storage
let activityLog = [];

// Activity Counters
let clickCount = 0;
let keypressCount = 0;
let focusCount = 0;

// Thresholds for suspicious activity
const THRESHOLDS = {
    rapidClicks: 10,          // 10 clicks in 5 seconds
    rapidClicksTime: 5000,    // 5 seconds
    excessiveKeys: 50,        // 50 keypresses in 10 seconds
    excessiveKeysTime: 10000, // 10 seconds
    totalClicks: 50,          // Total clicks warning
    totalKeys: 100            // Total keypresses warning
};

// Temporary tracking for rapid activity
let recentClicks = [];
let recentKeys = [];

// Initialize event listeners
function initActivityMonitor() {
    const testArea = document.getElementById('testArea');
    
    // CLICK EVENTS - Using both capturing and bubbling
    // Capturing phase (true parameter)
    testArea.addEventListener('click', handleClickCapture, true);
    
    // Bubbling phase (default)
    testArea.addEventListener('click', handleClickBubble, false);
    
    // KEYPRESS EVENTS on inputs
    const inputs = document.querySelectorAll('.test-input');
    inputs.forEach(input => {
        input.addEventListener('keypress', handleKeypress);
        input.addEventListener('keydown', handleKeydown);
    });
    
    // FOCUS and BLUR EVENTS
    const focusableElements = document.querySelectorAll('.test-input, .test-button');
    focusableElements.forEach(element => {
        element.addEventListener('focus', handleFocus, true);  // Capturing
        element.addEventListener('blur', handleBlur, true);    // Capturing
    });
    
    updateDisplay();
}

// Handle Click - Capturing Phase
function handleClickCapture(event) {
    const timestamp = new Date();
    const target = event.target;
    
    // Log the capturing phase
    const activity = {
        type: 'click',
        phase: 'capturing',
        timestamp: timestamp,
        target: getElementIdentifier(target),
        targetId: target.id || 'no-id',
        targetClass: target.className || 'no-class',
        coordinates: {
            x: event.clientX,
            y: event.clientY
        }
    };
    
    activityLog.push(activity);
}

// Handle Click - Bubbling Phase
function handleClickBubble(event) {
    const timestamp = new Date();
    const target = event.target;
    
    // Only log bubbling for actual interactive elements
    if (target.classList.contains('test-item') || 
        target.classList.contains('test-button') ||
        target.id === 'testArea') {
        
        const activity = {
            type: 'click',
            phase: 'bubbling',
            timestamp: timestamp,
            target: getElementIdentifier(target),
            targetId: target.id || 'no-id',
            targetClass: target.className || 'no-class',
            coordinates: {
                x: event.clientX,
                y: event.clientY
            }
        };
        
        activityLog.push(activity);
        
        // Update click count
        clickCount++;
        document.getElementById('clickCount').textContent = clickCount;
        
        // Track recent clicks for rapid click detection
        recentClicks.push(timestamp);
        
        // Check for suspicious activity
        checkSuspiciousActivity();
        
        updateDisplay();
    }
}

// Handle Keypress
function handleKeypress(event) {
    const timestamp = new Date();
    
    const activity = {
        type: 'keypress',
        phase: 'target',
        timestamp: timestamp,
        target: getElementIdentifier(event.target),
        targetId: event.target.id || 'no-id',
        key: event.key,
        code: event.code,
        value: event.target.value
    };
    
    activityLog.push(activity);
    
    // Update keypress count
    keypressCount++;
    document.getElementById('keypressCount').textContent = keypressCount;
    
    // Track recent keys for excessive typing detection
    recentKeys.push(timestamp);
    
    // Check for suspicious activity
    checkSuspiciousActivity();
    
    updateDisplay();
}

// Handle Keydown (for special keys)
function handleKeydown(event) {
    // Only log special keys (Enter, Escape, etc.)
    if (['Enter', 'Escape', 'Tab', 'Backspace', 'Delete'].includes(event.key)) {
        const timestamp = new Date();
        
        const activity = {
            type: 'keypress',
            phase: 'special',
            timestamp: timestamp,
            target: getElementIdentifier(event.target),
            targetId: event.target.id || 'no-id',
            key: event.key,
            code: event.code,
            special: true
        };
        
        activityLog.push(activity);
        updateDisplay();
    }
}

// Handle Focus
function handleFocus(event) {
    const timestamp = new Date();
    
    const activity = {
        type: 'focus',
        phase: 'capturing',
        timestamp: timestamp,
        target: getElementIdentifier(event.target),
        targetId: event.target.id || 'no-id'
    };
    
    activityLog.push(activity);
    
    // Update focus count
    focusCount++;
    document.getElementById('focusCount').textContent = focusCount;
    
    updateDisplay();
}

// Handle Blur
function handleBlur(event) {
    const timestamp = new Date();
    
    const activity = {
        type: 'blur',
        phase: 'capturing',
        timestamp: timestamp,
        target: getElementIdentifier(event.target),
        targetId: event.target.id || 'no-id'
    };
    
    activityLog.push(activity);
    updateDisplay();
}

// Get element identifier
function getElementIdentifier(element) {
    if (element.id) {
        return `#${element.id}`;
    } else if (element.className) {
        return `.${element.className.split(' ')[0]}`;
    } else {
        return element.tagName.toLowerCase();
    }
}

// Check for suspicious activity
function checkSuspiciousActivity() {
    const now = new Date();
    const warningArea = document.getElementById('warningArea');
    let warnings = [];
    
    // Check rapid clicks (10 clicks in 5 seconds)
    recentClicks = recentClicks.filter(time => now - time < THRESHOLDS.rapidClicksTime);
    if (recentClicks.length >= THRESHOLDS.rapidClicks) {
        warnings.push(`⚠️ RAPID CLICKING DETECTED: ${recentClicks.length} clicks in ${THRESHOLDS.rapidClicksTime / 1000} seconds`);
    }
    
    // Check excessive keypresses (50 keys in 10 seconds)
    recentKeys = recentKeys.filter(time => now - time < THRESHOLDS.excessiveKeysTime);
    if (recentKeys.length >= THRESHOLDS.excessiveKeys) {
        warnings.push(`⚠️ EXCESSIVE TYPING DETECTED: ${recentKeys.length} keypresses in ${THRESHOLDS.excessiveKeysTime / 1000} seconds`);
    }
    
    // Check total clicks
    if (clickCount >= THRESHOLDS.totalClicks) {
        warnings.push(`🚨 HIGH CLICK COUNT: ${clickCount} total clicks detected`);
    }
    
    // Check total keypresses
    if (keypressCount >= THRESHOLDS.totalKeys) {
        warnings.push(`🚨 HIGH KEYPRESS COUNT: ${keypressCount} total keypresses detected`);
    }
    
    // Display warnings
    if (warnings.length > 0) {
        warningArea.innerHTML = warnings.join('<br>');
        warningArea.classList.add('show');
        
        // Add danger class for critical warnings
        if (warnings.some(w => w.includes('🚨'))) {
            warningArea.classList.add('danger');
        }
    }
}

// Update display
function updateDisplay() {
    const logContainer = document.getElementById('logContainer');
    
    if (activityLog.length === 0) {
        logContainer.innerHTML = '<div class="log-empty">No activity logged yet. Interact with elements to start tracking.</div>';
        return;
    }
    
    // Clear container
    logContainer.innerHTML = '';
    
    // Display logs in reverse order (newest first)
    const recentLogs = activityLog.slice(-50).reverse(); // Show last 50 entries
    
    recentLogs.forEach(activity => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${activity.type}`;
        
        const timeStr = formatTime(activity.timestamp);
        const typeLabel = activity.type.toUpperCase();
        
        let details = '';
        
        if (activity.type === 'click') {
            details = `Target: ${activity.target} | Phase: ${activity.phase} | Coords: (${activity.coordinates.x}, ${activity.coordinates.y})`;
        } else if (activity.type === 'keypress') {
            if (activity.special) {
                details = `Target: ${activity.target} | Special Key: ${activity.key}`;
            } else {
                details = `Target: ${activity.target} | Key: "${activity.key}" | Phase: ${activity.phase}`;
            }
        } else if (activity.type === 'focus') {
            details = `Target: ${activity.target} | Phase: ${activity.phase}`;
        } else if (activity.type === 'blur') {
            details = `Target: ${activity.target} | Phase: ${activity.phase}`;
        }
        
        logEntry.innerHTML = `
            <span class="log-time">${timeStr}</span>
            <span class="log-type ${activity.type}">${typeLabel}</span>
            <span class="log-details">${details}</span>
        `;
        
        logContainer.appendChild(logEntry);
    });
    
    // Auto-scroll to top (newest entry)
    logContainer.scrollTop = 0;
}

// Format timestamp
function formatTime(timestamp) {
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const seconds = timestamp.getSeconds().toString().padStart(2, '0');
    const ms = timestamp.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
}

// Reset log
function resetLog() {
    if (activityLog.length === 0) {
        alert('Activity log is already empty.');
        return;
    }
    
    const confirmed = confirm(`Reset activity log? This will clear ${activityLog.length} logged events.`);
    
    if (confirmed) {
        activityLog = [];
        clickCount = 0;
        keypressCount = 0;
        focusCount = 0;
        recentClicks = [];
        recentKeys = [];
        
        document.getElementById('clickCount').textContent = '0';
        document.getElementById('keypressCount').textContent = '0';
        document.getElementById('focusCount').textContent = '0';
        
        clearWarning();
        updateDisplay();
    }
}

// Export log
function exportLog() {
    if (activityLog.length === 0) {
        alert('No activity to export.');
        return;
    }
    
    let exportText = '═══════════════════════════════════════════════════════════════\n';
    exportText += '                   USER ACTIVITY LOG EXPORT\n';
    exportText += '═══════════════════════════════════════════════════════════════\n\n';
    exportText += `Export Date: ${new Date().toLocaleString()}\n`;
    exportText += `Total Events: ${activityLog.length}\n`;
    exportText += `Total Clicks: ${clickCount}\n`;
    exportText += `Total Keypresses: ${keypressCount}\n`;
    exportText += `Total Focus Events: ${focusCount}\n`;
    exportText += '\n───────────────────────────────────────────────────────────────\n';
    exportText += '                      ACTIVITY DETAILS\n';
    exportText += '───────────────────────────────────────────────────────────────\n\n';
    
    activityLog.forEach((activity, index) => {
        exportText += `[${index + 1}] ${formatTime(activity.timestamp)} | ${activity.type.toUpperCase()}\n`;
        exportText += `    Target: ${activity.target}\n`;
        exportText += `    Phase: ${activity.phase}\n`;
        
        if (activity.type === 'click') {
            exportText += `    Coordinates: (${activity.coordinates.x}, ${activity.coordinates.y})\n`;
        } else if (activity.type === 'keypress') {
            exportText += `    Key: ${activity.key}\n`;
            if (activity.value !== undefined) {
                exportText += `    Input Value: ${activity.value}\n`;
            }
        }
        
        exportText += '\n';
    });
    
    exportText += '═══════════════════════════════════════════════════════════════\n';
    exportText += '                        END OF LOG\n';
    exportText += '═══════════════════════════════════════════════════════════════\n';
    
    // Create blob and download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`Exported ${activityLog.length} activity events to file.`);
}

// Clear warning
function clearWarning() {
    const warningArea = document.getElementById('warningArea');
    warningArea.classList.remove('show', 'danger');
    warningArea.innerHTML = '';
    
    // Reset rapid tracking
    recentClicks = [];
    recentKeys = [];
}

// Initialize on page load
initActivityMonitor();
