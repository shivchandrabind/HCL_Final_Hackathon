using FoodOrderingAPI.Entities;

namespace FoodOrderingAPI.Services.Interfaces;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(string toEmail, string customerName, Order order);
}
