// c:\\code\\transcarrency\\server\\src\\utils\\nhtsaApi.ts
const BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

// Interface for the structure of a part from the API (based on GetParts endpoint)
// You'll need to inspect the actual API response to refine this interface
interface VehiclePart {
  PartName: string;
  PartType: string;
  // Add other relevant fields based on the API response
  // For example: PartNumber, Manufacturer, etc.
  // This is a placeholder and needs to be adjusted.
}

// Interface for the API response when fetching parts
interface GetPartsResponse {
  Count: number;
  Message: string;
  SearchCriteria: string; // e.g., "VIN: XXXXXXXXXXXXXX, Year: 2020, Make: HONDA, Model: CIVIC"
  Results: VehiclePart[]; // This will likely be an array of objects, each representing a part or component category
}

interface GetPartsOptions {
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  type?: string; // e.g., "Engine", "Brakes", "Suspension" - check API docs for valid types
  format?: string;
}

/**
 * Fetches vehicle parts information from the NHTSA VPIC API.
 * @param options Options for fetching parts, including VIN, make, model, year, and type.
 * @returns A promise that resolves to an array of vehicle parts.
 */
export async function getVehicleParts(options: GetPartsOptions): Promise<VehiclePart[]> {
  const params = new URLSearchParams();
  if (options.vin) params.append('VIN', options.vin);
  if (options.make) params.append('make', options.make);
  if (options.model) params.append('model', options.model);
  if (options.year) params.append('modelYear', String(options.year)); // API uses modelYear
  if (options.type) params.append('type', options.type);
  params.append('format', options.format || 'json'); // Default to JSON

  const queryString = params.toString();
  const apiUrl = `${BASE_URL}/GetParts?${queryString}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      // Log more details for server-side debugging
      const errorBody = await response.text();
      console.error(`HTTP error! status: ${response.status}, body: ${errorBody}, url: ${apiUrl}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: GetPartsResponse = await response.json();
    if (data.Count === 0) {
        console.log(`No parts found for criteria: ${data.SearchCriteria}`);
        return [];
    }
    return data.Results; // Added this line
  } catch (error) {
    console.error('Failed to fetch vehicle parts:', error);
    // Depending on how you want to handle errors, you might re-throw or return an empty array
    throw error; // Or return [];
  }
}