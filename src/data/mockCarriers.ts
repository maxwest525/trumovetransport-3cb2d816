// Mock carrier data for demo purposes
// These represent realistic FMCSA data scenarios

export interface BasicScore {
  measure: number;
  percentile: number;
  rdDeficient?: string;
  rdsvDeficient?: string;
  svDeficient?: string;
  snapShotDate?: string;
  totalInspectionWithViolation?: number;
  totalViolation?: number;
}

export interface DocketNumber {
  prefix: string;
  number: string;
}

export interface MockCarrierData {
  carrier: {
    legalName: string;
    dbaName: string;
    dotNumber: string;
    mcNumber: string;
    allowToOperate: string;
    outOfService: string;
    outOfServiceDate: string;
    complaintCount: number;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    phone: string;
  };
  authority: {
    commonStatus: string;
    contractStatus: string;
    brokerStatus: string;
    bipdInsurance: string;
    cargoInsurance: string;
    bondInsurance: string;
  };
  safety: {
    rating: string;
    ratingDate: string;
    reviewDate: string;
    reviewType: string;
  };
  basics: {
    unsafeDriving: BasicScore | null;
    hoursOfService: BasicScore | null;
    vehicleMaintenance: BasicScore | null;
    controlledSubstances: BasicScore | null;
    driverFitness: BasicScore | null;
    crashIndicator: BasicScore | null;
  };
  oos: {
    vehicleOosRate: number;
    vehicleOosRateNationalAvg: number;
    driverOosRate: number;
    driverOosRateNationalAvg: number;
    vehicleInspections: number;
    driverInspections: number;
  };
  fleet: {
    powerUnits: number;
    drivers: number;
    mcs150Date: string;
    busVehicle: number;
    limoVehicle: number;
    miniBusVehicle: number;
    motorCoachVehicle: number;
    vanVehicle: number;
    passengerVehicle: number;
  };
  crashes: {
    fatal: number;
    injury: number;
    towAway: number;
    total: number;
  };
  cargoTypes: string[];
  operationTypes: string[];
  docketNumbers: DocketNumber[];
}

