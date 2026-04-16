using AutoMapper;
using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Entities;

namespace FoodOrderingAPI.Helpers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Customer, AuthResponseDto>();
        CreateMap<RegisterDto, Customer>();

        CreateMap<MenuItem, MenuItemDto>()
            .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name));
        CreateMap<CreateMenuItemDto, MenuItem>();
        CreateMap<UpdateMenuItemDto, MenuItem>();

        CreateMap<Category, CategoryDto>();
        CreateMap<CreateCategoryDto, Category>();

        CreateMap<Coupon, CouponDto>();
        CreateMap<CreateCouponDto, Coupon>();

        CreateMap<Order, OrderDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.Customer.Name))
            .ForMember(d => d.CustomerEmail, opt => opt.MapFrom(s => s.Customer.Email))
            .ForMember(d => d.Items, opt => opt.MapFrom(s => s.OrderItems));

        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(d => d.MenuItemName, opt => opt.MapFrom(s => s.MenuItem.Name))
            .ForMember(d => d.ImageUrl, opt => opt.MapFrom(s => s.MenuItem.ImageUrl))
            .ForMember(d => d.Subtotal, opt => opt.MapFrom(s => s.Price * s.Quantity));

        CreateMap<Cart, CartDto>()
            .ForMember(d => d.Items, opt => opt.MapFrom(s => s.CartItems))
            .ForMember(d => d.TotalAmount, opt => opt.MapFrom(s =>
                s.CartItems.Sum(ci => ci.MenuItem.Price * ci.Quantity)));

        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.MenuItemName, opt => opt.MapFrom(s => s.MenuItem.Name))
            .ForMember(d => d.Price, opt => opt.MapFrom(s => s.MenuItem.Price))
            .ForMember(d => d.ImageUrl, opt => opt.MapFrom(s => s.MenuItem.ImageUrl))
            .ForMember(d => d.Subtotal, opt => opt.MapFrom(s => s.MenuItem.Price * s.Quantity));
    }
}
