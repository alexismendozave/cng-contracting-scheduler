import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PricingCalculation {
  basePrice: number;
  zoneMultiplier?: number;
  zoneFixedPrice?: number;
  finalPrice: number;
  priceBreakdown: {
    base: number;
    zoneAdjustment: number;
    total: number;
  };
}

export const usePricingCalculator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePrice = useCallback(async (
    serviceId: string,
    coordinates: { lat: number; lng: number }
  ): Promise<PricingCalculation | null> => {
    setLoading(true);
    setError(null);

    try {
      // Get service base price
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('base_price, name')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Get zone for coordinates
      const { data: zones, error: zoneError } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true);

      if (zoneError) throw zoneError;

      let matchedZone = null;
      
      // Find matching zone (simplified point-in-polygon check)
      for (const zone of zones) {
        if (zone.zone_type === 'circle' && zone.center_lat && zone.center_lng && zone.radius_meters) {
          const distance = calculateDistance(
            coordinates.lat,
            coordinates.lng,
            zone.center_lat,
            zone.center_lng
          );
          
          if (distance <= zone.radius_meters) {
            matchedZone = zone;
            break;
          }
        }
      }

      let finalPrice = service.base_price;
      let zoneAdjustment = 0;

      if (matchedZone) {
        // Check for service-specific zone override
        const { data: override } = await supabase
          .from('service_zone_prices')
          .select('custom_price')
          .eq('service_id', serviceId)
          .eq('zone_id', matchedZone.id)
          .eq('is_active', true)
          .single();

        if (override) {
          finalPrice = override.custom_price;
          zoneAdjustment = override.custom_price - service.base_price;
        } else {
          // Apply zone pricing
          if (matchedZone.pricing_type === 'fixed') {
            finalPrice = matchedZone.fixed_price || service.base_price;
            zoneAdjustment = (matchedZone.fixed_price || service.base_price) - service.base_price;
          } else if (matchedZone.pricing_type === 'percentage') {
            const multiplier = matchedZone.multiplier || 1;
            finalPrice = service.base_price * multiplier;
            zoneAdjustment = service.base_price * (multiplier - 1);
          }
        }
      }

      return {
        basePrice: service.base_price,
        zoneMultiplier: matchedZone?.multiplier,
        zoneFixedPrice: matchedZone?.fixed_price,
        finalPrice,
        priceBreakdown: {
          base: service.base_price,
          zoneAdjustment,
          total: finalPrice
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculating price');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    calculatePrice,
    loading,
    error
  };
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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