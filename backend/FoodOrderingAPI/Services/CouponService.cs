using AutoMapper;
using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using FoodOrderingAPI.Services.Interfaces;

namespace FoodOrderingAPI.Services;

public class CouponService : ICouponService
{
    private readonly ICouponRepository _couponRepo;
    private readonly IMapper _mapper;

    public CouponService(ICouponRepository couponRepo, IMapper mapper)
    {
        _couponRepo = couponRepo;
        _mapper = mapper;
    }

    public async Task<CouponDto> ValidateCouponAsync(ApplyCouponDto dto)
    {
        var coupon = await _couponRepo.GetByCodeAsync(dto.Code);
        if (coupon == null)
            throw new KeyNotFoundException("Coupon not found.");

        if (!coupon.IsActive)
            throw new InvalidOperationException("Coupon is not active.");

        if (coupon.ExpiryDate <= DateTime.UtcNow)
            throw new InvalidOperationException("Coupon has expired.");

        if (coupon.TimesUsed >= coupon.UsageLimit)
            throw new InvalidOperationException("Coupon usage limit reached.");

        if (dto.OrderAmount < coupon.MinOrderAmount)
            throw new InvalidOperationException($"Minimum order amount of {coupon.MinOrderAmount} required.");

        return _mapper.Map<CouponDto>(coupon);
    }

    public async Task<List<CouponDto>> GetActiveCouponsAsync()
    {
        var coupons = await _couponRepo.GetActiveAsync();
        return _mapper.Map<List<CouponDto>>(coupons);
    }

    public async Task<CouponDto> CreateCouponAsync(CreateCouponDto dto)
    {
        var coupon = _mapper.Map<Coupon>(dto);
        var created = await _couponRepo.CreateAsync(coupon);
        return _mapper.Map<CouponDto>(created);
    }
}
