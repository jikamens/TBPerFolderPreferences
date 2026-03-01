// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.
  
function error(msg) {
    document.getElementById("errorText").innerText = msg;
}

async function importButtonListener() {
    const textArea = document.getElementById("settings");
    if (!textArea.value) {
        error("Paste settings into text area before attempting to import");
        return;
    }
    let settings;
    try {
        settings = JSON.parse(textArea.value);
    }
    catch (ex) {
        error("Pasted settings are malformatted (not valid JSON)");
        return;
    }
    if (settings.debugLogging === undefined) {
        error("Pasted settings are missing 'debugLogging'");
        return;
    }
    if (typeof(settings.debugLogging) != "boolean") {
        error("'debugLogging' setting is wrong type (should be boolean)");
        return;
    }
    if (settings.rules === undefined) {
        error("Pasted settings are missing 'rules'");
        return;
    }
    if (settings.rules.constructor !== Array) {
        error("'rules' setting is wrong type (should be array)");
        return;
    }
    for (let i = 0; i < settings.rules.length; i++) {
        const rule = settings.rules[i];
        if (rule.length != 4) {
            error(`rules[${i}] is wrong length (should have four elements)`);
            return;
        }
        if (! (rule[2] && rule[3])) {
            error(`rules[${i}] has empty preference name or value`);
            return;
        }
    }
    await messenger.storage.local.set({"prefs": settings});
    // Saving preferences will cause the changeListener to be invoked because
    // we're listening for storage changes, so I'm hiding this behind a brief
    // timeout so it happens after changeListener.
    setTimeout(() => {
        document.getElementById("importButton").disabled = true;
    }, 100);
    error("");
}

function changeListener() {
    const textArea = document.getElementById("settings");
    const importButton = document.getElementById("importButton");
    importButton.disabled = textArea.value ? false : true;
}

function loadListener() {
    const importButton = document.getElementById("importButton");
    importButton.addEventListener("click", importButtonListener);
    importButton.disabled = true;
    document.getElementById("settings").addEventListener(
        "input", changeListener);
}

window.addEventListener("load", loadListener, false);
// If the preferences are changed on the options page, then re-enable import
// here if we have text in our text area, because it may no longer match what
// is stored in the settings.
messenger.storage.local.onChanged.addListener(changeListener);
