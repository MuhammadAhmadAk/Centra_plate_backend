const reportModel = require('../models/reportModel');
const exportHistoryModel = require('../models/exportHistoryModel');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { Parser } = require('json2csv');

// Helper function to convert data to CSV
const convertToCSV = (data, fields) => {
    try {
        const parser = new Parser({ fields });
        return parser.parse(data);
    } catch (err) {
        throw new Error('Error converting to CSV: ' + err.message);
    }
};

// Helper to generate export ID
const generateExportId = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EXP-${date}-${random}`;
};

// Helper to format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
};

// Export users
const exportUsers = async (req, res) => {
    try {
        const { format = 'csv', filters = {}, fields = [] } = req.body;
        const userId = req.user.id;

        const data = await reportModel.exportUsers(filters, fields);

        if (format === 'csv') {
            const csv = convertToCSV(data, fields.length > 0 ? fields : Object.keys(data[0] || {}));
            const csvBuffer = Buffer.from(csv, 'utf-8');
            const fileSizeBytes = csvBuffer.length;
            const fileName = `users_export_${Date.now()}.csv`;
            const exportId = generateExportId();

            // Save export history
            try {
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours

                await exportHistoryModel.createExportHistory({
                    exportId,
                    type: 'users',
                    format: 'csv',
                    recordCount: data.length,
                    fileSizeBytes,
                    fileName,
                    createdByUserId: userId,
                    expiresAtUTC: expiresAt
                });
            } catch (historyErr) {
                console.error('Error saving export history:', historyErr);
                // Don't fail the export if history save fails
            }

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            return res.send(csv);
        }

        return sendSuccess(res, 200, 'Users data exported successfully', data);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error exporting users', err);
    }
};

// Export vehicles
const exportVehicles = async (req, res) => {
    try {
        const { format = 'csv', filters = {}, fields = [] } = req.body;
        const userId = req.user.id;

        const data = await reportModel.exportVehicles(filters, fields);

        if (format === 'csv') {
            const csv = convertToCSV(data, fields.length > 0 ? fields : Object.keys(data[0] || {}));
            const csvBuffer = Buffer.from(csv, 'utf-8');
            const fileSizeBytes = csvBuffer.length;
            const fileName = `vehicles_export_${Date.now()}.csv`;
            const exportId = generateExportId();

            // Save export history
            try {
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);

                await exportHistoryModel.createExportHistory({
                    exportId,
                    type: 'vehicles',
                    format: 'csv',
                    recordCount: data.length,
                    fileSizeBytes,
                    fileName,
                    createdByUserId: userId,
                    expiresAtUTC: expiresAt
                });
            } catch (historyErr) {
                console.error('Error saving export history:', historyErr);
            }

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            return res.send(csv);
        }

        return sendSuccess(res, 200, 'Vehicles data exported successfully', data);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error exporting vehicles', err);
    }
};

// Export search logs
const exportSearchLogs = async (req, res) => {
    try {
        const { format = 'csv', filters = {}, fields = [] } = req.body;
        const userId = req.user.id;

        const data = await reportModel.exportSearchLogs(filters, fields);

        if (format === 'csv') {
            const csv = convertToCSV(data, fields.length > 0 ? fields : Object.keys(data[0] || {}));
            const csvBuffer = Buffer.from(csv, 'utf-8');
            const fileSizeBytes = csvBuffer.length;
            const fileName = `logs_export_${Date.now()}.csv`;
            const exportId = generateExportId();

            // Save export history
            try {
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);

                await exportHistoryModel.createExportHistory({
                    exportId,
                    type: 'logs',
                    format: 'csv',
                    recordCount: data.length,
                    fileSizeBytes,
                    fileName,
                    createdByUserId: userId,
                    expiresAtUTC: expiresAt
                });
            } catch (historyErr) {
                console.error('Error saving export history:', historyErr);
            }

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            return res.send(csv);
        }

        return sendSuccess(res, 200, 'Search logs data exported successfully', data);
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error exporting search logs', err);
    }
};

// Get export history
const getExportHistory = async (req, res) => {
    try {
        const { page, limit, type, status } = req.query;

        const filters = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            type,
            status
        };

        const result = await exportHistoryModel.getExportHistory(filters);

        // Format the response
        const formattedExports = result.exports.map(exp => ({
            Id: exp.Id,
            ExportId: exp.ExportId,
            Type: exp.Type,
            TypeLabel: exp.Type === 'users' ? 'Users Data' : exp.Type === 'vehicles' ? 'Vehicles Registry' : 'Search Logs',
            Format: exp.Format,
            Status: exp.IsExpired ? 'expired' : exp.Status,
            RecordCount: exp.RecordCount,
            FileSize: formatFileSize(exp.FileSizeBytes),
            FileSizeBytes: exp.FileSizeBytes,
            FileName: exp.FileName,
            DownloadUrl: exp.IsExpired ? null : `/api/reports/download/${exp.ExportId}`,
            ErrorMessage: exp.ErrorMessage,
            CreatedBy: {
                Id: exp.CreatedById,
                Name: exp.CreatedByName,
                Email: exp.CreatedByEmail
            },
            CreatedAtUTC: exp.CreatedAtUTC,
            ExpiresAtUTC: exp.ExpiresAtUTC,
            IsExpired: exp.IsExpired
        }));

        return sendSuccess(res, 200, 'Export history retrieved successfully', {
            exports: formattedExports,
            pagination: result.pagination,
            summary: result.summary
        });
    } catch (err) {
        console.error(err);
        return sendError(res, 500, 'Server error fetching export history', err);
    }
};

module.exports = {
    exportUsers,
    exportVehicles,
    exportSearchLogs,
    getExportHistory
};
