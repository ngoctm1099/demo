export const roleDefaultValues = {
  role: "",
  User: false,
  ENABLE_USER: false,
  CREATE_USER: false,
  VIEW_USER: false,
  UPDATE_USER: false,
  DELETE_USER: false,
  Role: false,
  ENABLE_ROLE: false,
  CREATE_ROLE: false,
  VIEW_ROLE: false,
  UPDATE_ROLE: false,
  DELETE_ROLE: false,
  Report: false,
  ENABLE_REPORT: false,
  CREATE_REPORT: false,
  VIEW_REPORT: false,
  UPDATE_REPORT: false,
  DELETE_REPORT: false,
  Outlet: false,
  ENABLE_OUTLET: false,
  CREATE_OUTLET: false,
  VIEW_OUTLET: false,
  UPDATE_OUTLET: false,
  DELETE_OUTLET: false,
  Product: false,
  ENABLE_PRODUCT: false,
  CREATE_PRODUCT: false,
  VIEW_PRODUCT: false,
  UPDATE_PRODUCT: false,
  DELETE_PRODUCT: false,
  Membership: false,
  ENABLE_MEMBERSHIP: false,
  CREATE_MEMBERSHIP: false,
  VIEW_MEMBERSHIP: false,
  UPDATE_MEMBERSHIP: false,
  DELETE_MEMBERSHIP: false,
  Customer: false,
  ENABLE_CUSTOMER: false,
  CREATE_CUSTOMER: false,
  VIEW_CUSTOMER: false,
  UPDATE_CUSTOMER: false,
  DELETE_CUSTOMER: false,
  Order: false,
  ENABLE_ORDER: false,
  CREATE_ORDER: false,
  VIEW_ORDER: false,
  UPDATE_ORDER: false,
  DELETE_ORDER: false,
  Discount: false,
  ENABLE_DISCOUNT: false,
  CREATE_DISCOUNT: false,
  VIEW_DISCOUNT: false,
  UPDATE_DISCOUNT: false,
  DELETE_DISCOUNT: false,
};

export interface RoleInputs {
  role: string;
  User: string;
  ENABLE_USER: string;
  CREATE_USER: string;
  VIEW_USER: string;
  UPDATE_USER: string;
  DELETE_USER: string;
  Role: string;
  ENABLE_ROLE: string;
  CREATE_ROLE: string;
  VIEW_ROLE: string;
  UPDATE_ROLE: string;
  DELETE_ROLE: string;
  Report: string;
  ENABLE_REPORT: string;
  CREATE_REPORT: string;
  VIEW_REPORT: string;
  UPDATE_REPORT: string;
  DELETE_REPORT: string;
  Outlet: string;
  ENABLE_OUTLET: string;
  CREATE_OUTLET: string;
  VIEW_OUTLET: string;
  UPDATE_OUTLET: string;
  DELETE_OUTLET: string;
  Product: string;
  ENABLE_PRODUCT: string;
  CREATE_PRODUCT: string;
  VIEW_PRODUCT: string;
  UPDATE_PRODUCT: string;
  DELETE_PRODUCT: string;
  Membership: string;
  ENABLE_MEMBERSHIP: string;
  CREATE_MEMBERSHIP: string;
  VIEW_MEMBERSHIP: string;
  UPDATE_MEMBERSHIP: string;
  DELETE_MEMBERSHIP: string;
  Customer: string;
  ENABLE_CUSTOMER: string;
  CREATE_CUSTOMER: string;
  VIEW_CUSTOMER: string;
  UPDATE_CUSTOMER: string;
  DELETE_CUSTOMER: string;
  Order: string;
  ENABLE_ORDER: string;
  CREATE_ORDER: string;
  VIEW_ORDER: string;
  UPDATE_ORDER: string;
  DELETE_ORDER: string;
  Discount: string;
  ENABLE_DISCOUNT: string;
  CREATE_DISCOUNT: string;
  VIEW_DISCOUNT: string;
  UPDATE_DISCOUNT: string;
  DELETE_DISCOUNT: string;
}

