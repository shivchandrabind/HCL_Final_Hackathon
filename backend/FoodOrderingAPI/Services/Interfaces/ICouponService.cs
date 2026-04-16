using FoodOrderingAPI.DTOs;

namespace FoodOrderingAPI.Services.Interfaces;

public interface ICouponService
{
    Task<CouponDto> ValidateCouponAsync(ApplyCouponDto dto);
    Task<List<CouponDto>> GetActiveCouponsAsync();
    Task<CouponDto> CreateCouponAsync(CreateCouponDto dto);
}
