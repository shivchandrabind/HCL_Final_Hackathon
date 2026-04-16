using FoodOrderingAPI.DTOs;

namespace FoodOrderingAPI.Services.Interfaces;

public interface IOrderService
{
    Task<OrderDto> PlaceOrderAsync(int customerId, PlaceOrderDto dto);
    Task<List<OrderDto>> GetCustomerOrdersAsync(int customerId);
    Task<OrderDto?> GetOrderByIdAsync(int orderId);
    Task<List<OrderDto>> GetAllOrdersAsync(string? status);
    Task<OrderDto?> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto dto);
    Task<OrderDto> ReorderAsync(int customerId, int orderId);
}
