using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodOrderingAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly ICouponService _couponService;

    public CouponsController(ICouponService couponService) => _couponService = couponService;

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<CouponDto>>> GetActiveCoupons()
    {
        var coupons = await _couponService.GetActiveCouponsAsync();
        return Ok(coupons);
    }

    [HttpPost("validate")]
    [Authorize]
    public async Task<ActionResult<CouponDto>> ValidateCoupon([FromBody] ApplyCouponDto dto)
    {
        var coupon = await _couponService.ValidateCouponAsync(dto);
        return Ok(coupon);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CouponDto>> Create([FromBody] CreateCouponDto dto)
    {
        var coupon = await _couponService.CreateCouponAsync(dto);
        return CreatedAtAction(nameof(Create), new { id = coupon.CouponId }, coupon);
    }
}
