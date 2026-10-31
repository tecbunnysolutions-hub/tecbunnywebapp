import importlib.util
import json
import signal
import subprocess
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location('backup_wrapper', Path(__file__).with_name('run-scheduled-db-backup.py'))
wrapper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(wrapper)


class ScheduledBackupTests(unittest.TestCase):
    def run_case(self, outcomes):
        process = Mock()
        process.wait.side_effect = outcomes
        with patch.object(wrapper.subprocess, 'check_output', return_value=json.dumps([{'Image': 'sha256:' + 'a' * 64}]).encode()), \
             patch.object(wrapper.subprocess, 'Popen', return_value=process) as launch:
            result = wrapper.main()
            command = launch.call_args.args[0]
            self.assertEqual(command[-2:], ['--expected-api-image', 'sha256:' + 'a' * 64])
        return result, process

    def test_normal_completion(self):
        result, process = self.run_case([0])
        self.assertEqual(result, 0)
        process.send_signal.assert_not_called()

    def test_timeout_allows_exporter_cleanup(self):
        result, process = self.run_case([subprocess.TimeoutExpired('fixture', 650), 1])
        self.assertEqual(result, 1)
        process.send_signal.assert_called_once_with(signal.SIGTERM)
        process.kill.assert_not_called()

    def test_unresponsive_child_is_bounded(self):
        result, process = self.run_case([subprocess.TimeoutExpired('fixture', 650), subprocess.TimeoutExpired('fixture', 60), 1])
        self.assertEqual(result, 1)
        process.kill.assert_called_once()


if __name__ == '__main__':
    unittest.main()
