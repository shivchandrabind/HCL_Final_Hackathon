using FoodOrderingAPI.Entities;

namespace FoodOrderingAPI.Repositories.Interfaces;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(int id);
    Task<Customer?> GetByEmailAsync(string email);
    Task<Customer> CreateAsync(Customer customer);
    Task UpdateAsync(Customer customer);
}
