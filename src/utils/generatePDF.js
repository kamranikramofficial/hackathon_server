const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePrescriptionPDF = (prescription, patient, doctor) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `prescription_${prescription._id}.pdf`;
            const filePath = path.join(__dirname, '..', '..', 'uploads', 'prescriptions', fileName);

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Header
            doc.fontSize(20).text('AI Clinic Management', { align: 'center' });
            doc.moveDown();
            doc.fontSize(16).text('Prescription Document', { align: 'center' });
            doc.moveDown(2);

            // Info
            doc.fontSize(12).text(`Doctor: Dr. ${doctor.name}`);
            doc.text(`Patient: ${patient.name}`);
            doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
            doc.moveDown(2);

            // Medicines
            doc.fontSize(14).text('Medicines:', { underline: true });
            doc.moveDown(0.5);
            prescription.medicines.forEach((med, index) => {
                doc.fontSize(12).text(`${index + 1}. ${med.name} - ${med.dose}`);
            });
            doc.moveDown();

            // Instructions
            if (prescription.instructions) {
                doc.fontSize(14).text('Instructions:', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(12).text(prescription.instructions);
            }

            doc.end();

            writeStream.on('finish', () => {
                resolve(`/uploads/prescriptions/${fileName}`);
            });

            writeStream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generatePrescriptionPDF;
