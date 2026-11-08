"""Sync catalogue.json from maktabah-orchestrator/registry/repositories.json"""
import json
from pathlib import Path

def sync():
    root = Path(__file__).resolve().parent.parent
    orchestrator_registry = root.parent / "maktabah-orchestrator" / "registry" / "repositories.json"

    if not orchestrator_registry.exists():
        print(f"Error: Could not find orchestrator registry at {orchestrator_registry}")
        return 1

    with open(orchestrator_registry, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Exclude maktabah-orchestrator and maktabah-maftoohah.github.io from catalogue items to display works
    works = []
    for repo in data.get("repositories", []):
        if repo["id"] in ["maktabah-orchestrator", "maktabah-maftoohah.github.io"]:
            continue
        works.append(repo)

    output = {
        "organization": data.get("organization", "maktabah-maftoohah"),
        "organization_title": data.get("organization_title", "Maktabah Maftoohah (المكتبة المفتوحة)"),
        "total_works": len(works),
        "updated_at": data.get("updated_at"),
        "works": works
    }

    out_file = root / "data" / "catalogue.json"
    with open(out_file, "w", encoding="utf-8") as out:
        json.dump(output, out, ensure_ascii=False, indent=2)

    print(f"Successfully synced {len(works)} works to {out_file}")
    return 0

if __name__ == "__main__":
    sync()
