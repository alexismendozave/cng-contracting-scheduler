import { supabase } from '@/integrations/supabase/client';

export interface PriceCalculation {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  zoneId?: string;
  zoneName?: string;
  zoneMultiplier?: number;
  zoneFixedPrice?: number;
  finalPrice: number;
  reservationPrice?: number;
  priceBreakdown: {
    base: number;
    zoneAdjustment: number;
    total: number;
  };
}

export class PricingService {
  static async calculateServicePrice(
    serviceId: string,
    coordinates?: { lat: number; lng: number }
  ): Promise<PriceCalculation | null> {
    try {
      // Get service details
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;

      let matchedZone = null;
      let zoneAdjustment = 0;
      let finalPrice = service.base_price;

      if (coordinates) {
        // Find matching zone
        matchedZone = await this.findZoneForCoordinates(coordinates);

        if (matchedZone) {
          // Check for service-specific zone pricing override
          const { data: override } = await supabase
            .from('service_zone_prices')
            .select('custom_price')
            .eq('service_id', serviceId)
            .eq('zone_id', matchedZone.id)
            .eq('is_active', true)
            .maybeSingle();

          if (override) {
            finalPrice = override.custom_price;
            zoneAdjustment = override.custom_price - service.base_price;
          } else {
            // Apply zone pricing rules
            if (matchedZone.pricing_type === 'fixed' && matchedZone.fixed_price) {
              finalPrice = matchedZone.fixed_price;
              zoneAdjustment = matchedZone.fixed_price - service.base_price;
            } else if (matchedZone.pricing_type === 'percentage' && matchedZone.multiplier) {
              finalPrice = service.base_price * matchedZone.multiplier;
              zoneAdjustment = service.base_price * (matchedZone.multiplier - 1);
            }
          }
        }
      }

      return {
        serviceId: service.id,
        serviceName: service.name,
        basePrice: service.base_price,
        zoneId: matchedZone?.id,
        zoneName: matchedZone?.name,
        zoneMultiplier: matchedZone?.multiplier,
        zoneFixedPrice: matchedZone?.fixed_price,
        finalPrice,
        reservationPrice: service.reservation_price || 0,
        priceBreakdown: {
          base: service.base_price,
          zoneAdjustment,
          total: finalPrice
        }
      };
    } catch (error) {
      console.error('Error calculating price:', error);
      return null;
    }
  }

  static async findZoneForCoordinates(coordinates: { lat: number; lng: number }) {
    try {
      const { data: zones, error } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Check each zone to see if coordinates fall within it
      for (const zone of zones) {
        if (zone.zone_type === 'circle' && this.isPointInCircle(coordinates, zone)) {
          return zone;
        } else if (zone.zone_type === 'polygon' && this.isPointInPolygon(coordinates, zone)) {
          return zone;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding zone:', error);
      return null;
    }
  }

  private static isPointInCircle(
    point: { lat: number; lng: number },
    zone: any
  ): boolean {
    if (!zone.center_lat || !zone.center_lng || !zone.radius_meters) return false;

    const distance = this.calculateDistance(
      point.lat,
      point.lng,
      zone.center_lat,
      zone.center_lng
    );

    return distance <= zone.radius_meters;
  }

  private static isPointInPolygon(
    point: { lat: number; lng: number },
    zone: any
  ): boolean {
    if (!zone.coordinates) return false;

    try {
      const coordinates = typeof zone.coordinates === 'string' 
        ? JSON.parse(zone.coordinates) 
        : zone.coordinates;

      if (!coordinates || !Array.isArray(coordinates)) return false;

      // Ray casting algorithm for point-in-polygon
      let inside = false;
      const x = point.lng;
      const y = point.lat;

      for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
        const xi = coordinates[i][0];
        const yi = coordinates[i][1];
        const xj = coordinates[j][0];
        const yj = coordinates[j][1];

        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }

      return inside;
    } catch (error) {
      console.error('Error checking point in polygon:', error);
      return false;
    }
  }

  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}