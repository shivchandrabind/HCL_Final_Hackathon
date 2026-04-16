using FoodOrderingAPI.Entities;

namespace FoodOrderingAPI.Repositories.Interfaces;

public interface IMenuItemRepository
{
    Task<(List<MenuItem> Items, int TotalCount)> GetAllAsync(int page, int pageSize, int? categoryId);
    Task<MenuItem?> GetByIdAsync(int id);
    Task<MenuItem> CreateAsync(MenuItem item);
    Task UpdateAsync(MenuItem item);
    Task DeleteAsync(int id);
}
