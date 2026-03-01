// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.
  
const FIELDS = ["account", "folder", "prefName", "prefValue"];
const FIELD_WIDTHS = {
    "account": 20,
    "folder": 20,
    "prefName": 30,
    "prefValue": 20
};
let loaded = false;

function updateRules(rules) {
    let table = document.getElementById("rules");
    rules.push(Array(FIELDS.length).fill(""));
    let ruleCount = 0;
    for (let values of rules) {
        const ruleId = `rule${ruleCount}`;
        const oldRule = document.getElementById(ruleId);
        let rule;
        if (!oldRule) {
            rule = document.createElement("tr");
            rule.id = ruleId;
        }

        for (let field of FIELDS) {
            const valueId = `${field}Value${ruleCount}`;
            let value;
            if (!oldRule) {
                const cell = document.createElement("td");
                cell.id = `${field}Cell${ruleCount}`;
                value = document.createElement("input");
                value.id = valueId;
                value.type = "textbox";
                value.size = FIELD_WIDTHS[field];
                value.addEventListener("change", changeListener);
                cell.appendChild(value);
                rule.appendChild(cell);
                table.appendChild(rule);
            }
            else {
                value = document.getElementById(valueId);
            }
            value.value = values.shift();
        }
        ruleCount++;
    }

    let oldRule;
    while (oldRule = document.getElementById(`rule${ruleCount}`)) {
        oldRule.remove();
        ruleCount++;
    }
}

async function loadFolders() {
    const accounts = await messenger.accounts.list(true);
    const table = document.getElementById("sampleFoldersTable");
    for (const account of accounts) {
        const accountName = account.name;
        const folderNum = Math.floor(Math.random() * account.folders.length);
        const folderPath = account.folders[folderNum].path;
        const row = document.createElement("tr");
        const accountCell = document.createElement("td");
        const accountText = document.createTextNode(accountName);
        accountCell.appendChild(accountText);
        row.appendChild(accountCell);
        const folderCell = document.createElement("td");
        const folderText = document.createTextNode(folderPath);
        folderCell.appendChild(folderText);
        row.appendChild(folderCell);
        table.appendChild(row);
    }
}

async function loadListener() {
    const prefs = (await messenger.storage.local.get("prefs") || {}).prefs
          || {};

    updateRules(prefs.rules || []);

    if (! loaded) {
        await loadFolders();
    }
    
    const debugLogging = document.getElementById("debugLogging");
    debugLogging.checked = prefs.debugLogging;

    const saveButton = document.getElementById("saveButton");
    saveButton.disabled = true;

    const exportButton = document.getElementById("exportButton");
    exportButton.disabled = prefs ? false : true;

    if (! loaded) {
        debugLogging.addEventListener("change", changeListener);
        saveButton.addEventListener("click", saveButtonListener);
        exportButton.addEventListener("click", exportButtonListener);
        document.getElementById("importButton").addEventListener(
            "click", importButtonListener);
    }

    loaded = true;
}

function getRules() {
    const rules = [];
    let ruleCount = 0;
    let rule;
    while (rule = document.getElementById(`rule${ruleCount}`)) {
        let empty = true;
        let values = [];
        for (let field of FIELDS) {
            let value = document.getElementById(`${field}Value${ruleCount}`).
                value || "";
            values.push(value);
            if (value) empty = false;
        }
        if (!empty) rules.push(values);
        ruleCount++;
    }
    return rules;
}

function changeListener() {
    const rules = getRules();
    updateRules(rules);

    const saveButton = document.getElementById("saveButton");
    saveButton.disabled = false;
    document.getElementById("exportButton").disabled = true;
}
   
async function saveButtonListener() {
    let prefs = {};
    prefs.rules = getRules();
    prefs.debugLogging = document.getElementById("debugLogging").checked;
    for (const rule of prefs.rules) {
        if (!(rule[2] && rule[3])) {
            document.getElementById("errorText").innerText =
                "Preference name and value must not be blank for any rule";
            return;
        }
    }
    await messenger.storage.local.set({"prefs": prefs});
    const saveButton = document.getElementById("saveButton");
    saveButton.disabled = true;
    document.getElementById("exportButton").disabled = false;
    document.getElementById("errorText").innerText = "";
}

function exportButtonListener() {
    messenger.windows.create({
        "type": "popup",
        "url": "export.html"
    });
}

function importButtonListener() {
    messenger.windows.create({
        "type": "popup",
        "url": "import.html"
    });
}

window.addEventListener("load", loadListener, false);
messenger.storage.local.onChanged.addListener(loadListener);
