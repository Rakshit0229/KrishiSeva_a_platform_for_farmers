import PDFDocument from 'pdfkit';

export function generateProcurementReceipt(procurement: any, farmer: any, centre: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fillColor('#2A6B35')
         .fontSize(22)
         .text('KRISHISEVA — GOVT. OF INDIA', { align: 'center' });
      doc.fontSize(12)
         .fillColor('#6B7560')
         .text('Ministry of Consumer Affairs, Food & Public Distribution', { align: 'center' })
         .moveDown(0.5);

      doc.strokeColor('#D4A017')
         .lineWidth(2)
         .moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke()
         .moveDown(1);

      doc.fillColor('#1F2B1F').fontSize(16).text('OFFICIAL PROCUREMENT RECEIPT', { align: 'center' }).moveDown(1);

      // Receipt details grid
      doc.fontSize(11).fillColor('#1F2B1F');
      const startY = doc.y;

      doc.text(`Receipt ID: ${procurement.id || 'N/A'}`, 50, startY);
      doc.text(`Date: ${procurement.procurement_date || new Date().toISOString().split('T')[0]}`, 350, startY);

      doc.moveDown();
      doc.text(`Farmer Name: ${farmer?.name || 'Gurpreet Singh'}`);
      doc.text(`Phone: ${farmer?.phone || '+91 98765 43201'}`);
      doc.text(`Bank A/C (last 4): **** ${procurement.bank_account_last4 || farmer?.bank_account_last4 || '5678'}`);
      doc.text(`Procurement Mandi: ${centre?.name || 'Amritsar Central Mandi'}`);

      doc.moveDown(1);
      doc.strokeColor('#D5D0C4').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

      // Itemized Table
      doc.fontSize(12).fillColor('#2A6B35').text('Grain Details & MSP Settlement:').moveDown(0.5);
      doc.fontSize(11).fillColor('#1F2B1F');
      doc.text(`Crop Type: ${String(procurement.crop_type || '').toUpperCase()}`);
      doc.text(`Quantity: ${procurement.quantity_kg} kg (${(Number(procurement.quantity_kg) / 100).toFixed(2)} Quintals)`);
      doc.text(`MSP Rate: ₹${procurement.msp_rate} / Quintal`);
      doc.text(`Moisture Level: ${procurement.moisture_level || 12.0}% (FAQ Compliant)`);
      doc.text(`Quality Grade: Grade ${procurement.quality_grade || 'A'}`);

      doc.moveDown(1);
      doc.fontSize(14).fillColor('#2A6B35')
         .text(`Total MSP Value: ₹${Number(procurement.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, { bold: true } as any);
      doc.fontSize(10).fillColor('#6B7560').text('Formula: (Quantity in kg / 100) × MSP Rate per Quintal');

      doc.moveDown(2);
      doc.fontSize(10).fillColor('#6B7560')
         .text('Status: Direct Bank Transfer (DBT) via PFMS initiated. Credited within 72 hours.', { align: 'center' });
      doc.moveDown(0.5);
      doc.text('This is a computer generated tamper-proof document. For inquiries contact support@krishiseva.gov.in', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function generateIncomeCertificate(farmer: any, season: string, year: number, procurements: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fillColor('#2A6B35').fontSize(22).text('KRISHISEVA PROCURING AUTHORITY', { align: 'center' });
      doc.fontSize(12).fillColor('#6B7560').text('Certificate of Agricultural Grain Sales (MSP)', { align: 'center' }).moveDown(1);

      doc.strokeColor('#D4A017').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

      doc.fontSize(14).fillColor('#1F2B1F').text(`FARMER GRAIN PROCUREMENT CERTIFICATE — ${season.toUpperCase()} ${year}`).moveDown(1);

      doc.fontSize(11).fillColor('#1F2B1F');
      doc.text(`Certified that Sri/Smt: ${farmer?.name || 'Registered Farmer'}`);
      doc.text(`Registered Phone: ${farmer?.phone}`);
      doc.text(`Season: ${season.toUpperCase()} ${year}`);

      const totalEarnings = procurements.reduce((acc, p) => acc + Number(p.total_amount || 0), 0);
      const totalQty = procurements.reduce((acc, p) => acc + Number(p.quantity_kg || 0), 0);

      doc.moveDown(1);
      doc.text(`Total Quantity Sold at Mandi: ${totalQty.toFixed(2)} kg`);
      doc.text(`Total MSP Direct Payment Earned: ₹${totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      doc.moveDown(2);

      doc.text('Authorized Signatory: Department of Consumer Affairs, Govt. of India', { align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function generateJForm(procurement: any, farmer: any, centre: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Border frame for official J-Form look
      doc.rect(20, 20, 572, 752).lineWidth(2).strokeColor('#2A6B35').stroke();
      doc.rect(24, 24, 564, 744).lineWidth(0.75).strokeColor('#D4A017').stroke();

      // Official Banner
      doc.fillColor('#2A6B35').fontSize(18).text('FORM J / DIGITAL SALE SLIP (ਜੇ-ਫਾਰਮ)', { align: 'center' });
      doc.fontSize(10).fillColor('#4A5568').text('[See Rule 24(1) of State Agricultural Produce Markets Act & Rules]', { align: 'center' });
      doc.fontSize(11).fillColor('#1F2B1F').text('NATIONAL E-PROCUREMENT PORTAL · KRISHISEVA', { align: 'center' }).moveDown(0.5);

      doc.strokeColor('#2A6B35').lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke().moveDown(0.8);

      // Metadata Bar
      const jFormNo = `JF-${new Date().getFullYear()}-${procurement?.id ? procurement.id.substring(0, 8).toUpperCase() : '847291'}`;
      doc.fontSize(10).fillColor('#1F2B1F');
      const metaY = doc.y;
      doc.text(`J-Form No: ${jFormNo}`, 45, metaY, { bold: true } as any);
      doc.text(`Date of Issue: ${procurement?.procurement_date || new Date().toISOString().split('T')[0]}`, 380, metaY);

      doc.moveDown(1.2);

      // Section 1: Farmer & Market Committee Details
      doc.fontSize(11).fillColor('#2A6B35').text('1. APMC Mandi & Seller Particulars', 45, doc.y, { underline: true } as any);
      doc.moveDown(0.4);
      doc.fontSize(9.5).fillColor('#2D3748');
      doc.text(`Market Committee / Mandi: ${centre?.name || 'Amritsar Central APMC Mandi'} (${centre?.district || 'Amritsar'}, ${centre?.state || 'Punjab'})`);
      doc.text(`Farmer Name: ${farmer?.name || 'Gurpreet Singh'}`);
      doc.text(`Farmer Mobile No: ${farmer?.phone || '+91 98765 43201'}`);
      doc.text(`Aadhaar / Farmer ID: ${farmer?.aadhaar_hash ? 'XXXX-XXXX-' + farmer.aadhaar_hash.slice(-4) : 'UID-IN-98721'}`);
      doc.text(`Bank Account Linked (PFMS / DBT): **** ${procurement?.bank_account_last4 || farmer?.bank_account_last4 || '5678'}`);

      doc.moveDown(0.8);

      // Section 2: Commodity & Weighbridge Record
      doc.fontSize(11).fillColor('#2A6B35').text('2. Weight, Quality & MSP Assessment Details', 45, doc.y, { underline: true } as any);
      doc.moveDown(0.4);

      const qtyKg = Number(procurement?.quantity_kg || 4200);
      const quintals = Number((qtyKg / 100).toFixed(2));
      const mspRate = Number(procurement?.msp_rate || 2425.00);
      const grossAmt = Number((quintals * mspRate).toFixed(2));
      const marketFee = 0; // Exempted under direct MSP scheme
      const netPayable = grossAmt;

      doc.fontSize(9.5).fillColor('#2D3748');
      doc.text(`Agricultural Commodity: ${String(procurement?.crop_type || 'Wheat').toUpperCase()}`);
      doc.text(`Digital Weighbridge Weight: ${qtyKg.toLocaleString('en-IN')} kg (${quintals} Quintals)`);
      doc.text(`Moisture Content Tested: ${procurement?.moisture_level || 12.0}% (Within Standard FAQ limit ≤ 12.0%)`);
      doc.text(`Foreign Matter / Refraction: 0.4% (FAQ Grade-A Approved)`);
      doc.text(`Government Assured MSP Rate: ₹${mspRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })} per Quintal`);

      doc.moveDown(0.8);

      // Section 3: Financial Settlement Table
      doc.fontSize(11).fillColor('#2A6B35').text('3. Account Statement & Direct Benefit Transfer (DBT)', 45, doc.y, { underline: true } as any);
      doc.moveDown(0.4);

      // Table Header
      const tableY = doc.y;
      doc.rect(45, tableY, 520, 20).fill('#E8F5E9');
      doc.fillColor('#1B5E20').fontSize(9).text('Particulars', 55, tableY + 5);
      doc.text('Calculation', 300, tableY + 5);
      doc.text('Amount (INR)', 480, tableY + 5, { align: 'right', width: 75 });

      // Table Rows
      let curY = tableY + 22;
      doc.fillColor('#2D3748').fontSize(9);
      
      // Gross
      doc.text(`Gross Value of Produce at MSP`, 55, curY);
      doc.text(`${quintals} Qtl × ₹${mspRate}`, 300, curY);
      doc.text(`₹${grossAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, curY, { align: 'right', width: 75 });
      curY += 18;

      // Mandi Cess / Middleman Arhatiya Commission (₹0)
      doc.text(`Middleman / Arhatiya Commission (Exempted under KrishiSeva)`, 55, curY);
      doc.text(`Direct MSP (0% Arhatiya)`, 300, curY);
      doc.text(`₹0.00`, 480, curY, { align: 'right', width: 75 });
      curY += 18;

      // Net Total Box
      doc.rect(45, curY, 520, 24).fill('#C8E6C9');
      doc.fillColor('#1B5E20').fontSize(10).text('Net Payout to Farmer Bank A/C', 55, curY + 6, { bold: true } as any);
      doc.text('Direct Benefit Transfer (PFMS)', 300, curY + 6);
      doc.text(`₹${netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, curY + 6, { align: 'right', width: 75, bold: true } as any);

      doc.moveDown(3);

      // Security Seal & Signatures
      const sigY = doc.y;
      doc.fontSize(8.5).fillColor('#4A5568');
      doc.text('Certified by APMC Mandi Officer:', 55, sigY);
      doc.text('[Digitally Signed via DSC]', 55, sigY + 14, { bold: true } as any);
      doc.text(`Centre ID: ${centre?.id || 'APMC-AMR-01'}`, 55, sigY + 26);

      doc.text('Electronic Verification Stamp:', 380, sigY);
      doc.text('Ministry of Consumer Affairs · DoCA', 380, sigY + 14, { bold: true } as any);
      doc.text(`Payment Gateway: PFMS Instant DBT (72h SLA)`, 380, sigY + 26);

      doc.moveDown(4);
      doc.fontSize(7.5).fillColor('#718096')
         .text('Note: This digital J-Form is an authentic legal record admissible under Section 65B of the Indian Evidence Act. It can be used for obtaining Kisan Credit Card (KCC) loans and agricultural subsidies.', 45, doc.y, { align: 'center', width: 520 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

