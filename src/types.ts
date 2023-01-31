export type VinObj = {
  vin: string;
  valid?: boolean;
  pass?: boolean;
  date?: string;
};

export type APIResponse = {
  inspectionId: number;
  inspectionDate: string; // Date
  stationId: string;
  stationName: string;
  vin: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  overallInspectionResult: string;
}[];
