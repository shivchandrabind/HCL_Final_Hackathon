using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodOrderingAPI.Entities;

[Table("Categories")]
public class Category
{
    [Key]
    public int CategoryId { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}
