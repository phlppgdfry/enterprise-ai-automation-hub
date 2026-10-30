.PHONY: verify build test demo
verify: build test
	python3 scripts/build_process.py --check
	python3 scripts/check_contract.py
	python3 scripts/check_docs.py
	python3 scripts/check_release.py
build:
	dotnet build src/AutomationHub.csproj --configuration Release
test:
	python3 -m unittest discover -s tests -v
demo:
	python3 scripts/demo.py
