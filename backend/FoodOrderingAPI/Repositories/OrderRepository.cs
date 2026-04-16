using FoodOrderingAPI.Data;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodOrderingAPI.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context) => _context = context;

    public async Task<Order> CreateAsync(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<List<Order>> GetByCustomerIdAsync(int customerId) =>
        await _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
            .Include(o => o.Customer)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

    public async Task<Order?> GetByIdAsync(int orderId) =>
        await _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

    public async Task<List<Order>> GetAllAsync(string? status)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems).ThenInclude(oi => oi.MenuItem)
            .Include(o => o.Customer)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(o => o.Status == status);

        return await query.OrderByDescending(o => o.OrderDate).ToListAsync();
    }

    public async Task UpdateAsync(Order order)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
    }
}