// GOOD carrier - TruMove Certified Partner
export const MOCK_CARRIER_GOOD: MockCarrierData = {
  carrier: {
    legalName: "Sunrise Moving & Storage LLC",
    dbaName: "Sunrise Movers",
    dotNumber: "1847293",
    mcNumber: "MC-654321",
    allowToOperate: "Y",
    outOfService: "N",
    outOfServiceDate: "",
    complaintCount: 2,
    address: {
      street: "4520 Atlantic Blvd",
      city: "Jacksonville",
      state: "FL",
      zip: "32207",
      country: "US"
    },
    phone: "(904) 555-0123"
  },
  authority: {
    commonStatus: "ACTIVE",
    contractStatus: "NONE",
    brokerStatus: "NONE",
    bipdInsurance: "$1,000,000",
    cargoInsurance: "$250,000",
    bondInsurance: "N/A"
  },
  safety: {
    rating: "SATISFACTORY",
    ratingDate: "2024-03-15",
    reviewDate: "2024-03-15",
    reviewType: "COMPREHENSIVE"
  },
  basics: {
    unsafeDriving: { measure: 0.8, percentile: 18, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/15/2025', totalInspectionWithViolation: 3, totalViolation: 4 },
    hoursOfService: { measure: 0.5, percentile: 12, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/15/2025', totalInspectionWithViolation: 2, totalViolation: 2 },
    vehicleMaintenance: { measure: 1.2, percentile: 24, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/15/2025', totalInspectionWithViolation: 5, totalViolation: 7 },
    controlledSubstances: null,
    driverFitness: { measure: 0.3, percentile: 8, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/15/2025', totalInspectionWithViolation: 1, totalViolation: 1 },
    crashIndicator: { measure: 0.4, percentile: 15, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/15/2025', totalInspectionWithViolation: 2, totalViolation: 2 }
  },
  oos: {
    vehicleOosRate: 4.2,
    vehicleOosRateNationalAvg: 20.7,
    driverOosRate: 2.1,
    driverOosRateNationalAvg: 5.5,
    vehicleInspections: 48,
    driverInspections: 52
  },
  fleet: {
    powerUnits: 42,
    drivers: 65,
    mcs150Date: "2024-11-15",
    busVehicle: 0,
    limoVehicle: 0,
    miniBusVehicle: 0,
    motorCoachVehicle: 0,
    vanVehicle: 38,
    passengerVehicle: 0
  },
  crashes: {
    fatal: 0,
    injury: 1,
    towAway: 2,
    total: 3
  },
  cargoTypes: ["Household Goods", "General Freight"],
  operationTypes: ["Authorized For-Hire"],
  docketNumbers: [{ prefix: "MC", number: "654321" }, { prefix: "FF", number: "12345" }]
};

// BAD carrier - Multiple red flags
export const MOCK_CARRIER_BAD: MockCarrierData = {
  carrier: {
    legalName: "Fast & Cheap Movers LLC",
    dbaName: "Fast Movers",
    dotNumber: "3294751",
    mcNumber: "MC-987654",
    allowToOperate: "N",
    outOfService: "Y",
    outOfServiceDate: "03/15/2024",
    complaintCount: 47,
    address: {
      street: "123 Industrial Park Dr",
      city: "Houston",
      state: "TX",
      zip: "77001",
      country: "US"
    },
    phone: "(713) 555-9999"
  },
  authority: {
    commonStatus: "INACTIVE",
    contractStatus: "NONE",
    brokerStatus: "NONE",
    bipdInsurance: "$300,000",
    cargoInsurance: "$25,000",
    bondInsurance: "N/A"
  },
  safety: {
    rating: "CONDITIONAL",
    ratingDate: "2022-08-20",
    reviewDate: "2022-08-20",
    reviewType: "FOCUSED"
  },
  basics: {
    unsafeDriving: { measure: 4.2, percentile: 78, rdDeficient: 'Y', rdsvDeficient: 'Y', svDeficient: 'N', snapShotDate: '01/10/2025', totalInspectionWithViolation: 12, totalViolation: 28 },
    hoursOfService: { measure: 3.8, percentile: 82, rdDeficient: 'Y', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/10/2025', totalInspectionWithViolation: 10, totalViolation: 22 },
    vehicleMaintenance: { measure: 5.1, percentile: 89, rdDeficient: 'Y', rdsvDeficient: 'Y', svDeficient: 'Y', snapShotDate: '01/10/2025', totalInspectionWithViolation: 15, totalViolation: 45 },
    controlledSubstances: { measure: 1.2, percentile: 45, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/10/2025', totalInspectionWithViolation: 2, totalViolation: 3 },
    driverFitness: { measure: 2.8, percentile: 67, rdDeficient: 'Y', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/10/2025', totalInspectionWithViolation: 6, totalViolation: 9 },
    crashIndicator: { measure: 4.5, percentile: 85, rdDeficient: 'Y', rdsvDeficient: 'Y', svDeficient: 'N', snapShotDate: '01/10/2025', totalInspectionWithViolation: 8, totalViolation: 14 }
  },
  oos: {
    vehicleOosRate: 32.5,
    vehicleOosRateNationalAvg: 20.7,
    driverOosRate: 12.8,
    driverOosRateNationalAvg: 5.5,
    vehicleInspections: 18,
    driverInspections: 15
  },
  fleet: {
    powerUnits: 5,
    drivers: 8,
    mcs150Date: "2021-06-10",
    busVehicle: 0,
    limoVehicle: 0,
    miniBusVehicle: 0,
    motorCoachVehicle: 0,
    vanVehicle: 3,
    passengerVehicle: 0
  },
  crashes: {
    fatal: 2,
    injury: 5,
    towAway: 8,
    total: 15
  },
  cargoTypes: ["Household Goods", "General Freight", "Metal/Sheets/Coils"],
  operationTypes: ["Authorized For-Hire", "Exempt For-Hire"],
  docketNumbers: [{ prefix: "MC", number: "987654" }]
};

// MIXED carrier - Some concerns
export const MOCK_CARRIER_MIXED: MockCarrierData = {
  carrier: {
    legalName: "Regional Van Lines Inc",
    dbaName: "Regional Van Lines",
    dotNumber: "2581034",
    mcNumber: "MC-456789",
    allowToOperate: "Y",
    outOfService: "N",
    outOfServiceDate: "",
    complaintCount: 14,
    address: {
      street: "890 Commerce Way",
      city: "Charlotte",
      state: "NC",
      zip: "28202",
      country: "US"
    },
    phone: "(704) 555-7890"
  },
  authority: {
    commonStatus: "ACTIVE",
    contractStatus: "NONE",
    brokerStatus: "NONE",
    bipdInsurance: "$750,000",
    cargoInsurance: "$100,000",
    bondInsurance: "N/A"
  },
  safety: {
    rating: "NOT RATED",
    ratingDate: "",
    reviewDate: "",
    reviewType: ""
  },
  basics: {
    unsafeDriving: { measure: 2.1, percentile: 52, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/12/2025', totalInspectionWithViolation: 6, totalViolation: 10 },
    hoursOfService: { measure: 2.8, percentile: 68, rdDeficient: 'Y', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/12/2025', totalInspectionWithViolation: 8, totalViolation: 14 },
    vehicleMaintenance: { measure: 1.8, percentile: 45, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/12/2025', totalInspectionWithViolation: 7, totalViolation: 11 },
    controlledSubstances: null,
    driverFitness: { measure: 1.2, percentile: 35, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/12/2025', totalInspectionWithViolation: 3, totalViolation: 4 },
    crashIndicator: { measure: 2.2, percentile: 58, rdDeficient: 'N', rdsvDeficient: 'N', svDeficient: 'N', snapShotDate: '01/12/2025', totalInspectionWithViolation: 5, totalViolation: 7 }
  },
  oos: {
    vehicleOosRate: 18.5,
    vehicleOosRateNationalAvg: 20.7,
    driverOosRate: 6.2,
    driverOosRateNationalAvg: 5.5,
    vehicleInspections: 32,
    driverInspections: 28
  },
  fleet: {
    powerUnits: 18,
    drivers: 25,
    mcs150Date: "2024-02-28",
    busVehicle: 0,
    limoVehicle: 0,
    miniBusVehicle: 0,
    motorCoachVehicle: 0,
    vanVehicle: 15,
    passengerVehicle: 0
  },
  crashes: {
    fatal: 0,
    injury: 2,
    towAway: 4,
    total: 6
  },
  cargoTypes: ["Household Goods", "Office Supplies"],
  operationTypes: ["Authorized For-Hire"],
  docketNumbers: [{ prefix: "MC", number: "456789" }]
};

export const MOCK_CARRIERS = [
  MOCK_CARRIER_GOOD,
  MOCK_CARRIER_BAD,
  MOCK_CARRIER_MIXED
];
