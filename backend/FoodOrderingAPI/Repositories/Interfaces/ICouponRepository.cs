using FoodOrderingAPI.Entities;

namespace FoodOrderingAPI.Repositories.Interfaces;

public interface ICouponRepository
{
    Task<Coupon?> GetByCodeAsync(string code);
    Task<List<Coupon>> GetActiveAsync();
    Task<Coupon> CreateAsync(Coupon coupon);
    Task UpdateAsync(Coupon coupon);
}
