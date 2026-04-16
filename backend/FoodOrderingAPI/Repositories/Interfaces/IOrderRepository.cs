using FoodOrderingAPI.Entities;

namespace FoodOrderingAPI.Repositories.Interfaces;

public interface IOrderRepository
{
    Task<Order> CreateAsync(Order order);
    Task<List<Order>> GetByCustomerIdAsync(int customerId);
    Task<Order?> GetByIdAsync(int orderId);
    Task<List<Order>> GetAllAsync(string? status);
    Task UpdateAsync(Order order);
}
