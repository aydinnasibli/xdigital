// lib/services/pdf-report.service.ts
// Generate PDF analytics reports

export interface ReportData {
    projectName: string;
    websiteUrl: string;
    reportPeriod: {
        startDate: string;
        endDate: string;
    };
    analytics: {
        pageViews: number;
        visitors: number;
        sessions: number;
        bounceRate: number;
        avgSessionDuration: number;
        conversions: number;
        topPages: Array<{ page: string; views: number }>;
        trafficSources: Array<{ source: string; sessions: number }>;
    };
    seo: {
        score: number;
        criticalIssues: number;
        recommendations: string[];
    };
    performance: {
        score: number;
        coreWebVitals: {
            lcp: { value: number; rating: string };
            fid: { value: number; rating: string };
            cls: { value: number; rating: string };
        };
    };
}

export class PDFReportService {
    /**
     * Generate analytics PDF report
     * Note: In production, use a PDF generation library like:
     * - jsPDF (client-side)
     * - PDFKit (server-side Node.js)
     * - Puppeteer (HTML to PDF)
     */
    async generateReport(data: ReportData): Promise<string> {
        // This is a placeholder that returns HTML
        // In production, convert this to actual PDF using libraries mentioned above

        const html = this.generateReportHTML(data);

        // In production, use one of these approaches:
        /*
        // Option 1: jsPDF (already installed in your project)
        import jsPDF from 'jspdf';
        const doc = new jsPDF();
        doc.html(html, {
            callback: function (doc) {
                doc.save('analytics-report.pdf');
            }
        });

        // Option 2: Puppeteer (server-side, more reliable)
        import puppeteer from 'puppeteer';
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        return pdf;

        // Option 3: Use a service like PDFShift or DocRaptor
        */

        return html; // Return HTML for now
    }

    /**
     * Generate HTML template for report
     */
    private generateReportHTML(data: ReportData): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Analytics Report - ${data.projectName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 40px;
            background: #fff;
        }
        .header {
            border-bottom: 3px solid #3B82F6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1F2937;
            font-size: 28px;
            margin-bottom: 8px;
        }
        .header p {
            color: #6B7280;
            font-size: 14px;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 20px;
            color: #1F2937;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #E5E7EB;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: #F9FAFB;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #3B82F6;
        }
        .metric-label {
            font-size: 12px;
            color: #6B7280;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #1F2937;
        }
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 36px;
            font-weight: bold;
            color: #fff;
        }
        .score-excellent { background: #10B981; }
        .score-good { background: #3B82F6; }
        .score-fair { background: #F59E0B; }
        .score-poor { background: #EF4444; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #E5E7EB;
        }
        th {
            background: #F3F4F6;
            font-weight: 600;
            color: #1F2937;
        }
        .recommendation {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 4px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 12px;
        }
        @media print {
            body { padding: 20px; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Analytics Report</h1>
        <p><strong>${data.projectName}</strong></p>
        <p>${data.websiteUrl}</p>
        <p>Report Period: ${data.reportPeriod.startDate} to ${data.reportPeriod.endDate}</p>
    </div>

    <!-- Analytics Section -->
    <div class="section">
        <h2 class="section-title">📊 Website Analytics</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Page Views</div>
                <div class="metric-value">${data.analytics.pageViews.toLocaleString()}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Visitors</div>
                <div class="metric-value">${data.analytics.visitors.toLocaleString()}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Sessions</div>
                <div class="metric-value">${data.analytics.sessions.toLocaleString()}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Bounce Rate</div>
                <div class="metric-value">${Math.round(data.analytics.bounceRate * 100)}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Avg Session</div>
                <div class="metric-value">${Math.round(data.analytics.avgSessionDuration)}s</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Conversions</div>
                <div class="metric-value">${data.analytics.conversions.toLocaleString()}</div>
            </div>
        </div>

        <h3 style="margin-top: 24px; margin-bottom: 12px; color: #1F2937;">Top Pages</h3>
        <table>
            <thead>
                <tr>
                    <th>Page</th>
                    <th style="text-align: right;">Views</th>
                </tr>
            </thead>
            <tbody>
                ${data.analytics.topPages
                    .map(
                        (page) => `
                    <tr>
                        <td>${page.page}</td>
                        <td style="text-align: right;">${page.views.toLocaleString()}</td>
                    </tr>
                `
                    )
                    .join('')}
            </tbody>
        </table>

        <h3 style="margin-top: 24px; margin-bottom: 12px; color: #1F2937;">Traffic Sources</h3>
        <table>
            <thead>
                <tr>
                    <th>Source</th>
                    <th style="text-align: right;">Sessions</th>
                </tr>
            </thead>
            <tbody>
                ${data.analytics.trafficSources
                    .map(
                        (source) => `
                    <tr>
                        <td style="text-transform: capitalize;">${source.source}</td>
                        <td style="text-align: right;">${source.sessions.toLocaleString()}</td>
                    </tr>
                `
                    )
                    .join('')}
            </tbody>
        </table>
    </div>

    <div class="page-break"></div>

    <!-- SEO Section -->
    <div class="section">
        <h2 class="section-title">🔍 SEO Analysis</h2>
        <div class="score-circle ${this.getScoreClass(data.seo.score)}">
            ${data.seo.score}
        </div>
        <p style="text-align: center; color: #6B7280; margin-bottom: 24px;">
            ${data.seo.criticalIssues} Critical Issues Found
        </p>

        <h3 style="margin-bottom: 12px; color: #1F2937;">Recommendations</h3>
        ${data.seo.recommendations
            .map(
                (rec) => `
            <div class="recommendation">${rec}</div>
        `
            )
            .join('')}
    </div>

    <!-- Performance Section -->
    <div class="section">
        <h2 class="section-title">⚡ Performance</h2>
        <div class="score-circle ${this.getScoreClass(data.performance.score)}">
            ${data.performance.score}
        </div>

        <h3 style="margin-top: 24px; margin-bottom: 12px; color: #1F2937;">Core Web Vitals</h3>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">LCP (Largest Contentful Paint)</div>
                <div class="metric-value">${data.performance.coreWebVitals.lcp.value}ms</div>
                <div style="margin-top: 4px; font-size: 12px; color: ${
                    this.getRatingColor(data.performance.coreWebVitals.lcp.rating)
                };">
                    ${data.performance.coreWebVitals.lcp.rating.toUpperCase()}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">FID (First Input Delay)</div>
                <div class="metric-value">${data.performance.coreWebVitals.fid.value}ms</div>
                <div style="margin-top: 4px; font-size: 12px; color: ${
                    this.getRatingColor(data.performance.coreWebVitals.fid.rating)
                };">
                    ${data.performance.coreWebVitals.fid.rating.toUpperCase()}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">CLS (Cumulative Layout Shift)</div>
                <div class="metric-value">${data.performance.coreWebVitals.cls.value}</div>
                <div style="margin-top: 4px; font-size: 12px; color: ${
                    this.getRatingColor(data.performance.coreWebVitals.cls.rating)
                };">
                    ${data.performance.coreWebVitals.cls.rating.toUpperCase()}
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>This report is automatically generated based on real-time website data</p>
    </div>
</body>
</html>
        `;
    }

    /**
     * Get CSS class for score circle
     */
    private getScoreClass(score: number): string {
        if (score >= 90) return 'score-excellent';
        if (score >= 75) return 'score-good';
        if (score >= 60) return 'score-fair';
        return 'score-poor';
    }

    /**
     * Get color for rating
     */
    private getRatingColor(rating: string): string {
        if (rating === 'good') return '#10B981';
        if (rating === 'needs-improvement') return '#F59E0B';
        return '#EF4444';
    }

    /**
     * Generate monthly report
     */
    async generateMonthlyReport(data: ReportData): Promise<string> {
        return await this.generateReport(data);
    }

    /**
     * Convert HTML to PDF using client-side library
     * This can be called from the frontend
     */
    static async convertHTMLToPDF(html: string, filename: string): Promise<void> {
        // This would be used on the client side
        // Using html2canvas + jsPDF (already in your dependencies)
        /*
        const { jsPDF } = require('jspdf');
        const html2canvas = require('html2canvas');

        const element = document.createElement('div');
        element.innerHTML = html;
        document.body.appendChild(element);

        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);

        document.body.removeChild(element);
        */
    }
}
