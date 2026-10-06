import unittest

from flask import Flask

from compliance import build_compliance_report, create_compliance_blueprint


SAMPLE_METRICS = {
    "gray_zone_traffic_pct": 12.5,
    "tp_prevented_fraud": 7,
    "fp_false_positives": 3,
    "rupee_net_savings_inr": 174800.0,
}


class ComplianceReportTests(unittest.TestCase):
    def test_report_labels_assessment_and_data_limits(self):
        report = build_compliance_report(100, 10, SAMPLE_METRICS)

        self.assertEqual(report["overall_status"], "NOT_ASSESSED")
        self.assertEqual(report["evaluation"]["data_source"], "synthetic")
        self.assertEqual(report["evaluation"]["method"], "in_sample")
        self.assertNotIn("regulatory_signoff", report)
        self.assertTrue(all(
            framework["assessment_status"] == "NOT_ASSESSED"
            for framework in report["framework_references"]
        ))
        names = " ".join(item["name"] for item in report["framework_references"])
        self.assertIn("NIST FIPS 203", names)
        self.assertIn("NIST FIPS 204", names)
        self.assertIn("NPCI/RBI", names)

    def test_blueprint_serves_the_report_at_expected_path(self):
        app = Flask(__name__)
        context_provider = lambda: {
            "sample_count": 100,
            "positive_label_count": 10,
            "metrics": SAMPLE_METRICS,
        }
        app.register_blueprint(create_compliance_blueprint(context_provider))

        with app.test_client() as client:
            response = client.get("/api/export-report")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["overall_status"], "NOT_ASSESSED")


if __name__ == "__main__":
    unittest.main()
