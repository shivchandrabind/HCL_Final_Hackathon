using System.ComponentModel.DataAnnotations;

namespace FoodOrderingAPI.DTOs;

public class CouponDto
{
    public int CouponId { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercent { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public decimal MinOrderAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; }
    public int UsageLimit { get; set; }
    public int TimesUsed { get; set; }
}

public class ApplyCouponDto
{
    [Required]
    public string Code { get; set; } = string.Empty;

    [Required]
    public decimal OrderAmount { get; set; }
}

public class CreateCouponDto
{
    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    public decimal DiscountPercent { get; set; }

    public decimal? MaxDiscountAmount { get; set; }

    public decimal MinOrderAmount { get; set; } = 0;

    [Required]
    public DateTime ExpiryDate { get; set; }

    public bool IsActive { get; set; } = true;

    public int UsageLimit { get; set; } = 1;
}
