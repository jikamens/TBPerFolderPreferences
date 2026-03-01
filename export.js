// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.
  
function copyToClipboard() {
    const textArea = document.getElementById("settings");
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
}

async function loadListener() {
    const prefs = (await messenger.storage.local.get("prefs") || {}).prefs
          || {};
    document.getElementById("settings").value =
        JSON.stringify(prefs, undefined, 1);
    document.getElementById("copyButton").addEventListener(
        "click", copyToClipboard);
}

window.addEventListener("load", loadListener, false);
