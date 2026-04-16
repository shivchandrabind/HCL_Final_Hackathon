using AutoMapper;
using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using FoodOrderingAPI.Services.Interfaces;

namespace FoodOrderingAPI.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepo;
    private readonly IMapper _mapper;

    public CategoryService(ICategoryRepository categoryRepo, IMapper mapper)
    {
        _categoryRepo = categoryRepo;
        _mapper = mapper;
    }

    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepo.GetAllAsync();
        return _mapper.Map<List<CategoryDto>>(categories);
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var category = _mapper.Map<Category>(dto);
        var created = await _categoryRepo.CreateAsync(category);
        return _mapper.Map<CategoryDto>(created);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, CreateCategoryDto dto)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null) return null;

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.ImageUrl = dto.ImageUrl;
        category.IsActive = dto.IsActive;

        await _categoryRepo.UpdateAsync(category);
        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null) return false;
        await _categoryRepo.DeleteAsync(id);
        return true;
    }
}
