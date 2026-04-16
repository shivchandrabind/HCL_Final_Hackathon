using System.ComponentModel.DataAnnotations;

namespace FoodOrderingAPI.DTOs;

public class CategoryDto
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
}

public class CreateCategoryDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;
}
