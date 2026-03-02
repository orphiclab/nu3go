import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DeliveryService {
    constructor(private readonly dataSource: DataSource) { }

    async getSchedule(date: string) {
        const items = await this.dataSource.query(
            `SELECT
        ml.id,
        u.id as user_id,
        u.full_name as user_name,
        u.phone,
        u.delivery_address as address,
        u.delivery_area as area,
        u.delivery_notes as notes,
        COALESCE(dl.status, 'pending') as status,
        dl.id as delivery_log_id,
        'https://maps.google.com/?q=' || ENCODE(u.delivery_address::bytea,'escape') as maps_link
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id
       JOIN plans p ON p.id = s.plan_id
       LEFT JOIN meal_logs ml ON ml.user_id = s.user_id AND ml.meal_date = $1 AND ml.type = 'delivery'
       LEFT JOIN delivery_logs dl ON dl.meal_log_id = ml.id
       WHERE s.status = 'active'
         AND p.type IN ('delivery', 'hybrid')
         AND s.start_date <= $1
         AND s.end_date >= $1
       ORDER BY u.delivery_area, u.full_name`,
            [date],
        );
        return { items };
    }

    async updateStatus(id: string, status: 'delivered' | 'failed') {
        await this.dataSource.query(
            `INSERT INTO delivery_logs (meal_log_id, status, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (meal_log_id) DO UPDATE SET status = $2, updated_at = NOW()`,
            [id, status],
        );
        return { message: 'Status updated.' };
    }

    async exportExcel(date: string): Promise<ArrayBuffer> {
        const schedule = await this.getSchedule(date);
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet(`Delivery ${date}`);

        ws.columns = [
            { header: '#', key: 'num', width: 5 },
            { header: 'Name', key: 'user_name', width: 25 },
            { header: 'Phone', key: 'phone', width: 18 },
            { header: 'Address', key: 'address', width: 40 },
            { header: 'Area', key: 'area', width: 18 },
            { header: 'Notes', key: 'notes', width: 30 },
            { header: 'Status', key: 'status', width: 12 },
        ];

        ws.getRow(1).font = { bold: true };
        ws.getRow(1).fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: 'FF22C55E' },
        };

        schedule.items.forEach((row: any, i: number) => {
            ws.addRow({ num: i + 1, ...row });
        });

        return (wb.xlsx.writeBuffer() as unknown) as Promise<ArrayBuffer>;
    }
}
