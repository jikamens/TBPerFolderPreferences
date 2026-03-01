# "Per Folder Preferences" Thunderbird Extension

This extension allows you to cause Thunderbird preferences which are not typically linked to specific accounts or folders to change dynamically depending on which folder you are currently viewing within the application.

For example, for some folders I want messages I view to be marked read automatically, but for other folders I don't. Thunderbird only allows this behavior to be configured globally, not per account or per folder, but with this extension, I can fix that.

To use this extension, you install it, open its preferences, and add rules specifying regular expressions to match against the account name and folder path, and the corresponding preference names and values to set when there are matches. Leaving the account name and/or folder regexp blank in a rule causes it to apply to all accounts and/or folders. The first matching rule for any particular preference is used, so to specify a default value for a preference that you are changing for some accounts or folders, create a rule after all the other rules for that preference, with the account and folder regexps blank, the preference name, and its default value.

# Home page

https://github.com/jikamens/TBPerFolderPreferences

# Author

Jonathan Kamens <jik@kamens.us>

# Copyright

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, you can obtain one at https://mozilla.org/MPL/2.0/.
