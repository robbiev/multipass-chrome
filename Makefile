.PHONY: release extension

multipass-chrome: *.go
	go build

multipass-chrome-linux64.zip: multipass-chrome org.garbagecollected.multipass.json install.sh LICENSE README.md
	rm -rf /tmp/multipass-chrome
	mkdir -p /tmp/multipass-chrome
	cp $^ /tmp/multipass-chrome
	cd /tmp && zip -r $(CURDIR)/$@ multipass-chrome

extension.zip: extension
	zip -r $@ $< --exclude *rsrc*

release: extension.zip multipass-chrome-linux64.zip
