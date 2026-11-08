import json
from pathlib import Path

def test_project():
    root = Path(__file__).resolve().parent.parent
    assert (root / "index.html").exists(), "index.html missing"
    assert (root / "AGENTS.md").exists(), "AGENTS.md missing"
    assert (root / ".nojekyll").exists(), ".nojekyll missing"
    assert (root / "manifest.webmanifest").exists(), "manifest.webmanifest missing"
    assert (root / "icon.svg").exists(), "icon.svg missing"
    assert (root / "sw.js").exists(), "sw.js missing"
    assert (root / "data" / "catalogue.json").exists(), "catalogue.json missing"

    with open(root / "data" / "catalogue.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        assert len(data.get("works", [])) > 0, "No works found in catalogue.json"

    print("Project verification PASSED for maktabah-maftoohah.github.io.")

if __name__ == "__main__":
    test_project()
