using AutoMapper;
using FoodOrderingAPI.DTOs;
using FoodOrderingAPI.Entities;
using FoodOrderingAPI.Repositories.Interfaces;
using FoodOrderingAPI.Services.Interfaces;

namespace FoodOrderingAPI.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly ICartRepository _cartRepo;
    private readonly IMenuItemRepository _menuRepo;
    private readonly ICustomerRepository _customerRepo;
    private readonly ICouponRepository _couponRepo;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;

    public OrderService(
        IOrderRepository orderRepo,
        ICartRepository cartRepo,
        IMenuItemRepository menuRepo,
        ICustomerRepository customerRepo,
        ICouponRepository couponRepo,
        IEmailService emailService,
        IMapper mapper)
    {
        _orderRepo = orderRepo;
        _cartRepo = cartRepo;
        _menuRepo = menuRepo;
        _customerRepo = customerRepo;
        _couponRepo = couponRepo;
        _emailService = emailService;
        _mapper = mapper;
    }

    public async Task<OrderDto> PlaceOrderAsync(int customerId, PlaceOrderDto dto)
    {
        var cart = await _cartRepo.GetByCustomerIdAsync(customerId);
        if (cart == null || !cart.CartItems.Any())
            throw new InvalidOperationException("Cart is empty.");

        var customer = await _customerRepo.GetByIdAsync(customerId);
        if (customer == null)
            throw new KeyNotFoundException("Customer not found.");

        // Validate stock and build order items
        var orderItems = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var cartItem in cart.CartItems)
        {
            var menuItem = await _menuRepo.GetByIdAsync(cartItem.MenuItemId);
            if (menuItem == null)
                throw new KeyNotFoundException($"Menu item {cartItem.MenuItemId} not found.");

            if (!menuItem.IsAvailable)
                throw new InvalidOperationException($"'{menuItem.Name}' is not available.");

            if (menuItem.StockQuantity < cartItem.Quantity)
                throw new InvalidOperationException($"Insufficient stock for '{menuItem.Name}'. Available: {menuItem.StockQuantity}.");

            orderItems.Add(new OrderItem
            {
                MenuItemId = cartItem.MenuItemId,
                Quantity = cartItem.Quantity,
                Price = menuItem.Price
            });

            subtotal += menuItem.Price * cartItem.Quantity;

            // Deduct stock
            menuItem.StockQuantity -= cartItem.Quantity;
            await _menuRepo.UpdateAsync(menuItem);
        }

        // Apply coupon
        decimal discountAmount = 0;
        string? couponCode = null;

        if (!string.IsNullOrEmpty(dto.CouponCode))
        {
            var coupon = await _couponRepo.GetByCodeAsync(dto.CouponCode);
            if (coupon != null && coupon.IsActive && coupon.ExpiryDate > DateTime.UtcNow
                && coupon.TimesUsed < coupon.UsageLimit && subtotal >= coupon.MinOrderAmount)
            {
                discountAmount = subtotal * coupon.DiscountPercent / 100;
                if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                    discountAmount = coupon.MaxDiscountAmount.Value;

                couponCode = coupon.Code;
                coupon.TimesUsed++;
                await _couponRepo.UpdateAsync(coupon);
            }
        }

        var totalAmount = subtotal - discountAmount;

        var order = new Order
        {
            CustomerId = customerId,
            TotalAmount = totalAmount,
            Status = "Pending",
            CouponCode = couponCode,
            DiscountAmount = discountAmount,
            DeliveryAddress = dto.DeliveryAddress ?? customer.Address,
            OrderItems = orderItems
        };

        var createdOrder = await _orderRepo.CreateAsync(order);

        // Clear cart
        await _cartRepo.ClearCartAsync(cart.CartId);

        // Award loyalty points (1 per 100 spent)
        int loyaltyPoints = (int)(totalAmount / 100);
        if (loyaltyPoints > 0)
        {
            customer.LoyaltyPoints += loyaltyPoints;
            await _customerRepo.UpdateAsync(customer);
        }

        // Send email (non-blocking, don't fail order)
        try
        {
            var fullOrder = await _orderRepo.GetByIdAsync(createdOrder.OrderId);
            await _emailService.SendOrderConfirmationAsync(customer.Email, customer.Name, fullOrder!);
        }
        catch { /* Email failure should not fail the order */ }

        var result = await _orderRepo.GetByIdAsync(createdOrder.OrderId);
        return _mapper.Map<OrderDto>(result);
    }

    public async Task<List<OrderDto>> GetCustomerOrdersAsync(int customerId)
    {
        var orders = await _orderRepo.GetByCustomerIdAsync(customerId);
        return _mapper.Map<List<OrderDto>>(orders);
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int orderId)
    {
        var order = await _orderRepo.GetByIdAsync(orderId);
        return order == null ? null : _mapper.Map<OrderDto>(order);
    }

    public async Task<List<OrderDto>> GetAllOrdersAsync(string? status)
    {
        var orders = await _orderRepo.GetAllAsync(status);
        return _mapper.Map<List<OrderDto>>(orders);
    }

    public async Task<OrderDto?> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto dto)
    {
        var order = await _orderRepo.GetByIdAsync(orderId);
        if (order == null) return null;

        order.Status = dto.Status;
        await _orderRepo.UpdateAsync(order);

        var updated = await _orderRepo.GetByIdAsync(orderId);
        return _mapper.Map<OrderDto>(updated);
    }

    public async Task<OrderDto> ReorderAsync(int customerId, int orderId)
    {
        var originalOrder = await _orderRepo.GetByIdAsync(orderId);
        if (originalOrder == null)
            throw new KeyNotFoundException("Order not found.");

        // Add original order items to cart
        var cart = await _cartRepo.GetByCustomerIdAsync(customerId);
        if (cart == null)
            cart = await _cartRepo.CreateCartAsync(customerId);

        // Clear existing cart
        await _cartRepo.ClearCartAsync(cart.CartId);

        foreach (var item in originalOrder.OrderItems)
        {
            var menuItem = await _menuRepo.GetByIdAsync(item.MenuItemId);
            if (menuItem == null || !menuItem.IsAvailable)
                continue;

            var cartItem = new CartItem
            {
                CartId = cart.CartId,
                MenuItemId = item.MenuItemId,
                Quantity = item.Quantity
            };
            await _cartRepo.AddCartItemAsync(cartItem);
        }

        // Place the order
        return await PlaceOrderAsync(customerId, new PlaceOrderDto
        {
            DeliveryAddress = originalOrder.DeliveryAddress
        });
    }
}
