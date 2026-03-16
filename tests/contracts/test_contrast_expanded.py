"""Contract tests: contrast-audit-expanded.py runs and exits successfully."""

import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
CONTRAST_SCRIPT = ROOT / "scripts" / "contrast-audit-expanded.py"


class TestContrastAuditExpandedScript(unittest.TestCase):
    """scripts/contrast-audit-expanded.py is run in CI; it must complete (exit 0)."""

    def test_script_exists(self):
        self.assertTrue(CONTRAST_SCRIPT.exists(), "scripts/contrast-audit-expanded.py should exist")

    def test_contrast_audit_expanded_exits_zero(self):
        """Run contrast-audit-expanded.py; CI runs this step — it must exit 0."""
        if not CONTRAST_SCRIPT.exists():
            self.skipTest("contrast-audit-expanded.py not found")
        proc = subprocess.run(
            [sys.executable, str(CONTRAST_SCRIPT)],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            timeout=120,
        )
        self.assertEqual(
            proc.returncode,
            0,
            f"contrast-audit-expanded.py should exit 0. stderr: {proc.stderr!r}",
        )


if __name__ == "__main__":
    unittest.main()
