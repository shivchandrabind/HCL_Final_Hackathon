-- ============================================
-- Retail Food Ordering System - MySQL Schema
-- Database: FoodOrderingDB
-- ============================================

CREATE DATABASE IF NOT EXISTS FoodOrderingDB;
USE FoodOrderingDB;

-- ============================================
-- Customers Table
-- ============================================
CREATE TABLE Customers (
    CustomerId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(500) NOT NULL,
    Phone VARCHAR(20),
    Address VARCHAR(500),
    Role ENUM('Customer', 'Admin') NOT NULL DEFAULT 'Customer',
    LoyaltyPoints INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- Categories Table
-- ============================================
CREATE TABLE Categories (
    CategoryId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(500),
    ImageUrl VARCHAR(500),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ============================================
-- MenuItems Table
-- ============================================
CREATE TABLE MenuItems (
    MenuItemId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(150) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    CategoryId INT NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    Description VARCHAR(1000),
    ImageUrl VARCHAR(500),
    IsAvailable BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_MenuItems_Categories FOREIGN KEY (CategoryId)
        REFERENCES Categories(CategoryId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- Orders Table
-- ============================================
CREATE TABLE Orders (
    OrderId INT AUTO_INCREMENT PRIMARY KEY,
    CustomerId INT NOT NULL,
    OrderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10,2) NOT NULL,
    Status ENUM('Pending','Confirmed','Preparing','OutForDelivery','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
    CouponCode VARCHAR(50),
    DiscountAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    DeliveryAddress VARCHAR(500),
    CONSTRAINT FK_Orders_Customers FOREIGN KEY (CustomerId)
        REFERENCES Customers(CustomerId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- OrderItems Table
-- ============================================
CREATE TABLE OrderItems (
    OrderItemId INT AUTO_INCREMENT PRIMARY KEY,
    OrderId INT NOT NULL,
    MenuItemId INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId)
        REFERENCES Orders(OrderId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_OrderItems_MenuItems FOREIGN KEY (MenuItemId)
        REFERENCES MenuItems(MenuItemId) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- Cart Table
-- ============================================
CREATE TABLE Cart (
    CartId INT AUTO_INCREMENT PRIMARY KEY,
    CustomerId INT NOT NULL UNIQUE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_Cart_Customers FOREIGN KEY (CustomerId)
        REFERENCES Customers(CustomerId) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- CartItems Table
-- ============================================
CREATE TABLE CartItems (
    CartItemId INT AUTO_INCREMENT PRIMARY KEY,
    CartId INT NOT NULL,
    MenuItemId INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_CartItems_Cart FOREIGN KEY (CartId)
        REFERENCES Cart(CartId) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_CartItems_MenuItems FOREIGN KEY (MenuItemId)
        REFERENCES MenuItems(MenuItemId) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY UQ_CartItem (CartId, MenuItemId)
) ENGINE=InnoDB;

-- ============================================
-- Coupons Table
-- ============================================
CREATE TABLE Coupons (
    CouponId INT AUTO_INCREMENT PRIMARY KEY,
    Code VARCHAR(50) NOT NULL UNIQUE,
    DiscountPercent DECIMAL(5,2) NOT NULL,
    MaxDiscountAmount DECIMAL(10,2),
    MinOrderAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    ExpiryDate DATETIME NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    UsageLimit INT NOT NULL DEFAULT 1,
    TimesUsed INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ============================================
-- Seed Data
-- ============================================

-- Admin user (password: Admin@123)
INSERT INTO Customers (Name, Email, PasswordHash, Phone, Address, Role) VALUES
('Admin User', 'admin@foodorder.com', '', '9999999999', 'Admin Office', 'Admin');

-- Categories
INSERT INTO Categories (Name, Description, ImageUrl) VALUES
('Pizza', 'Delicious hand-tossed pizzas with fresh toppings', '/assets/images/pizza.jpg'),
('Cold Drinks', 'Refreshing cold beverages', '/assets/images/drinks.jpg'),
('Breads', 'Freshly baked breads and garlic breads', '/assets/images/breads.jpg');

-- Menu Items - Pizza
INSERT INTO MenuItems (Name, Price, CategoryId, StockQuantity, Description, ImageUrl) VALUES
('Margherita Pizza', 249.00, 1, 50, 'Classic pizza with mozzarella cheese and tomato sauce', '/assets/images/margherita.jpg'),
('Pepperoni Pizza', 349.00, 1, 40, 'Loaded with spicy pepperoni and mozzarella', '/assets/images/pepperoni.jpg'),
('BBQ Chicken Pizza', 399.00, 1, 35, 'Grilled chicken with BBQ sauce and onions', '/assets/images/bbq-chicken.jpg'),
('Veggie Supreme Pizza', 329.00, 1, 45, 'Loaded with bell peppers, olives, mushrooms and onions', '/assets/images/veggie-supreme.jpg'),
('Cheese Burst Pizza', 449.00, 1, 30, 'Extra cheese stuffed crust pizza', '/assets/images/cheese-burst.jpg');

-- Menu Items - Cold Drinks
INSERT INTO MenuItems (Name, Price, CategoryId, StockQuantity, Description, ImageUrl) VALUES
('Coca Cola 500ml', 40.00, 2, 100, 'Classic Coca Cola', '/assets/images/coke.jpg'),
('Pepsi 500ml', 40.00, 2, 100, 'Pepsi Cola', '/assets/images/pepsi.jpg'),
('Sprite 500ml', 40.00, 2, 80, 'Lemon lime soda', '/assets/images/sprite.jpg'),
('Fresh Orange Juice', 99.00, 2, 60, 'Freshly squeezed orange juice', '/assets/images/orange-juice.jpg'),
('Mango Shake', 129.00, 2, 50, 'Thick mango milkshake', '/assets/images/mango-shake.jpg');

-- Menu Items - Breads
INSERT INTO MenuItems (Name, Price, CategoryId, StockQuantity, Description, ImageUrl) VALUES
('Garlic Bread', 129.00, 3, 60, 'Crispy garlic bread with herbs', '/assets/images/garlic-bread.jpg'),
('Cheese Garlic Bread', 169.00, 3, 50, 'Garlic bread loaded with cheese', '/assets/images/cheese-garlic.jpg'),
('Stuffed Bread', 199.00, 3, 40, 'Bread stuffed with vegetables and cheese', '/assets/images/stuffed-bread.jpg'),
('Breadsticks', 99.00, 3, 70, 'Crispy breadsticks with dip', '/assets/images/breadsticks.jpg');

-- Coupons
INSERT INTO Coupons (Code, DiscountPercent, MaxDiscountAmount, MinOrderAmount, ExpiryDate) VALUES
('WELCOME10', 10.00, 100.00, 200.00, '2026-12-31 23:59:59'),
('FLAT20', 20.00, 200.00, 500.00, '2026-12-31 23:59:59'),
('PIZZA50', 50.00, 250.00, 400.00, '2026-06-30 23:59:59');

-- Indexes for performance
CREATE INDEX IX_MenuItems_CategoryId ON MenuItems(CategoryId);
CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
CREATE INDEX IX_Orders_Status ON Orders(Status);
CREATE INDEX IX_OrderItems_OrderId ON OrderItems(OrderId);
CREATE INDEX IX_CartItems_CartId ON CartItems(CartId);
CREATE INDEX IX_Coupons_Code ON Coupons(Code);
