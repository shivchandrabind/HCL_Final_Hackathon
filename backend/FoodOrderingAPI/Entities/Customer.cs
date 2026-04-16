using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodOrderingAPI.Entities;

[Table("Customers")]
public class Customer
{
    [Key]
    public int CustomerId { get; set; }

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    [Required, MaxLength(20)]
    public string Role { get; set; } = "Customer";

    public int LoyaltyPoints { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public Cart? Cart { get; set; }
}
