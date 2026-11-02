// Filas de la base de datos (ver src/services/database.js) y datos de entrada
// de los servicios.

export interface Vehicle {
  id: number;
  name: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  plate: string | null;
  vin: string | null;
  currentKm: number;
  photo: string | null;
  createdAt: string;
}

export type VehicleInput = Pick<Vehicle, "name"> &
  Partial<Omit<Vehicle, "id" | "name" | "createdAt">>;

export interface Expense {
  id: number;
  vehicleId: number;
  description: string;
  category: string | null;
  date: string;
  cost: number;
  notes: string | null;
  photo: string | null;
  items: string | null;
  createdAt: string;
}

export type ExpenseInput = Pick<
  Expense,
  "vehicleId" | "description" | "date" | "cost"
> &
  Partial<Pick<Expense, "category" | "notes" | "photo">> & {
    items?: string | null;
  };

export interface Repair {
  id: number;
  vehicleId: number;
  description: string;
  category: string | null;
  date: string;
  cost: number;
  workshop: string | null;
  notes: string | null;
  photo: string | null;
  items: string | null;
  createdAt: string;
}

export type RepairInput = Pick<
  Repair,
  "vehicleId" | "description" | "date" | "cost"
> &
  Partial<Pick<Repair, "category" | "workshop" | "notes" | "photo">> & {
    items?: string | null;
  };

export interface Contact {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
}

export type ContactInput = Pick<Contact, "name"> &
  Partial<Pick<Contact, "phone" | "email" | "notes">>;

export interface CategoryTotal {
  category: string | null;
  total: number;
  count: number;
}
