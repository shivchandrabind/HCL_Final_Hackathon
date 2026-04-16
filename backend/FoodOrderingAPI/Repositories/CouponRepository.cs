using FoodOrderingAPI.Data;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodOrderingAPI.Repositories;

public class CouponRepository : ICouponRepository
{
    private readonly AppDbContext _context;

    public CouponRepository(AppDbContext context) => _context = context;

    public async Task<Coupon?> GetByCodeAsync(string code) =>
        await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code);

    public async Task<List<Coupon>> GetActiveAsync() =>
        await _context.Coupons
            .Where(c => c.IsActive && c.ExpiryDate > DateTime.UtcNow && c.TimesUsed < c.UsageLimit)
            .OrderBy(c => c.MinOrderAmount)
            .ToListAsync();

    public async Task<Coupon> CreateAsync(Coupon coupon)
    {
        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();
        return coupon;
    }

    public async Task UpdateAsync(Coupon coupon)
    {
        _context.Coupons.Update(coupon);
        await _context.SaveChangesAsync();
    }
}
