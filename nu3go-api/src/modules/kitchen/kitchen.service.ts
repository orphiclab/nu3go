import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class KitchenService {
    constructor(private readonly dataSource: DataSource) { }

    async getCount(date: string) {
        // Pickup counts by location
        const byLocation = await this.dataSource.query(
            `SELECT l.name as location_name, COUNT(*) as count
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       LEFT JOIN locations l ON l.id = s.location_id
       WHERE s.status = 'active'
         AND p.type IN ('pickup', 'hybrid')
         AND s.start_date <= $1
         AND s.end_date >= $1
       GROUP BY l.name
       ORDER BY count DESC`,
            [date],
        );

        // Delivery counts by area
        const byArea = await this.dataSource.query(
            `SELECT COALESCE(u.delivery_area, 'Unknown') as area, COUNT(*) as count
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       JOIN users u ON u.id = s.user_id
       WHERE s.status = 'active'
         AND p.type IN ('delivery', 'hybrid')
         AND s.start_date <= $1
         AND s.end_date >= $1
       GROUP BY u.delivery_area
       ORDER BY count DESC`,
            [date],
        );

        const totals = await this.dataSource.query(
            `SELECT
        COUNT(*) FILTER (WHERE p.type IN ('pickup', 'hybrid')) as pickup_count,
        COUNT(*) FILTER (WHERE p.type IN ('delivery', 'hybrid')) as delivery_count,
        COUNT(*) as total_meals
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.status = 'active'
         AND s.start_date <= $1
         AND s.end_date >= $1`,
            [date],
        );

        return {
            totalMeals: parseInt(totals[0].total_meals),
            pickupCount: parseInt(totals[0].pickup_count),
            deliveryCount: parseInt(totals[0].delivery_count),
            byLocation: byLocation.map((r: any) => ({
                locationName: r.location_name ?? 'Unknown',
                count: parseInt(r.count),
            })),
            byArea: byArea.map((r: any) => ({
                area: r.area,
                count: parseInt(r.count),
            })),
            dietaryReq: [],
        };
    }

    async markPrinted(date: string) {
        await this.dataSource.query(
            `INSERT INTO kitchen_print_logs (date, printed_at) VALUES ($1, NOW())
       ON CONFLICT (date) DO UPDATE SET printed_at = NOW()`,
            [date],
        );
        return { message: 'Marked as printed.' };
    }

    async exportPdf(date: string): Promise<Buffer> {
        const data = await this.getCount(date);
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            const doc = new PDFDocument({ margin: 50 });

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).fillColor('#22c55e').text('nu3go Kitchen Sheet', { align: 'center' });
            doc.fontSize(12).fillColor('#374151').text(`Date: ${date}`, { align: 'center' });
            doc.moveDown();

            // Totals
            doc.fontSize(14).fillColor('#111827').text('Total Meals to Prepare', { underline: true });
            doc.fontSize(28).fillColor('#22c55e').text(String(data.totalMeals), { align: 'center' });
            doc.moveDown();

            // Split
            doc.fontSize(12).fillColor('#374151');
            doc.text(`Pickup: ${data.pickupCount}  |  Delivery: ${data.deliveryCount}`);
            doc.moveDown();

            // By location
            if (data.byLocation.length) {
                doc.fontSize(13).fillColor('#111827').text('By Pickup Location:', { underline: true });
                data.byLocation.forEach((l) => {
                    doc.fontSize(12).fillColor('#374151').text(`${l.locationName}: ${l.count}`);
                });
                doc.moveDown();
            }

            // By area
            if (data.byArea.length) {
                doc.fontSize(13).fillColor('#111827').text('Delivery by Area:', { underline: true });
                data.byArea.forEach((a) => {
                    doc.fontSize(12).fillColor('#374151').text(`${a.area}: ${a.count}`);
                });
            }

            doc.end();
        });
    }
}
