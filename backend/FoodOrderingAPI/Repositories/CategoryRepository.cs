using FoodOrderingAPI.Data;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodOrderingAPI.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context) => _context = context;

    public async Task<List<Category>> GetAllAsync() =>
        await _context.Categories.OrderBy(c => c.Name).ToListAsync();

    public async Task<Category?> GetByIdAsync(int id) =>
        await _context.Categories.FindAsync(id);

    public async Task<Category> CreateAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
}
