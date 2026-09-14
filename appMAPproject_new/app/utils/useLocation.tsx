import * as Location from "expo-location";
import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";

export default function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress[] | null>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        const msg = "Permission to access location was denied";
        setErrorMsg(msg);
        Alert.alert("Permission Denied", msg);
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log("Location: ", currentLocation.coords.latitude, currentLocation.coords.longitude);

      let response = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setAddress(response);
      console.log("Address: ", response);
    } catch (error) {
      console.error("Error in useLocation:", error);
      const msg = "Error getting location";
      setErrorMsg(msg);
      Alert.alert("Location Error", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { location, address, errorMsg, loading, getLocation };
}
