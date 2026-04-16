using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodOrderingAPI.Entities;

[Table("Coupons")]
public class Coupon
{
    [Key]
    public int CouponId { get; set; }

    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Column(TypeName = "decimal(5,2)")]
    public decimal DiscountPercent { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? MaxDiscountAmount { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal MinOrderAmount { get; set; } = 0;

    public DateTime ExpiryDate { get; set; }

    public bool IsActive { get; set; } = true;

    public int UsageLimit { get; set; } = 1;

    public int TimesUsed { get; set; } = 0;
}
