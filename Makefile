XPI=PerFolderPreferences.xpi
FILES=manifest.json background.js api/LegacyPrefs/implementation.js \
      api/LegacyPrefs/schema.json options.html options.js export.html \
      export.js import.html import.js

all: $(XPI)

clean: ; -rm -f $(XPI) *.tmp *~

$(XPI): $(FILES)
	rm -f $@ $@.tmp
	zip -r $@.tmp $^
	mv $@.tmp $@

