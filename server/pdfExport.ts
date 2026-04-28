/**
 * PDF Export Helper - Generate professional health reports
 * Uses HTML to PDF conversion for doctor-shareable reports
 */

export interface HealthReportData {
  userName: string;
  reportDate: Date;
  sleepHours: number;
  screenTimeHours: number;
  moodScore: number;
  energyLevel: number;
  activityKm: number;
  cancelledPlans: number;
  detectedPatterns: string[];
  riskScore: number;
  wellnessScore: number;
  weeklyTrend: Array<{ date: string; score: number }>;
}

/**
 * Generate a professional HTML report for PDF export
 */
export const generateHealthReport = (data: HealthReportData): string => {
  const reportHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Sentinel AI Health Report - ${data.userName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          color: #1f2937;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          background: #f9fafb;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          color: #1e40af;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }
        .report-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f3f4f6;
          border-radius: 6px;
        }
        .meta-item {
          font-size: 14px;
        }
        .meta-label {
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .meta-value {
          color: #1f2937;
          font-size: 16px;
          font-weight: 500;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #1e40af;
          font-size: 18px;
          margin: 0 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .metric-card {
          padding: 15px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
        }
        .metric-label {
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .metric-value {
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
        }
        .metric-unit {
          color: #9ca3af;
          font-size: 12px;
          margin-left: 4px;
        }
        .risk-high {
          color: #dc2626;
          font-weight: 700;
        }
        .risk-medium {
          color: #f59e0b;
          font-weight: 700;
        }
        .risk-low {
          color: #10b981;
          font-weight: 700;
        }
        .patterns-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .patterns-list li {
          padding: 10px;
          margin-bottom: 8px;
          background: #fef2f2;
          border-left: 4px solid #dc2626;
          border-radius: 4px;
          font-size: 14px;
        }
        .wellness-score {
          font-size: 32px;
          font-weight: 700;
          color: #3b82f6;
          margin: 10px 0;
        }
        .recommendations {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          border-radius: 4px;
          margin-top: 15px;
        }
        .recommendations h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 14px;
        }
        .recommendations ul {
          margin: 0;
          padding-left: 20px;
          font-size: 14px;
          color: #1f2937;
        }
        .recommendations li {
          margin-bottom: 8px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
        .disclaimer {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          padding: 15px;
          border-radius: 6px;
          font-size: 12px;
          color: #92400e;
          margin-top: 20px;
        }
        @media print {
          body { background: white; }
          .container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sentinel AI Health Report</h1>
          <p>Personal Wellbeing & Behavioral Analysis</p>
        </div>

        <div class="report-meta">
          <div class="meta-item">
            <div class="meta-label">Patient Name</div>
            <div class="meta-value">${escapeHtml(data.userName)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Report Date</div>
            <div class="meta-value">${data.reportDate.toLocaleDateString()}</div>
          </div>
        </div>

        <div class="section">
          <h2>Current Wellness Score</h2>
          <div class="wellness-score">${data.wellnessScore}/100</div>
          <p style="color: #6b7280; margin: 0;">Based on behavioral patterns and health metrics</p>
        </div>

        <div class="section">
          <h2>Daily Behavioral Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Sleep</div>
              <div class="metric-value">${data.sleepHours.toFixed(1)}<span class="metric-unit">hrs</span></div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Screen Time</div>
              <div class="metric-value">${data.screenTimeHours.toFixed(1)}<span class="metric-unit">hrs</span></div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Mood</div>
              <div class="metric-value">${data.moodScore}<span class="metric-unit">/10</span></div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Energy</div>
              <div class="metric-value">${data.energyLevel}<span class="metric-unit">/10</span></div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Activity</div>
              <div class="metric-value">${data.activityKm.toFixed(1)}<span class="metric-unit">km</span></div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Cancelled Plans</div>
              <div class="metric-value">${data.cancelledPlans}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Risk Assessment</h2>
          <p>
            <strong>Overall Risk Score:</strong>
            <span class="${getRiskClass(data.riskScore)}">${data.riskScore}/100</span>
          </p>
          ${
            data.detectedPatterns.length > 0
              ? `
            <p><strong>Detected Patterns:</strong></p>
            <ul class="patterns-list">
              ${data.detectedPatterns.map((pattern) => `<li>${escapeHtml(pattern)}</li>`).join("")}
            </ul>
          `
              : "<p style='color: #10b981;'>✓ No concerning patterns detected</p>"
          }
        </div>

        <div class="section">
          <div class="recommendations">
            <h3>Recommendations for Healthcare Provider</h3>
            <ul>
              <li>Review behavioral patterns and discuss lifestyle changes</li>
              <li>Consider sleep quality assessment if sleep hours are consistently low</li>
              <li>Discuss screen time and digital wellness strategies</li>
              <li>Monitor mood trends and consider mental health support if needed</li>
              <li>Encourage physical activity and outdoor time</li>
            </ul>
          </div>
        </div>

        <div class="disclaimer">
          <strong>Important Disclaimer:</strong> This report is generated by Sentinel AI for informational purposes only. 
          It is not a medical diagnosis or substitute for professional medical advice. Please consult with a qualified healthcare provider 
          for medical concerns or before making any health-related decisions.
        </div>

        <div class="footer">
          <p>Sentinel AI - Personal Wellbeing Platform</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>This report is confidential and intended for the patient and their healthcare provider only.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return reportHTML;
};

/**
 * Get CSS class for risk score color
 */
const getRiskClass = (riskScore: number): string => {
  if (riskScore >= 60) return "risk-high";
  if (riskScore >= 40) return "risk-medium";
  return "risk-low";
};

/**
 * Escape HTML special characters
 */
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Generate filename for PDF export
 */
export const generateFileName = (userName: string): string => {
  const date = new Date().toISOString().split("T")[0];
  const sanitizedName = userName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  return `sentinel-ai-report-${sanitizedName}-${date}.pdf`;
};
