using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Services.Interfaces;
using MailKit.Net.Smtp;
using MimeKit;

namespace FoodOrderingAPI.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendOrderConfirmationAsync(string toEmail, string customerName, Order order)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _config["SmtpSettings:FromName"],
                _config["SmtpSettings:FromEmail"]));
            message.To.Add(new MailboxAddress(customerName, toEmail));
            message.Subject = $"Order Confirmation - #{order.OrderId}";

            var itemsHtml = string.Join("", order.OrderItems.Select(oi =>
                $"<tr><td>{oi.MenuItem?.Name ?? "Item"}</td><td>{oi.Quantity}</td><td>{oi.Price:C}</td><td>{(oi.Price * oi.Quantity):C}</td></tr>"));

            message.Body = new TextPart("html")
            {
                Text = $@"
                <h2>Thank you for your order, {customerName}!</h2>
                <p>Your order <strong>#{order.OrderId}</strong> has been placed successfully.</p>
                <table border='1' cellpadding='8' cellspacing='0'>
                    <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                    {itemsHtml}
                </table>
                <p><strong>Discount:</strong> {order.DiscountAmount:C}</p>
                <p><strong>Total:</strong> {order.TotalAmount:C}</p>
                <p><strong>Delivery Address:</strong> {order.DeliveryAddress}</p>
                <p>We'll notify you when your order status changes.</p>"
            };

            using var client = new SmtpClient();
            await client.ConnectAsync(
                _config["SmtpSettings:Host"],
                int.Parse(_config["SmtpSettings:Port"]!),
                MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(
                _config["SmtpSettings:Username"],
                _config["SmtpSettings:Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Order confirmation email sent to {Email} for order #{OrderId}", toEmail, order.OrderId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send order confirmation email to {Email}", toEmail);
        }
    }
}
