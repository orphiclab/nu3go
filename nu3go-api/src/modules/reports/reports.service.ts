import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
    constructor(private readonly dataSource: DataSource) { }

    /** Dashboard overview KPIs */
    async getDashboard() {
        const [kpi] = await this.dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscribers,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND auto_renew = true) as auto_renew_count,
        (SELECT COALESCE(SUM(amount_lkr), 0) FROM payment_transactions WHERE status = 'completed' AND created_at >= date_trunc('month', NOW())) as total_revenue_lkr,
        (SELECT COUNT(*) FROM meal_logs WHERE meal_date = CURRENT_DATE) as pickup_today,
        (SELECT ROUND(
          (COUNT(*) FILTER (WHERE auto_renew = true))::numeric /
          NULLIF(COUNT(*), 0) * 100, 1
        ) FROM subscriptions WHERE status IN ('active', 'expired')) as renewal_rate_percent
    `);

        return {
            activeSubscribers: parseInt(kpi.active_subscribers),
            totalRevenueLkr: parseFloat(kpi.total_revenue_lkr) || 0,
            pickupToday: parseInt(kpi.pickup_today),
            renewalRatePercent: parseFloat(kpi.renewal_rate_percent) || 0,
        };
    }

    /** Revenue trend over N days */
    async getRevenueTrend(days = 30) {
        const rows = await this.dataSource.query(
            `SELECT
         date_trunc('day', created_at)::date AS date,
         COALESCE(SUM(amount_lkr), 0) AS revenue,
         COUNT(DISTINCT pt.user_id) FILTER (
           WHERE s.created_at::date = date_trunc('day', pt.created_at)::date
         ) AS new,
         COUNT(DISTINCT sub.id) FILTER (WHERE sub.status = 'paused') AS paused
       FROM payment_transactions pt
       LEFT JOIN subscriptions s ON s.user_id = pt.user_id
       LEFT JOIN subscriptions sub ON sub.user_id = pt.user_id
       WHERE pt.status = 'completed'
         AND pt.created_at >= NOW() - ($1 || ' days')::interval
       GROUP BY 1
       ORDER BY 1`,
            [days],
        );

        return rows.map((r: any) => ({
            date: r.date,
            revenue: parseFloat(r.revenue),
            new: parseInt(r.new) || 0,
            paused: parseInt(r.paused) || 0,
        }));
    }

    /** Active subscriptions by plan type */
    async getPlanDistribution() {
        const rows = await this.dataSource.query(`
      SELECT p.type, COUNT(*) as count
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.status = 'active'
      GROUP BY p.type
    `);

        return rows.map((r: any) => ({ type: r.type, count: parseInt(r.count) }));
    }

    /** Export full report to Excel */
    async exportReport(days = 30): Promise<Buffer> {
        const [summary, planDist, revTrend] = await Promise.all([
            this.getDashboard(),
            this.getPlanDistribution(),
            this.getRevenueTrend(days),
        ]);

        const wb = new ExcelJS.Workbook();

        // Summary sheet
        const summarySheet = wb.addWorksheet('Summary');
        summarySheet.addRow(['Metric', 'Value']);
        summarySheet.addRow(['Active Subscribers', summary.activeSubscribers]);
        summarySheet.addRow(['Monthly Revenue (LKR)', summary.totalRevenueLkr]);
        summarySheet.addRow(['Renewal Rate (%)', summary.renewalRatePercent]);
        summarySheet.addRow(['Total Pickups Today', summary.pickupToday]);
        summarySheet.getRow(1).font = { bold: true };

        // Revenue trend sheet
        const revSheet = wb.addWorksheet('Revenue Trend');
        revSheet.addRow(['Date', 'Revenue (LKR)', 'New Subs', 'Paused']);
        revTrend.forEach((r: any) => revSheet.addRow([r.date, r.revenue, r.new, r.paused]));
        revSheet.getRow(1).font = { bold: true };

        // Plan distribution sheet
        const planSheet = wb.addWorksheet('Plan Distribution');
        planSheet.addRow(['Plan Type', 'Count']);
        planDist.forEach((p: any) => planSheet.addRow([p.type, p.count]));
        planSheet.getRow(1).font = { bold: true };

        return wb.xlsx.writeBuffer() as Promise<Buffer>;
    }
}
