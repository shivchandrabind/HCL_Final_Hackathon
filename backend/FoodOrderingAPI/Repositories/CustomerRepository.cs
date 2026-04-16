using FoodOrderingAPI.Data;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodOrderingAPI.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context) => _context = context;

    public async Task<Customer?> GetByIdAsync(int id) =>
        await _context.Customers.FindAsync(id);

    public async Task<Customer?> GetByEmailAsync(string email) =>
        await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);

    public async Task<Customer> CreateAsync(Customer customer)
    {
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();
        return customer;
    }

    public async Task UpdateAsync(Customer customer)
    {
        _context.Customers.Update(customer);
        await _context.SaveChangesAsync();
    }
}
