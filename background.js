// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.
  
var prefs = undefined;

function debug(...msg) {
    if (prefs.debugLogging) console.log("PerFolderPreferences", ...msg);
}

function error(...msg) {
    console.log("PerFolderPreferences", ...msg);
}

async function setPreferences(folder) {
    const funcName = "setPreferences";
    debug(funcName, folder);

    const rules = prefs.rules || [];
    if (! rules) return;

    const found = [];
    const folderPath = folder.path;
    const accountId = folder.accountId;
    const account = await messenger.accounts.get(accountId);
    const accountName = account.name;

    for (let [accountRegexp, folderRegexp, prefName, prefValue ] of rules) {
        if (found.includes(prefName)) continue;
        if (accountRegexp && !accountName.match(accountRegexp)) continue;
        if (folderRegexp && !folderPath.match(folderRegexp)) continue;
        found.push(prefName);
        const oldValue = await messenger.LegacyPrefs.getPref(prefName);
        if (typeof(oldValue) == "boolean") {
            console.log("is boolean");
            if (prefValue.toLowerCase() == "false") {
                prefValue = false;
                console.log("boolean false");
            }
            else if (prefValue.toLowerCase() == "true") {
                prefValue = true;
                console.log("boolean true");
            }
            else {
                error(`Value for ${prefName} must be "true" or "false"`);
                continue;
            }
        }
        else if (typeof(oldValue) == "number") {
            prefValue = Number(prefValue);
            if (isNaN(prefValue)) {
                error(`Value for ${prefName} must be a number`);
                continue;
            }
        }
        debug(funcName, accountName, folderPath, "setting", prefName,
              prefValue);
        if (! await messenger.LegacyPrefs.setPref(prefName, prefValue)) {
            error(`Failed to set preference ${prefName} to ${prefValue}`);
        }
    }
}

async function mailtabsDisplayedFolderChangedListener(tab, displayedFolder) {
    const funcName = "mailtabsDisplayedFolderChangedListener";
    debug(funcName);
    const window = await messenger.windows.get(tab.windowId);
    if (!window.focused) {
        debug(funcName, "returning because not focused");
        return;
    }
    await setPreferences(displayedFolder);
}

async function tabsActivatedListener(activeInfo) {
    const funcName = "tabsActivatedListener";
    debug(funcName);
    const window = await messenger.windows.get(activeInfo.windowId)
    if (!window.focused) {
        debug(funcName, "returning because not focused");
        return;
    }
    const tab = await messenger.tabs.get(activeInfo.tabId);
    if (!tab.mailTab) {
        debug(funcName, "returning because not mailTab");
        return;
    }
    const mailTab = await messenger.mailTabs.get(activeInfo.tabId);
    if (!mailTab.displayedFolder) {
        debug(funcName, "returning because displayedFolder is empty");
        return;
    }
    await setPreferences(mailTab.displayedFolder);
}

async function tabsUpdatedListener(tabId, changeInfo, tab) {
    const funcName = "tabsUpdatedListener";
    debug(funcName);
    if (!tab.mailTab) {
        debug(funcName, "returning because not mailTab");
        return;
    }
    const window = await messenger.windows.get(tab.windowId)
    if (!window.focused) {
        debug(funcName, "returning because not focused");
        return;
    }
    const mailTab = await messenger.mailTabs.get(tabId);
    if (!mailTab.displayedFolder) {
        debug(funcName, "returning because displayedFolder is empty");
        return;
    }
    await setPreferences(mailTab.displayedFolder);
}

async function windowsFocusChangedListener(windowId) {
    const funcName = "windowsFocusChangedListener";
    debug(funcName);
    if (windowId == messenger.windows.WINDOW_ID_NONE) {
        debug(funcName, "returning because no window");
        return;
    }
    const window = await messenger.windows.get(windowId, {populate: true});
    const tab = window.tabs.find((tab) => tab.active);
    if (!tab) {
        debug(funcName, "returning because no active tab");
        return;
    }
    if (!tab.mailTab) {
        debug(funcName, "returning because not mailTab");
        return;
    }
    const mailTab = await messenger.mailTabs.get(tab.id);
    if (!mailTab.displayedFolder) {
        debug(funcName, "returning because displayedFolder is empty");
        return;
    }
    await setPreferences(mailTab.displayedFolder);
}

async function storageChangedListener() {
    prefs = (await messenger.storage.local.get("prefs") || {}).prefs || {};
    if (prefs.rules) {
        for (const rule of prefs.rules) {
            if (rule[0]) rule[0] = new RegExp(rule[0]);
            if (rule[1]) rule[1] = new RegExp(rule[1]);
        }
    }
}

async function startup() {
    await storageChangedListener();
    await windowsFocusChangedListener(
        (await messenger.windows.getCurrent()).id);
}

messenger.mailTabs.onDisplayedFolderChanged.addListener(
    mailtabsDisplayedFolderChangedListener);
messenger.tabs.onActivated.addListener(tabsActivatedListener);
messenger.tabs.onUpdated.addListener(tabsUpdatedListener);
messenger.windows.onFocusChanged.addListener(windowsFocusChangedListener);
messenger.storage.local.onChanged.addListener(storageChangedListener);
startup();
