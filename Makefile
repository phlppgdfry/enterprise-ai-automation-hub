.PHONY: verify build test demo
verify: build test
	python3 scripts/check_docs.py
build:
	dotnet build src/AutomationHub.csproj --configuration Release
test:
	python3 -m unittest discover -s tests -v
demo:
	python3 scripts/demo.py
