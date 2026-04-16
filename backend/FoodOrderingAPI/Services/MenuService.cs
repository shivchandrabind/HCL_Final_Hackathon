using AutoMapper;
using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using FoodOrderingAPI.Services.Interfaces;

namespace FoodOrderingAPI.Services;

public class MenuService : IMenuService
{
    private readonly IMenuItemRepository _menuRepo;
    private readonly IMapper _mapper;

    public MenuService(IMenuItemRepository menuRepo, IMapper mapper)
    {
        _menuRepo = menuRepo;
        _mapper = mapper;
    }

    public async Task<(List<MenuItemDto> Items, int TotalCount)> GetAllAsync(int page, int pageSize, int? categoryId)
    {
        var (items, totalCount) = await _menuRepo.GetAllAsync(page, pageSize, categoryId);
        return (_mapper.Map<List<MenuItemDto>>(items), totalCount);
    }

    public async Task<MenuItemDto?> GetByIdAsync(int id)
    {
        var item = await _menuRepo.GetByIdAsync(id);
        return item == null ? null : _mapper.Map<MenuItemDto>(item);
    }

    public async Task<MenuItemDto> CreateAsync(CreateMenuItemDto dto)
    {
        var item = _mapper.Map<MenuItem>(dto);
        var created = await _menuRepo.CreateAsync(item);
        var full = await _menuRepo.GetByIdAsync(created.MenuItemId);
        return _mapper.Map<MenuItemDto>(full);
    }

    public async Task<MenuItemDto?> UpdateAsync(int id, UpdateMenuItemDto dto)
    {
        var item = await _menuRepo.GetByIdAsync(id);
        if (item == null) return null;

        item.Name = dto.Name;
        item.Price = dto.Price;
        item.CategoryId = dto.CategoryId;
        item.StockQuantity = dto.StockQuantity;
        item.Description = dto.Description;
        item.ImageUrl = dto.ImageUrl;
        item.IsAvailable = dto.IsAvailable;

        await _menuRepo.UpdateAsync(item);
        var updated = await _menuRepo.GetByIdAsync(id);
        return _mapper.Map<MenuItemDto>(updated);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _menuRepo.GetByIdAsync(id);
        if (item == null) return false;
        await _menuRepo.DeleteAsync(id);
        return true;
    }
}
