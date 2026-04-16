using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodOrderingAPI.Entities;

[Table("MenuItems")]
public class MenuItem
{
    [Key]
    public int MenuItemId { get; set; }

    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }

    public int CategoryId { get; set; }

    public int StockQuantity { get; set; } = 0;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CategoryId")]
    public Category Category { get; set; } = null!;
}