export const moduleNames = [
  "User",
  "Role",
  "Product",
  "Order",
  "Discount",
  "Customer",
  "Membership",
  "Outlet",
  "Report",
];

export const roleMapping = {
  user: {
    label: "User",
    roleActions: ["ENABLE_USER", "CREATE_USER", "VIEW_USER", "UPDATE_USER", "DELETE_USER"],
  },
  role: {
    label: "Role",
    roleActions: ["ENABLE_ROLE", "CREATE_ROLE", "VIEW_ROLE", "UPDATE_ROLE", "DELETE_ROLE"],
  },
  product: {
    label: "Product",
    roleActions: ["ENABLE_PRODUCT", "CREATE_PRODUCT", "VIEW_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT"],
  },
  order: {
    label: "Order",
    roleActions: ["ENABLE_ORDER", "CREATE_ORDER", "VIEW_ORDER", "UPDATE_ORDER", "DELETE_ORDER"],
  },
  discount: {
    label: "Discount",
    roleActions: ["ENABLE_DISCOUNT", "CREATE_DISCOUNT", "VIEW_DISCOUNT", "UPDATE_DISCOUNT", "DELETE_DISCOUNT"],
  },
  customer: {
    label: "Customer",
    roleActions: ["ENABLE_CUSTOMER", "CREATE_CUSTOMER", "VIEW_CUSTOMER", "UPDATE_CUSTOMER", "DELETE_CUSTOMER"],
  },
  membership: {
    label: "Membership",
    roleActions: [
      "ENABLE_MEMBERSHIP",
      "CREATE_MEMBERSHIP",
      "VIEW_MEMBERSHIP",
      "UPDATE_MEMBERSHIP",
      "DELETE_MEMBERSHIP",
    ],
  },
  outlet: {
    label: "Outlet",
    roleActions: ["ENABLE_OUTLET", "CREATE_OUTLET", "VIEW_OUTLET", "UPDATE_OUTLET", "DELETE_OUTLET"],
  },
  report: {
    label: "Report",
    roleActions: ["ENABLE_REPORT", "CREATE_REPORT", "VIEW_REPORT", "UPDATE_REPORT", "DELETE_REPORT"],
  },
};

export const defaultVariant = { name: "", options: [{ image: null, name: "", price: "" }] };

export interface VariantProps {
  name: string;
  options: { image: any; name: string; price: string }[];
}

export const defaultProduct = {
  file: null,
  name: "",
  categories: null,
  tags: null,
  price: "",
  description: "",
  variants: [defaultVariant],
};

export interface ProductProps {
  file: any;
  name: string;
  categories: string[];
  tags: string[];
  price: string;
  description: string;
  variants: VariantProps[];
}

export const defaultDiscount = {
  type: "",
  amount: "",
  startEndDate: null,
  quantity: "",
  name: "",
  promoCode: "",
};

export interface DiscountProps {
  type: string;
  amount: string;
  startEndDate: Date;
  quantity: string;
  name: string;
  promoCode: string;
}

export const defaultProfile = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  file: null,
  language: "",
};

export interface ProfileProps {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  file: File;
  language: string;
}

export const defaultOutlet = {
  name: "",
  address: "",
  outletManagers: "",
  startOperatingHours: "",
  endOperatingHours: "",
};

export interface OutletProps {
  name: string;
  address: string;
  outletManagers: string;
  startOperatingHours: string;
  endOperatingHours: string;
}

export const defaultMembership = {
  membershipId: "",
  memberPoints: "",
};

export interface MembershipProps {
  membershipId: string | number;
  memberPoints: string | number;
}

export const defaultCustomer = {
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  membership: { membershipId: "", memberPoints: null },
};

export interface CustomerProps {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  membership: string;
}

export interface TierProps {
  unit: string;
  points: string;
}
