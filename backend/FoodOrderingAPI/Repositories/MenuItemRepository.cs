using FoodOrderingAPI.Data;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodOrderingAPI.Repositories;

public class MenuItemRepository : IMenuItemRepository
{
    private readonly AppDbContext _context;

    public MenuItemRepository(AppDbContext context) => _context = context;

    public async Task<(List<MenuItem> Items, int TotalCount)> GetAllAsync(int page, int pageSize, int? categoryId)
    {
        var query = _context.MenuItems.Include(m => m.Category).AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(m => m.CategoryId == categoryId.Value);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderBy(m => m.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<MenuItem?> GetByIdAsync(int id) =>
        await _context.MenuItems.Include(m => m.Category).FirstOrDefaultAsync(m => m.MenuItemId == id);

    public async Task<MenuItem> CreateAsync(MenuItem item)
    {
        _context.MenuItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task UpdateAsync(MenuItem item)
    {
        _context.MenuItems.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var item = await _context.MenuItems.FindAsync(id);
        if (item != null)
        {
            _context.MenuItems.Remove(item);
            await _context.SaveChangesAsync();
        }
    }
}
