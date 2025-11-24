// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'STUDENT' | 'ADMIN' | 'STAFF';
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'STUDENT' | 'ADMIN' | 'STAFF';
}

export interface LoginDto {
  email: string;
  password: string;
}

// Dormitory DTOs
export interface CreateDormitoryDto {
  name: string;
  address: string;
  description?: string;
  imageUrl?: string;
  facilities?: string[];
}

export interface UpdateDormitoryDto {
  name?: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  facilities?: string[];
}

// Room DTOs
export interface CreateRoomDto {
  roomNumber: string;
  dormitoryId: string;
  type: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
  capacity: number;
  price: number;
  floor: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  description?: string;
  imageUrl?: string;
}

export interface UpdateRoomDto {
  roomNumber?: string;
  type?: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
  capacity?: number;
  price?: number;
  floor?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  description?: string;
  imageUrl?: string;
}

// Booking DTOs
export interface CreateBookingDto {
  userId: string;
  roomId: string;
  startDate: string | Date;
  endDate?: string | Date;
  totalAmount: number;
  notes?: string;
}

export interface UpdateBookingDto {
  startDate?: string | Date;
  endDate?: string | Date;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalAmount?: number;
  notes?: string;
}

// Payment DTOs
export interface CreatePaymentDto {
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'PROMPTPAY';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  slipUrl?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'PROMPTPAY';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  slipUrl?: string;
  notes?: string;
}

// Query Params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RoomFilterParams extends PaginationParams {
  dormitoryId?: string;
  type?: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD';
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
  minPrice?: number;
  maxPrice?: number;
}

export interface BookingFilterParams extends PaginationParams {
  userId?: string;
  roomId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}
