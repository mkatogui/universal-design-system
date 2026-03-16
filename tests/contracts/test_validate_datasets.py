"""Contract tests: validate-datasets.py runs and passes with current data."""

import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
VALIDATE_SCRIPT = ROOT / "scripts" / "validate-datasets.py"


class TestValidateDatasetsScript(unittest.TestCase):
    """scripts/validate-datasets.py must exit 0 when CSVs are valid."""

    def test_script_exists(self):
        self.assertTrue(VALIDATE_SCRIPT.exists(), "scripts/validate-datasets.py should exist")

    def test_validate_datasets_exits_zero(self):
        """Run validate-datasets.py; CI runs this step — it must pass."""
        if not VALIDATE_SCRIPT.exists():
            self.skipTest("validate-datasets.py not found")
        proc = subprocess.run(
            [sys.executable, str(VALIDATE_SCRIPT)],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            timeout=30,
        )
        self.assertEqual(
            proc.returncode,
            0,
            f"validate-datasets.py should exit 0. stderr: {proc.stderr!r} stdout: {proc.stdout!r}",
        )

    def test_validate_datasets_json_mode_exits_zero(self):
        """--json mode should also exit 0 when valid."""
        if not VALIDATE_SCRIPT.exists():
            self.skipTest("validate-datasets.py not found")
        proc = subprocess.run(
            [sys.executable, str(VALIDATE_SCRIPT), "--json"],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            timeout=30,
        )
        self.assertEqual(
            proc.returncode,
            0,
            f"validate-datasets.py --json should exit 0. stderr: {proc.stderr!r}",
        )


if __name__ == "__main__":
    unittest.main()
