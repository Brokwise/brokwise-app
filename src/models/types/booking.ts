export interface Booking {
  _id: string;
  plotId: {
    _id: string;
    plotNumber: string;
    area: number;
    areaUnit: string;
    price: number;
    facing: string;
    status: string;
  };
  blockId: string;
  projectId: {
    _id: string;
    name: string;
    address: {
      state: string;
      city: string;
      address: string;
      pincode: string;
    };
    projectId: string;
  };
  brokerId: {
    _id: string;
    email: string;
  };
  developerId: {
    _id: string;
    email: string;
  };
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    _id: string;
  };
  bookingStatus: "pending" | "confirmed" | "cancelled" | "rejected";
  bookingDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingResponse {
  success: boolean;
  status: number;
  data: {
    bookings: Booking[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}
