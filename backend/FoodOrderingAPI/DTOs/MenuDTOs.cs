using System.ComponentModel.DataAnnotations;

namespace FoodOrderingAPI.DTOs;

public class MenuItemDto
{
    public int MenuItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int StockQuantity { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateMenuItemDto
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public decimal Price { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public int StockQuantity { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;
}

public class UpdateMenuItemDto
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public decimal Price { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public int StockQuantity { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;
}
