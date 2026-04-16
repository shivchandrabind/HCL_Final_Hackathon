using FoodOrderingAPI.DTOs;

namespace FoodOrderingAPI.Services.Interfaces;

public interface IMenuService
{
    Task<(List<MenuItemDto> Items, int TotalCount)> GetAllAsync(int page, int pageSize, int? categoryId);
    Task<MenuItemDto?> GetByIdAsync(int id);
    Task<MenuItemDto> CreateAsync(CreateMenuItemDto dto);
    Task<MenuItemDto?> UpdateAsync(int id, UpdateMenuItemDto dto);
    Task<bool> DeleteAsync(int id);
}
