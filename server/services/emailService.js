const transporter = require('../config/nodemailer');

const sendOrderConfirmation = async (userEmail, userName, order, provider) => {
  const mailOptions = {
    from: `"e-Services" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order Confirmed – ${order.orderRef}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1a6bc4;">e-Services</h2>
        <h3>Order Confirmation</h3>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Your service order has been placed successfully. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr style="background:#f8f9fa;">
            <td style="padding:8px;border:1px solid #dee2e6;"><strong>Order Reference</strong></td>
            <td style="padding:8px;border:1px solid #dee2e6;">${order.orderRef}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #dee2e6;"><strong>Service Provider</strong></td>
            <td style="padding:8px;border:1px solid #dee2e6;">${provider.name}</td>
          </tr>
          <tr style="background:#f8f9fa;">
            <td style="padding:8px;border:1px solid #dee2e6;"><strong>Provider Contact</strong></td>
            <td style="padding:8px;border:1px solid #dee2e6;">${provider.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #dee2e6;"><strong>Service Date</strong></td>
            <td style="padding:8px;border:1px solid #dee2e6;">${new Date(order.serviceDate).toDateString()}</td>
          </tr>
          <tr style="background:#f8f9fa;">
            <td style="padding:8px;border:1px solid #dee2e6;"><strong>Service Address</strong></td>
            <td style="padding:8px;border:1px solid #dee2e6;">${order.serviceAddress}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #dee2e6;"><strong>Estimated Hours</strong></td>
            <td style="padding:8px;border:1px solid #dee2e6;">${order.estimatedHours} hr(s)</td>
          </tr>
          <tr style="background:#f8f9fa;">
            <td style="padding:8px;border:1px solid #dee2e6;"><strong>Estimated Cost</strong></td>
            <td style="padding:8px;border:1px solid #dee2e6;">&#8377;${order.estimatedCost.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #dee2e6;"><strong>Status</strong></td>
            <td style="padding:8px;border:1px solid #dee2e6;">${order.orderStatus}</td>
          </tr>
        </table>
        <p style="color:#6c757d;font-size:13px;">
          For queries, contact us at ${process.env.EMAIL_USER}<br/>
          Thank you for choosing e-Services!
        </p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendOrderConfirmation };
